# ナビゲーションメニューの切替

ユーザーコンテクストを使用して、ナビゲーションメニューが切り替わるように実装します。

## ナビゲーションメニュー切替処理の実装

`NavigationHeader`コンポーネントにナビゲーションメニューの切替処理を実装します。

`src/components/navigation-header/NavigationHeader.tsx`
```jsx
'use client';
import React from 'react';
import styles from './NavigationHeader.module.css';
import Link from 'next/link';
import {useUserContext} from '../../contexts/UserContext';

export const NavigationHeader: React.FC = () => {
  const userContext = useUserContext();

  const logout = async () => {
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ToDoアプリ</h1>
      <nav>
        <ul className={styles.nav}>
          {userContext.isLoggedIn ? (
            <React.Fragment>
              <li>{userContext.userName}さん</li>
              <li>
                <button type='button' onClick={logout}>
                  ログアウト
                </button>
              </li>
            </React.Fragment>
          ) : (
            <li>
              <Link href='/login'>ログイン</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
```

ユーザーコンテクストは前章で作成した`useUserContext`で取得します。ユーザーコンテクストからログイン済みであるかを取得し、その状態によりメニューを切り替えます。

## 動作確認

単体での動作確認がしづらいため、最後にまとめて動作を確認します。
