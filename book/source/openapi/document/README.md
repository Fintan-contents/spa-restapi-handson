# ドキュメントの確認

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

これで、OpenAPIドキュメントの確認は完了です。
