# ToDoを削除する（演習）

ToDoページで、ToDoを削除できるように実装します。

今までの実装とほぼ同じ要領で実装ができるため、演習として自身で実装してみましょう。

## 機能説明

ToDoページで一覧表示しているToDoの右側にあるxボタンをクリックすると、対象のToDoを一覧から削除します。

### 実装のヒント

- OpenAPI
  - 削除に使用するREST APIは`DELETE /api/todos/{id}`です
- フロントエンド
  - チェックボックスでToDoの状態を更新する実装を参考にしてください
- バックエンド
  - ToDo状態更新のREST APIの実装を参考にしてください。
  - 主キーによるDELETEをする場合は、ユニバーサルDAOのCRUD機能が利用できます。（[参考](https://nablarch.github.io/docs/5u18/doc/application_framework/application_framework/libraries/database/universal_dao.html#sqlcrud)）