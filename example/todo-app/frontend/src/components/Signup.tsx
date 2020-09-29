import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import './Signup.css';
import { AccountConflictError, useUserContext } from '../contexts/UserContext';
import { useInput } from '../hooks/useInput';
import { stringField, useValidation } from '../validation';

type ValidationFields = {
  userName: string
  password: string
};

export const Signup: React.FC = () => {
  const history = useHistory();
  const [userName, userNameAttributes] = useInput('');
  const [password, passwordAttributes] = useInput('');
  const userContext = useUserContext();
  const [formError, setFormError] = useState('');

  const { error, handleSubmit } = useValidation<ValidationFields>({
    userName: stringField()
      .required('名前を入力してください'),
    password: stringField()
      .required('パスワードを入力してください')
      .minLength(4, 'パスワードは4桁以上入力してください'),
  });

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
};
