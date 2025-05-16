import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './Signup.module.css';
import {useInput} from '../../hooks/useInput';
import {AccountConflictError, useUserContext} from '../../contexts/UserContext';
import {stringField, useValidation} from '../../validation';

type ValidationFields = {
  userName: string;
  password: string;
};

export const Signup: React.FC = () => {
  const router = useRouter();
  const [userName, userNameAttributes] = useInput('');
  const [password, passwordAttributes] = useInput('');
  const [formError, setFormError] = useState('');
  const userContext = useUserContext();

  const {error, handleSubmit} = useValidation<ValidationFields>({
    userName: stringField().required('名前を入力してください'),
    password: stringField()
      .required('パスワードを入力してください')
      .minLength(4, 'パスワードは4桁以上入力してください'),
  });

  const signup: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    const result = await userContext.signup(userName, password);
    if (result instanceof AccountConflictError) {
      setFormError('サインアップに失敗しました。同じ名前が登録されています。');
      return;
    }
    router.push('/');
  };

  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.title}>
          <h1>ユーザー登録</h1>
          <div className='error'>{formError}</div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit({userName, password}, signup, () => setFormError(''))}>
          <div className={styles.item}>
            <div className={styles.label}>名前</div>
            <input type='text' {...userNameAttributes} />
            <div className='error'>{error.userName}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>パスワード</div>
            <input type='password' {...passwordAttributes} />
            <div className='error'>{error.password}</div>
          </div>
          <div className={styles.buttonGroup}>
            <button type='submit' className={styles.button}>
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
