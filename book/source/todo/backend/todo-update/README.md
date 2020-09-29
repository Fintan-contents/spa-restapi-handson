# ToDo状態更新のREST API

ToDoの状態を更新するために使用するREST APIを実装します。

## ToDoを更新する処理の実装

まず、ToDoの状態を更新する処理を実装します。ここはREST APIと直接関係が無い部分であるため、詳細な説明は省略します。

### `Todo`クラスに追加

ToDoの状態を変更したインスタンスを生成する`changeStatus`メソッドを追加します。

```java
public Todo changeStatus(TodoStatus status) {
    return new Todo(id, text, status);
}
```

### `TodoRepository`インターフェースに追加

`TodoRepository`インターフェースに、ToDoを取得するための`get`メソッド、ToDoを更新するための`update`メソッドを追加します。

```java
    Todo get(TodoId todoId);

    void update(UserId userId, Todo todo);
```

### `TodoService`クラスに追加

ToDoの状態を更新するための`updateStatus`メソッドを実装します。

```java
public Todo updateStatus(UserId userId, TodoId todoId, TodoStatus status) {
    Todo todo = todoRepository.get(todoId);
    Todo changedTodo = todo.changeStatus(status);
    todoRepository.update(userId, changedTodo);
    return changedTodo;
}
```

### `JdbcTodoRepository`クラスに追加

先ほど`TodoRepository`インターフェースに`get`メソッドと`update`メソッドを追加したため、実装クラスにも処理を実装します。

```java
    @Override
    public Todo get(TodoId todoId) {
        TodoEntity todoEntity = UniversalDao.findById(TodoEntity.class, todoId.value());
        return createTodo(todoEntity);
    }

    @Override
    public void update(UserId userId, Todo todo) {
        TodoEntity todoEntity = new TodoEntity();
        todoEntity.setTodoId(todo.id().value());
        todoEntity.setText(todo.text().value());
        todoEntity.setCompleted(todo.status() == TodoStatus.COMPLETED);
        todoEntity.setUserId(userId.value());
        UniversalDao.update(todoEntity);
    }
```

`get`メソッドでは、ToDoのIDからDBに登録されているToDoを取得します。ToDoのIDは主キーであるため、SQLファイルは書かずに`UniversalDao#findById`を使用して検索することができます。（参考：[Nablarch SQLを書かなくても単純なCRUDができる](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#sqlcrud)）

`update`メソッドでは、引数のToDoからDBを更新しています。

## REST APIの作成

### `TodoActon`クラスの作成

今回は、単一のToDoを表現したパスに変わるため、新しく`TodoAction`クラスを作成します。（同じアクションクラスでも実装可能ですが、ここでは分けます）

```java
package com.example.todo.api;

import com.example.todo.application.TodoService;
import com.example.todo.domain.*;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;
import nablarch.core.validation.ee.ValidatorUtil;
import nablarch.fw.ExecutionContext;
import nablarch.fw.web.HttpRequest;

import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

@SystemRepositoryComponent
@Path("/todos/{todoId}")
public class TodoAction {

    private final TodoService todoService;

    public TodoAction(TodoService todoService) {
        this.todoService = todoService;
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public TodoResponse put(HttpRequest request, ExecutionContext context, PutRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        UserId userId = new UserId("1002");
        TodoId todoId = new TodoId(Long.valueOf(request.getParam("todoId")[0]));
        TodoStatus status = requestBody.completed ? TodoStatus.COMPLETED : TodoStatus.INCOMPLETE;
        
        Todo todo = todoService.updateStatus(userId, todoId, status);

        return new TodoResponse(todo.id(), todo.text(), todo.status());
    }

    public static class PutRequest {
        @NotNull
        public Boolean completed;
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

`put`メソッドは以下の処理を実装します。
 
- 登録と同じように、`ValidatorUtil`を使用してBean Validationを実行
- ユーザーIDをダミー値で生成
- ToDoのIDをパスパラメータから取得
- ToDo状態のオブジェクトを生成
- `TodoService`の状態更新メソッドを呼び出し
- 更新結果をレスポンスのオブジェクトに変換

## REST APIのテスト

他のテストに影響を与えないように、`src/test/resources/db/testdata/V9999__testdata.sql`にテストデータを追加します。

```
INSERT INTO todo (todo_id, text, completed, user_id) VALUES (2003, 'やること３', false, '1003');
```

前回作成した`RestApiTest`に、新しく作成したRSET APIのテストを追加します。

```java
    @Test
    public void RESTAPIでToDoの状態を更新できる() throws Exception {
        RestMockHttpRequest request = put("/api/todos/2003")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of("completed", true));
        HttpResponse response = sendRequest(request);

        assertStatusCode("ToDoのステータス更新", HttpResponse.Status.OK, response);

        assertThat(response.getBodyString(), hasJsonPath("$.id", equalTo(2003)));
        assertThat(response.getBodyString(), hasJsonPath("$.text", equalTo("やること３")));
        assertThat(response.getBodyString(), hasJsonPath("$.completed", equalTo(true)));

        openApiValidator.validate("putTodo", request, response);
    }
```

実装要領は登録と同じです。

続いて、テストを実行する前準備として、PostgreSQLを起動しておきます。PostgreSQLのコンテナを起動していない場合は、`backend`ディレクトリで次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.dev.yml up -d
```

続いて、次のコマンドでコンテナが起動していることを確認します。

```
mvn test
```

特にエラーが発生せず、テストが成功することを確認します。

これで、ToDo状態更新のREST APIの実装は完了です。
