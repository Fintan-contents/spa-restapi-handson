# コンポーネントの分割

ToDoページをコンポーネントに分割します。

## コンポーネントへの落とし込み

次に、ToDoページをどのようなコンポーネント構造にするかを考え、コンポーネントに落とし込みます。

ToDoページのデザインから、コンポーネントの階層構造に落とし込みます。  
（参考：[React の流儀 ステップ 1 – React](https://ja.react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy)）

扱う情報の種類や用途から、ここでは以下のようにコンポーネントに分割します。

![design](img/design.png)

- **NavigationHeader**（黄色）：ナビゲーションメニューのヘッダ
- **TodoBoard**（オレンジ色）：ToDoを扱うエリア
- **TodoForm**（青色）：新しいToDoを入力する
- **TodoFilter**（紫色）：ToDoの表示対象を選択する
- **TodoList**（緑色）：ToDoを一覧形式で表示する
- **TodoItem**（赤色）：ToDoを1行で表示する

これらのコンポーネントを、以下のような階層構造で作成していきます。

- NavigationHeader
- TodoBoard
  - TodoForm
  - TodoFilter
  - TodoList
    - TodoItem

## コンポーネントの作成

コンポーネントを作成するディレクトリとして、`src`の下に`components`ディレクトリを作成します。

ここでは、現在表示している静的なデータを修正して、それぞれのコンポーネントを作成していきます。  
（参考：[React の流儀 ステップ 2 – React](https://ja.react.dev/learn/thinking-in-react#step-2-build-a-static-version-in-react)）

ページ外観の作成では`src/app`配下の`globals.css`に全てのデザインを書いていますが、
コンポーネントごとに、CSS Modulesファイルを**`[コンポーネント名].module.css`**という命名ルールで作成していきます。

{% hint style='tip' %}
#### CSS Modules

CSS Modulesは自動的に一意のクラス名を作成することで、CSSをファイルごとに独立したスコープで使用できるようにする機能です。  
（参考：[Getting Started: CSS Modules | Next.js](https://nextjs.org/docs/app/getting-started/css#css-modules)）

CSS Modulesを使用することで以下のメリットが得られます。
- 他のファイルで同じクラス名を使用してもクラス名が衝突しなくなるので、  
予期せぬデザイン崩れを避けることができる
- コンポーネントごとのCSSとしてコードを管理しやすくなる

デザインモックにあるCSSのクラス名は衝突を防ぐために`[コンポーネント名]_[任意文字列]`と命名されています。
CSS ModulesではimportしたコンポーネントでのみCSSが適用され、他のコンポーネントとクラス名が衝突しません。そのため`[コンポーネント名]`部分が不要になります。  
これから実装するCSS Modulesでは`[コンポーネント名]`部分を削除します。
{% endhint %}

### NavigationHeader

`NavigationHeader`コンポーネントを作成します。`components`配下に`navigation-header`ディレクトリを作成し、
その配下に`NavigationHeader.tsx`を作成します。`NavigationHeader`が使用するCSSも分割するため、`NavigationHeader.module.css`を作成します。

先に`globals.css`から`NavigationHeader`で使用するCSSを移植します。
CSS Modulesの説明にあったように、`NavigationHeader.module.css`ではクラス名の`[コンポーネント名]`部分である`PageHeader_`を削除します。

`src/components/navigation-header/NavigationHeader.module.css`
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  border-bottom: solid 1px black;
  background: black;
}
.title {
  color: white;
  font-size: 1.5rem;
}
.header a {
  text-decoration: none;
}
.nav {
  display: flex;
  list-style: none;
}
.nav li {
  margin-left: 30px;
  color: white;
}
.nav a {
  color: white;
}
.nav button,
.nav button:active,
.nav button:hover {
  cursor: pointer;
  border: 0;
  background-color: transparent;
  color: white;
}
```

`NavigationHeader`が返すReact要素を、`Home`コンポーネントから抽出します。  
また、`NavigationHeader.module.css`をimportする際に変数を指定し、className属性で  
`{変数.クラス名}`と記述します。
本ハンズオンでは、CSS Modulesをimportする際の変数は`styles`とします。

`src/components/navigation-header/NavigationHeader.tsx`
```jsx
import React from 'react';
import styles from './NavigationHeader.module.css';

export const NavigationHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ToDoアプリ</h1>
      <nav>
        <ul className={styles.nav}>
          <li>テストユーザーさん</li>
          <li>ログアウト</li>
        </ul>
      </nav>
    </header>
  );
};
```

`NavigationHeader`ではTypeScriptの構文を使用して`NavigationHeader`の型に`React.FC`を指定しています。`React.FC`はReactが提供している関数コンポーネントを表す型になります。TypeScriptでは  
`変数:型`というような構文で型を付けることができます。

```js
export const NavigationHeader: React.FC = () => {
}
```

`NavigationHeader`が作成できたら、`Home`で`NavigationHeader`を使用するように修正します。

`src/app/page.tsx`
```jsx
'use client';
import React from 'react';
import {NavigationHeader} from '../components/navigation-header/NavigationHeader';

