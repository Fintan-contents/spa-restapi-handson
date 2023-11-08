# バックエンドの確認

バックエンドを開発するためのプロジェクトを確認します。

## バックエンド開発プロジェクトを確認する

`backend`ディレクトリが、バックエンド開発プロジェクトになります。

このプロジェクトは、NablarchのRESTfulウェブサービス構成で作成されています。（参考：[Nablarch - RESTfulウェブサービス](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/web_service/rest/index.html)）

Nablarchが提供しているブランクプロジェクトから作成し、次の変更を加えています。（参考：[Nablarch - ブランクプロジェクト](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/blank_project/index.html#blank-project)）

- 使用するJavaのバージョンを11に変更
- 開発環境で使用するアプリケーションサーバをJettyに変更
- 起動テスト用のアクションクラスとテストクラスを追加
- Bean ValidationのメッセージとしてHibernate Validationのメッセージを使用する設定
- `nablarch.webApi.applicationPath`の環境依存値を`/api`に設定
- 使用しないファイルや定義を削除

ディレクトリ構造は、次のようになっています。

```
backend
├── .gitignore
├── pom.xml
├── docker
│   └── docker-compose.dev.yml
├── rest-api-specification
│   └── openapi.yaml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── example
    │   │           ├── SampleAction.java
    │   │           └── system
    │   │               └── nablarch
    │   │                   ├── FlywayExecutor.java
    │   │                   └── di
    │   │                       └── ExampleComponentDefinitionLoader.java
    │   ├── resources
    │   │   ├── app-log.properties
    │   │   ├── common.config
    │   │   ├── data-source.config
    │   │   ├── env.config
    │   │   ├── log.properties
    │   │   ├── rest-boot.xml
    │   │   ├── rest-component-configuration.xml
    │   │   ├── db
    │   │   │   └── migration
    │   │   │       └── V1__create_table.sql
    │   │   └── META-INF
    │   │       └── services
    │   │           └── nablarch.core.repository.di.config.externalize.ExternalizedComponentDefinitionLoader
    │   └── webapp
    │       └── WEB-INF
    │           └── web.xml
    └── test
        ├── java
        │   └── com
        │       └── example
        │           └── SampleTest.java
        └── resources
            ├── log.properties
            └── unit-test.xml
```

#### `.gitignore`

Gitで管理対象外とするファイルを定義するためのファイルです。

ブランクプロジェクト作成時に生成されたものを使用しています。

#### `pom.xml`

Mavenプロジェクトの定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `docker/docker-compose.dev.yml`

DBコンテナの構成と起動に使用されるファイルです。

#### `rest-api-specification/openapi.yaml`

OpenAPI仕様でREST APIを定義したOpenAPIドキュメントです。

本ハンズオンで作成するREST APIについては、予め定義しています。

#### `src/main/java/com/example/SampleAction.java`

起動テスト用のREST APIを作成するためのアクションクラスです。（参考[Nablarch - アプリケーションの責務配置](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/web/application_design.html)）

```java
package com.example;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@SystemRepositoryComponent
@Path("test")
public class SampleAction {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Object get() {
        return Map.of("status", "ok");
    }
}

```

Nablarchでは、ルーティングアダプタという機能で、リクエストをどのアクションクラスで処理するかを定義することができます。（参考：[Nablarch - ルーティングアダプタ](https://nablarch.github.io/docs/5u18/doc/application_framework/adaptors/router_adaptor.html)）

JAX-RSのアノテーション（`@PATH`や`@GET`等）を使用してルーティングを定義できますので、パスが`api/test`、HTTPメソッドが`GET`に対応した起動テスト用のREST APIを実装しています。（参考：[ウィキペディア - JAX-RS](https://ja.wikipedia.org/wiki/JAX-RS)）

クラスに付与している`SystemRepositoryComponent`アノテーションは、Nablarchが提供しているDIコンテナの機能を持つシステムリポジトリに登録するための設定です。（参考：[Nablarch - システムリポジトリ](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/repository.html)）

ToDoアプリでDIコンテナの機能を使うため、アクションクラスをシステムリポジトリから取得するように予め設定しています。そのため、アクションクラスをシステムリポジトリに登録する必要があります。

DIコンテナで管理するコンポーネントは、通常はXMLファイルを使用して定義しますが、その他にも`SystemRepositoryComponent`アノテーションを付与する方法もあり、このアプリではこちらの方法を使用します。（[アノテーションを付与したクラスのオブジェクトを構築する | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/repository.html#repository-inject-annotation-component)）

`"status"`キーで`"ok"`文字列を格納する`Map`オブジェクトを返していますが、これは次のようなJSONに変換されます。

```json
{ "status": "ok" }
```

#### `src/main/java/com/example/system/nablarch/FlywayExecutor.java`

バックエンドでは、マイグレーションツールである[Flyway](https://flywaydb.org/)を使用して、データベース上のテーブルやテストデータを登録するようにします。

Flywayを使用するための準備については、予め設定しています。（[Maven Plugin | Flyway](https://flywaydb.org/documentation/maven/#installation)）

Flywayの実行については、Nablarchの初期化処理を利用して、バックエンドアプリを起動したタイミングで行うように予め設定しています。（参考：[Nablarch - オブジェクトの初期化処理を行う](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/repository.html#repository-initialize-object)）

example-chatのバックエンドでも同様の実装をしているため、その実装を流用しています。

{% hint style='danger' %}
ToDoアプリでは、アプリ起動時に毎回テーブルを初期化するように設定しています。テストを簡単に繰り返し実行できるようにするためにこのような設定としますが、テスト用途以外では指定しないように注意してください。
{% endhint %}

#### `src/main/java/com/example/system/nablarch/di/ExampleComponentDefinitionLoader.java`

前述の`SystemRepositoryComponent`アノテーションを付与してシステムリポジトリへ登録するための実装です。

#### `src/main/resource/app-log.properties`

Nablarchで使用するログ出力用の定義ファイルです。

ブランクプロジェクト作成時に生成されたものを使用しています。

#### `src/main/resource/common.config`

Nablarchで使用するプロパティ定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/main/resource/data-source.config`

Nablarchで使用するプロパティ定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/main/resource/env.config`

Nablarchで使用するプロパティ定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/main/resource/log.properties`

Nablarchで使用するログ出力用の定義ファイルです。

ブランクプロジェクト作成時に生成されたものを使用しています。

#### `src/main/resource/rest-boot.xml`

Nablarchの使用するシステムリポジトリの定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/main/resource/rest-component-configuration.xml`

Nablarchの使用するシステムリポジトリの定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/main/resources/db/migration/V1__create_table.sql`

Flywayで実行するSQLを定義したファイルです。

#### `src/main/resources/META-INF/services/nablarch.core.repository.di.config.externalize.ExternalizedComponentDefinitionLoader`

前述の`SystemRepositoryComponent`アノテーションを付与してシステムリポジトリへ登録するための実装です。

#### `src/main/webapp/WEB-INF/web.xml`

Java EEでWebアプリケーションを作成する際の定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

#### `src/test/java/com/example/SampleTest.java`

動作確認を行うためのテストを定義したテストクラスです。

実行できれば無条件に成功するテストを実装しています。

```java
package com.example;

import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class SampleTest {

    @Test
    public void test() {
        assertTrue(true);
    }
}
```

#### `src/test/resource/log.properties`

Nablarchで使用するログ出力用の定義ファイルです。

ブランクプロジェクト作成時に生成されたものを使用しています。

#### `src/test/resource/unit-test.xml`

テスト実行時にNablarchが使用するシステムリポジトリの定義ファイルです。

ブランクプロジェクト作成時に生成されたものをベースに使用しています。

## バックエンドのアプリを起動する

バックエンドのアプリはMavenプロジェクトであるため、Mavenを使用して動作を確認していきます。

まずは、コンパイルやテストが動作することを確認するため、`backend`ディレクトリで次のコマンドを実行します。

```
$ mvn test
```

次のように`BUILD SUCCESS`と出力されることを確認します。

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.SampleTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.048 s - in com.example.SampleTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  4.506 s
[INFO] Finished at: 2020-08-07T09:55:45+09:00
[INFO] ------------------------------------------------------------------------
```

次に、アプリケーションサーバのJettyでアプリを起動できることを確認します。

Nablarchでは起動時にデータベースに接続するため、アプリを起動する前に、PostgreSQLを起動しておきます。PostgreSQLをDockerコンテナで起動するため、Docker Composeを使用します。`backend`ディレクトリで次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml up -d
```

続いて、コンテナが起動していることを確認するため、次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml ps
```

`docker_postgres_1`の`State`が`Up`（起動中）と出力されることを確認します。

```
      Name                     Command              State           Ports
----------------------------------------------------------------------------------
docker_postgres_1   docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
```

PostgreSQLを起動したら、続いてJettyを起動するため、次のコマンドを実行します。バックエンドのアプリの初期設定では、Jettyは[localhost:9080](http://localhost:9080)で起動します。

```
$ mvn jetty:run
```

次のように`Started`と出力され、コマンドが実行中のままとなります。これでJettyが起動中の状態となっています。

```
[INFO] Started ServerConnector@2299f6d7{HTTP/1.1,[http/1.1]}{0.0.0.0:9080}
[INFO] Started Server@3751acd7{STARTING}[10.0.0.alpha1] @7133ms
```

Jettyが起動したら、起動テストを行います。

ブラウザを起動し、[lostlhost:9080/api/test](http://localhost:9080/api/test)にアクセスします。

画面上に次のようなレスポンスが出力されることを確認します。

```
{
    status: "ok"
}
```

起動テストが完了したら、PostgreSQLとJettyを停止しておきます。

まず、Jettyを終了するため、Jettyを起動して実行中となっているコンソールで、`Ctrl`+`C`を押してコマンドを終了します。

Jettyを停止したら、続いてPostgreSQLを起動しているDockerコンテナを終了するため、次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml down
```

終了したことを確認するため、次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml ps
```

起動中のDockerコンテナとして出力されないことを確認します。

```
Name   Command   State   Ports
------------------------------
```

