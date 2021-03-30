# ログインのREST API

ログインに使用するREST APIを実装します。

ログイン機能を実装するためには、ログイン状態を何らかの仕組みで保持する必要があります。これを実現するために、Nablarchのセッションストアを使用します。（参考：[セッションストア | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/session_store.html)）

また、NablarchではユーザーIDを設定することで、スレッドコンテキスト機能やログ出力機能等で使用することができます。（参考：[ユーザーIDを設定する | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/handlers/common/thread_context_handler.html#thread-context-handler-user-id-attribute-setting)）

ここでは、ログイン中のユーザーIDがNablarchのユーザーIDとして設定されるように、規定のキーを使用してセッションストアに保持するようにします。

## セッションストアの設定

セッションストアを使うために、いくつかの設定が必要になります。

### SessionManagerの設定

まず、SessionManagerのコンポーネント定義を設定するために、`rest-component-configuration.xml`ファイルに次の定義を追加します。

```xml
<import file="nablarch/webui/session-store.xml" />

<component name="sessionManager" class="nablarch.common.web.session.SessionManager">
  <property name="defaultStoreName" value="${nablarch.sessionManager.defaultStoreName}" />
  <property name="availableStores">
    <list>
      <component-ref name="httpSessionStore" />
    </list>
  </property>
</component>
```

`nablarch/webui/session-store.xml`ファイルは、Nablarchが提供しているデフォルト設定の一つであり、セッションストアに関連するコンポーネント郡が定義されているため、これを読み込みます。（参考：[デフォルト設定一覧 | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/configuration/index.html)）

セッションストアの保存先は複数あり、デフォルト設定では全てのセッションストアを使用できる設定になっています。（参考：[セッションストアの特徴と選択基準 | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/session_store.html#session-store-future-of-store)）

ここではHTTPセッションストアのみ利用するため、`sessionManager`名のコンポーネント定義を上書きし、HTTPセッションストアのみ使用できる設定に変更しておきます。

### セッション変数保存ハンドラの設定

次に、セッション変数保存ハンドラを設定します。

`webFrontController`名で定義しているコンポーネントの`handlerQueue`プロパティに、REST APIの呼び出しで実行するハンドラを設定するため、ここにセッション変数保存ハンドラを追加します。セッション変数保存ハンドラは、先ほど読み込んだNablarchのデフォルト設定の中で`sessionStoreHandler`名のコンポーネントとして定義されているため、`threadContextHandler`の手前に追加します。

```xml
<component name="webFrontController" class="nablarch.fw.web.servlet.WebFrontController">
  <property name="handlerQueue">
    <list>
...
      <component-ref name="sessionStoreHandler" />

      <component-ref name="threadContextHandler"/>
...
```

これで、セッションストアの設定は完了です。

## ユーザー認証処理の実装

ログインでは名前とパスワードを使用した認証を行うため、ユーザー認証処理を実装します。

### 名前でアカウント検索するSQLの作成

ユーザー認証では名前とパスワードを使用しますが、それぞれテーブルが分かれています。ユニバーサルDAOでは、テーブルを結合して検索する場合はSQLを作成する必要があります。（参考：[テーブルをJOINした検索結果を取得する | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#join)）

先ほど作成した`AccountEntity`クラスに対応する`AccountEntity.sql`ファイルを作成し、SQLを定義します。

`src/main/resources/com/example/authentication/application/entity/AccountEntity.sql`
```sql
FIND_BY_USERNAME =
select
    account.user_id,
    account.password
FROM
    account
INNER JOIN user_profile
    ON account.user_id = user_profile.user_id
WHERE
    user_profile.name = :userName
```

### ユーザー認証クラスの作成

ユーザー認証処理を実装するため、まずは認証結果を表す`AuthenticationResult`クラスを作成します。

```java
package com.example.authentication.application;

public class AuthenticationResult {

    private final Status status;

    private final String userId;

    private AuthenticationResult(Status status, String userId) {
        this.status = status;
        this.userId = userId;
    }

    public static AuthenticationResult success(String userId) {
        return new AuthenticationResult(Status.SUCCESS, userId);
    }

    public static AuthenticationResult passwordMismatch() {
        return new AuthenticationResult(Status.PASSWORD_MISMATCH, null);
    }

    public boolean isFailed() {
        return status != Status.SUCCESS;
    }

    public String userId() {
        if (isFailed()) {
            throw new UnsupportedOperationException();
        }
        return userId;
    }

    private enum Status {
        SUCCESS, PASSWORD_MISMATCH
    }
}
```

続いて、`AuthenticationService`クラスを作成します。

```java
package com.example.authentication.application;

import com.example.authentication.application.entity.AccountEntity;
import nablarch.common.dao.NoDataException;
import nablarch.common.dao.UniversalDao;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.Map;

@SystemRepositoryComponent
public class AuthenticationService {

    public AuthenticationResult authenticate(String userName, String password) {
        AccountEntity accountEntity = findAccount(userName);
        if (!password.equals(accountEntity.getPassword())) {
            return AuthenticationResult.passwordMismatch();
        }
        return AuthenticationResult.success(accountEntity.getUserId());
    }

    private AccountEntity findAccount(String userName) {
        Map<String, String> condition = Map.of("userName", userName);
        return UniversalDao.findBySqlFile(AccountEntity.class, "FIND_BY_USERNAME", condition);
    }
}
```

ユニバーサルDAOを使用してDBからユーザーIDとパスワードを取得し、パスワードが一致すればユーザーIDも合わせて返すように実装します。

## REST APIの実装

先ほど作成した`AuthenticationAction`クラスに、ログイン用のREST APIを実装します。

```java
...
    private final AccountRegistrationService registrationService;

    private final AuthenticationService authenticationService;

    public AuthenticationAction(AccountRegistrationService registrationService,
                                AuthenticationService authenticationService) {
        this.registrationService = registrationService;
        this.authenticationService = authenticationService;
    }
...
    @Path("/login")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void login(ExecutionContext executionContext, LoginRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        AuthenticationResult result = authenticationService.authenticate(requestBody.userName, requestBody.password);
        if (result.isFailed()) {
            throw new HttpErrorResponse(HttpResponse.Status.UNAUTHORIZED.getStatusCode());
        }
        SessionUtil.invalidate(executionContext);
        SessionUtil.put(executionContext, "user.id", result.userId());
    }

    public static class LoginRequest {
        @NotNull
        public String userName;

        @NotNull
        public String password;
    }
```

ユーザー名とパスワードが送信されているかチェックし、先ほど実装したユーザー認証機能を呼び出します。

認証に成功したら、まず`SessionUtil#invalidate`を呼び出し、セッションを一度破棄して新しいセッションを使用するようにします。こうすることで、セッション管理の不備を狙ったセッション・ハイジャックの対策になります。（参考：[セッション管理の不備 | 安全なウェブサイトの作り方](https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_4.html)）

`SessionUtil#invalidate`の引数に必要な`ExecutionContext`については、アクションクラスのメソッドの引数に宣言することで、Nablarchから受け取ることができます。（参考：[リソース(アクション)クラスの実装に関して | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/web_service/rest/feature_details/resource_signature.html)）

認証に成功するとユーザーIDが返されるので、スレッドコンテキストのユーザーID属性に設定するため、セッションストアに`user.id`名で保存します。（参考：[ユーザーIDを設定する | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/handlers/common/thread_context_handler.html#id14)）

パスワードが間違っていた場合は`null`が返されるので、`null`であれば認証失敗としてステータスコードが`401 Unauthorized`のエラーレスポンスを返すように実装します。

## REST APIのテスト

### テストデータの追加

テストで使用するテストデータを、`V9999__testdata.sql`に追加します。

`src/test/resources/db/testdata/V9999__testdata.sql`
```sql
INSERT INTO account (user_id, password) VALUES ('1010', 'pass');
INSERT INTO user_profile (user_id, name) VALUES ('1010', 'login-test');
```

### 認証に成功するテストの作成

`AuthenticationRestApiTest`に、認証が成功する場合のテストを追加します。

```java
    @Test
    public void RESTAPIでログインできる() throws Exception {
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "login-test",
                        "password", "pass"));
        HttpResponse response = sendRequest(request);

        assertStatusCode("ログイン", HttpResponse.Status.NO_CONTENT, response);

        openApiValidator.validate("login", request, response);
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
mvn test
```

特にエラーが発生せず、テストが成功することを確認します。

### パスワードの不一致で認証に失敗するテストの作成

続けて、パスワードの不一致で認証に失敗する場合のテストを追加します。

```java
    @Test
    public void パスワードが不一致の場合_ログインに失敗して401になる() throws Exception {
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "login-test",
                        "password", "fail"));
        HttpResponse response = sendRequest(request);

        assertStatusCode("ログイン", HttpResponse.Status.UNAUTHORIZED, response);

        openApiValidator.validate("login", request, response);
    }
```

テストを実行し、成功することを確認します。

### 名前の不一致で認証に失敗するテストの作成

続けて、名前の不一致で認証に失敗する場合のテストを追加します。

```java
    @Test
    public void 名前が不一致の場合_ログインに失敗して401になる() throws Exception {
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "fail-test",
                        "password", "pass"));
        HttpResponse response = sendRequest(request);

        assertStatusCode("ログイン", HttpResponse.Status.UNAUTHORIZED, response);

        openApiValidator.validate("login", request, response);
    }
```

テストを実行すると、次のようにステータスコードが`401 Unauthorized`ではなく`500 Internal Server Error`になり失敗します。

```
[ERROR] Failures:
[ERROR]   AuthenticationRestApiTest.名前の不一致でログインに失敗すると401になる:70->SimpleRestTestSupport.assertStatusCode:283->SimpleRestTestSupport.assertStatusCode:294 ログイン [HTTP STATUS] expected:<401> but was:<500>
```

他の出力結果を確認すると、次のようなスタックトレースが出力されており、先ほど実装した`AuthenticationService#findAccount`の中で呼び出している`UniversalDao#findBySqlFile`で、`NoDataException`の例外が送出されていることが分かります。

```
nablarch.common.dao.NoDataException
	at nablarch.common.dao.BasicDaoContext.findBySqlFile(BasicDaoContext.java:267)
	at nablarch.common.dao.UniversalDao.findBySqlFile(UniversalDao.java:165)
	at com.example.authentication.application.AuthenticationService.findAccount(AuthenticationService.java:48)
```

`UniversalDao#findBySqlFile`の[Javadoc](https://nablarch.github.io/docs/5u18/javadoc/nablarch/common/dao/UniversalDao.html#findBySqlFile-java.lang.Class-java.lang.String-java.lang.Object-)を確認すると、検索条件に該当するレコードが存在しない場合は`NoDataException`の例外を送出すると定義されています。

名前で検索して見つからなかった場合はこれに該当するため、例外をハンドリングするように実装します。

まずは、`AuthenticationResult`クラスに、見つからなかった場合の結果を追加します。

```java
    public static AuthenticationResult nameNotFound() {
        return new AuthenticationResult(Status.NAME_NOT_FOUND, null);
    }
...
    private enum Status {
        SUCCESS, NAME_NOT_FOUND, PASSWORD_MISMATCH
    }
```

続いて、例外をハンドリングして`null`を返すように`AuthenticationService`クラスの`findAccount`メソッドを修正します。

```java
private AccountEntity findAccount(String userName) {
...
    try {
        return UniversalDao.findBySqlFile(AccountEntity.class, "FIND_BY_USERNAME", condition);
    } catch (NoDataException e) {
        return null;
    }
...
```

同じクラスの`authenticate`メソッドに、`findAccount`メソッドで`null`が返された場合のために判定を追加します。

```java
public AuthenticationResult authenticate(String userName, String password) {
    AccountEntity accountEntity = findAccount(userName);
    if (accountEntity == null) {
        return AuthenticationResult.nameNotFound();
    }
...
```

もう一度テストを実行し、成功することを確認します。

これで、ログインのREST APIの実装は完了です。