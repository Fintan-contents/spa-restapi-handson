# OpenAPI

## REST APIの仕様を確認する

ユーザー認証をするために必要なREST APIについて確認します。

REST APIの仕様にあるとおり、アカウントの登録、ログイン、ログアウトを行うために、以下のREST APIを使用します。

```
POST /api/signup
POST /api/login
POST /api/logout
```

サインアップとログインのREST APIでは、リクエストボディとしてアカウント情報を送る必要があります。アカウント情報は、ユーザー名、パスワードの2項目であるため、アカウント情報のスキーマとしては次のとおりとします。

- userName
  - ユーザー名
  - 文字列
- password
  - パスワード
  - 文字列


レスポンスは、ToDoの登録時と同じになります。

## OpenAPIドキュメントへの記述

`openapi.yaml`に、サインアップ、ログイン、ログアウトのREST APIを定義します。

`paths`の下に追加します。

`rest-api-specification/openapi.yaml`
```yaml
  /api/signup:
    post:
      summary: アカウントの登録
      description: >
        ToDoアプリを利用するのに必要となるユーザーアカウントを登録する。
        **ユーザー名**は識別できるように一意である必要がある。
      tags:
        - users
      operationId: signup
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userName:
                  type: string
                  description: ユーザー名
                password:
                  type: string
                  description: パスワード
              required:
                - userName
                - password
              additionalProperties: false
            examples:
              example:
                value:
                  userName: test1
                  password: password
      responses:
        '204':
          description: No Content
        '400':
          description: Bad Request
  /api/login:
    post:
      summary: ログイン
      description: >
        ユーザー情報で認証を行い、認証に成功した場合はログインする。
        一部のREST APIを利用するためには、このREST APIを利用して事前にログインしておく必要がある。
        ログイン状態は、ログアウトするREST APIを呼び出すか、一定時間が経過するまで継続する。
      tags:
        - users
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userName:
                  type: string
                  description: ユーザー名
                password:
                  type: string
                  description: パスワード
              required:
                - userName
                - password
              additionalProperties: false
            examples:
              example:
                value:
                  userName: test1
                  password: password
      responses:
        '204':
          description: No Content
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
  /api/logout:
    post:
      summary: ログアウト
      description: >
        ログイン中である場合、ログアウトする。
      tags:
        - users
      operationId: logout
      responses:
        '204':
          description: No Content
        '403':
          description: Forbidden
```

ここでは、ToDo管理とユーザー認証のREST APIを区別するため、`tags`を定義しています。この`tags`を指定することで、OpenAPIドキュメントから様々な成果物を生成したりする際に、グルーピングされるようになります。

例えば、REST APIのクライアントコードを生成した場合に今までは`DefaultApi`という名前で生成されていましたが、前述のユーザー認証のREST APIからクライアントコードを生成すると、`UsersApi`といった`tags`に指定した名前でAPIクラスがそれぞれ生成されるようになったりもします。

これで、REST APIのドキュメント化は完了です。