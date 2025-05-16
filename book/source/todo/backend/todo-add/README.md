# ToDo登録のREST API

ToDoを登録するために使用するREST APIを実装します。

## ToDoを登録する処理の実装

まず、ToDoを登録する処理を実装します。ここはREST APIと直接関係が無い部分であるため、詳細な説明は省略します。

### `TodoRepository`インターフェースに追加

`TodoRepository`インターフェースに、IDを採番する`nextId`メソッドと、ToDoを登録するための`add`メソッドを追加します。

```java
package com.example.todo.application;

import com.example.todo.domain.Todo;
import com.example.todo.domain.TodoId;
import com.example.todo.domain.UserId;

import java.util.List;

public interface TodoRepository {

    List<Todo> list(UserId userId);

    TodoId nextId();

    void add(Todo todo);
}
```

### `TodoService`クラスに追加

ToDoを新しく登録するための`addTodo`メソッドを実装します。

```java
package com.example.todo.application;

import com.example.todo.domain.*;
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

    public Todo addTodo(UserId userId, TodoText text) {
        TodoId todoId = todoRepository.nextId();
        Todo newTodo = new Todo(todoId, text, TodoStatus.INCOMPLETE, userId);
        todoRepository.add(newTodo);
        return newTodo;
    }
}
```

ここでは、新しくToDoのIDを採番し、新しく登録するToDoオブジェクトを生成します。生成したToDoオブジェクトは、TodoRepositoryに渡して追加するようにします。戻り値として生成したToDoオブジェクトを返すようにします。

### `TodoIdSequence`クラスの作成

`db/migration/V1__create_table.sql`ファイルには、ToDoのIDを採番するための`todo_id`というシーケンスオブジェクトを定義しています。このシーケンスオブジェクトに対応するEntityクラスを作成します。前回と同じく、主キーを使用した処理ではないため、SQLファイルを作成します。

前回Entityクラスを配置した`com.example.todo.infrastructure.entity`パッケージに、`TodoIdSequence`クラスを作成します。

```java
package com.example.todo.infrastructure.entity;

public class TodoIdSequence {

    private Long todoId;

    public Long getTodoId() {
        return todoId;
    }

    public void setTodoId(Long todoId) {
        this.todoId = todoId;
    }
}
```

### `TodoIdSequence.sql`ファイルの作成

前回と同じように、作成したEntityクラスと同じ場所にSQLファイルを作成して、シーケンスオブジェクトから値を取得するSQLを定義します。

`src/main/resources/com/example/todo/infrastructure/entity/TodoIdSequence.sql`

```
NEXT_TODO_ID = select nextval('todo_id') AS todo_id;
```

### `JdbcTodoRepository`クラスに追加

先ほど`TodoRepository`インターフェースに`nextId`メソッドと`add`メソッドを追加したため、実装クラスにも処理を実装します。

```java
package com.example.todo.infrastructure;

import com.example.todo.application.TodoRepository;
import com.example.todo.domain.*;
import com.example.todo.infrastructure.entity.TodoEntity;
import com.example.todo.infrastructure.entity.TodoIdSequence;
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

    @Override
    public TodoId nextId() {
        TodoIdSequence todoIdSequence = UniversalDao.findBySqlFile(TodoIdSequence.class, "NEXT_TODO_ID", new Object[0]);
        return new TodoId(todoIdSequence.getTodoId());
    }

    @Override
    public void add(Todo todo) {
        TodoEntity todoEntity = new TodoEntity();
        todoEntity.setTodoId(todo.id().value());
        todoEntity.setText(todo.text().value());
        todoEntity.setCompleted(todo.status() == TodoStatus.COMPLETED);
        todoEntity.setUserId(todo.userId().value());
        UniversalDao.insert(todoEntity);
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

`nextId`メソッドでは、先ほど作成したシーケンスオブジェクトを使用し、ToDoIDを生成するように実装します。

`add`メソッドでは、渡されたユーザーIDとToDoオブジェクトを、DB上に追加するように実装します。

## REST APIの作成

### `TodosAction`クラスへ追加

前回作成した`TodosAction`クラスへ、ToDoを登録するためのREST APIを実装します。

ここでは、リクエストボディで送信された入力に異常がないか、NablarchのBean Validation機能を使用した入力値バリデーションを実装します。（参考：[Nablarch - BeanValidation](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/validation/bean_validation.html)）

NablarchのBean Validation機能は、JavaEEのBean Validation(JSR349)に準拠しており、ここでは`javax.validation.constraints`パッケージ（[Javadoc](https://docs.oracle.com/javaee/7/api/javax/validation/constraints/package-summary.html)）にあるアノテーションを使用して、入力項目の制約を定義していきます。

```java
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public TodoResponse post(PostRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        UserId userId = new UserId("1001");
        TodoText text = new TodoText(requestBody.text);

        Todo todo = todoService.addTodo(userId, text);

        return new TodoResponse(todo.id(), todo.text(), todo.status());
    }

    public static class PostRequest {
        @NotNull
        public String text;
    }
