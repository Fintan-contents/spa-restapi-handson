# ログアウトのREST API

ログアウトに使用するREST APIを実装します。

ログイン状態をセッションストアで保持しているため、これを破棄することでログアウトを実現します。

## REST APIの実装

`AuthenticationAction`クラスに、ログアウト用のREST APIを実装します。

```java
@Path("/logout")
@POST
public void logout(ExecutionContext executionContext) {
    SessionUtil.invalidate(executionContext);
}
```

ログイン時と同様に、セッションを破棄するように実装します。

## REST APIのテスト

### ログアウトに成功するテストの作成

`AuthenticationRestApiTest`に、ログアウトのテストを追加します。

```java
@Test
public void RESTAPIでログアウトできる() throws Exception {
    RestMockHttpRequest request = post("/api/logout");
    HttpResponse response = sendRequest(request);

    assertStatusCode("ログアウト", HttpResponse.Status.NO_CONTENT, response);

    openApiValidator.validate("logout", request, response);
}
```

続いて、テストを実行する前準備として、PostgreSQLを起動しておきます。PostgreSQLのコンテナを起動していない場合は、`backend`ディレクトリで次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml up -d
```

続いて、次のコマンドでコンテナが起動していることを確認します。

```
$ docker-compose -f docker/docker-compose.dev.yml ps
      Name                     Command              State           Ports
----------------------------------------------------------------------------------
docker_postgres_1   docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
```

PostgreSQLが起動していることを確認できたら、Mavenでテストを実行します。

```
$ mvn test
```

特にエラーが発生せず、テストが成功することを確認します。

これで、ログアウトのREST APIの実装は完了です。