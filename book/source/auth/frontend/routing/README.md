# ルーティングの設定

ルーティングとは、ユーザーが特定のURLを訪れた際に、どのコンテンツを表示するかを決定する仕組みです。
SPAでは1つのページを動的に書き換えるため、何もしない限りページ内容が書き換わってもURLは変更されません。しかし、ブックマークやページ履歴を利用したい場合等、ページ内容に応じてURLを変更したい場面があります。ToDoアプリでも、ユーザー認証を作成したことで目的が異なるページ内容が複数できたため、URLでページ内容が切り替わるように実装します。

ページは次の4つに分類し、それぞれにパスを割り当てます。

- `/` ：トップページ
- `/board` ：ToDoページ
- `/signup` ：サインアップページ
- `/login` ：ログインページ

{% hint style='tip' %}
URLと同様に、ページの[title要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/title)もそのままでは変わりません。本ハンズオンでは実装しませんが、変更が必要な場合には`useEffect`等を利用して実装する必要があります。
{% endhint %}

## App Router

ルーティングを実現するために、Next.jsのルーティング機能である[App Router](https://nextjs.org/docs/app)を使用します。

App Routerはファイルシステムに基づいてルーティングを管理する機能です。
各URLはディレクトリ構造に対応し、URLごとに使用するコンポーネントの制御や、異なるURLへの遷移などを簡単に実装できます。
具体的には、`src/app`配下にディレクトリを作成した後、そのディレクトリ配下に`page.tsx`を作成します。`page.tsx`と命名したファイルを配置することで、そのディレクトリがルーティングの対象となります。例えば、`src/app/board/page.tsx`は`/board`のパスに対応します。

## pageファイルの作成

URLごとに使用するコンポーネントが切り替わるように実装します。
割り当てたパスを基に、それぞれのコンポーネントに対応するディレクトリとファイルを作成します。

### トップページ

URLパスで`/`にあたるディレクトリとファイルを実装します。

URLパスの`/`にあたるファイルは`src/app/page.tsx`です。
作成済みの`page.tsx`で、ページ外観の作成時に実装した`Welcome`コンポーネントを呼び出します。

`src/app/page.tsx`
```jsx
'use client';
import React from 'react';
import {Welcome} from '../components/welcome/Welcome';

export default function Home() {
  return <Welcome />;
}
```

`src/app/page.tsx`にもともと実装していた`<NavigationHeader />`を、どの画面でも使用できるようにするために`layout.tsx`に配置します。

`src/app/layout.tsx`
```jsx
...
import {NavigationHeader} from '../components/navigation-header/NavigationHeader';
...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <NavigationHeader />
        {children}
      </body>
    </html>
  );
}
```

`layout.tsx`の`body`タグ内に`{children}`を記述しています。

`layout.tsx`は、Next.jsアプリケーションのルートレイアウトとして機能します。ルートレイアウトはアプリケーション全体で共有される`<html>`タグや`<body>`タグ、その他のグローバルなUIを定義するために使用されます。
そのため、`layout.tsx`で定義されたレイアウトは、`src/app`配下の全てのページ（`page.tsx`）に適用されます。

`{children}`は、レイアウトがラップしているページや子レイアウトなどを動的に挿入するための特別なプロパティです。
この実装により、`<NavigationHeader />`の下に各ページの内容が表示されるようになります。

`src/app/page.tsx`にもともと実装していた`TodoBoard`コンポーネントは、`src/app`配下に`board`ディレクトリを作成し、その中の`page.tsx`で呼び出します。
これにより、`{children}`の位置に表示されるようになります。
（参考：[layout.js | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/layout)） 

`use client`はコンポーネントをクライアントサイドでレンダリングすることを指定できるReactのディレクティブです。
（参考：['use client' directive – React](https://react.dev/reference/rsc/use-client)）  
Next.jsではデフォルトで全てのコンポーネントが[サーバコンポーネント](https://nextjs.org/docs/app/building-your-application/rendering/server-components)になっています。
`use client`を1行目に記述することで、そのコンポーネントと子コンポーネントがクライアントコンポーネントとして動作します。

クライアントコンポーネントは、コンポーネントの状態管理やエフェクト、イベントリスナーを使用してインタラクティブなUIを作成できます。
ハンズオンで実装したToDoの状態管理や入力、ボタンのクリックを実現するためには、それらがクライアントコンポーネントである必要があります。
したがって、  `src/app/layout.tsx`の`body`タグ内で呼び出されるコンポーネントには、1行目に`use client`を記述します。

### ToDoページ

URLパスの`/board`にあたるディレクトリとファイルを実装します。

`src/app`配下に`board`ディレクトリを作成します。
作成後、`board`ディレクトリ配下に`page.tsx`を作成し、ToDo管理で実装した`TodoBoard`を呼び出します。

`src/app/board/page.tsx`
```jsx
'use client';
import React from 'react';
import {TodoBoard} from '../../components/board/TodoBoard';

const TodoBoardPage: React.FC = () => {
  return <TodoBoard />;
};

export default TodoBoardPage;
```

### サインアップページ

URLパスの`/signup`にあたるディレクトリとファイルを実装します。

`src/app`配下に`signup`ディレクトリを作成します。
作成後、`signup`ディレクトリ配下に`page.tsx`を作成し、ページ外観の作成で実装した`Signup`コンポーネントを呼び出します。

`src/app/signup/page.tsx`
```jsx
'use client';
import React from 'react';
import {Signup} from '../../components/signup/Signup';

const SignupPage: React.FC = () => {
  return <Signup />;
};

export default SignupPage;
```

### ログインページ

URLパスの`/login`にあたるディレクトリとファイルを実装します。

`src/app`配下に`login`ディレクトリを作成します。
作成後、`login`ディレクトリ配下に`page.tsx`を作成し、ページ外観の作成で実装した`Login`コンポーネントを呼び出します。

`src/app/login/page.tsx`
```jsx
'use client';
import React from 'react';
import {Login} from '../../components/login/Login';

const LoginPage: React.FC = () => {
  return <Login />;
};

export default LoginPage;
```

## ページ遷移の実装

各pageファイルの作成ができたため、ページ遷移を実装します。

### トップページからサインアップページへの遷移

トップページからサインアップページへ遷移させるため、`Welcome`を次のように実装します。

`src/components/welcome/Welcome.tsx`
```js
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
```

「登録する」ボタンがクリックされたらサインアップページ（`/signup`）へ遷移するように、`Link`コンポーネントを使用します。
`Link`はクライアントサイドでのナビゲーションを提供するコンポーネントで、Next.jsでルート間を移動する際の推奨される方法です。
`href`プロパティには、遷移先のURLを指定します。  
（参考：[Link | Next.js](https://nextjs.org/docs/app/api-reference/components/link)）

### サインアップ後のトップページへの遷移

サインアップしたらトップページへ遷移させるため、`Signup`を次のように実装します。

`src/components/signup/Signup.tsx`
```jsx
import React from 'react';
import {useRouter} from 'next/navigation';
import styles from './Signup.module.css';

export const Signup: React.FC = () => {
  const router = useRouter();

  const signup: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.title}>
          <h1>ユーザー登録</h1>
        </div>
        <form className={styles.form} onSubmit={signup}>
          <div className={styles.item}>
            <div className={styles.label}>名前</div>
            <input type='text' />
          </div>
          <div className={styles.item}>
            <div className={styles.label}>パスワード</div>
            <input type='password' />
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
```

Next.jsが提供している`useRouter`というフックを使うことで、コンポーネントの処理中にURL遷移を行うことができます。（参考：[useRouter | Next.js](https://nextjs.org/docs/app/api-reference/functions/use-router)）

ここでは、「登録する」ボタンをクリックしたらトップページ（`/`）へ遷移させます。最終的にはアカウントの登録処理が完了したら遷移するように実装しますが、ここではまず遷移のみ実装しておきます。

### ナビゲーションメニューからの遷移

ヘッダの「ログイン」リンクをクリックするとログインページへ遷移し、同様にヘッダの「ログアウト」ボタンをクリックしたときにトップページへ遷移させるため、`NavigationHeader`コンポーネントを次のように実装します。

`src/components/navigation-header/NavigationHeader.tsx`
```jsx
'use client';
import React from 'react';
import styles from './NavigationHeader.module.css';
import Link from 'next/link';

export const NavigationHeader: React.FC = () => {

  const logout = async () => {
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ToDoアプリ</h1>
      <nav>
        <ul className={styles.nav}>
          <li>
            <Link href='/login'>ログイン</Link>
          </li>
          <li>テストユーザーさん</li>
          <li>
            <button type='button' onClick={logout}>
              ログアウト
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};
```

ここでは、ログアウト時にページを読み込み直してReactの状態を安全に破棄するよう、useRouterではなく`window.location.href`を使用します。

### ログイン後のToDoページへの遷移

ログインしたらToDoページへ遷移させるため、`Login`を次のように実装します。

`src/components/login/Login.tsx`
```jsx
import React from 'react';
import {useRouter} from 'next/navigation';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const router = useRouter();

  const login: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    router.push('/board');
  };

  return (
    <div className={styles.content}>
      <div className={styles.box}>
        <div className={styles.title}>
          <h1>ログイン</h1>
        </div>
        <form className={styles.form} onSubmit={login}>
          <div className={styles.item}>
            <div className={styles.label}>名前</div>
            <input type='text' />
          </div>
          <div className={styles.item}>
            <div className={styles.label}>パスワード</div>
            <input type='password' />
          </div>
          <div className={styles.buttonGroup}>
            <button type='submit' className={styles.button}>
              ログインする
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

## 動作確認

サインアップやログイン等の処理はまだ実装していませんが、ページ遷移が可能になりました。  
`frontend`ディレクトリで次のコマンドを実行します。
```
$ npm run dev
```
フロントエンドアプリを起動して、動作を確認します。