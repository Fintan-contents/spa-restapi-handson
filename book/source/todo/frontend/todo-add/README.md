# ToDoの登録

ToDoページで新しいToDoを登録できるように実装します。

## stateの設計

ToDoの一覧表示の時と同様に、ToDoを登録するコンポーネントで、どのような状態が必要になるかを考えていきます。

ここでは、ToDoを登録するためのフォームを作成します。フォームの作成についてはReactからガイドされており、フォーム自身が保持する独自のstateをReactが管理するstateに統合し、Reactのstateのみで制御する「制御されたコンポーネント」として作成することを推奨しています。（参考：[input](https://ja.react.dev/reference/react-dom/components/input)、[select](https://ja.react.dev/reference/react-dom/components/select)、[textarea](https://ja.react.dev/reference/react-dom/components/textarea)）

ここからわかるとおり、フォームでは入力中の状態を保持するstateが必要になります。ここでは、ToDoの内容を入力するフォームであるため、入力中のToDoの内容を保持するstateが必要になります。

このstateは、ToDoを登録するコンポーネントである`TodoForm`でしか必要ないため、stateはこのコンポーネントに配置します。

登録完了したToDoは一覧に表示しますが、一覧で表示するためのToDoを保持するstateは`TodoBoard`に配置しています。そのため、`TodoForm`でToDoを登録した際に`TodoBoard`のstateを更新するようにします。

## ToDo登録フォームの実装

`TodoForm`を実装していきます。このコンポーネントにあるフォームには、テキスト入力ボックスがあります。これを先ほど説明した「制御されたコンポーネント」として実装します。

このようなテキスト入力ボックスを実装するために、example-chatのフロントエンドでは`useInput`という独自のフックを実装していますので、その実装を流用します。

まず、`src/hooks`ディレクトリを作成し、そこに`useInput.ts`ファイルを作成します。
example-chatの`src/framework/hooks/index.ts`に`useInput`が定義されているため、このコードを`useInput.ts`ファイルに持ってきます。

```js
import { useState } from 'react';

/**
 * input要素のステートフックとステート更新をラッピングした独自フック。
 *
 * @param initialState 初期値
 * @return [input要素のステート, input要素の属性, ステート更新の関数]
 */
export const useInput = (initialState: string = ''): [string, React.InputHTMLAttributes<HTMLInputElement>, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = useState<string>(initialState);

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  return [
    value,
    {
      value,
      onChange
    },
    setValue
  ];
};
```

`TodoForm`では、この`useInput`を使用して、次のように実装します。

```jsx
import React from 'react';
import './TodoForm.css';
import { useInput } from '../hooks/useInput';

export const TodoForm: React.FC = () => {
  const [text, textAttributes, setText] = useInput('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 登録した際の処理を書く予定だが、この時点で動作確認しやすいように一旦 alert で入力値を表示する
    alert(text);
  };
  
  return (
    <div className="TodoForm_content">
      <form onSubmit={handleSubmit} className="TodoForm_form">
        <div className="TodoForm_input">
          <input type="text" {...textAttributes} placeholder="タスクを入力してください"/>
        </div>
        <div className="TodoForm_button">
          <button type="submit">追加</button>
        </div>
      </form>
    </div>
  );
};
```

`useInput`では、`useState`と同様に呼び出し時に初期値を渡します。戻り値としては、state自体や、`input`に渡すためのプロパティが設定されたオブジェクト等が返されます。

`input`のプロパティを個別に設定してもよいですが、ここでは[スプレッド構文](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax)を使用して、そのオブジェクトに設定されているプロパティを展開して一気に設定します。

```jsx
<input type="text" {...textAttributes} placeholder="タスクを入力してください"/>
```

`textAttributes`には`value`と`onChange`プロパティがあるため、これは次の実装と同じ意味になります。

```jsx
<input type="text" value={textAttributes.value} onChange={textAttributes.onChange} placeholder="タスクを入力してください"/>
```

フォームのサブミットで登録処理を行うように、「追加」ボタンの`type`を`submit`に設定します。これで、「追加」ボタンをクリックするとサブミットされるようになります。

サブミット時に登録処理を実行するようにするため、登録処理を`handleSubmit`関数として実装し、`form`の`onSubmit`に設定します。これで、サブミット時にこの関数がコールバックされます。
また、サブミット時に関数がコールバックされた後、そのままだとサブミットイベントによりフォームをサーバに送信しようとしてしまうので、次のように関数内で`event.preventDefault()`を呼び、サブミットイベントをキャンセルしておきます。

```js
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
...
```

サブミットイベントをキャンセルすると何も起きなくなるため、この時点で動作確認をしたい場合には少し分かりづらくなります。そのため、ここでは一旦 `alert` で入力値を表示するようにしています。これはあくまで一時的な確認用のため、この後でREST APIを呼び出す処理を実装する際には削除します。

## REST APIの呼び出しとstateの更新

先ほど作成したサブミット用のコールバック関数では、イベントをキャンセルするだけでしたが、生成したクライアントコードでREST APIを呼び出すように実装していきます。

REST APIを呼び出すと登録した結果のToDoがレスポンスとして返されるので、それを一覧に表示されるようにします。ただ、一覧に表示するためのstateは、`TodoForm`の親コンポーネントである`TodoBoard`に配置しているため、`TodoForm`の実装では更新することができません。このような場合、stateを配置しているコンポーネントでstateを更新するためのコールバック関数を定義し、それをプロパティで渡してもらうようにします。

また、ToDoを登録した後は入力したテキストもクリアするため、テキスト入力のstateも更新するようにします。

```jsx
import React from 'react';
import './TodoForm.css';
import { useInput } from '../hooks/useInput';
import { BackendService } from '../backend/BackendService';

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Props = {
  addTodo: (todo: Todo) => void
}

export const TodoForm: React.FC<Props> = ({addTodo}) => {
  const [text, textAttributes, setText] = useInput('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    BackendService.postTodo(text)
      .then(response => addTodo(response));
    setText('');
  };

  return (
    <div className="TodoForm_content">
      <form onSubmit={handleSubmit} className="TodoForm_form">
        <div className="TodoForm_input">
          <input type="text" {...textAttributes} placeholder="タスクを入力してください"/>
        </div>
        <div className="TodoForm_button">
          <button type="submit">追加</button>
        </div>
      </form>
    </div>
  );
};
```

`TodoBoard`では、次のように、引数のToDoをstateのToDoに結合させる関数を作成し、それを`TodoForm`に渡すように実装します。

```jsx
export const TodoBoard: React.FC = () => {
...
  const addTodo = (todo: Todo) => {
    setTodos(todos.concat(todo));
  };
...
  return (
    <div className="TodoBoard_content">
      <TodoForm addTodo={addTodo}/>
...
```

このようにすることで、`TodoBoard`のstateの管理は`TodoBoard`に残したまま、`TodoForm`から更新することができるようになります。

## モックを使用した動作確認

ToDoページを表示して、ToDoが登録できることを確認します。ToDo登録フォームのテキスト入力に適当な値を入力して「追加」ボタンをクリックし、モックサーバからのレスポンスで取得したToDoが一覧に追加されるのを確認します。

モックサーバの起動時にも説明しましたが、モックサーバからはOpenAPIドキュメントのexampleに設定した値がレスポンスとして返されます。そのため、ここでは常に同じToDoが追加されることになり、実際に入力したToDoが追加されるわけではありませんので、注意してください。

確認ができたら、フロントエンドの実装は完了です。