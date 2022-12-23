# ToDo管理でのユーザー取得

ToDo管理のREST APIで、ログインしたユーザーを使用するように修正します。

## ToDo管理のREST APIを修正

ToDo管理の実装時には、ユーザーIDとしてダミー値を使用していましたが、スレッドコンテキストからユーザーIDを取得するように修正します。

`TodosAction`クラスでダミーのユーザーIDを生成している箇所を、次のように修正します。

```java
String userIdValue = ThreadContext.getUserId();
UserId userId = new UserId(userIdValue);
```

## REST APIのテスト

もう一度テストを実行し、成功することを確認します。

{% hint style='danger' %}
もしテストが失敗する場合は、先ほどのログインチェックハンドラのテスト時にテストクラスに加えたユーザーIDが、元々使用していたダミー値と異なっていないか確認しましょう。ログインチェックハンドラでの修正時には、まだREST APIの内部で使用するユーザーIDはダミー値であったため、どのようなユーザーIDをセッションストアに設定してもテストが成功していましたが、ここでの修正により想定しているユーザーIDでなければテストデータとマッチせずにテストが失敗するようになります。
{% endhint %}

これで、ToDo管理でのユーザー取得の実装は完了です。