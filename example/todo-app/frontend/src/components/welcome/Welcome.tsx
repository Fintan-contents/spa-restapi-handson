import React from 'react';
import Link from 'next/link';
import styles from './Welcome.module.css';

export const Welcome: React.FC = () => {
  return (
    <div className={styles.content}>
      <div>
        <h1 className={styles.title}>Welcome</h1>
        <div className={styles.buttonGroup}>
          <Link href='/signup'>
            <button className={styles.button}>登録する</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
