# ToDo状態の更新

ToDoページでToDoの状態を更新できるように実装します。

## stateの設計

ToDoの状態を更新するコンポーネントで、どのような状態が必要になるかを考えていきます。

ToDoの状態を更新するためのチェックボックスがあるコンポーネントは、`TodoItem`です。

チェックするToDoのstateは`TodoBoard`に配置しているため、ToDoの登録と同じように、`TodoBoard`から更新用のコールバック関数をプロパティで渡すようにします。

## REST APIの呼び出しとstateの更新

登録のときと同様に、stateの更新用のコールバック関数をプロパティで渡すように実装します。

登録のときは、`TodoForm`でREST APIを呼び出した後に、結果をコールバック関数に渡して実行していました。`TodoForm`での実装は簡易さを重視してそのようにしましたが、ToDoのstateと更新処理は関連が深く、本来は近いところにある方が望ましくもあります。そのため、ここでは`TodoBoard`で実装する関数内でREST APIの呼び出しも行うようにします。

### `TodoItem`の実装

`TodoItem`では、`TodoList`からチェックがされるたびに状態を反転して更新する関数を受け取るようプロパティを追加します。受け取った関数はチェックされるたびに実行したいため、チェックボックスの`onChange`で実行するようにします。

```jsx
import React from 'react';
import './TodoItem.css';

type Props = {
  id: number
  text: string
  completed: boolean
  toggleTodoCompletion: (id: number) => void
}

export const TodoItem: React.FC<Props> = ({id, text, completed, toggleTodoCompletion}) => {
  return (
    <li className="TodoItem_item">
      <div className="TodoItem_todo">
        <label>
          <input type="checkbox"
                 className="TodoItem_checkbox"
                 checked={completed}
                 onChange={() => toggleTodoCompletion(id)} />
          <span>{text}</span>
        </label>
      </div>
      <div className="TodoItem_delete">
        <button className="TodoItem_button">x</button>
      </div>
    </li>
  );
};
```

### `TodoList`の実装

`TodoList`でも、同様に関数を受け取るためのプロパティを追加します。受け取った関数は`TodoItem`にそのまま渡すようにします。

```jsx
import React from 'react';
import './TodoList.css';
import { TodoItem } from './TodoItem';

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Props = {
  todos: Todo[],
  toggleTodoCompletion: (id: number) => void
}

export const TodoList: React.FC<Props> = ({todos, toggleTodoCompletion}) => {
  return (
    <ul className="TodoList_list">
      {todos.map(todo =>
        <TodoItem key={todo.id} id={todo.id} text={todo.text} completed={todo.completed} toggleTodoCompletion={toggleTodoCompletion}/>
      )}
    </ul>
  );
};
```

### `TodoBoard`の実装

`TodoBoard`では、ToDoの状態を更新するREST APIを呼び出し、その結果からstateを更新する関数を定義します。その関数は、先ほど追加した`TodoList`のプロパティに渡します。

```jsx
export const TodoBoard: React.FC = () => {
...
  const toggleTodoCompletion = (id: number) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) {
      return;
    }
    BackendService.putTodo(id, !target.completed)
      .then(response => setTodos(
        todos.map(todo => todo.id === response.id ? response : todo)
      ));
  };

  return (
...
      <TodoList todos={todos} toggleTodoCompletion={toggleTodoCompletion}/>
...
```

`addTodo`とは違い、ToDoの更新手段についても`TodoBoard`まで引き上げた形になりました。

## モックを使用した動作確認

ToDoページを表示して、チェックボックスをクリックしてToDoを完了にできるか確認します。OpenAPIドキュメントの`example`には`id`が`2002`で定義しているため、二行目の「やること２」のチェックボックスにチェックを入れることができるかどうかを確認します。

確認ができたら、フロントエンドの実装は完了です。
