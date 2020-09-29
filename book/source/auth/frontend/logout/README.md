# ログアウト

ユーザーコンテクストを使用して、ログアウト処理を実装します。

## ログアウト処理の実装

`Login`コンポーネントと同様に、`NavigationHeader`コンポーネントにログアウト処理を実装します。

```jsx
export const NavigationHeader: React.FC = () => {
...
  const logout = async () => {
    await userContext.logout();
    window.location.href = '/';
  };
...
```

ログアウトボタンをクリックしたら、ユーザーコンテクストのログアウト関数を実行するようにします。

## 動作確認

サインアップやログイン、ログアウト処理の実装ができましたので、モックサーバとフロントエンドアプリを起動して、動作確認をしてみましょう。

モックサーバを起動していない場合は、`frontend`ディレクトリで次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.api-mock.yml up
```

フロントエンドアプリを起動していない場合は、`frontend`ディレクトリで次のコマンドを実行します。

```
npm start
```

モックサーバとフロントエンドアプリが起動したら、ページを操作してユーザー認証の動作を確認します。