# ナビゲーションメニューの切替

ユーザーコンテクストを使用して、ナビゲーションメニューが切り替わるように実装します。

## ナビゲーションメニュー切替処理を実装

`NavigationHeader`コンポーネントにナビゲーションメニューの切替処理を実装します。

```jsx
import React from 'react';
import './NavigationHeader.css';
import { Link } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';

export const NavigationHeader: React.FC = () => {

  const userContext = useUserContext();

  const logout = async () => {
    window.location.href = '/';
  };

  return (
    <header className="PageHeader_header">
      <h1 className="PageHeader_title">Todoアプリ</h1>
      <nav>
        <ul className="PageHeader_nav">
          { userContext.isLoggedIn ? (
            <React.Fragment>
              <li>{userContext.userName}さん</li>
              <li>
                <button type="button" onClick={logout}>ログアウト</button>
              </li>
            </React.Fragment>
          ) : (
            <li>
              <Link to="/login">ログイン</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
```

ユーザーコンテクストは先ほど作成した`useUserContext`で取得します。ユーザーコンテクストからログイン済みであるかを取得し、それによりメニューを切り替えます。

## 動作確認

単体での動作確認がしづらいため、最後にまてめて動作を確認します。
