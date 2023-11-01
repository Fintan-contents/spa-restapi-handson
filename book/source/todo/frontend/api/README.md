# REST APIクライアントの作成

ToDo一覧を実装する際には、バックエンドのREST APIにアクセスする必要があります。ここでは、OpenAPIドキュメントを利用してREST APIのクライアントを作成します。

## OpenAPIドキュメントの確認

REST APIをOpenAPI仕様で記述したOpenAPIドキュメントは、プロジェクト作成時に作成しています。（参考：[OpenAPI - Specification](https://swagger.io/specification/)）

バックエンドの`rest-api-specification/openapi.yaml`ファイルがOpenAPIドキュメントになるため、内容を確認します。

例えば、ToDoの一覧を取得するためのREST APIは、次のように定義されています。

```yaml
  /api/todos:
    get:
      summary: ToDo一覧の取得
      description: >
        登録しているToDoを全て取得する。
      tags:
        - todos
      operationId: getTodos
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Todo'
              examples:
                example:
                  value:
                    - id: 2001
                      text: やること１
                      completed: true
                    - id: 2002
                      text: やること２
                      completed: false
        '403':
          description: Forbidden
```

`summary`や`description`には、ドキュメント化したときの説明文を定義します。

`tags`には、REST APIをグルーピングするための名前を定義します。ここでは、ToDo管理とユーザー認証のREST APIを区別するために使用します。この`tags`を指定することで、OpenAPIドキュメントから様々な成果物を生成したりする際に、グルーピングされるようになります。例えば、REST APIのクライアントコードでは、`tags`に指定した名前ごとにクラス（ここでは`TodosApi`）が生成されるようになります。

`operationId`には、それぞれのREST APIを一意に識別するためのIDを定義します。これはクライアントを自動生成した際の関数名にもなるため、それを考慮して定義します。

`responses`には、レスポンスを定義します。`responses`にはステータスコードごとに定義します。JSON形式で返却するため、`content`として`application/json`を定義します。


`content`内の`schema`には、レスポンスデータの形式を定義します。ここでは、配列を返すように定義し、配列の中については`$ref`を使って共通で定義したコンポーネントを参照するよう定義します。複数のREST APIで扱うToDoレスポンスの形式が同じであるため、このような定義にしています。

参照先となる形式は、次のように定義しています。

```yaml
components:
  schemas:
    Todo:
      title: Todo
      type: object
      description: ToDo情報
      properties:
        id:
          type: integer
          description: ToDoのID
        text:
          type: string
          description: ToDoのタイトル
        completed:
          type: boolean
          description: ToDoのステータス
      required:
        - id
        - text
        - completed
      additionalProperties: false
```

`properties`には、このコンポーネントの項目を定義します。全ての項目が必ず必要であるため、`required`には全ての項目を定義します。ここで定義していない項目が追加で返却されることは想定していないため、`additionalProperties`には`false`を定義します。

`content`内の`examples`に、実際に返却される例を定義します。

これらから、REST APIで返却されるJSONは、次のようなイメージになります。

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

## クライアントコードの生成

REST APIのクライアントコードを、OpenAPIドキュメントから生成します。

クライアントコードの生成には、[OpenAPI Generator](https://openapi-generator.tech/)を使用します。OpenAPIが提供しているツールで、OpenAPIドキュメントから様々なものを生成することができます。TypeScript用のクライアントコードについても様々な実装を生成することができますが、ここでは`typescript-fetch`を使用します。

OpenAPI Generatorはコンテナイメージでも提供されています。そのコンテナイメージを使用して実行するためのDocker Composeファイルとして`docker-compose.api-gen.yml`を予め作成しているため、Docker Composeを使用してDockerコンテナ上で生成します。

`frontend`ディレクトリで、次のコマンドを実行します。

```
$ docker-compose -f docker/docker-compose.api-gen.yml up
```

実行が完了すると、`src`の下に`backend`ディレクトリが生成され、その配下に`generated-rest-client`ディレクトリが生成されます。この`generated-rest-client`配下に、自動生成されたクライアントコードが格納されています。

フロントエンドでREST APIを呼び出す際には、このクライアントコードを使用していきます。

## クライアントコードのラッパーを作成

OpenAPIドキュメントからREST APIのクライアントコードを生成しましたが、使用時には同じ設定を行うことが多くなります。そこで、共通的な設定がされたクライアントコードを使用するために、生成したクライアントコードをラッピングした`BackendSerivce`を作成します。コンポーネントからREST APIにアクセスする際には、生成したクライアントコードは直接使用せずに、この`BackendSerivce`を使用するようにします。

`src/backend`ディレクトリに`BackendService.ts`を作成します。

`src/backend/BackendService.ts`
```js
import {
  Configuration,
  TodosApi,
  Middleware,
  UsersApi,
  FetchParams,
  HTTPMethod,
  RequestContext
} from './generated-rest-client';
  
const requestLogger: Middleware = {
  pre: async (context) => {
    console.log(`>> ${context.init.method} ${context.url}`, context.init);
  },
  post: async (context) => {
    console.log(`<< ${context.response.status} ${context.url}`, context.response);
  }
};

const corsHandler: Middleware = {
  pre: async (context) => {
    return {
      url: context.url,
      init: {
        ...context.init,
        mode: 'cors',
        credentials: 'include'
      }
    };
  }
};

class CsrfTokenAttachment implements Middleware {

  private readonly targetMethod: ReadonlyArray<HTTPMethod> = ['POST', 'PUT', 'DELETE', 'PATCH'];
  private headerName = '';
  private tokenValue = '';

  setCsrfToken(headerName: string, tokenValue: string) {
    console.log('setCsrfToken:', headerName, tokenValue);
    this.headerName = headerName;
    this.tokenValue = tokenValue;
  }

  pre = async (context: RequestContext): Promise<FetchParams | void> => {
    if (!this.headerName || !this.targetMethod.includes(context.init.method as HTTPMethod)) {
      return;
    }
    console.log('attach csrf token:', this.headerName, this.tokenValue);
    return {
      url: context.url,
      init: {
        ...context.init,
        headers : {
          ...context.init.headers,
          [this.headerName]: this.tokenValue
        }
      }
    };
  }
}

const csrfTokenAttachment = new CsrfTokenAttachment();

const configuration = new Configuration({
  middleware: [csrfTokenAttachment, corsHandler, requestLogger]
});

const todosApi = new TodosApi(configuration);

const usersApi = new UsersApi(configuration);

const signup = async (userName: string, password: string) => {
  return usersApi.signup({ inlineObject2 : { userName, password }});
};

const login = async (userName: string, password: string) => {
  return usersApi.login({ inlineObject3: { userName, password }});
};

const logout = async () => {
  return usersApi.logout();
};

const getTodos = async () => {
  return todosApi.getTodos();
};

const postTodo = async (text: string) => {
  return todosApi.postTodo({ inlineObject: { text }});
};

const putTodo = async (todoId: number, completed: boolean) => {
  return todosApi.putTodo({ todoId, inlineObject1: { completed }});
};

const deleteTodo = async (todoId: number) => {
  return todosApi.deleteTodo({ todoId });
};

const refreshCsrfToken = async () => {
  const response = await usersApi.getCsrfToken();
  csrfTokenAttachment.setCsrfToken(response.csrfTokenHeaderName, response.csrfTokenValue);
};

export const BackendService = {
  signup,
  login,
  logout,
  getTodos,
  postTodo,
  putTodo,
  deleteTodo,
  refreshCsrfToken
};
```

生成されたクライアントコードでは、REST APIを呼び出すためには`TodosApi`等のAPIクラスのオブジェクトを生成する必要があります。生成時には設定オブジェクトを渡すことで、様々な設定をすることができます。

生成したクライアントコードでは、Middlewareと呼ばれる部品を作成することで、リクエストやレスポンスに対する共通的な処理を実装することができます。ここでは、開発時にREST APIの呼び出しを確認しやすいように、リクエストとレスポンスをコンソールにログ出力するMiddlewareを作成します。

なお、OpenAPIドキュメントにはToDoを削除するためのREST APIも定義されていますが、削除については後の演習にて自身で実装できるよう、ここでは作成しません。
