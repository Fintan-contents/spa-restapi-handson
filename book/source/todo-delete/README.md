# ToDoを削除する（演習）

ToDoページで、ToDoを削除できるように実装します。

今までの実装とほぼ同じ要領で実装ができるため、演習として自身で実装してみましょう。

## 機能説明

ToDoページで一覧表示しているToDoの右側にある「x」ボタンをクリックすると、対象のToDoを一覧から削除します。

## 実装のヒント

- OpenAPI
  - 削除に使用するREST APIは`DELETE /api/todos/{id}`です
- フロントエンド
  - チェックボックスでToDoの状態を更新する実装を参考にしてください
- バックエンド
  - ToDo状態更新のREST APIの実装を参考にしてください。
  - 主キーによるDELETEをする場合は、ユニバーサルDAOのCRUD機能が利用できます。  
（参考：[ユニバーサルDAO — Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#sqlcrud)）

## Nablarch（5u18）での注意点

バックエンドで使用しているNablarchのバージョンは`5u18`ですが、このバージョンではCORSのプリフライトリクエストに`Access-Control-Request-Headers`ヘッダが必須になります。

ただし、この時点でToDoの削除機能を実装して動作させた場合、許可が必要なヘッダ項目が無いために`Access-Control-Request-Headers`ヘッダも無い状態となっています。

そのため、ToDoの削除機能を動作させるにはCORSの設定クラスを差し替える必要があります。

`com.example.system.nablarch`パッケージに、次の`CustomCors`クラスを作成します。

```java
package com.example.system.nablarch;

import nablarch.fw.ExecutionContext;
import nablarch.fw.jaxrs.cors.BasicCors;
import nablarch.fw.web.HttpRequest;

public class CustomCors extends BasicCors {

    @Override
    public boolean isPreflightRequest(HttpRequest request, ExecutionContext context) {
        return request.getMethod().equals("OPTIONS") &&
                request.getHeader(Headers.ORIGIN) != null &&
                request.getHeader(Headers.ACCESS_CONTROL_REQUEST_METHOD) != null;

    }

    private static final class Headers {
        static final String ORIGIN = "Origin";
        static final String ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method";
    }
}
```

Nablarchが提供している`BasicCors`クラスを継承し、`isPreflightRequest(HttpRequest, ExecutionContext)`メソッドをオーバーライドしてプリフライトリクエストの判定を変更しています。

次に、`rest-component-configuration.xml`ファイルで定義しているCORS設定クラスを、`BasicCors`から`CustomCors`に修正します。

```xml
<!-- CORS設定 -->
<component name="cors" class="com.example.system.nablarch.CustomCors">
  <property name="allowOrigins">
    <component class="nablarch.core.repository.di.config.StringListComponentFactory">
      <property name="values" value="${cors.origins}"/>
    </component>
  </property>
</component>
```

以上の対応で、`Access-Control-Request-Headers`ヘッダが無いプリフライトリクエストでも動作可能になります。
