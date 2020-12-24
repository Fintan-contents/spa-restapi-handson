# CORSの設定

フロントエンドアプリでCORSを使用するための設定をしましたが、同様に、バックエンドアプリでもCORSを使用するための設定をする必要があります。

Nablarchには、リクエストやレスポンスに対して横断的な処理を行うための仕組みがあり、処理を実装したものを「ハンドラ」と呼びます。（[アーキテクチャ | Nablarch](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/nablarch/architecture.html#nablarch-architecture)）

ハンドラは自身で実装することもできますが、Nablarchでは様々なハンドラが予め用意されています。CORSを使用するためのハンドラもNablarchから提供されているため、ここではそれを使用します。なお、example-chatのバックエンドでも同様の実装をしています。

ハンドラはコンポーネントとして定義する必要があるため、`rest-component-configuration`ファイルに次のコンポーネント定義を追加します。

```xml
<!-- CORS設定 -->
<component name="cors" class="nablarch.fw.jaxrs.cors.BasicCors">
  <property name="allowOrigins">
    <component class="nablarch.core.repository.di.config.StringListComponentFactory">
      <property name="values" value="${cors.origins}"/>
    </component>
  </property>
</component>
...
<component name="webFrontController" class="nablarch.fw.web.servlet.WebFrontController">
  <property name="handlerQueue">
    <list>
...
      <component class="nablarch.fw.jaxrs.JaxRsResponseHandler">
        <property name="responseFinishers">
            <list>
              <!-- CORSレスポンス -->
              <component class="nablarch.fw.jaxrs.cors.CorsResponseFinisher">
                <property name="cors" ref="cors" />
              </component>
            </list>
          </property>
      </component>

      <!-- CORSハンドラ -->
      <component class="nablarch.fw.jaxrs.CorsPreflightRequestHandler">
        <property name="cors" ref="cors" />
      </component>
...
      <component-ref name="packageMapping"/>
    </list>
  </property>
</component>
```

続いて、コンポーネント定義で使用する環境依存値を設定します。`env.config`に、以下の値を追加します。

```
# CORSで許可するオリジン
cors.origins=http://localhost:3000
```

これで、バックエンドのCORS設定については完了です。
