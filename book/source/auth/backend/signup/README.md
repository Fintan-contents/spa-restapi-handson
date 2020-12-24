# サインアップのREST API

サインアップに使用するREST APIを実装します。

ToDo管理の実装では、レイヤーで責務を分離したり値オブジェクト等のクラスを作成したりしていましたが、ユーザー認証の実装では、REST APIと機能実装を分離するだけにし、値オブジェクト等も使用しない実装とします。

## アカウント登録処理の実装

サインアップではアカウントを登録するため、アカウントの登録処理を実装します。

### Entityクラスの作成

ユニバーサルDAOを使用するため、DBのテーブルに対応するEntityクラスを作成します。

まず、Entityクラスを格納する`com.example.authentication.application.entity`パッケージを作成します。

続いて、`account`テーブルに対応した`AccountEntity`クラスを作成します。

```java
package com.example.authentication.application.entity;

import javax.persistence.*;

@Entity
@Table(name = "account")
@Access(AccessType.FIELD)
public class AccountEntity {

    @Id
    private String userId;

    private String password;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

続いて、`user_profile`テーブルに対応した`UserProfileEntity`クラスを作成します。

```java
package com.example.authentication.application.entity;

import javax.persistence.*;

@Entity
@Table(name = "user_profile")
@Access(AccessType.FIELD)
public class UserProfileEntity {

    @Id
    private String userId;

    private String name;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
```

### ユーザー登録クラスの作成

アカウント登録処理を実装するため、`AccountRegistrationService`クラスを作成します。

```java
package com.example.authentication.application;

import com.example.authentication.application.entity.AccountEntity;
import com.example.authentication.application.entity.UserProfileEntity;
import nablarch.common.dao.UniversalDao;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.UUID;

@SystemRepositoryComponent
public class AccountRegistrationService {

    public void register(String userName, String password) {
        String userId = generateUserId();
        insertAccount(userId, password);
        insertUserProfile(userId, userName);
    }

    private String generateUserId() {
        return UUID.randomUUID().toString();
    }

    private void insertAccount(String userId, String password) {
        AccountEntity accountEntity = new AccountEntity();
        accountEntity.setUserId(userId);
        accountEntity.setPassword(password);
        UniversalDao.insert(accountEntity);
    }

    private void insertUserProfile(String userId, String userName) {
        UserProfileEntity userProfileEntity = new UserProfileEntity();
        userProfileEntity.setUserId(userId);
        userProfileEntity.setName(userName);
        UniversalDao.insert(userProfileEntity);
    }
}
```

## REST APIの実装

まず、アクションクラスを格納する`com.example.authentication.api`パッケージを作成します。

ユーザー認証関連のREST APIを実装するため、`AuthenticationAction`クラスを作成します。

```java
package com.example.authentication.api;

import com.example.authentication.application.AuthenticationService;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;
import nablarch.core.validation.ee.ValidatorUtil;

import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;

@Path("/")
@SystemRepositoryComponent
public class AuthenticationAction {

    private final AccountRegistrationService registrationService;

    public AuthenticationAction(AccountRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @Path("/signup")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void signup(SignupRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        registrationService.register(requestBody.userName, requestBody.password);
    }

    public static class SignupRequest {
        @NotNull
        public String userName;

        @NotNull
        public String password;
    }
}
```

この後に実装するログイン等のREST APIもこのクラスで実装するため、クラスには空のパスを指定した`@Path`アノテーションを付与し、メソッドにサインアップ用のパスを指定した`@Path`アノテーションを付与します。

ユーザー名とパスワードが送信されているかチェックし、先ほど実装したアカウント登録機能を呼び出します。

## REST APIのテスト

### 認証に成功するテストの作成

REST APIをテストするため、`AuthenticationRestApiTest`クラスを作成します。

ToDo管理で作成したテストと同様に、NablarchのREST APIテスティングフレームワークと、OpenAPIドキュメントを使用します。

```java
package com.example.authentication;

import com.example.openapi.OpenApiValidator;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.nio.file.Paths;
import java.util.Map;

public class AuthenticationRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @Test
    public void RESTAPIでサインアップできる() throws Exception {
        RestMockHttpRequest request = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-test",
                        "password", "pass"));
        HttpResponse response = sendRequest(request);

