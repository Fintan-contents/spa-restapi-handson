# 動作確認

フロントエンドとバックエンドを接続して動作を確認します。

## DBコンテナの起動

PostgreSQLのDockerコンテナを起動していない場合は、バックエンドアプリを起動する前に起動します。既に起動している場合は、この手順はスキップしてください。

PostgreSQLをDockerコンテナで起動するため、`backend`ディレクトリで次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml up -d
```

次のコマンドを実行し、コンテナが起動していることを確認します。

```
$ docker-compose -f docker/docker-compose.dev.yml ps
      Name                     Command              State           Ports
----------------------------------------------------------------------------------
docker_postgres_1   docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
```

## バックエンドアプリの起動

バックエンドアプリを起動するため、`backend`ディレクトリで次のコマンドを実行します。

```
$ mvn jetty:run
```

次のように`Started`と出力され、バックエンドアプリが起動されていることを確認します。

```
[INFO] Started ServerConnector@2299f6d7{HTTP/1.1,[http/1.1]}{0.0.0.0:9080}
[INFO] Started Server@3751acd7{STARTING}[10.0.0.alpha1] @7133ms
```

{% hint style='danger' %}
フロントエンド開発時に使用するモックサーバは、バックエンドアプリと同じ`9080`ポートを使用しています。そのため、モックサーバが起動している状態でアプリを起動すると、`Error starting jetty: Failed to bind to 0.0.0.0/0.0.0.0:9080: Address already in use`といったようにアドレスが使用済みである旨のエラーが発生します。もし発生した場合は、モックサーバを停止してから、再度バックエンドアプリを起動してください。
{% endhint %}

## フロントエンドアプリの起動

フロントエンドアプリを起動するため、`frontend`ディレクトリで、次のコマンドを実行します。

```
$ npm run dev
```

フロントエンドアプリが起動されたら、ブラウザで[トップページ](http://localhost:3000/)を開きます。

## ToDoページの表示内容を確認する

ToDoページが表示され、ToDoを登録したり表示したりすることが問題なくできることを確認します。
