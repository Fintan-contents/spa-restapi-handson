# ルーティングの設定

SPAでは1つのページを動的に書き換えるため、ページ内容が書き換わってもそのままではURLは変わりません。しかし、ブックマークやページ履歴を利用したい場合等、ページ内容に応じてURLを変更したい場面があります。ToDoアプリでも、ユーザー認証を作成したことで目的が異なるページ内容が複数できたため、URLでページ内容が切り替わるように実装します。

ページは次の4つに分類し、それぞれにパスを割り当てます。

- `/` ：トップページ
- `/signup` ：サインアップページ
- `/login` ：ログインページ
- `/board` ：ToDoページ

{% hint style='tip' %}
URLと同様に、ページの[題名要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/title)もそのままでは変わりません。本ハンズオンでは実装しませんが、変更が必要な場合には`useEffect`等を利用して実装する必要があります。
{% endhint %}

## React Routerの導入

ルーティングを実現するために、React用のルーティングライブラリである[React Router](https://reactrouter.com/)を導入します。

React Routerを使用することで、URLごとに使用するコンポーネントを制御したり異なるURLへ移動したりといったことを、簡単に実装することができます。

React RouterとTypeScript用の型定義をインストールするため、`frontend`ディレクトリで次のコマンドを実行します。

```
npm install --save react-router-dom@5 @types/react-router-dom@5
```

## ルーティングの設定

URLごとに使用するコンポーネントが切り替わるように実装するため、`App`コンポーネントを次のように実装します。

```jsx
import React from 'react';
import './App.css';
import { NavigationHeader } from './components/NavigationHeader';
import { TodoBoard } from './components/TodoBoard';
import { Route, Switch } from 'react-router-dom';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';

function App() {
  return (
    <>
      <NavigationHeader />
      <Switch>
        <Route path="/board">
          <TodoBoard />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">
          <Welcome />
        </Route>
      </Switch>
    </>
  );
}

export default App;
```

URLによるルーティングを行うため、`Switch`コンポーネントと`Route`コンポーネントを使用します。（参考：[Switch](https://v5.reactrouter.com/web/api/Switch)、[Route](https://v5.reactrouter.com/web/api/Route)）

`Switch`コンポーネントの中でURLルーティングが有効になり、`Route`コンポーネントの`path`プロパティに指定されたURLにマッチしたら、子要素のコンポーネントが実行されます。

URLとのマッチングは、デフォルトでは部分一致で判定されるため、ここでは、完全一致を使用するために`exact`プロパティを指定します。

## ページ遷移の実装

### トップページからサインアップページへの遷移

トップページからサインアップページへ遷移するため、`Welcome`コンポーネントを次のように実装します。

`src/components/Welcome.tsx`
```js
import React from 'react';
import {Link} from 'react-router-dom';
import './Welcome.css';

export const Welcome: React.FC = () => {
  return (
    <div className="Welcome_content">
      <div>
        <h1 className="Welcome_title">Welcome</h1>
        <div className="Welcome_buttonGroup">
          <Link to="/signup">
            <button className="Welcome_button">登録する</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
```

「登録する」ボタンがクリックされたら`/signup`URLへ遷移するように、`Link`コンポーネントを使用します。`to`プロパティには、遷移先のURLを指定します。（参考：[Link](https://v5.reactrouter.com/web/api/Link)）

### サインアップ後のトップページへの遷移

サインアップしたらトップページへ遷移するため、`Signup`コンポーネントを次のように実装します。

`src/components/Signup.tsx`
```jsx
import React from 'react';
import { useHistory } from 'react-router-dom';
import './Signup.css';

export const Signup: React.FC = () => {
  const history = useHistory();
  
  const signup: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
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
            <input type="text" />
          </div>
          <div className="Signup_item">
            <div className="Signup_label">パスワード</div>
            <input type="password" />
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

ReactRouterが提供しているフックの`useHistory`を使うことで、コンポーネントの処理中にURL遷移を行うことができます。（参考：[useHistory](https://v5.reactrouter.com/web/api/Hooks/usehistory)）

ここでは、「登録する」ボタンをクリックしたら、トップページに遷移するようにします。最終的にはアカウントの登録処理が完了したら遷移するように実装しますが、ここではまず遷移のみ実装しておきます。

### ナビゲーションメニューからの遷移

ヘッダの「ログイン」リンクからログインページへ遷移するのと、同じくヘッダの「ログアウト」からトップページへ遷移するため、`NavigationHeader`コンポーネントを次のように実装します。

```jsx
import React from 'react';
import './NavigationHeader.css';
import { Link } from 'react-router-dom';

export const NavigationHeader: React.FC = () => {

  const logout = async () => {
    window.location.href = '/';
  };

  return (
    <header className="PageHeader_header">
      <h1 className="PageHeader_title">Todoアプリ</h1>
      <nav>
        <ul className="PageHeader_nav">
          <li>
            <Link to="/login">ログイン</Link>
          </li>
          <li>テストユーザさん</li>
          <li>
            <button type="button" onClick={logout}>ログアウト</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};
```

ここでは、ログアウト時にページを読み込み直してReactの状態を安全に破棄するよう、ReactRouterではなく`windows.location.href`を使用します。

### ログイン後のToDoページへの遷移

ログインしたらToDoページへ遷移するため、`Login`コンポーネントを次のように実装します。

`src/components/Login.tsx`
```jsx
import React  from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';

export const Login: React.FC = () => {
  const history = useHistory();

  const login: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    history.push('/board');
  };

  return (
    <div className="Login_content">
      <div className="Login_box">
        <div className="Login_title">
          <h1>ログイン</h1>
        </div>
        <form className="Login_form" onSubmit={login}>
          <div className="Login_item">
            <div className="Login_label">名前</div>
            <input type="text" />
          </div>
          <div className="Login_item">
            <div className="Login_label">パスワード</div>
            <input type="password" />
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

## 動作確認

サインアップやログイン等の処理はまだ実装していませんが、ページを表示してページ遷移することができるようになりましたので、一度フロントエンドアプリを起動して、動作確認をしてみましょう。

フロントエンドアプリを起動していない場合は、`frontend`ディレクトリで次のコマンドを実行します。

```
npm start
```

フロントエンドアプリが起動したら、ページを操作して動作を確認します。