        assertStatusCode("サインアップ", HttpResponse.Status.NO_CONTENT, response);

        openApiValidator.validate("signup", request, response);
    }

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

### 名前の不一致で認証に失敗するテストの作成

続けて、名前の不一致で認証に失敗する場合のテストを追加します。

```java
    @Test
    public void 名前が登録済みの場合_サインアップに失敗して409になる() throws Exception {
        RestMockHttpRequest firstRequest = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-conflict-test",
                        "password", "pass"));
        sendRequest(firstRequest);

        RestMockHttpRequest secondRequest = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-conflict-test",
                        "password", "pass"));
        HttpResponse response = sendRequest(secondRequest);

        assertStatusCode("サインアップ", HttpResponse.Status.CONFLICT, response);

        openApiValidator.validate("signup", secondRequest, response);
    }
```

テストを実行すると、次のようにステータスコードが`409 Conflict`ではなく`204 No Content`になり失敗します。

```
[ERROR] 名前が登録済みの場合_サインアップに失敗して409になる  Time elapsed: 0.047 s  <<< FAILURE!
java.lang.AssertionError: サインアップ [HTTP STATUS] expected:<409> but was:<204>
	at com.example.authentication.AuthenticationRestApiTest.名前が登録済みの場合_サインアップに失敗して409になる(AuthenticationRestApiTest.java:49)
```

アカウントの登録時に同じ名前で登録されていないかチェックしていないため、アカウントの登録に成功しています。

同じ名前のレコードがあるかを検索するために、`UserProfileEntity`クラスに対応した`UserProfileEntity.sql`ファイルを作成し、SQLを作成します。

`src/main/resources/com/example/authentication/application/entity/UserProfileEntity.sql`
```sql
FIND_BY_USERNAME =
select
    user_id
FROM
    user_profile
WHERE
    name = :userName
```

続いて、登録結果を表現するための`AccountRegistrationResult`を作成します。

```java
package com.example.authentication.application;

public enum AccountRegistrationResult {
    SUCCESS, NAME_CONFLICT
}
```

続いて、`AuthenticationService`クラスを修正します。先ほどのSQLを使用してレコードがあるかを判定するための`existsAccount`メソッドを実装します。また、`register`メソッドでそれを呼び出し、結果を`AccountRegistrationResult`で返すように修正します。

```java
    public AccountRegistrationResult register(String userName, String password) {
       if (existsAccount(userName)) {
            return AccountRegistrationResult.NAME_CONFLICT;
        }
        String userId = generateUserId();
        insertAccount(userId, password);
        insertUserProfile(userId, userName);
        return AccountRegistrationResult.SUCCESS;
    }

   private boolean existsAccount(String userName) {
        Map<String, String> condition = Map.of("userName", userName);
        return UniversalDao.exists(UserProfileEntity.class, "FIND_BY_USERNAME", condition);
    }
```

続いて、`AuthenticationAction`クラスを修正します。

Nablarchでは、`HttpErrorResponse`（[Javadoc](https://nablarch.github.io/docs/5u18/javadoc/nablarch/fw/web/HttpErrorResponse.html)）の例外を送出することで、エラーレスポンスを返すことができます。`AuthenticationService#register`から`false`が返ってきたら、ステータスコードが`409 Conflict`のエラーレスポンスになるように実装します。

```java
...
        AccountRegistrationResult result = authenticationService.register(requestBody.userName, requestBody.password);
        if (result == AccountRegistrationResult.NAME_CONFLICT) {
            throw new HttpErrorResponse(HttpResponse.Status.CONFLICT.getStatusCode());
        }
...
```

もう一度テストを実行し、成功することを確認します。

これで、サインアップのREST APIの実装は完了です。