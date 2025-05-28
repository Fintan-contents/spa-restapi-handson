# ToDoの一覧表示

ToDoページで登録されているToDoを一覧表示できるように実装します。

## stateの設計

登録されているToDoを表示するために、コンポーネントでどのような状態が必要になるかを考えていきます。

Reactでは、stateを使用することで状態の変化を表現することができます。  
（参考：[React の流儀 ステップ 3 – React](https://ja.react.dev/learn/thinking-in-react#step-3-find-the-minimal-but-complete-representation-of-ui-state)）

コンポーネントのstateになりうるのは、ユーザーからの入力や時間の経過の中で変化するもの、他のstate等を使って算出可能ではないものになります。画面に表示するToDoの一覧は、ユーザーからの入力で変化していくもので、算出することもできないため、stateとします。

次に、そのstateをどのコンポーネントに配置するのかを考えていきます。  
（参考：[React の流儀 ステップ 4 – React](https://ja.react.dev/learn/thinking-in-react#step-4-identify-where-your-state-should-live)）

stateの配置場所を決めるために、stateとして管理することにしたToDo一覧がどこで利用されるかを確認します。まず、ToDo一覧は`TodoList`で表示されます。それぞれのToDoの内容を表示するのは`TodoItem`ですが、一覧できるように表示するのは`TodoList`です。また、`TodoForm`ではこのToDo一覧に追加できる必要があるため、`TodoForm`でもこのstateを扱うことになります。複数のコンポーネントでstateを必要とする場合、階層構造の中で共通の親コンポーネントがstateを持つことに適しているため、ここでは`TodoBoard`にこのstateを持たせることとします。

## コンポーネントの実装

現時点では、ToDoの表示内容は`TodoList`に静的に定義していますが、これを`TodoBoard`でstateを使って実装します。

Reactの関数コンポーネントでは、様々な機能を実装するためにフック（Hooks）と呼ばれる機能が提供されています。ToDoの表示内容にはuseStateフックを使います。  
（参考：[コンポーネントのメモリ – React](https://ja.react.dev/learn/state-a-components-memory)）

useStateフックは`useState`を呼び出すことで使用できます。引数に初期値を指定し、返り値としてstateとそれを更新するための関数をペアで返します。例えば、0から始まるカウントをstateとし、ボタンをクリックするごとにstateを更新するような場合、次のように使用します。

```js
const [count, setCount] = useState(0);

return (
  <div>
    <label>{count}</label>
    <button onClick={() => setCount(count + 1)}>カウントアップ</button>
  </div>
);
```

ここでは、初期値としてはまず現在の静的なデータを使用しておきます。合わせて、REST APIで取得した際にはToDoを識別する`id`も返却されるため、これも追加しておきます。

stateの更新は今の段階では必要ないため、stateを次のように実装します。

```js
const [todos] = useState([
  { id: 2001, text: '洗い物をする', completed: true },
  { id: 2002, text: '洗濯物を干す', completed: false },
  { id: 2003, text: '買い物へ行く', completed: false }
]);
```

このstateは`TodoBoard`に配置し、`TodoList`で表示します。そのため、`TodoList`でも`TodoItem`と同様にプロパティを定義し、`TodoBoard`からstateを受け取るようにする必要があります。  
さらに、`TodoItem`と同様に`type`でプロパティの型を定義し、`TodoList`にプロパティを追加します。

また、先ほどstateで扱うToDoデータに`id`を追加したため、プロパティでToDoデータを受け取っているコンポーネントの型定義に、次のように`id`を追加しておきます。

```js
type Props = {
  id: number;
  text: string;
  completed: boolean;
};
```

state使用前は`TodoList`で静的データを定義していたため、`TodoList`内で`TodoItem`を固定で3つ定義していました。プロパティとして引数で受け取るようにしたことで、定義する`TodoItem`の数が動的になります。引数は配列で受け取るため、`map`を使用して動的に`TodoItem`を生成するようにしておきます。

これらを実装すると、`TodoBoard`と`TodoList`、`TodoItem`は次のとおりになります。

`src/components/board/TodoBoard.tsx`
```jsx
import React, {useState} from 'react';
import styles from './TodoBoard.module.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodoBoard: React.FC = () => {
  const [todos] = useState<Todo[]>([
    { id: 2001, text: '洗い物をする', completed: true },
    { id: 2002, text: '洗濯物を干す', completed: false },
    { id: 2003, text: '買い物へ行く', completed: false }
  ]);

  return (
    <div className={styles.content}>
      <TodoForm />
      <TodoFilter />
      <TodoList todos={todos} />
    </div>
  );
};
```

`src/components/board/list/TodoList.tsx`
```jsx
import React from 'react';
import styles from './TodoList.module.css';
import {TodoItem} from './item/TodoItem';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type Props = {
  todos: Todo[];
};

export const TodoList: React.FC<Props> = ({todos}) => {
  return (
    <ul className={styles.list}>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          id={todo.id}
          text={todo.text}
          completed={todo.completed}
        />
      ))}
    </ul>
  );
};
```

`src/components/board/list/item/TodoItem.tsx`
```jsx
import React from 'react';
import styles from './TodoItem.module.css';

type Props = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodoItem: React.FC<Props> = ({id, text, completed}) => {
  return (
    <li className={styles.item}>
      <div className={styles.todo}>
        <label>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={completed}
          />
          <span>{text}</span>
        </label>
      </div>
      <div className={styles.delete}>
        <button className={styles.button}>
          x
        </button>
      </div>
    </li>
  );
};
```

なお、`TodoList`のJSXで`TodoItem`を宣言しているところで、`key`プロパティを使用します。これは、コンポーネントのレンダリング要否を判定するためにReactが使うプロパティで、`map`で繰り返してコンポーネントを使用したりする場合、個々のコンポーネントを識別するために一意となる値を設定する必要があります。（参考：[リストのレンダー – React](https://ja.react.dev/learn/rendering-lists)）

## REST APIの呼び出しとstateの更新

次に、stateを更新するため、REST APIを呼び出すタイミングを考えます。

ページを表示したタイミングでToDo一覧を表示したいので、`TodoBoard`コンポーネントを最初にレンダーしたタイミングで、REST APIを呼び出し、その結果からstateを更新するようにします。

関数コンポーネントでは、このようにデータの取得や更新によりコンポーネントに影響を与えることを副作用と呼び、副作用を起こす処理を実装するためのフックとして、useEffectフックが提供されています。（参考：[useEffect – React](https://ja.react.dev/reference/react/useEffect)）

useEffectフックは`useEffect`を呼び出すことで使用します。第1引数に副作用を起こす関数と、第2引数にこの副作用が依存するstateを配列で渡します。第2引数に渡したstateが更新されると、第1引数の関数が実行されます。ここでのREST API呼び出しは他のstateに依存せず、最初のレンダー後に呼び出したいため、そのような場合には空の配列（`[]`）を渡します。  
（参考：[エフェクトの依存配列を指定する（落とし穴） – React](https://ja.react.dev/learn/synchronizing-with-effects#step-2-specify-the-effect-dependencies)）

useStateフックの初期値で静的データを渡していましたが、REST APIの呼び出しを想定し、まずはuseEffectフックを使用して静的データでstateを更新するように実装してみます。stateの初期値としては、空の配列を渡しておきます。

`src/components/board/TodoBoard.tsx`
```jsx
import React, {useEffect, useState} from 'react';
import styles from './TodoBoard.module.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodoBoard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setTodos([
      { id: 2001, text: '洗い物をする', completed: true },
      { id: 2002, text: '洗濯物を干す', completed: false },
      { id: 2003, text: '買い物へ行く', completed: false }
    ]);
  }, []);

  return (
    <div className={styles.content}>
      <TodoForm />
      <TodoFilter />
      <TodoList todos={todos} />
    </div>
  );
};
```

ページの表示内容を確認すると、何も変わらず表示されています。いまは静的データで設定しているだけでuseEffectの処理も瞬時に完了するため、目に見えるような影響はありません。

useEffectフックで更新する準備ができたため、次に、生成したクライアントコードを使用してREST APIを呼び出すように実装します。事前に作成した`BackendService`の関数を使用して、REST APIを呼び出します。結果は`Promise`で返ってくるため、`then`を呼び出してレスポンスが返ってきたタイミングでstateの更新関数を呼び出すように実装します。

```jsx
import React, {useEffect, useState} from 'react';
import styles from './TodoBoard.module.css';
import {TodoForm} from './form/TodoForm';
import {TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';
import {BackendService} from '../../backend/BackendService';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodoBoard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    BackendService.getTodos().then(response => setTodos(response));
  }, []);

  return (
    <div className={styles.content}>
      <TodoForm />
      <TodoFilter />
      <TodoList todos={todos} />
    </div>
  );
};
```

## モックを使用した動作確認

ページを表示したら、モックサーバから取得したデータが一覧で表示されることを確認します。

確認ができたら、フロントエンドのToDoの一覧表示の実装は完了です。