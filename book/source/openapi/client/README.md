# クライアントコードの生成

REST APIのクライアントコードを、OpenAPIドキュメントから生成します。

クライアントコードの生成には、[OpenAPI Generator](https://openapi-generator.tech/)を使用します。OpenAPIが提供しているツールで、OpenAPIドキュメントから様々なものを生成することができます。TypeScript用のクライアントコードについても様々な実装を生成することができますが、ここでは`typescript-fetch`を使用します。

OpenAPI Generatorはコンテナイメージでも提供されています。そのコンテナイメージを使用して実行するためのDocker Composeファイルとして`docker-compose.api-gen.yml`を予め作成しているため、Docker Composeを使用してDockerコンテナ上で生成します。

`frontend`ディレクトリで、次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.api-gen.yml up
```

実行が完了すると、`src`の下に`backend`ディレクトリが生成され、その配下に`generated-rest-client`ディレクトリが生成されます。この`generated-rest-client`配下に、自動生成されたクライアントコードが格納されています。

フロントエンドでREST APIを呼び出す際には、このクライアントコードを使用していきます。