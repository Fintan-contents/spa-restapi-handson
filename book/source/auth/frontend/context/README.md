# ユーザーコンテクストの作成

ユーザー情報のような特定のコンポーネントに依存しない値は、様々なコンポーネントで使用する可能性があります。このような情報を扱う場合、プロパティを使用してコンポーネントの階層に値を渡していく必要が出てきます。こういった場合に活用できるのがReactのコンテクスト機能で、プロパティを使用せずにコンポーネント間で値を共有することが出来ます。  
（参考：[コンテクストで深くデータを受け渡す – React](https://ja.react.dev/learn/passing-data-deeply-with-context)）

ここでは、ユーザーの認証に関する値を持つコンテクスト（以下ユーザーコンテクスト）を作成し、認証に関わるコンポーネントではそのコンテクストを使用できるように実装していきます。認証に関する情報を集約させるため、ユーザーコンテクストには次の値を持たせます。

- サインアップするための関数
- ログインするための関数
- ログアウトするための関数
- ユーザー名
- ログインしているかどうか

なお、example-chatのフロントエンド実装でも同様の実装をしています。

## ユーザーコンテクストの定義

まず、ユーザーコンテクストを作成します。

コンテクストに関する実装を配置するため、`src/contexts`ディレクトリを作成し、  
その中に`UserContext.tsx`を作成します。  
（後ほどJSXを使用する実装を入れるため、拡張子には`tsx`を使用しておきます。）

`src/contexts/UserContext.tsx`
```jsx
'use client';
import React from 'react';

export class AccountConflictError {}

export class AuthenticationFailedError {}

type Props = {
  children: React.ReactNode;
};

type ContextValueType = {
  signup: (userName: string, password: string) => Promise<void | AccountConflictError>;
  login: (userName: string, password: string) => Promise<void | AuthenticationFailedError>;
  logout: () => Promise<void>;
  userName: string;
  isLoggedIn: boolean;
};

export const UserContext = React.createContext<ContextValueType>({} as ContextValueType);
```

サインアップやログインにおけるREST APIの仕様として、入力ミス等で失敗した場合にはエラーレスポンスが返却されます。生成したクライアントコードでは、エラーレスポンスである場合は例外として送出されます。ここでは、ユーザーコンテクストの利用者がエラーを扱いやすくするため、エラーを表現するクラスのインスタンスに変換して返すようにします。

React v18からpropsを定義する際にchildrenプロパティを明示的に列挙する必要があるため、`Props`型を定義します。

`React.createContext`を使用して、コンテクストを作成します。ユーザーコンテクストを扱う際に型を使用したいため、`ContextValueType`型も定義します。

## ユーザーコンテクストを取得するフックの作成

コンポーネントでコンテクストを使用するためのフックとして`useContext`が提供されています。  
`useContext`を使用することで、コンポーネントでコンテクストとして設定されている値（コンテクストオブジェクト）を取得することができます。（参考：[useContext – React](https://ja.react.dev/reference/react/useContext)）

各コンポーネントで`useContext`を使用してもよいですが、ここではユーザーコンテクストを明示的に取得するためのフックを作成します。ユーザーコンテクストに関わる実装は`UserContext.tsx`に集約するため、`UserContext.tsx`に次のような実装を追加します。

```jsx
...
import React, {useContext} from 'react';

...

export const useUserContext = () => useContext(UserContext);
```

## コンテクストプロバイダの作成

ユーザーコンテクストを各コンポーネントで使用できるようにするためには、プロバイダと呼ばれるコンポーネントを使用します。（参考：[SomeContext.Provider – React](https://ja.react.dev/reference/react/createContext#provider)）

プロバイダコンポーネントの`value`属性に渡した値が、子要素のコンポーネントで使用できるようになります。ここでは、このプロバイダコンポーネントとそれに渡す値を独立したコンポーネントとして使用できるようにするため、`UserContextProvider`コンポーネントを作成します。ユーザーコンテクストに関わる実装は`UserContext.tsx`にまとめます。

```jsx
...
import React, {useContext, useState} from 'react';
import {BackendService} from '../backend/BackendService';

...

export const UserContextProvider: React.FC<Props> = ({children}) => {
  const [userName, setUserName] = useState<string>('');

  const contextValue: ContextValueType = {
    signup: async (userName, password) => {
      try {
        await BackendService.signup(userName, password);
      } catch (error: unknown) {
        if (error instanceof Response && error.status === 409) {
          return new AccountConflictError();
        }
        throw error;
      }
    },
    login: async (userName, password) => {
      try {
        await BackendService.login(userName, password);
        setUserName(userName);
      } catch (error: unknown) {
        if (error instanceof Response && error.status === 401) {
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
    isLoggedIn: userName !== '',
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
```

## コンテクストプロバイダの配置

ユーザーコンテクストはどのコンポーネントからでも使用できるようにするため、  
`UserContextProvider`を`layout.tsx`に配置します。

`src/app/layout.tsx`
```jsx
...
import {UserContextProvider} from '../contexts/UserContext';

...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <UserContextProvider>
          <NavigationHeader />
          {children}
        </UserContextProvider>
      </body>
    </html>
  );
}
```

## 動作確認

コンテクストを使用しているコンポーネントが無ければ確認しづらいため、最後にまとめて確認します。