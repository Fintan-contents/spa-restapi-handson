# ToDo一覧取得のREST API

ToDoの一覧を取得するために使用するREST APIを実装します。

## OpenAPIドキュメントの確認

バックエンドのREST APIは、OpenAPIドキュメントの定義と合うように実装しますので、OpenAPIドキュメントを確認します。フロントエンドのREST APIクライアント作成で説明している内容と同じであるため、該当ページの「[OpenAPIドキュメントの確認](../../frontend/api/README.md#openapiドキュメントの確認)」を参照してください。

## ダミーデータのToDoを取得する処理の実装

REST APIを実装する前に、REST APIから呼ぶToDoを取得する処理を実装します。

まず、DBからToDoを取得するところまでは一気に実装せず、想定どおりのJSONを返却するREST APIが作成できることを確認します。
そのため、この段階では、DBからToDoを取得するのではなく、ダミーデータを固定で返すように実装しておきます。

なお、この部分の設計についてはREST APIとは直接関係がありませんので、詳細な説明は省略します。

### `com.example.todo.domain`パッケージの作成

ToDo管理で扱うモデルを表すクラスを配置するための、`com.example.todo.domain`パッケージを作成します。

### `TodoId`クラスの作成

まず、ToDoを識別するためのIDを表す`TodoId`クラスを作成します。

```java
package com.example.todo.domain;

public class TodoId {

    private final Long value;

    public TodoId(Long value) {
        this.value = value;
    }

    public Long value() {
        return value;
    }
}
```

{% hint style='tip' %}
このような何のための値であるかを専用の型で表現する方法は、一般的に「値オブジェクト（バリューオブジェクト）」と呼ばれます。何の値であるかを型で区別できるようにすることで、ミスを防ぎやすくしたり、どこでどのように使われるのかを特定しやすくしたりします。
{% endhint %}

### `TodoText`クラスの作成

続いて、ToDoの内容を表す`TodoText`クラスを作成します。

```java
package com.example.todo.domain;

public class TodoText {

    private final String value;

    public TodoText(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}
```

### `TodoStatus`クラスの作成

続いて、ToDoの状態を表す`TodoStatus`クラスを作成します。

```java
package com.example.todo.domain;

public enum TodoStatus {
    INCOMPLETE,
    COMPLETED
}
```

ここでは、JSONやテーブルで扱う`boolean`値をそのまま扱わず、状態を名前で扱うためにEnumを使用します。

### `UserId`クラスの作成

続いて、ユーザーIDを表す`UserId`クラスを作成します。

```java
package com.example.todo.domain;

public class UserId {

    private final String value;

    public UserId(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}
```

### `Todo`クラスの作成

続いて、ToDoを表す`Todo`クラスを作成します。

```java
package com.example.todo.domain;

public class Todo {

    private final TodoId id;

    private final TodoText text;

    private final TodoStatus status;

    private final UserId userId;

    public Todo(TodoId id, TodoText text, TodoStatus status, UserId userId) {
        this.id = id;
        this.text = text;
        this.status = status;
        this.userId = userId;
    }

    public TodoId id() {
        return id;
    }

    public TodoText text() {
        return text;
    }

    public TodoStatus status() {
        return status;
    }

    public UserId userId() {
        return userId;
    }
}
```

{% hint style='tip' %}
コンストラクタでのみ状態を設定し、生成後に状態を変更できないオブジェクトは、一般的に「イミュータブル（不変）」なオブジェクトと呼ばれます。オブジェクトをやり取りする中で、意図せずオブジェクトの状態を更新されてしまう等のバグを防ぎやすくします。
{% endhint %}

### `com.example.todo.application`パッケージの作成

ToDo管理の機能を表すクラスを配置するための、`com.example.todo.application`パッケージを作成します。

### `TodoRepository`インターフェースの作成

まず、ToDo管理の永続化処理を呼び出すためのインターフェースとなる、`TodoRepository`インターフェースを作成します。

```java
package com.example.todo.application;

import com.example.todo.domain.Todo;
import com.example.todo.domain.UserId;

import java.util.List;

public interface TodoRepository {

    List<Todo> list(UserId userId);
}
```

### `TodoService`クラスの作成

続いて、ToDoの操作を行うための`TodoService`を作成します。REST APIからは、このクラスのメソッドを呼び出して、ToDo管理の機能を使用します。

```java
package com.example.todo.application;

import com.example.todo.domain.Todo;
import com.example.todo.domain.UserId;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.List;

@SystemRepositoryComponent
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> list(UserId userId) {
        List<Todo> todos = todoRepository.list(userId);
        return todos;
    }

}
```

このクラスはコンポーネントとしてDIコンテナに登録するため、`@SystemRepositoryComponent`を付与します。`TodoRepository`のインスタンスについては、DIコンテナによりコンストラクタインジェクションで設定されるようにします。（参考：[Nablarch - コンポーネントを自動的にインジェクションする](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/repository.html#repository-autowired)）

### `com.example.todo.infrastructure`パッケージの作成

ToDo管理の永続化処理を実装するクラスを配置するための、`com.example.todo.infrastructure`パッケージを作成します。

### `JdbcTodoRepository`クラスの作成

`TodoRepository`インターフェースを実装した`JdbcTodoRepository`クラスを作成します。

ここにはDBにアクセスする処理を実装する予定ですが、前述のとおり、一旦ダミーデータを返す処理を実装しておきます。

```java
package com.example.todo.infrastructure;

import com.example.todo.application.TodoRepository;
import com.example.todo.domain.*;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.List;

@SystemRepositoryComponent
public class JdbcTodoRepository implements TodoRepository {

    @Override
    public List<Todo> list(UserId userId) {
        return List.of(
            new Todo(new TodoId(2001L), new TodoText("やること１"), TodoStatus.COMPLETED, new UserId("1001")),
            new Todo(new TodoId(2002L), new TodoText("やること２"), TodoStatus.INCOMPLETE, new UserId("1001"))
        );
    }
}
```

## REST APIの作成

### `com.example.todo.api`パッケージの作成

REST APIを実装するクラスを配置するための、`com.example.todo.api`パッケージを作成します。

### `TodosAction`クラスの作成

登録しているToDoを取得するためのREST APIを実装する`TodosAction`を作成します。

```java
package com.example.todo.api;

import com.example.todo.domain.*;
import com.example.todo.application.TodoService;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@SystemRepositoryComponent
@Path("/todos")
public class TodosAction {

    private final TodoService todoService;

    public TodosAction(TodoService todoService) {
        this.todoService = todoService;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<TodoResponse> get() {
        UserId userId = new UserId("1001");
        List<Todo> todos = todoService.list(userId);
        return todos.stream()
                .map(todo -> new TodoResponse(todo.id(), todo.text(), todo.status()))
                .collect(Collectors.toList());
    }

    public static class TodoResponse {

        public final Long id;

        public final String text;

        public final Boolean completed;

        public TodoResponse(TodoId id, TodoText text, TodoStatus status) {
            this.id = id.value();
            this.text = text.value();
            this.completed = status == TodoStatus.COMPLETED;
        }
    }
}
```

このクラスはコンポーネントとしてDIコンテナに登録するため、`@SystemRepositoryComponent`を付与します。`TodoService`のインスタンスについては、DIコンテナによりコンストラクタインジェクションで設定されるようにします。

前述のとおり、JAX-RSのアノテーションを利用してREST APIを作成します。JAX-RSの`@Path`アノテーションをクラスに、`@GET`アノテーションと`@Produces`アノテーションをメソッドに付与し、パス等の属性を指定します。

`@Path`アノテーションをクラスに付与することで、このアクションクラスが対応するパスを指定します。

`@GET`アノテーションをメソッドに付与することで、HTTPメソッドが`GET`の場合にそのメソッドが呼び出されるようになります。

`@Produces`アノテーションは、レスポンスを返す際の`Content-Type`を指定します。レスポンスはJSONで返すため、`MediaType.APPLICATION_JSON`を指定します。

メソッドの実装としては、さきほど作成した`TodoService`クラスの`list(UserId)`メソッドを呼び出します。DBから取得するためのユーザーIDを渡す必要がありますが、今はまだユーザー認証を実装していないため、とりあえずダミーのユーザーIDを生成して渡しておきます。

レスポンスのオブジェクトがJSONに変換されるため、OpenAPIドキュメントに沿った値に変換されるように`TodoResponse`クラスを内部で定義し、`TodoService`から取得したオブジェクトを変換します。また、`java.util.List`で返すことで配列形式に変換されるため、`TodoResponse`型のオブジェクトをListで返すことで、OpenAPIの定義時に想定していた次のようなJSONに変換されます。

```json
{
  [
    {
      "id": 2001,
      "text": "やること１",
      "completed": true
    },
    {
      "id": 2002,
      "text": "やること２",
      "completed": false
    }
  ]
}
```

## REST API（ダミーデータ）のテスト

ToDoはダミーデータですが、アクションクラスを作成してREST APIを定義したため、このREST APIが想定している動作をするのか、テストします。

Nablarchでは、REST APIをテストするためテスティングフレームワークを提供していますので、それを使用してアプリサーバの起動およびREST APIの呼び出しをテストします。

REST APIのテスティングフレームワークを使用するための設定は、Nablarchのブランクプロジェクトで予め設定されているため、事前準備は必要ありません。

### テストクラスの作成

テスト用Javaディレクトリの`src/test/java`に、`com.example.todo.api`パッケージを作成し、そこに`TodoListRestApiTest`クラスを作成します。

REST APIのテスティングフレームワークを使用するため、親クラスに`nablarch.test.core.http.SimpleRestTestSupport`クラスを指定します。

合わせて、最初のテストとしてREST APIが想定しているパスとHTTPメソッドで呼び出せるかをテストします。

```java
package com.example.todo.api;

import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.Test;

public class TodoListRestApiTest extends SimpleRestTestSupport {

    @Test
    public void RESTAPIでToDo一覧が取得できる() {
        RestMockHttpRequest request = get("/api/todos");
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDo一覧の取得", HttpResponse.Status.OK, response);
    }
}
```

親クラスの`get`メソッド呼び出してパスを渡すことで、そのパスにGETでリクエストを送信するためのリクエストオブジェクトを生成できます。
生成したら、`sendRequest`メソッドにそのリクエストを渡すことで、リクエストが処理されてREST APIが呼び出されます。戻り値のレスポンスオブジェクトには、ステータスコードやレスポンスボディ等のレスポンスに関する情報が入っています。

ここでは、REST APIが呼び出せているかを確認するため、レスポンスのステータスコードが`200 OK`であるかを検証します。

テストクラスを作成したら、テストを実行します。

REST APIテスティングフレームワークではテスト実行時にアプリを起動するため、テストを実行する前準備として、PostgreSQLを起動しておきます。PostgreSQLのコンテナを起動していない場合は、`backend`ディレクトリで次のコマンドを実行します。

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

Mavenでテストを実行するため、次のコマンドを実行します。

```
$ mvn test
```

出力された内容から、`TodoListRestApiTest`テストが実行され、テストが成功していることを確認します。

### レスポンスボディのJSONの検証

次は、ダミーデータのToDoが想定通りJSONに変換されていることを確認します。先ほどのテストメソッドを、次のように変更します。

```java
package com.example.todo.api;

import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.Test;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

public class TodoListRestApiTest extends SimpleRestTestSupport {

    @Test
    public void RESTAPIでToDo一覧が取得できる() {
        RestMockHttpRequest request = get("/api/todos");
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDo一覧の取得", HttpResponse.Status.OK, response);

        String responseBody = response.getBodyString();

        assertThat(responseBody, hasJsonPath("$", hasSize(2)));

        assertThat(responseBody, hasJsonPath("$[0].id", equalTo(2001)));
        assertThat(responseBody, hasJsonPath("$[0].text", equalTo("やること１")));
        assertThat(responseBody, hasJsonPath("$[0].completed", equalTo(true)));

        assertThat(responseBody, hasJsonPath("$[1].id", equalTo(2002)));
        assertThat(responseBody, hasJsonPath("$[1].text", equalTo("やること２")));
        assertThat(responseBody, hasJsonPath("$[1].completed", equalTo(false)));
    }
}
```

ここでは、先ほど依存関係に追加したライブラリであるJsonPathを利用して、レスポンスとして返されたJSONに対して次の検証をします。（JsonPathでは、ルート要素を`$`で表します）

- 配列の要素数が2である
- 配列の1番目が、ダミーデータの1番目の値と同じである
- 配列の2番目が、ダミーデータの2番目と値と同じである

先ほどと同じく、Mavenでテストを実行し、テストが成功していることを確認します。

なお、ダミーデータを変えてみることでテストを失敗させることができるため、想定どおりに検証できるかやテスト失敗時の挙動を確認するために、わざと失敗するようにダミーデータを変更してテストを実行してみるのもよいです。

### OpenAPIドキュメントによる型の検証

次に、OpenAPIドキュメントに記述したレスポンスの定義と、実際のレスポンスの内容が一致しているか検証します。

OpenAPIによりフロントエンドとREST APIに対する認識を合わせているため、OpenAPIドキュメントの定義と実装が一致していることの検証は重要です。

ここでは、OpenAPIドキュメントの解析や検証ができるOSSの[OpenAPI4J](https://www.openapi4j.org/)を使用します。

OpenAPI4Jを使用するための設定は済んだ状態になっているため、事前準備は必要ありません。（[Operation validator | OpenAPI4J](https://www.openapi4j.org/operation-validator.html#installation)）

OpenAPIドキュメントによる検証を実装するには、OpenAPI4Jから提供されているValidatorを使用します。example-chatのバックエンドでは、Nablarchで使いやすくするためにValidatorをラッピングしたクラスを実装しているため、その実装を流用します。

example-chatのテストソースに`com.example.openapi.OpenApiValidator`クラスがあるため、これをそのまま同じパッケージに持ってきます。

次に、先ほどのテストに、OpenAPIドキュメントの定義と一致するかを検証するためのテストコードを追加します。

```java
package com.example.todo.api;

import com.example.openapi.OpenApiValidator;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.Test;

import java.nio.file.Paths;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

public class TodoListRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @Test
    public void RESTAPIでToDo一覧が取得できる() throws Exception {
        RestMockHttpRequest request = get("/api/todos");
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDo一覧の取得", HttpResponse.Status.OK, response);

        String responseBody = response.getBodyString();

        assertThat(responseBody, hasJsonPath("$", hasSize(2)));

        assertThat(responseBody, hasJsonPath("$[0].id", equalTo(2001)));
        assertThat(responseBody, hasJsonPath("$[0].text", equalTo("やること１")));
        assertThat(responseBody, hasJsonPath("$[0].completed", equalTo(true)));

        assertThat(responseBody, hasJsonPath("$[1].id", equalTo(2002)));
        assertThat(responseBody, hasJsonPath("$[1].text", equalTo("やること２")));
        assertThat(responseBody, hasJsonPath("$[1].completed", equalTo(false)));

        openApiValidator.validate("getTodos", request, response);
    }

}
```

先ほどと同じく、Mavenでテストを実行し、テストが成功していることを確認します。

この検証では、値については検証されずに、あくまでJSONの項目と型が定義と一致するかを検証します。そのため、想定しているデータであるかどうかについては、JsonPath等を利用して検証する必要があります。

なお、`TodoResponse`の型を変更してみるなどして、想定どおりに検証できるかやテスト失敗時の挙動を確認することができるため、わざと失敗するように修正してテストを実行してみるのもよいです。

## DBから取得する処理の実装

次に、先ほどダミーデータの取得として実装していた処理を、実際にDBから取得する処理に変更していきます。

NablarchでDBを操作するために、ユニバーサルDAOと呼ばれる機能を使用します。（参考：[Nablarch - ユニバーサルDAO](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html)）

### `com.example.todo.infrastructure.entity`パッケージの作成

ユニバーサルDAOでは、Entityと呼ばれるクラスを使用して、DBの検索結果をEntityにマッピングします。そのため、まずはEntityを配置するための`com.example.todo.infrastructure.entity`パッケージを作成します。（参考：[Nablarch - 検索結果をBeanにマッピングできる](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#bean)）

### `TodoEntity`クラスの作成

`todo`テーブルを先ほど作成しているため、`todo`テーブルに対応する`TodoEntity`クラスを作成します。

```java
package com.example.todo.infrastructure.entity;

import javax.persistence.*;

@Entity
@Table(name = "todo")
@Access(AccessType.FIELD)
public class TodoEntity {

    @Id
    private Long todoId;

    private String text;

    private Boolean completed;

    private String userId;

    public Long getTodoId() {
        return todoId;
    }

    public void setTodoId(Long todoId) {
        this.todoId = todoId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
```

Entityクラスには、Entityを表すための`@Entity`アノテーションをクラスに付与します。

ユニバーサルDAOではEntityクラス名をテーブル名とみなしますが、ここではEntityクラス名はテーブル名と一致しないため、`@Table`アノテーションを付与して、`name`属性でテーブル名を指定します。

### `JdbcTodoRepository`クラスの修正

先ほどダミーデータを返す処理を実装した`JdbcTodoRepository`クラスを、ユニバーサルDAOを使用してDBからデータを取得するように修正します。

```java
package com.example.todo.infrastructure;

import com.example.todo.application.TodoRepository;
import com.example.todo.domain.*;
import com.example.todo.infrastructure.entity.TodoEntity;
import nablarch.common.dao.EntityList;
import nablarch.common.dao.UniversalDao;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@SystemRepositoryComponent
public class JdbcTodoRepository implements TodoRepository {

    @Override
    public List<Todo> list(UserId userId) {
        Map<String, String> condition = Map.of("userId", userId.value());
        EntityList<TodoEntity> todoEntities = UniversalDao.findAllBySqlFile(TodoEntity.class, "FIND_BY_USERID", condition);

        return todoEntities.stream().map(this::createTodo).collect(Collectors.toList());
    }

    private Todo createTodo(TodoEntity entity) {
        return new Todo(
                new TodoId(entity.getTodoId()),
                new TodoText(entity.getText()),
                entity.getCompleted() ? TodoStatus.COMPLETED : TodoStatus.INCOMPLETE,
                new UserId(entity.getUserId()));
    }
}
```

ここでは、ユーザーIDに紐づくToDoを取得しますが、ユーザーIDは`todo`テーブルの主キーではありません。ユニバーサルDAOでは、主キーを使用しない検索にはSQLファイルを使用します。（参考：[Nablarch - 任意のSQLで検索する](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#sql-sql)）

SQLファイルは後ほど作成しますので、使用するSQLのIDを`FIND_BY_USERID`、パラメータを`userId`として実装します。

### `com/example/todo/infrastructure/entity`ディレクトリの作成

ユニバーサルDAOで使用するSQLファイルを使用するためには、Entityクラスと同じクラスパス上にSQLファイルを配置する必要があります。
そのため、まずは`src/main/resources`の下に`com/example/todo/infrastructure/entity`ディレクトリを作成します。

### `TodoEntity.sql`ファイルの作成

作成した`com/example/todo/infrastructure/entity`ディレクトリ内に、`TodoEntity`クラスに対応する`TodoEntity.sql`ファイルを作成します。

```
FIND_BY_USERID =
select
  *
FROM
  todo
WHERE
  user_id = :userId
ORDER BY
  todo_id
```

SQLファイル内のそれぞれのSQLにはIDが必要であるため、先ほど実装した際のIDとパラメータも記述します。（参考：[SQLをファイルで管理する](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/database.html#database-use-sql-file)）

## テストデータの作成

テスト実行時にDBにテストデータを投入するため、テスト用リソースディレクトリの`src/test/resources`に、`db/testdata`ディレクトリを作成し、`V9999__testdata.sql`ファイルを作成します。ファイルには、テストデータを登録するためのSQLを記述します。

`src/test/resouces/db/testdata/V9999__testdata.sql`
```SQL
INSERT INTO account (user_id, password) VALUES ('1001', '');
INSERT INTO user_profile (user_id, name) VALUES ('1001', 'todo-test');
INSERT INTO todo (todo_id, text, completed, user_id) VALUES (2001, 'やること１', true, '1001');
INSERT INTO todo (todo_id, text, completed, user_id) VALUES (2002, 'やること２', false, '1001');
```

## REST APIのテスト

DBのテストデータは最初に作成したダミーデータと同じ値であるため、REST APIのテストケースはそのまま利用できます。後ほど実装する登録等のテストでも同じテストデータを利用するため、テスト実行順序でテスト結果が変わらないように、テスト前処理としてDB初期化処理を実装します。DB初期化処理にはFlywayのマイグレーションを利用します。

{% hint style='tip' %}
DB初期化処理を簡易に実装するためFlywayのマイグレーションを利用していますが、処理時間が増えるためテスト実行時間は遅くなってしまいます。ハンズオンコンテンツではテストケース数がわずかであるため問題ありませんが、使用する際にはご注意ください。
{% endhint %}

```java
package com.example.todo.api;

import com.example.openapi.OpenApiValidator;
import com.example.system.nablarch.FlywayExecutor;
import nablarch.core.repository.SystemRepository;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.BeforeClass;
import org.junit.Test;

import java.nio.file.Paths;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

public class TodoListRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @BeforeClass
    public static void setUpClass() {
        FlywayExecutor flywayExecutor = SystemRepository.get("dbMigration");
        flywayExecutor.migrate(true);
    }

    @Test
    public void RESTAPIでToDo一覧が取得できる() throws Exception {
        RestMockHttpRequest request = get("/api/todos");
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDo一覧の取得", HttpResponse.Status.OK, response);

        String responseBody = response.getBodyString();

        assertThat(responseBody, hasJsonPath("$", hasSize(2)));

        assertThat(responseBody, hasJsonPath("$[0].id", equalTo(2001)));
        assertThat(responseBody, hasJsonPath("$[0].text", equalTo("やること１")));
        assertThat(responseBody, hasJsonPath("$[0].completed", equalTo(true)));

        assertThat(responseBody, hasJsonPath("$[1].id", equalTo(2002)));
        assertThat(responseBody, hasJsonPath("$[1].text", equalTo("やること２")));
        assertThat(responseBody, hasJsonPath("$[1].completed", equalTo(false)));

        openApiValidator.validate("getTodos", request, response);
    }

}
```

テストが成功することを確認するため、再度Mavenでテストを実行してみます。

```
$ mvn test
```

特にエラーが発生せず、テストが成功することを確認します。

これで、ToDo一覧取得のREST APIの実装は完了です。
