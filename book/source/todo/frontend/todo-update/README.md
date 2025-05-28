# ToDo状態の更新

ToDoページでToDoの状態を更新できるように実装します。

## stateの設計

ToDoの状態を更新するコンポーネントで、どのような状態が必要になるかを考えていきます。

ToDoの状態を更新するためのチェックボックスがあるコンポーネントは、`TodoItem`です。

チェックするToDoのstateは`TodoBoard`に配置しているため、ToDoの登録と同様に、`TodoBoard`から更新用のコールバック関数をプロパティで渡します。

## REST APIの呼び出しとstateの更新

ToDoの登録のときと同様に、stateの更新用のコールバック関数をプロパティで渡すように実装します。

登録の時は、実装の簡易さを重視して`TodoForm`内でREST APIを呼び出していました。
しかし、フロントエンドのstateとバックエンドの永続化データが密接に関連している場合、stateの更新とREST APIの呼び出しを近くで扱うことが本来は望ましいです。そこで、今回は`TodoBoard`内でToDo更新のREST APIを呼び出すように実装します。

### `TodoItem`の実装

`TodoItem`では、`TodoList`からチェックがされるたびに状態を反転して更新する関数を受け取るようプロパティを追加します。受け取った関数はチェックされるたびに実行したいため、チェックボックスの`onChange`で実行するようにします。

`src/components/board/list/item/TodoItem.tsx`
```jsx
import React from 'react';
import styles from './TodoItem.module.css';

type Props = {
  id: number;
  text: string;
  completed: boolean;
  toggleTodoCompletion: (id: number) => void;
};

export const TodoItem: React.FC<Props> = ({id, text, completed, toggleTodoCompletion}) => {
  return (
    <li className={styles.item}>
      <div className={styles.todo}>
        <label>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={completed}
            onChange={() => toggleTodoCompletion(id)}
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

### `TodoList`の実装

`TodoList`でも、同様に関数を受け取るためのプロパティを追加します。受け取った関数は`TodoItem`にそのまま渡します。

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
  toggleTodoCompletion: (id: number) => void;
};

export const TodoList: React.FC<Props> = ({todos, toggleTodoCompletion}) => {
  return (
    <ul className={styles.list}>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          text={todo.text}
          completed={todo.completed}
          toggleTodoCompletion={toggleTodoCompletion}
        />
      ))}
    </ul>
  );
};
```

### `TodoBoard`の実装

`TodoBoard`では、ToDoの状態を更新するREST APIを呼び出し、その結果からstateを更新する関数を定義します。その関数は、先ほど追加した`TodoList`のプロパティに渡します。

`src/components/board/TodoBoard.tsx`
```jsx
export const TodoBoard: React.FC = () => {
...
  const toggleTodoCompletion = (id: number) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) {
      return;
    }
    BackendService.putTodo(id, !target.completed).then(response =>
      setTodos(todos.map(todo => (todo.id === response.id ? response : todo))),
    );
  };

  return (
...
      <TodoList todos={todos} toggleTodoCompletion={toggleTodoCompletion} />
...
```

`setTodos`を実行するだけの`addTodo`とは違い、ToDo更新のREST API呼び出しについても`TodoBoard`まで引き上げた形になりました。

上記の実装を進める中で`TodoItem.tsx`で`onChange`ハンドラを実装しました。
そのため、ページ外観の作成から発生していたエラーはここで解消されます。

## モックを使用した動作確認

ToDoページを表示して、チェックボックスをクリックしてToDoを完了にできるか確認します。OpenAPIドキュメントの`example`には`id`が`2002`で定義しているため、二行目の「やること２」のチェックボックスにチェックを入れることができるか確認します。（OpenAPIドキュメントで、`putTodo`の`example`には`completed: true`が設定されています。そのため、モックサーバを使用した動作確認ではチェックを外す操作はできません。）

確認ができたら、フロントエンドのToDo状態の更新の実装は完了です。