```

アクションクラスのメソッドの引数にオブジェクトを設定することで、NablarchがリクエストボディのJSON文字列をオブジェクトに変換してくれ、それを受け取ることができます。入力値をチェックするため、オブジェクトを受け取った後は`ValidatorUtil`を使用してBeanValidationを実行します。（参考：[Nablarch - 登録を行う](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/web_service/http_messaging/getting_started/save/index.html#id2)）

ここでは、リクエストのJSONに`text`が含まれているかを検証するため、`PostRequest`の`text`フィールドに`@NotNull`アノテーションを付与します。
リクエストに`text`が含まれていなければ`PostRequest`の`text`フィールドが`null`になるため、BeanValidationでこの制約に引っ掛かり、例外が送出されます。例外についてはNablarchでハンドリングしてくれるため、ここではハンドリングしません。

なお、実際には項目有無以外にも様々なバリデーションが必要になりますが、ここではそれらは省略します。

入力値に異常がなかった場合、以下の処理フローで実装します。

- 前回と同じく、ユーザーIDはダミー値で生成する
- リクエストボディのToDo内容をオブジェクトとして生成する
- `TodoService`のToDo登録メソッドを呼び出し、ToDoを登録する
- 登録結果のToDoを、レスポンス用のオブジェクトに変換する

## REST APIのテスト

### 登録に成功するテストを作成

テスト用Javaディレクトリの`com.example.todo.api`パッケージに、`TodoRegisterRestApiTest`クラスを作成します。

```java
package com.example.todo.api;

import com.example.openapi.OpenApiValidator;
import com.example.system.nablarch.FlywayExecutor;
import nablarch.core.repository.SystemRepository;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.hamcrest.Matchers;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.nio.file.Paths;
import java.util.Map;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class TodoRegisterRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @BeforeClass
    public static void setUpClass() {
        FlywayExecutor flywayExecutor = SystemRepository.get("dbMigration");
        flywayExecutor.migrate(true);
    }

    @Test
    public void RESTAPIでToDoを登録できる() throws Exception {
        RestMockHttpRequest request = post("/api/todos")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of("text", "テストする"));
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDoの登録", HttpResponse.Status.OK, response);

        assertThat(response.getBodyString(), hasJsonPath("$.id", Matchers.notNullValue()));
        assertThat(response.getBodyString(), hasJsonPath("$.text", equalTo("テストする")));
        assertThat(response.getBodyString(), hasJsonPath("$.completed", equalTo(false)));

        openApiValidator.validate("postTodo", request, response);
    }
}
```

実装要領は前回と同じですが、今回はHTTPメソッドが`GET`ではなく`POST`であるため、`post`メソッドを使用してリクエストオブジェクトを生成します。

`id`の正確な値で検証するのは難しいため、ここでは何かしら入っていることを検証するため、`null`でないこととします。

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

### Bean Validationでエラーになるテストを作成

続いて、`ValidatorUtil`を使用したBean Validationが実行されていることを確認するため、リクエストに`text`項目を含めずに送信するテストを `TodoRegisterRestApiTest` クラスに追加します。

```java
    @Test
    public void ToDo登録時にtext項目が無い場合_登録に失敗して400になる() {
        RestMockHttpRequest request = post("/api/todos")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Collections.emptyMap());
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDoの登録", HttpResponse.Status.BAD_REQUEST, response);
    }
```

Nablarchは、`ValidatorUtil`で送出された例外をハンドリングし、レスポンスのステータスコードを`400 Bad Request`に設定します。そのため、レスポンスのステータスコードを検証します。

PostgreSQLは先ほどのテスト実行時に起動しているため、Mavenでテストを実行します。

```
$ mvn test
```

特にエラーが発生せず、テストが成功することを確認します。

これで、ToDo登録のREST APIの実装は完了です。