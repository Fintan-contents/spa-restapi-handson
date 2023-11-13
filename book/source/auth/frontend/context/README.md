# ユーザーコンテクストの作成

ユーザー情報のような特定のコンポーネントに依存しない値は、様々なコンポーネントで使用する可能性がありますが、その場合にはプロパティを使用してコンポーネントの階層に渡していく必要が出てきます。
このような情報を扱う場合、コンテクストと呼ばれるReactの機能を利用することで、プロパティを使用せずにコンポーネント間で値を共有することが出来ます。（参考：[コンテクスト | React](https://ja.reactjs.org/docs/context.html)）

ここでは、ユーザーの認証に関する値を持つコンテクスト（以下ユーザーコンテクスト）を作成し、認証に関わるコンポーネントではそのコンテクストを使用できるように実装していきます。ここでは、認証に関する情報を集約させるため、ユーザーコンテクストには次の値を持たせます。

- サインアップするための関数
- ログインするための関数
- ログアウトするための関数
- ユーザー名
- ログインしているかどうか

なお、example-chatのバックエンド実装でも同様の実装をしています。

## ユーザーコンテクストの定義

まず、ユーザーコンテクストを作成します。

コンテクストに関する実装を配置するため、`src/contexts`ディレクトリを作成し、その中に`UserContext.tsx`を作成します。（後ほどJSXを使用する実装を入れるため、拡張子には`tsx`を使用しておきます）

`src/contexts/UserContext.tsx`
```js
import React from 'react';

export class AccountConflictError {}

export class AuthenticationFailedError {}

type Props = {
  children?: React.ReactNode,
}

type ContextValueType = {
  signup: (userName: string, password: string) => Promise<void | AccountConflictError>,
  login: (userName: string, password: string) => Promise<void | AuthenticationFailedError>,
  logout: () => Promise<void>,
  userName: string
  isLoggedIn: boolean,
}

export const UserContext = React.createContext<ContextValueType>({} as ContextValueType);
```

React v18からpropsを定義する際にchildrenプロパティを明示的に列挙する必要があるので、`Props`型を定義します。

`React.createContext`を使用して、コンテクストを作成します。ユーザーコンテクストを扱う際に型を使用したいため、`ContextValueType`型も定義します。

また、サインアップやログインのREST APIの仕様として、入力ミス等で失敗した場合にはエラーレスポンスが返却されます。生成したクライアントコードでは、エラーレスポンスであった場合は例外として送出されます。ここでは、ユーザーコンテクストの利用者がエラーを扱いやすくするため、エラーを表現するオブジェクトに変換して返すようにします。

## ユーザーコンテクストを取得するフックの作成

関数コンポーネントでコンテクストを使用するためのフックとして`useContext`が提供されています。`useContext`を使用することで、関数コンポーネントでコンテクストとして設定されている値（コンテクストオブジェクト）を取得することができます。（参考：[useContext | React](https://ja.reactjs.org/docs/hooks-reference.html#usecontext)）

各コンポーネントで`useContext`を使用してもよいですが、ここではユーザーコンテクストを明示的に取得するためのフックを作成します。ユーザーコンテクストに関わる実装は`UserContext.tsx`に集約するため、`UserContext.tsx`に次のような実装を追加します。

```js
import React, { useContext } from 'react';
...

export const useUserContext = () => useContext(UserContext);
```

## コンテクストプロバイダの作成

ユーザーコンテクストを各コンポーネントで使用できるようにするためには、プロパイダと呼ばれるコンポーネントを使用します。（参考：[Context.Provider | React](https://ja.reactjs.org/docs/context.html#contextprovider)）

プロパイダコンポーネントの`value`属性に渡した値が、子要素のコンポーネントで使用できるようになります。ここでは、このプロパイダコンポーネントとそれに渡す値を、独立したコンポーネントとして使用できるようにするため、`UserContextProvider`コンポーネントを作成します。ユーザーコンテクストに関わる実装は`UserContext.tsx`にまとめます。

```jsx
import React, { useContext, useState } from 'react';
import { BackendService } from '../backend/BackendService';
...

export const UserContextProvider: React.FC<Props> = ({ children }) => {
  const [userName, setUserName] = useState<string>('');

  const contextValue: ContextValueType = {
    signup: async (userName, password) => {
      try {
        await BackendService.signup(userName, password);
      } catch(error: any) {
        if (error.status === 409) {
          return new AccountConflictError();
        }
        throw error;
      }
    },
    login: async (userName, password) => {
      try {
        await BackendService.login(userName, password);
        setUserName(userName);
      } catch(error: any) {
        if (error.status === 401) {
          return new AuthenticationFailedError();
        }
        throw error;
      }
    },
    logout: async () => {
      await BackendService.logout();
      setUserName('');
    },
    userName: userName,
    isLoggedIn: userName !== ''
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
```

## コンテクストプロパイダの配置

ユーザーコンテクストはどのコンポーネントからでも使用できるようにするため、`UserContextProvider`コンポーネントを`App`コンポーネントに配置します。

```jsx
import { UserContextProvider } from './contexts/UserContext';
...

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <NavigationHeader />
        <Switch>
          <Route exact path="/board">
            <TodoBoard />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/">
            <Welcome />
          </Route>
        </Switch>
      </BrowserRouter>
    </UserContextProvider>
  );
}
```

## 動作確認

コンテクストを使用しているコンポーネントが無ければ確認しづらいため、最後にまとめて確認します。