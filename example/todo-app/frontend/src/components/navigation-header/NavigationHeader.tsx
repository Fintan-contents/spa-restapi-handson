'use client';
import React from 'react';
import styles from './NavigationHeader.module.css';
import Link from 'next/link';
import {useUserContext} from '../../contexts/UserContext';

export const NavigationHeader: React.FC = () => {
  const userContext = useUserContext();

  const logout = async () => {
    // 「ログアウト」ボタンを押下した際に、クライアントサイドのレンダリングにより一瞬「ログインする」ボタンが出現する。
    // その時に、next.jsの仕様で、「ログインする」ボタンの遷移先のprefetchが行われていることは認識済みであり、許容する。
    await userContext.logout();
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
