# REST APIへのアクセス制限

ログイン状態によるREST APIへのアクセス制御を実装します。

ユーザー認証を実装した後は、ログインしていなければToDoページを表示できないため、REST APIについても同様にログインしていなければアクセスできないようにします。

ここでは、ハンドラを実装することで実現します。ハンドラの実装についてはexample-chatのバックエンド実装から流用します。

## ログインチェックハンドラの作成

まず、ハンドラのクラスを格納する`com.example.system.nablarch.handler`パッケージを作成します。

続いて、example-chatの同パッケージにある`LoginCheckHandler`クラスを持ってきます。

このクラスでは、ログインしていなくてもアクセスが可能なREST APIを設定することで、ログインしていない状態でそれ以外のREST APIへアクセスするとエラーレスポンスを返します。

### 対象のREST APIを設定

`LoginCheckHandler`クラスはそのままではToDoアプリに合わないため、一部を修正していきます。

まず、対象のREST APIを設定するために、コンストラクタで設定している「ログインしていなくてもアクセスが可能なREST API」として、次のように修正します。

```java
public LoginCheckHandler() {
    whitePatterns
            .add("/api/signup", HttpMethod.POST)
            .add("/api/login", HttpMethod.POST);
}
```

### ログインチェック処理の修正

次に、ユーザーIDの取得方法と、エラーレスポンスの生成方法を変更するため、`handle`メソッドを次のように修正します。

```java
@Override
public Object handle(HttpRequest request, ExecutionContext context) {
    if (!whitePatterns.matches(request)) {
        if (ThreadContext.getUserId().equals("guest")) {
            String path = request.getRequestPath();
            String method = request.getMethod();
            logger.logWarn(String.format("Unauthorized access to path. path=[%s] method=[%s]", path, method));
            throw new HttpErrorResponse(HttpResponse.Status.FORBIDDEN.getStatusCode());
        }
    }
    return context.handleNext(request);
}
```

example-chatでは、セッションストアから独自の値を取得していますが、ここでは、スレッドコンテキストからユーザーIDを取得します。スレッドコンテキストからユーザーIDを取得するには、`ThreadContext#getUserId`を使用します。（参考：[スレッドコンテキストの属性値を設定/取得する | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/handlers/common/thread_context_handler.html#thread-context-handler-attribute-access)）

スレッドコンテキストにユーザーIDがされていない場合は、`common.config`に設定されている次の環境依存値がユーザーIDとして使用されます。

```
# 未ログイン時、ログに出力するユーザID
nablarch.userIdAttribute.anonymousId=guest
```

そのため、スレッドコンテキストのユーザーIDがここで設定している値であればログインしていないと判断するように変更します。

example-chatではエラーレスポンスを独自の例外で表現していますが、ここでは、今までの実装と同様に、`HttpErrorResponse`を使用するように変更します。

### ハンドラを設定

`LoginCheckHandler`クラスをハンドラとして設定するため、`rest-component-configuration`にある`webFrontController`名のコンポーネント定義を修正します。

ハンドラを設定する`handlerQueue`プロパティの最後にある`packageMapping`名のハンドラの手前に、`LoginCheckHandler`クラスをハンドラとして追加します。

```xml
<component name="webFrontController" class="nablarch.fw.web.servlet.WebFrontController">
  <property name="handlerQueue">
    <list>
...
      <component class="com.example.system.nablarch.handler.LoginCheckHandler"/>

      <component-ref name="packageMapping"/>
    </list>
  </property>
</component>
```

## REST APIのテスト

ハンドラが有効になっているかを確認するため、REST APIのテストを実行します。

ハンドラが有効になっていれば、レスポンスのステータスコードが`403 Forbidden`になり、いくつかのテストが失敗します。テストは失敗しますが、ハンドラが有効になっていることが確認できます。

次に、テストが成功するように修正していきます。REST APIテスティングフレームワークではCookieが使えないため、テスト開始時にセッションストアにユーザーIDを設定し、それに使用した`ExecutionContext`をリクエスト送信時に使用するようにします。特定の`ExecutionContext`をリクエスト送信時に使用するには、`sendRequest`メソッドではなく`sendRequestWithContext`メソッドを使用します。

ユーザー認証のテストではユーザーIDに`1010`を使用していますので、例えばログアウトのテストであれば、次のように修正します。

```java
@Test
public void RESTAPIでログアウトできる() {
    ExecutionContext executionContext = new ExecutionContext();
    SessionUtil.put(executionContext, "user.id", "1010");

    RestMockHttpRequest request = post("/api/logout");
    HttpResponse response = sendRequestWithContext(request, executionContext);
...
```

Todo操作のテストではユーザーIDに`1001`を使用していますので、例えばTodo一覧取得のテストであれば、次のように修正します。

```java
@Test
public void RESTAPIでToDo一覧が取得できる() throws Exception {
    ExecutionContext executionContext = new ExecutionContext();
    SessionUtil.put(executionContext, "user.id", "1001");

    RestMockHttpRequest request = get("/api/todos");
    HttpResponse response = sendRequestWithContext(request, executionContext);
...
```

他のテストケースもこれらと同様に修正します。全て修正したら、もう一度テストを実行し、全てのテストが成功することを確認します。

これで、REST APIへのアクセス制御の実装は完了です。
