# CORSの設定

ToDoアプリでは、フロントエンドとバックエンドを別々のアプリとして作成します。フロントエンドアプリは`http://localhost:3000`、バックエンドアプリは`http://localhost:9080`で起動するため、ウェブコンテンツとしては異なる[オリジン](https://developer.mozilla.org/ja/docs/Glossary/Origin)ということになります。

セキュリティ上の理由から、ブラウザでは異なるオリジンへのリクエストを制限しています。  
（参考：[同一オリジンポリシー | MDN](https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy)）

この制限により、そのままではフロントエンドアプリからバックエンドアプリのREST APIにアクセスしようとするとエラーが発生してしまいます。

この制限に対応するため、ToDoアプリでは、オリジン間リソース共有（以下CORS）と呼ばれる仕組みを利用します。（参考：[オリジン間リソース共有（CORS）| MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)）

生成したクライアントコードでは、[Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch)を使用してHTTP通信を行います。このAPIでは、リクエストを送信するための`fetch()`メソッドの引数である`init`オブジェクトに[`mode`](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch#%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%B3%E9%96%93%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%82%92%E8%A1%8C%E3%81%86)と[`credentials`](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch#%E8%B3%87%E6%A0%BC%E6%83%85%E5%A0%B1%E3%82%92%E5%90%AB%E3%82%81%E3%82%8B)を設定することで、CORSを使用することができます。

```js
{
  mode: 'cors',
  credentials: 'include',
}
```

先ほど作成した`BackendService`でこの設定をするため、次のように実装します。リクエスト時に`mode`と`credentials`が設定されるように、`corsHandler`をMiddlewareとして実装します。実装した`corsHandler`を使用するために、`configuration`オブジェクトの`middleware`に追加します。

`src/backend/BackendService.ts`
```js
const corsHandler: Middleware = {
  pre: async context => {
    return {
      url: context.url,
      init: {
        ...context.init,
        mode: 'cors',
        credentials: 'include',
      },
    };
  },
};

const configuration = new Configuration({
  middleware: [corsHandler, requestLogger],
});
```

これで、フロントエンドのCORS設定については完了です。
