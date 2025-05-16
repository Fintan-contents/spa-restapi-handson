# CSRF対策

REST API一覧の説明時にも紹介しましたが、Nablarchではクロスサイト・リクエスト・フォージェリ（以下CSRF）に対策するための機能が提供されています。  
（参考：[CSRF | 安全なウェブサイトの作り方](https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_6.html)）

CSRFトークンを発行してリクエスト毎にサーバサイドで保持しているCSRFトークンと突き合わせる方式であり、
CSRFトークンを発行するためのユーティリティとCSRFトークンを検証するためのハンドラが提供されています。
（参考：[CSRFトークン検証ハンドラ — Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/handlers/web/csrf_token_verification_handler.html)）

ここでは、CSRF対策を実現するために、バックエンドでCSRFトークンを取得するREST APIを提供し、フロントエンドからはREST APIで取得したCSRFトークンを使用するように実装していきます。

## バックエンド

example-chatのバックエンドでも同様の実装をしているため、その実装を流用します。  

バックエンドではCSRFトークンを取得するREST APIと、それを検証するためのハンドラを実装します。

### CSRFトークンを取得するREST APIの作成

CSRFトークンを取得するREST APIについては、example-chatの`com.example.presentation.restapi.system.CsrfTokenAction`クラスで同様の実装をしているため、このクラスを流用します。`backend/src/main/java/com/example`配下に`presentation/restapi/system`ディレクトリを作成し`CsrfTokenAction.java`をコピーします。

### CSRFトークン検証ハンドラの設定

CSRFトークンを検証するハンドラについては、Nablarchから提供されているため、これもコンポーネント定義に追加します。CSRFトークンを検証するハンドラではセッションを使用するため、セッション変数保存ハンドラ（ここでは`sessionStoreHandler`）より後で実行されるように定義します。

`backend/src/main/resources/rest-component-configuration.xml`
```xml
<!-- CSRFトークン検証ハンドラ -->
<component name="csrfTokenVerificationHandler" class="nablarch.fw.web.handler.CsrfTokenVerificationHandler" />

<!-- ハンドラキュー構成 -->
<component name="webFrontController" class="nablarch.fw.web.servlet.WebFrontController">
  <property name="handlerQueue">
    <list>
...
        <component-ref name="sessionStoreHandler" />

        <component-ref name="threadContextHandler"/>

        <!-- CSRFトークン検証ハンドラ -->
        <component-ref name="csrfTokenVerificationHandler"/>

        <component-ref name="dbConnectionManagementHandler"/>
...
    </list>
  </property>
</component>
```

### ログインチェックハンドラの修正

CSRFトークンを取得するREST APIは、ログインしていなくてもアクセスできる必要があります。ログインしていなくてもアクセスできるパスは、ユーザー認証の実装時に作成した`com.example.system.nablarch.handler.LoginCheckHandler`クラスのコンストラクタで設定しているため、`/api/csrf_token`のパスを追加します。

`backend/src/main/java/com/example/system/nablarch/handler/LoginCheckHandler.java`
```java
public LoginCheckHandler() {
    whitePatterns
            .add("/api/signup", HttpMethod.POST)
            .add("/api/login", HttpMethod.POST)
            .add("/api/csrf_token", HttpMethod.GET);
}
```

### バックエンドのテスト

次に、バックエンドのテストを実行してみます。

```
$ mvn test
```

すると、更新系の操作をするREST APIのテストが失敗します。これは、CSRFトークン検証ハンドラにより、リクエスト時にCSRFトークンが無ければ、ステータスコードが`400 Bad Request`のエラーレスポンスとして返却されるためです。

そのため、テスト時にCSRFトークンを使用するように、テストクラスを修正します。

CSRFトークンを使用するには、先ほど実装したREST APIを使用してCSRFトークンとHTTPヘッダ属性名を取得し、リクエスト時のHTTPヘッダに設定する必要があります。

まず、テストクラスに次のようなprivateメソッドを実装します。

