# サインアップ

ユーザーコンテクストを使用して、サインアップ処理を実装します。

## サインアップ処理の実装

`Signup`コンポーネントにサインアップ処理を実装します。

```jsx
import React from "react";
import { useHistory } from 'react-router-dom';
import './Signup.css';
import { useInput } from '../hooks/useInput';
import { useUserContext } from '../contexts/UserContext';

export const Signup: React.FC = () => {
  const history = useHistory();
  const [userName, userNameAttributes] = useInput('');
  const [password, passwordAttributes] = useInput('');
  const userContext = useUserContext();

  const signup: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await userContext.signup(userName, password);
    history.push('/');
  };

  return (
    <div className="Signup_content">
      <div className="Signup_box">
        <div className="Signup_title">
          <h1>ユーザー登録</h1>
        </div>
        <form className="Signup_form" onSubmit={signup}>
          <div className="Signup_item">
            <div className="Signup_label">名前</div>
            <input type="text" {...userNameAttributes} />
          </div>
          <div className="Signup_item">
            <div className="Signup_label">パスワード</div>
            <input type="password" {...passwordAttributes} />
          </div>
          <div className="Signup_buttonGroup">
            <button type="submit" className="Signup_button">登録する</button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

フォームには名前とパスワードのテキストボックスがあるため、ToDo登録と同様に`useInput`を使用してstateとプロパティ用オブジェクトを作成し、フォームのJSXで各項目のプロパティとして展開します。

フォームのサブミット時には、ユーザーコンテクストのサインアップ関数に入力値を渡して実行するようにします。

## 入力値のバリデーション

ToDoを登録する際には入力値のバリデーションを行いませんでしたが、ここでは入力値に対して次のバリデーションを実装します。

- 名前が入力されているか
- パスワードが入力されているか
- パスワードが4文字以上であるか

example-chatのバックエンドでもこのような入力値のバリデーションを実装していますので、その実装を流用します。

example-chatの`src/framework/validation`ディレクトリに、入力値のバリデーションを実装したファイルが格納されているため、このディレクトリを、`src/validation`としてコピーします。

この中にバリデーション用のフックである`useValidation`が実装されているため、これを使用して`Signup`コンポーネントでバリデーションを実装します。

```jsx
...
import { stringField, useValidation } from '../validation';

type ValidationFields = {
  userName: string
  password: string
};

export const Signup: React.FC = () => {
...
  const { error, handleSubmit } = useValidation<ValidationFields>({
    userName: stringField()
      .required('名前を入力してください'),
    password: stringField()
      .required('パスワードを入力してください')
      .minLength(4, 'パスワードは4桁以上入力してください'),
  });
...
  return (
    <div className="Signup_content">
      <div className="Signup_box">
        <div className="Signup_title">
          <h1>ユーザー登録</h1>
        </div>
        <form className="Signup_form"
              onSubmit={handleSubmit({ userName, password }, signup)}>
          <div className="Signup_item">
            <div className="Signup_label">名前</div>
            <input type="text" {...userNameAttributes} />
            <div className="error">{error.userName}</div>
          </div>
          <div className="Signup_item">
            <div className="Signup_label">パスワード</div>
            <input type="password" {...passwordAttributes} />
            <div className="error">{error.password}</div>
          </div>
          <div className="Signup_buttonGroup">
            <button type="submit" className="Signup_button">登録する</button>
          </div>
        </form>
      </div>
    </div>
  );
```

ここではエラーメッセージのスタイル用に、クラス名として`error`を使用します。これは他のコンポーネントでも使用するため、`App.css`に次のスタイル定義を追加します。

`src/App.css`
```css
.error {
  color: red;
}
```

`useValidation`では、型引数により各項目で使用できるバリデーションを切り替えます。そのため、まずはバリデーション対象になる項目を定義した`ValidationFields`型を定義します。

`useValidation`の型引数に`ValidationFields`を指定し、引数にバリデーションを定義したオブジェクトを生成して渡します。プロパティのキーは`ValidationFields`に対応し、各項目でどのようなバリデーションを行うかを定義します。

`string`型の項目を検証するための`stringFields`が用意されているので、これを起点にバリデーションを指定していきます。`stringFields`では、必須入力をチェックするための`required`や、最小文字数をチェックするための`minLength`等が用意されており、ここでのバリデーションはそれらを使用します。

`useValidation`の戻り値として、バリデーションエラーが格納される`error`と、サブミット時に自動で実行するための`handleSubmit`を受け取ります。

`error`は実際には`useState`によるstateであり、バリデーションでエラーになるとこのstateにメッセージが設定されます。`error`のプロパティは`useValidation`のプロパティに一対一で対応しています。例えば、`userName`に対するバリデーションでエラーとなった場合、`error.userName`にエラーメッセージが設定されます。

ここでは、各テキストボックスの下にエラーメッセージを表示するように、JSXで`input`の直後に`div`でエラーメッセージを表示するようにします。

`handleSubmit`は関数であり、第1引数に入力値と、第2引数にエラーが発生しなかった場合のコールバック関数を渡します。


## サインアップ失敗時のハンドリング

サインアップのREST APIでは、登録する名前と同じ名前がすでにが登録されていたら、ステータスコードが`409`であるエラーレスポンスが返却されます。

ユーザーコンテクストのサインアップ関数を実装した際、そのエラーレスポンスであれば`AccountConflictError`オブジェクトを返却するように実装しましたので、ここでは、サインアップ関数の実行結果からエラーであるかを判断し、エラーであればフォームの上にエラーメッセージを表示するようにします。

`useValidation`ではこのようなサーバーサイドのエラーについてはハンドリングできないため、エラーメッセージを表すstateを新しく作成するため、次のように実装します。


```jsx
import React, { useState } from "react";
...
import { AccountConflictError, useUserContext } from '../contexts/UserContext';
...

export const Signup: React.FC = () => {
...
  const [formError, setFormError] = useState('');
...
  const signup: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const result = await userContext.signup(userName, password);
    if (result instanceof AccountConflictError) {
      setFormError('サインアップに失敗しました。同じ名前が登録されています。')
      return;
    }
    history.push('/');
  };

  return (
    <div className="Signup_content">
      <div className="Signup_box">
        <div className="Signup_title">
          <h1>ユーザー登録</h1>
          <div className="error">{formError}</div>
        </div>
        <form className="Signup_form"
              onSubmit={handleSubmit({ userName, password }, signup, () => setFormError(''))}>
...
```

サインアップ関数の戻り値が`AccountConflictError`のオブジェクトであれば、サインアップ失敗としてエラーメッセージをstateに設定します。フォームの上にエラーメッセージを表示するように、JSXで`form`の直前に`div`でエラーメッセージを表示するようにします。

なお、フォーム上のエラーメッセージが表示された状態で再度フォームに入力し、入力値のバリデーションでエラーとなった場合には、フォーム上のエラーメッセージは表示されないようにしたいです。

`handleSubmit`の第3引数には、バリデーションを実行する前に呼び出されるコールバック関数を渡すことができるため、ここではエラーメッセージを初期化する関数を渡すようにします。

これで、サインアップ失敗時のハンドリングの実装は完了です。

## 動作確認

単体での動作確認がしづらいため、最後にまとめて動作を確認します。
