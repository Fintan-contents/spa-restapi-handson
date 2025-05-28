# ページ外観の作成

ユーザー認証で追加するページの外観を作成します。

## コンポーネントの分割

それぞれのページにあるナビゲーションメニューのヘッダについては、表示されているメニューは違いますがToDoページとほぼ同じものであるため、ToDoページで作成した`NavigationHeader`コンポーネントを使用します。

ヘッダ以外の部分については、それぞれのページ内では用途が同じ情報のみ扱っているため、それぞれのページ全体をコンポーネントとします。

- **NavigationHeader**：ナビゲーションメニューのヘッダ
- **Welcome**：トップページのウェルカムメッセージを表示する
- **Signup**：サインアップフォームを表示する
- **Login**：ログインフォームを表示する

これらのコンポーネントを、ToDoページのコンポーネントと並べて次の階層構造となるように作成していきます。

- NavigationHeader（作成済み）
- Welcome
- Signup
- Login
- TodoBoard（作成済み）
  - TodoForm
  - TodoFilter
  - TodoList
    - TodoItem

## コンポーネントの作成

ToDoページを作成した時と同じように、`spa-restapi-handson/design-mock`に配置されているデザインモックを元に、それぞれのコンポーネントを作成していきます。

### Welcome

まず、`components`の下に`welcome`ディレクトリを作成し、そこにCSS Modulesファイルと`Welcome`コンポーネントを作成します。

`src/components/welcome/Welcome.module.css`
```css
.content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}
.title {
  font-size: 60px;
}
.buttonGroup {
  text-align: center;
}
.button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.button:hover {
  background-color: green;
}
```
`src/components/welcome/Welcome.tsx`
```js
import React from 'react';
import styles from './Welcome.module.css';

export const Welcome: React.FC = () => {
  return (
    <div className={styles.content}>
      <div>
        <h1 className={styles.title}>Welcome</h1>
        <div className={styles.buttonGroup}>
          <button className={styles.button}>登録する</button>
        </div>
      </div>
    </div>
  );
};
```

### Signup

続いて、`components`の下に`signup`ディレクトリを作成し、そこにCSS Modulesファイルと`Signup`コンポーネントを作成します。

`src/components/signup/Signup.module.css`
```css
.content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  text-align: center;
}
.box {
  width: 50%;
}
.title {
  height: 70px;
}
.title h1 {
  margin: 10px 0;
}
.form {
  width: 50%;
  padding: 0 25%;
}
.item {
  margin: 20px 0;
  height: 75px;
}
.item input {
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  margin-top: 10px;
  outline: none;
}
.item input:focus {
  background-color: white;
}
.label {
  text-align: left;
}
.buttonGroup {
  text-align: center;
  margin-top: 40px;
}
.button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.button:hover {
  background-color: green;
}
```
`src/components/signup/Signup.tsx`
```jsx
import React from 'react';
import styles from './Signup.module.css';

export const Signup: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.title}>
          <h1>ユーザー登録</h1>
        </div>
        <div className={styles.form}>
          <div className={styles.item}>
            <div className={styles.label}>名前</div>
            <input type='text' />
          </div>
          <div className={styles.item}>
            <div className={styles.label}>パスワード</div>
            <input type='password' />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button}>
              登録する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Login

続いて、`components`の下に`login`ディレクトリを作成し、そこにCSS Modulesファイルと`Login`コンポーネントを作成します。

`src/components/login/Login.module.css`
```css
.content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  text-align: center;
}
.box {
  width: 50%;
}
.title {
  height: 70px;
}
.title h1 {
  margin: 10px 0;
}
.form {
  width: 50%;
  padding: 0 25%;
}
.item {
  margin: 20px 0;
  height: 75px;
}
.item input {
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  margin-top: 10px;
  outline: none;
}
.item input:focus {
  background-color: white;
}
.label {
  text-align: left;
}
.buttonGroup {
  text-align: center;
  margin-top: 40px;
}
.button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.button:hover {
  background-color: green;
}
```
`src/components/login/Login.tsx`
```jsx
import React from 'react';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.title}>
          <h1>ログイン</h1>
        </div>
        <div className={styles.form}>
          <div className={styles.item}>
            <div className={styles.label}>名前</div>
            <input type='text' />
          </div>
          <div className={styles.item}>
            <div className={styles.label}>パスワード</div>
            <input type='password' />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button}>
              ログインする
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 動作確認

ページを表示して確認したいところですが、複数のページをそれぞれ確認しづらいため、次の章であるルーティングの設定の最後に動作を確認します。