`backend/src/test/java/com/example/authentication/api/AuthenticationRestApiTest.java`
```java
private void attachCsrfToken(RestMockHttpRequest request, ExecutionContext context) {
    HttpResponse response = sendRequest(get("/api/csrf_token"));
    assertStatusCode("CSRFトークンの取得", HttpResponse.Status.OK, response);

    String json = response.getBodyString();
    String name = JsonPath.read(json, "$.csrfTokenHeaderName");
    String value = JsonPath.read(json, "$.csrfTokenValue");

    request.setHeader(name, value);

    WebConfig webConfig = WebConfigFinder.getWebConfig();
    String storedVarName = webConfig.getCsrfTokenSessionStoredVarName();
    String storeName = webConfig.getCsrfTokenSavedStoreName();
    if (storeName != null) {
        SessionUtil.put(context, storedVarName, value, storeName);
    } else {
        SessionUtil.put(context, storedVarName, value);
    }
}
```

このメソッドでは以下の実装をしています。
- CSRFトークンを取得するREST APIを呼び出す
- リクエストヘッダーにCSRFトークンをセットする
- セッションストアにトークンをセットする

セッションストアにも保存するのは、サーバサイドで比較元として使用するためです。
`ExecutionContext`を使用したセッションストアへの設定については、ユーザー認証でのテストクラスへの実装と同様に実装します。

各REST APIのテストで、REST APIにアクセスする前にこの`attachCsrfToken`メソッドを呼び出すように修正します。

例えばサインアップのテストであれば、次のように修正します。

```java
@Test
public void RESTAPIでサインアップできる() throws Exception {
    ExecutionContext executionContext = new ExecutionContext();
    RestMockHttpRequest request = post("/api/signup")
            .setHeader("Content-Type", MediaType.APPLICATION_JSON)
            .setBody(Map.of(
                    "userName", "signup-test",
                    "password", "pass"));
    attachCsrfToken(request, executionContext);
    HttpResponse response = sendRequestWithContext(request, executionContext);
...
```

例えばログアウトのようにユーザーIDを設定しているテストであれば、次のように修正します。

```java
@Test
public void RESTAPIでログアウトできる() throws Exception {
    ExecutionContext executionContext = new ExecutionContext();
    SessionUtil.put(executionContext, "user.id", "1010");

    RestMockHttpRequest request = post("/api/logout");
    attachCsrfToken(request, executionContext);
    HttpResponse response = sendRequestWithContext(request, executionContext);
...
```

各REST APIのテストで同様の実装をすると、テストが成功します。

これでバックエンドの実装は完了です。

## フロントエンド

続いて、フロントエンドを実装します。

### REST APIクライアントへのCSRFトークン組込

生成したREST APIクライアントのラッパーを実装した`BackendService.ts`に、CSRFトークンを使用するための実装を追加します。

`src/backend/BackendService.ts`
```js
import {
  ...
  FetchParams,
  HTTPMethod,
  RequestContext,
} from './generated-rest-client';

...

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
        headers: {
          ...context.init.headers,
          [this.headerName]: this.tokenValue,
        },
      },
    };
  };
}

const csrfTokenAttachment = new CsrfTokenAttachment();

const configuration = new Configuration({
  middleware: [csrfTokenAttachment, corsHandler, requestLogger],
});

...

const refreshCsrfToken = async () => {
  const response = await usersApi.getCsrfToken();
  csrfTokenAttachment.setCsrfToken(response.csrfTokenHeaderName, response.csrfTokenValue);
};

export const BackendService = {
...
  refreshCsrfToken,
};
```

すでに説明したとおり、生成したREST APIのクライアントコードでは、Middlewareと呼ばれる部品を作成することで、リクエストやレスポンスに対する共通的な処理を実装することができます。

まず、CSRFトークンをヘッダに設定する`CsrfTokenAttachment`クラスを、Middlewareとして実装します。（CSRFトークンを状態として保持しやすくするよう、クラスとして実装します）

Middlewareに追加するため、`CsrfTokenAttachment`クラスのインスタンスを生成し、`middleware`プロパティに追加します。

