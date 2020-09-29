# ログイン

ユーザーコンテクストを使用して、ログイン処理を実装します。

## ログイン処理の実装

`Login`コンポーネントにログイン処理を実装します。また、入力値のバリデーション、ユーザー認証が失敗した場合のエラーメッセージの表示についても、`Signup`コンポーネントと同様に実装します。

```jsx
import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import './Login.css';
import { useInput } from '../hooks/useInput';
import { AuthenticationFailedError, useUserContext } from '../contexts/UserContext';
import { stringField, useValidation } from '../validation';

type ValidationFields = {
  userName: string
  password: string
};

export const Login: React.FC = () => {
  const history = useHistory();
  const [userName, userNameAttributes] = useInput('');
  const [password, passwordAttributes] = useInput('');
  const [formError, setFormError] = useState('');
  const userContext = useUserContext();

  const { error, handleSubmit } = useValidation<ValidationFields>({
    userName: stringField()
      .required('名前を入力してください'),
    password: stringField()
      .required('パスワードを入力してください')
  });

  const login: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const result = await userContext.login(userName, password);
    if (result instanceof AuthenticationFailedError) {
      setFormError('ログインに失敗しました。名前またはパスワードが正しくありません。')
      return;
    }
    history.push('/board');
  };

  return (
    <div className="Login_content">
      <div className="Login_box">
        <div className="Login_title">
          <h1>ログイン</h1>
          <div className="error">{formError}</div>
        </div>
        <form className="Login_form"
              onSubmit={handleSubmit({ userName, password }, login, () => setFormError(''))}>
          <div className="Login_item">
            <div className="Login_label">名前</div>
            <input type="text" {...userNameAttributes} />
            <div className="error">{error.userName}</div>
          </div>
          <div className="Login_item">
            <div className="Login_label">パスワード</div>
            <input type="password" {...passwordAttributes} />
            <div className="error">{error.password}</div>
          </div>
          <div className="Login_buttonGruop">
            <button type="submit" className="Login_button">ログインする</button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

フォームのサブミット時に、ユーザーコンテクストのログイン関数を実行するようにします。

## 動作確認

単体での動作確認がしづらいため、最後にまてめて動作を確認します。
