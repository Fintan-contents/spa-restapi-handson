# REST APIクライアントの作成

ToDo一覧を表示する実装をする際には、バックエンドのREST APIにアクセスする必要があります。

事前にOpenAPIドキュメントからREST APIクライアントコードを生成していますが、REST APIの呼び出し時に共通的な設定を行うことが多いため、ここでは、各コンポーネントから生成したクライアントコードを直接使用せず、クライアントコードをラッピングした`BackendSerivce`を作成します。コンポーネントからREST APIにアクセスする際には、この`BackendSerivce｀を使用するようにします。

`src/backend`ディレクトリに`BackendService.ts`を作成します。

`src/backend/BackendService.ts`
```js
import {
  Configuration,
  TodosApi,
  Middleware,
  UsersApi
} from './generated-rest-client';

const requestLogger: Middleware = {
  pre: async (context) => {
    console.log(`>> ${context.init.method} ${context.url}`, context.init);
  },
  post: async (context) => {
    console.log(`<< ${context.response.status} ${context.url}`, context.response);
  }
}

const configuration = new Configuration({
  middleware: [requestLogger]
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
}

const putTodo = async (todoId: number, completed: boolean) => {
  return todosApi.putTodo({ todoId, inlineObject1: { completed }});
};

export const BackendService = {
  signup,
  login,
  logout,
  getTodos,
  postTodo,
  putTodo
};
```

生成されたクライアントコードでは、REST APIを呼び出すためには`TodosApi`等のAPIクラスのオブジェクトを生成する必要があります。生成時には設定オブジェクトを渡すことで、様々な設定をすることができます。

生成したクライアントコードでは、Middlewareと呼ばれる部品を作成することで、リクエストやレスポンスに対する共通的な処理を実装することができます。ここでは、開発時にREST APIの呼び出しを確認しやすいように、リクエストとレスポンスをコンソールにログ出力するMiddlewareを作成します。

なお、OpenAPIドキュメントにはToDoを削除するためのREST APIも定義されていますが、削除については後の演習にて自身で実装できるよう、ここでは作成しません。