次に、CSRFトークン取得のREST APIを呼び出して`CsrfTokenAttachment`に設定する`refreshCsrfToken`関数を実装します。
CSRFトークンはセッションストアに紐付いており、セッションが切り替わるタイミングでCSRFトークンも変更されます。
そのため、ログインやログアウト等のセッション切替タイミングで、この関数を実行してCSRFトークンを最新化します。

### アプリ起動時のCSRFトークン設定

この関数を実行してCSRFトークンを最新化するため、共通の部品として実装します。  
具体的には、CSRFトークンを最新化する部品を作成し、それを`layout.tsx`で呼び出します。

`src`ディレクトリ配下に`initializer`ディレクトリを作成し、その中に`AppInitializer.tsx`を作成して、下記のコードを実装します。

`src/initializer/AppInitializer.tsx`
```jsx
'use client';
import React, {useEffect, useState} from 'react';
import {BackendService} from '../backend/BackendService';

const AppInitializer: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    BackendService.refreshCsrfToken().finally(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return <React.Fragment />;
  }

  return children;
};

export default AppInitializer;
```

`refreshCsrfToken`関数によるCSRFトークン取得が完了するまでは、他のコンポーネントを処理したくないため、それを制御するためのフラグとして`initialized`stateを作成します。  
`refreshCsrfToken`の処理が終わるまではJSXで空要素を返すようにし、`refreshCsrfToken`の処理が完了して`initialized`が`true`になったタイミングで、今までと同様のコンポーネント処理を実行するようにします。

return文で`children`を返すことにより、`AppInitializer`でラップするコンポーネントをレンダリングする実装になっています。
作成した`AppInitializer`を共通の部品として使用するために、`layout.tsx`で呼び出します。

`src/app/layout.tsx`
```jsx
...
import AppInitializer from '../initializer/AppInitializer';

...
  return (
    <html lang='en'>
      <body>
        <AppInitializer>
          <UserContextProvider>
            <NavigationHeader />
            {children}
          </UserContextProvider>
        </AppInitializer>
      </body>
    </html>
  );
}
```

この実装により、セッション切替のタイミングでCSRFトークンを最新化できるようになりました。

### ログイン・ログアウト時のCSRFトークン設定

ログイン、ログアウト時に、セッションを破棄して新しく開始するようにします。
`UserContext`にある`login`、`logout`関数内で、先ほど作成した`refreshCsrfToken`関数を実行するように実装します。

`src/contexts/UserContext.tsx`
```jsx
...

export const UserContextProvider: React.FC<Props> = ({children}) => {
  ...

  const contextValue: ContextValueType = {
    ...
    login: async (userName, password) => {
      try {
        await BackendService.login(userName, password);
        await BackendService.refreshCsrfToken();
        setUserName(userName);
        ...
    },
    logout: async () => {
      await BackendService.logout();
      await BackendService.refreshCsrfToken();
      setUserName('');
    },
    ...
```

これで、フロントエンドの実装は完了です。


## 動作確認

いままでと同じように、フロントエンドアプリとバックエンドアプリを起動し、動作を確認します。

内部的な処理であるため、ページの動作や見た目については、何も影響がありません。

CSRFトークンの取得や設定時には`console.log`でログを出力していますので、ブラウザの開発者ツールでコンソールを確認してみましょう。次のようなログが出力され、正常に動作していることが確認できます。

```
>> GET http://localhost:9080/api/csrf_token 
Object
body: undefined
credentials: "include"
headers: {}
method: "GET"
mode: "cors"
[[Prototype]]: Object
```
```
<< 200 http://localhost:9080/api/csrf_token 
Response
body: ReadableStream
bodyUsed: false
headers: Headers {}
ok: true
redirected: false
status: 200
statusText: "OK"
type: "cors"
url: "http://localhost:9080/api/csrf_token"
[[Prototype]]: Response
```
```
setCsrfToken: X-CSRF-TOKEN fe709dd4-ed6a-4436-ab6d-63dce1291b05
```

これで、CSRF対策の実装は完了です。