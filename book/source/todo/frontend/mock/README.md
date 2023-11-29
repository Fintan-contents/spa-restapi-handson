# モックサーバの起動

この時点では、まだバックエンドのREST APIの開発は完了していないため、そのままではREST APIを呼び出すことができません。そこで、OpenAPIドキュメントを使用してモックサーバを起動し、REST APIを呼び出せるようにします。

モックサーバには[Prism](https://stoplight.io/open-source/prism/)を使用します。PrismはOSSのモック&プロキシサーバで、OpenAPIドキュメントを使用してモックサーバを起動することができます。

Prismはコンテナイメージでも提供されています。そのコンテナイメージを使用して実行するためのDocker Composeファイルとして`docker-compose.api-mock.yml`を予め作成しているため、Docker Composeを使用してDockerコンテナ上でモックサーバを起動します。

`frontend`ディレクトリで、次のコマンドを実行します。なお、ここでは実行結果を確認しやすいよう、バックグラウンドで起動するためのパラメータである`-d`は付けずに実行します。

```
$ docker-compose -f docker/docker-compose.api-mock.yml up
```

次のように`start Prism is listening`といった出力がされていれば、起動が完了しています。

```
prism_1  | [9:54:45 PM] › [CLI] …  awaiting  Starting Prism…
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      GET        http://0.0.0.0:9080/api/todos
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      POST       http://0.0.0.0:9080/api/todos
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      PUT        http://0.0.0.0:9080/api/todos/401.33348794918277
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      DELETE     http://0.0.0.0:9080/api/todos/170.16709317551496
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      POST       http://0.0.0.0:9080/api/signup
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      POST       http://0.0.0.0:9080/api/login
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      POST       http://0.0.0.0:9080/api/logout
prism_1  | [9:54:47 PM] › [CLI] ℹ  info      GET        http://0.0.0.0:9080/api/csrf_token
prism_1  | [9:54:47 PM] › [CLI] ▶  start     Prism is listening on http://0.0.0.0:9080
```

動作を確認するため、ブラウザを起動し、[localhost:9080/api/todos](http://localhost:9080/api/todos)にアクセスします。

Prismでは、レスポンスとしてOpenAPIドキュメントに定義された`example`を使用するため、次のレスポンスが画面上に出力されることを確認します。（`examples`を使用せずに動的に生成する[Dynamic Response Generation](https://meta.stoplight.io/docs/prism/83dbbd75532cf-http-mocking#dynamic-response-generation)機能もあります）

```
[
  - {
        id: 2001,
        text: "やること１",
        completed: true
    },
  - {
        id: 2002,
        text: "やること２",
        completed: false
    }
]
```

Prismでは、リクエストを受信すると、ログをコンソールに出力します。`/api/todos`に対するGETリクエストを受信しているため、次のような内容が出力されています。

```
ism_1  | [4:29:54 AM] › [HTTP SERVER] get /api/todos ℹ  info      Request received
prism_1  | [4:29:54 AM] ›     [NEGOTIATOR] ℹ  info      Request contains an accept header: */*
prism_1  | [4:29:54 AM] ›     [VALIDATOR] ✔  success   The request passed the validation rules. Looking for the best response
prism_1  | [4:29:54 AM] ›     [NEGOTIATOR] ✔  success   Found a compatible content for */*
prism_1  | [4:29:54 AM] ›     [NEGOTIATOR] ✔  success   Responding with the requested status code 200
```

なお、モックサーバを停止させる場合には、起動したコンソールで`Ctrl`+`C`を押します。

これでモックサーバの起動は完了です。