export default function Home() {
  return (
    <React.Fragment>
      <NavigationHeader />
      <div className='TodoBoard_content'>
      ...
      </div>
    </React.Fragment>
  );
}
```

また、`NavigationHeader.module.css`に抽出した定義を`globals.css`から削除します。

この時点でページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`Home`から`NavigationHeader`部分の抽出は完了です。

### TodoBoard

`TodoBoard`コンポーネントを作成します。このコンポーネントにはいくつかの子コンポーネントがありますが、一度に作り込まずに一旦このコンポーネントで全て定義し、その後に分割していきます。

`components`配下に`board`ディレクトリを作成し、その配下に`TodoBoard.tsx`を作成します。  
`TodoBoard`が使用するCSSを分割するため、`TodoBoard.css`も作成します。子コンポーネントを分割した後に`TodoBoard.css`を`TodoBoard.module.css`に修正します。

`src/components/board/TodoBoard.css`
```css
.TodoBoard_content {
  margin-top: 10px;
  width: 40%;
  padding: 0 30%;
}

.TodoForm_content {
  margin-top: 20px;
  margin-bottom: 20px;
}
.TodoForm_form {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.TodoForm_input {
  width: 86%;
}
.TodoForm_input input{
  float: left;
  width: 95%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  outline: none;
}
.TodoForm_input input:focus {
  background-color: white;
}
.TodoForm_button {
  text-align: center;
  width: 14%;
}
.TodoForm_button button {
  height: 35px;
  cursor: pointer;
  line-height: 1;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 0 15px;
  border: none;
  vertical-align: middle;
}
.TodoForm_button button:hover {
  background-color: green;
}

.TodoFilter_content {
  text-align: right;
}
.TodoFilter_content button{
  margin-left: 5px;
}
.TodoFilter_buttonSelected {
  background-color: #31b3c7;
  border-width: 0;
  color: #fff;
  cursor: pointer;
  justify-content: center;
  padding: 7px 16px;
  text-align: center;
  white-space: nowrap;
  border-radius: 290486px;
  outline: none;
}
.TodoFilter_buttonUnselected {
  background-color: lightgray;
  border-width: 0;
  color: gray;
  cursor: pointer;
  justify-content: center;
  padding: 7px 16px;
  text-align: center;
  white-space: nowrap;
  border-radius: 290486px;
  outline: none;
}

.TodoList_list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.TodoItem_item {
  padding: 15px 10px;
  background: whitesmoke;
  margin-bottom: 10px;
}
.TodoItem_todo {
  float: left;
  text-align: left;
}
.TodoItem_checkbox {
  margin-right: 7px;
  outline: none;
}
.TodoItem_delete {
  text-align: right;
}
.TodoItem_button {
  font-size: 17px;
  font-weight: bold;
  border: none;
  color: grey;
  background: lightgrey;
  border-radius: 100%;
  width: 25px;
  height: 25px;
  line-height: 20px;
  cursor: pointer;
  outline: none;
}
```

`TodoBoard`が返すReact要素を、`Home`から抽出します。

`src/components/board/TodoBoard.tsx`
```jsx
import React from 'react';
import './TodoBoard.css';

export const TodoBoard: React.FC = () => {
  return (
    <div className='TodoBoard_content'>
      <div className='TodoForm_content'>
        <form className='TodoForm_form'>
          <div className='TodoForm_input'>
            <input type='text' placeholder='タスクを入力してください' />
          </div>
          <div className='TodoForm_button'>
            <button type='button'>追加</button>
          </div>
        </form>
      </div>
      <div className='TodoFilter_content'>
        <button className='TodoFilter_buttonSelected'>全て</button>
        <button className='TodoFilter_buttonUnselected'>未完了のみ</button>
        <button className='TodoFilter_buttonUnselected'>完了のみ</button>
      </div>
      <ul className='TodoList_list'>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' checked={true} />
              <span>洗い物をする</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>洗濯物を干す</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>買い物へ行く</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
      </ul>
    </div>
  );
};
```

`TodoBoard`が作成できたら、`Home`で`TodoBoard`を使用するように修正します。

`src/app/page.tsx`
```jsx
'use client';
import React from 'react';
import {NavigationHeader} from '../components/navigation-header/NavigationHeader';
import {TodoBoard} from '../components/board/TodoBoard';

export default function Home() {
  return (
    <React.Fragment>
      <NavigationHeader />
      <TodoBoard />
    </React.Fragment>
  );
}
```

また、`TodoBoard.css`に抽出した定義を`globals.css`から削除します。

ページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`Home`から`TodoBoard`部分の抽出は完了です。

### TodoForm

`TodoBoard`をさらに子コンポーネントに分割するため、`TodoForm`コンポーネントを作成します。
`board`配下に`form`ディレクトリを作成し、`TodoForm.tsx`を作成します。`TodoForm`が使用するCSSを分割するため、`TodoForm.module.css`も作成します。

先に`TodoBoard.css`から`TodoForm`で使用するCSSを移植します。
`TodoForm.module.css`のクラス名から`TodoForm_`を削除します。

`src/components/board/form/TodoForm.module.css`
```css
.content {
  margin-top: 20px;
  margin-bottom: 20px;
}
.form {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.input {
  width: 86%;
}
.input input {
  float: left;
  width: 95%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  outline: none;
}
.input input:focus {
  background-color: white;
}
.button {
  text-align: center;
  width: 14%;
}
.button button {
  height: 35px;
  cursor: pointer;
  line-height: 1;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 0 15px;
  border: none;
  vertical-align: middle;
}
.button button:hover {
  background-color: green;
}
```

`TodoForm`が返すReact要素を、`TodoBoard`から抽出します。
また、`TodoForm.module.css`をimportする際に変数に`styles`と指定し、className属性で`{styles.クラス名}`と記述します。

`src/components/board/form/TodoForm.tsx`
```jsx
import React from 'react';
import styles from './TodoForm.module.css';

export const TodoForm: React.FC = () => {
  return (
    <div className={styles.content}>
      <form className={styles.form}>
        <div className={styles.input}>
          <input type='text' placeholder='タスクを入力してください' />
        </div>
        <div className={styles.button}>
          <button type='button'>追加</button>
        </div>
      </form>
    </div>
  );
};
```

`TodoForm`が作成できたら、`TodoBoard`で`TodoForm`を使用するように修正します。

`src/components/board/TodoBoard.tsx`
```jsx
import React from 'react';
import './TodoBoard.css';
import {TodoForm} from './form/TodoForm';

export const TodoBoard: React.FC = () => {
  return (
    <div className='TodoBoard_content'>
      <TodoForm />
      <div className='TodoFilter_content'>
        <button className='TodoFilter_buttonSelected'>全て</button>
        <button className='TodoFilter_buttonUnselected'>未完了のみ</button>
        <button className='TodoFilter_buttonUnselected'>完了のみ</button>
      </div>
      <ul className='TodoList_list'>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' checked={true} />
              <span>洗い物をする</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>洗濯物を干す</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>買い物へ行く</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
      </ul>
    </div>
  );
};
```

また、`TodoForm.module.css`に抽出した定義を`TodoBoard.css`から削除します。

ページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`TodoBoard`から`TodoForm`部分の抽出は完了です。

### TodoFilter

`TodoBoard`をさらに子コンポーネントに分割するため、`TodoFilter`コンポーネントを作成します。
`board`配下に`filter`ディレクトリを作成し、`TodoFilter.tsx`を作成します。`TodoFilter`が使用するCSSを分割するため、`TodoFilter.module.css`も作成します。

先に`TodoBoard.css`から`TodoFilter`で使用するCSSを移植します。
`TodoFilter.module.css`のクラス名から`TodoFilter_`を削除します。

`src/components/board/filter/TodoFilter.module.css`
```css
.content {
  text-align: right;
}
.content button {
  margin-left: 5px;
}
.buttonSelected {
  background-color: #31b3c7;
  border-width: 0;
  color: #fff;
  cursor: pointer;
  justify-content: center;
  padding: 7px 16px;
  text-align: center;
  white-space: nowrap;
  border-radius: 290486px;
  outline: none;
}
.buttonUnselected {
  background-color: lightgray;
  border-width: 0;
  color: gray;
  cursor: pointer;
  justify-content: center;
  padding: 7px 16px;
  text-align: center;
  white-space: nowrap;
  border-radius: 290486px;
  outline: none;
}
```

`TodoFilter`が返すReact要素を、`TodoBoard`から抽出します。  
また、`TodoFilter.module.css`をimportする際に変数に`styles`と指定し、className属性で`{styles.クラス名}`と記述します。

`src/components/board/filter/TodoFilter.tsx`
```jsx
import React from 'react';
import styles from './TodoFilter.module.css';

export const TodoFilter: React.FC = () => {
  return (
    <div className={styles.content}>
      <button className={styles.buttonSelected}>全て</button>
      <button className={styles.buttonUnselected}>未完了のみ</button>
      <button className={styles.buttonUnselected}>完了のみ</button>
    </div>
  );
};
```

`TodoFilter`が作成できたら、`TodoBoard`で`TodoFilter`を使用するように修正します。

`src/components/board/TodoBoard.tsx`
```jsx
import React from 'react';
import './TodoBoard.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';

export const TodoBoard: React.FC = () => {
  return (
    <div className='TodoBoard_content'>
      <TodoForm />
      <TodoFilter />
      <ul className='TodoList_list'>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' checked={true} />
              <span>洗い物をする</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>洗濯物を干す</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
        <li className='TodoItem_item'>
          <div className='TodoItem_todo'>
            <label>
              <input type='checkbox' className='TodoItem_checkbox' />
              <span>買い物へ行く</span>
            </label>
          </div>
          <div className='TodoItem_delete'>
            <button className='TodoItem_button'>x</button>
          </div>
        </li>
      </ul>
    </div>
  );
};
```

また、`TodoFilter.module.css`に抽出した定義を`TodoBoard.css`から削除します。

ページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`TodoBoard`から`TodoFilter`部分の抽出は完了です。

### TodoList

`TodoBoard`をさらに子コンポーネントに分割するため、`TodoList`コンポーネントを作成します。
このコンポーネントには子コンポーネントがありますが、`TodoBoard`作成時と同様、一旦このコンポーネントで全て定義し、その後に分割していきます。

`board`配下に`list`ディレクトリを作成し、`TodoList.tsx`を作成します。`TodoList`が使用するCSSを分割するため、`TodoList.css`も作成します。
`TodoList`の子コンポーネントを分割後に  
`TodoList.css`を`TodoList.module.css`に修正します。

`src/components/board/list/TodoList.css`
```css
.TodoList_list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.TodoItem_item {
  padding: 15px 10px;
  background: whitesmoke;
  margin-bottom: 10px;
}
.TodoItem_todo {
  float: left;
  text-align: left;
}
.TodoItem_checkbox {
  margin-right: 7px;
  outline: none;
}
.TodoItem_delete {
  text-align: right;
}
.TodoItem_button {
  font-size: 17px;
  font-weight: bold;
  border: none;
  color: grey;
  background: lightgrey;
  border-radius: 100%;
  width: 25px;
  height: 25px;
  line-height: 20px;
  cursor: pointer;
  outline: none;
}
```

`TodoList`が返すReact要素を、`TodoBoard`から抽出します。

`src/components/board/list/TodoList.tsx`
```jsx
import React from 'react';
import './TodoList.css';

export const TodoList: React.FC = () => {
  return (
    <ul className='TodoList_list'>
      <li className='TodoItem_item'>
        <div className='TodoItem_todo'>
          <label>
            <input type='checkbox' className='TodoItem_checkbox' checked={true} />
            <span>洗い物をする</span>
          </label>
        </div>
        <div className='TodoItem_delete'>
          <button className='TodoItem_button'>x</button>
        </div>
      </li>
      <li className='TodoItem_item'>
        <div className='TodoItem_todo'>
          <label>
            <input type='checkbox' className='TodoItem_checkbox' />
            <span>洗濯物を干す</span>
          </label>
        </div>
        <div className='TodoItem_delete'>
          <button className='TodoItem_button'>x</button>
        </div>
      </li>
      <li className='TodoItem_item'>
        <div className='TodoItem_todo'>
          <label>
            <input type='checkbox' className='TodoItem_checkbox' />
            <span>買い物へ行く</span>
          </label>
        </div>
        <div className='TodoItem_delete'>
          <button className='TodoItem_button'>x</button>
        </div>
      </li>
    </ul>
  );
};

```

`TodoList`が作成できたら、`TodoBoard`で`TodoList`を使用するように修正し、`TodoList.css`に抽出した定義を`TodoBoard.css`から削除します。

ページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`TodoBoard`から`TodoList`部分の抽出は完了です。

この時点で、`TodoBoard`のコンポーネント分割は完了したため、`TodoBoard.tsx`は次のようになっています。

`src/components/board/TodoBoard.tsx`
```jsx
import React from 'react';
import './TodoBoard.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';

export const TodoBoard: React.FC = () => {
  return (
    <div className='TodoBoard_content'>
      <TodoForm />
      <TodoFilter />
      <TodoList />
    </div>
  );
};
```

`TodoBoard.css`をCSS Modulesとして使用するために`TodoBoard.module.css`にファイル名を変更します。
ファイル名変更後、`TodoBoard.module.css`のクラス名から`TodoBoard_`を削除します。

`src/components/board/TodoBoard.module.css`
```css
.content {
  margin-top: 10px;
  width: 40%;
  padding: 0 30%;
}
```

最後に、`TodoBoard.module.css`をimportします。変数に`styles`と指定し、className属性で  
`{styles.クラス名}`と記述します。

修正後のコードは以下のようになります。

`src/components/board/TodoBoard.tsx`
```jsx
import React from 'react';
import styles from './TodoBoard.module.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';

export const TodoBoard: React.FC = () => {
  return (
    <div className={styles.content}>
      <TodoForm />
      <TodoFilter />
      <TodoList />
    </div>
  );
};
```

### TodoItem

`TodoList`をさらに子コンポーネントに分割するため、`TodoItem`コンポーネントを作成します。
`list`配下に`item`ディレクトリを作成し、`TodoItem.tsx`を作成します。`TodoItem`が使用するCSSを分割するため、`TodoItem.module.css`も作成します。

先に`TodoList.css`から`TodoItem`で使用するCSSを移植します。
`TodoItem.module.css`のクラス名から`TodoItem_`を削除します。

`src/components/board/list/item/TodoItem.module.css`
```css
.item {
  padding: 15px 10px;
  background: whitesmoke;
  margin-bottom: 10px;
}
.todo {
  float: left;
  text-align: left;
}
.checkbox {
  margin-right: 7px;
  outline: none;
}
.delete {
  text-align: right;
}
.button {
  font-size: 17px;
  font-weight: bold;
  border: none;
  color: grey;
  background: lightgrey;
  border-radius: 100%;
  width: 25px;
  height: 25px;
  line-height: 20px;
  cursor: pointer;
  outline: none;
}
```

`TodoItem`が返すReact要素を、`TodoList`から抽出しますが、`TodoItem`は複数配置し、それぞれの表示内容が異なります。このような場合には、コンポーネントにプロパティを定義し、親コンポーネントから引数で値を受け取るようにします。（参考：[コンポーネントに props を渡す – React](https://ja.react.dev/learn/passing-props-to-a-component)）

ここでは、TypeScriptの構文である`type`を使用し、プロパティの型を定義した型エイリアスを定義します。それをコンポーネントの型である`React.FC`の型引数として渡すことで、コンポーネントの引数をそれらの型でチェックすることができます。

```js
type Props = {
  text: string;
  completed: boolean;
};
```

受け取った引数はページ外観の作成時に実装した`checked`と同様、中括弧で囲うことによりJSXで使用することができます。
また、`TodoItem.module.css`をimportする際に変数に`styles`と指定し、className属性で`{styles.クラス名}`と記述します。

`TodoItem.tsx`の実装は次のようになります。

`src/components/board/list/item/TodoItem.tsx`
```jsx
import React from 'react';
import styles from './TodoItem.module.css';

type Props = {
  text: string;
  completed: boolean;
};

export const TodoItem: React.FC<Props> = ({text, completed}) => {
  return (
    <li className={styles.item}>
      <div className={styles.todo}>
        <label>
          <input type='checkbox' className={styles.checkbox} checked={completed} />
          <span>{text}</span>
        </label>
      </div>
      <div className={styles.delete}>
        <button className={styles.button}>x</button>
      </div>
    </li>
  );
};
```

`TodoList`では次のようにして`TodoItem`のプロパティに値を設定します。

`src/components/board/list/TodoList.tsx`
```jsx
import React from 'react';
import './TodoList.css';
import {TodoItem} from './item/TodoItem';

export const TodoList: React.FC = () => {
  return (
    <ul className='TodoList_list'>
      <TodoItem text='洗い物をする' completed={true} />
      <TodoItem text='洗濯物を干す' completed={false} />
      <TodoItem text='買い物へ行く' completed={false} />
    </ul>
  );
};
```

これで`TodoList`で`TodoItem`を使用できるようになりました。
また、`TodoItem.module.css`に抽出した定義を`TodoList.css`から削除します。

`TodoList.css`をCSS Modulesとして使用するために`TodoList.module.css`にファイル名を変更します。
ファイル名変更後、`TodoList.module.css`のクラス名から`TodoList_`を削除します。

`src/components/board/list/TodoList.module.css`
```css
.list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}
```

最後に、`TodoList.tsx`に`TodoList.module.css`をimportします。変数に`styles`と指定し、className属性で`{styles.クラス名}`と記述します。

それらの操作を実行すると`TodoList`は以下のようになります。

`src/components/board/list/TodoList.tsx`
```jsx
import React from 'react';
import styles from './TodoList.module.css';
import {TodoItem} from './item/TodoItem';

export const TodoList: React.FC = () => {
  return (
    <ul className={styles.list}>
      <TodoItem text='洗い物をする' completed={true} />
      <TodoItem text='洗濯物を干す' completed={false} />
      <TodoItem text='買い物へ行く' completed={false} />
    </ul>
  );
};
```

ページの表示内容を確認すると、何も変わらず表示されていることが分かります。これで`TodoList`から`TodoItem`部分の抽出は完了です。

これで、コンポーネントの分割は完了です。