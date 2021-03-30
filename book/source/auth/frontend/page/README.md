# ページ外観の作成

ユーザー認証で追加するページの外観を作成します。

## コンポーネントの分割

それぞれのページにあるナビゲーションメニューのヘッダについては、表示されているメニューは違いますがToDoページとほぼ同じものであるため、ToDoページで作成した`NavigationHeader`コンポーネントを使用します。

ヘッダ以外の部分については、それぞれのページ内では用途が同じ情報のみ扱っているため、それぞれのページ全体をコンポーネントとします。

- **NavigationHeader**：ナビゲーションメニューのヘッダ
- **Welcome**：トップページのウェルカムメッセージを表示する
- **Signup**：サインアップフォームを表示する
- **Login**：ログインフォームを表示する

これらのコンポーネントを、ToDoページのコンポーネントと並べて次の階層構造となるように作成していきます。

- NavigationHeader（作成済み）
- Welcome
- Signup
- Login
- TodoBoard（作成済み）
  - TodoForm
  - TodoFilter
  - TodoList
    - TodoItem

## コンポーネントの作成

Todoページを作成した時と同じように、`spa-restapi-handson/design-mock`に配置されているデザインモックを元に、それぞれのコンポーネントを作成していきます。

### `Welcome`コンポーネント

まず、`Welcome`コンポーネントを作成します。

`src/components/Welcome.tsx`
```js
import React from 'react';
import './Welcome.css';

export const Welcome: React.FC = () => {
  return (
    <div className="Welcome_content">
      <div>
        <h1 className="Welcome_title">Welcome</h1>
        <div className="Welcome_buttonGroup">
          <button className="Welcome_button">登録する</button>
        </div>
      </div>
    </div>
  );
};
```

`src/components/Welcome.css`
```css
.Welcome_content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}
.Welcome_title {
  font-size: 60px;
}

.Welcome_buttonGroup {
  text-align: center;
}
.Welcome_button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.Welcome_button:hover {
  background-color: green;
}
```

### `Signup`コンポーネント

続いて、`Signup`コンポーネントを作成します。

`src/components/Signup.tsx`
```jsx
import React from 'react';
import './Signup.css';

export const Signup: React.FC = () => {
  return (
    <div className="Signup_content">
      <div className="Signup_box">
        <div className="Signup_title">
          <h1>ユーザー登録</h1>
        </div>
        <div className="Signup_item">
          <div className="Signup_label">名前</div>
          <input type="text"/>
        </div>
        <div className="Signup_item">
          <div className="Signup_label">パスワード</div>
          <input type="password" />
        </div>
        <div className="Signup_buttonGroup">
          <button className="Signup_button">登録する</button>
        </div>
      </div>
    </div>
  );
};
```

`src/components/Signup.css`
```css
.Signup_content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  text-align: center;
}
.Signup_box {
  width: 50%;
}
.Signup_title {
  height: 70px;
}
.Signup_title h1 {
  margin: 10px 0;
}
.Signup_form {
  width: 50%;
  padding: 0 25%;
}

.Signup_item {
  margin: 20px 0;
  height: 75px;
}
.Signup_item input {
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  margin-top: 10px;
  outline: none;
}
.Signup_item input:focus {
  background-color: white;
}
.Signup_label {
  text-align: left;
}

.Signup_buttonGroup {
  text-align: center;
  margin-top: 40px;
}
.Signup_button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.Signup_button:hover {
  background-color: green;
}
```

### `Login`コンポーネント

続いて、`Login`コンポーネントを作成します。

`src/components/Login.tsx`
```jsx
import React  from 'react';
import './Login.css';

export const Login: React.FC = () => {
  return (
    <div className="Login_content">
      <div className="Login_box">
        <div className="Login_title">
          <h1>ログイン</h1>
        </div>
        <div className="Login_item">
          <div className="Login_label">名前</div>
          <input type="text" />
        </div>
        <div className="Login_item">
          <div className="Login_label">パスワード</div>
          <input type="password" />
        </div>
        <div className="Login_buttonGruop">
          <button className="Login_button">ログインする</button>
        </div>
      </div>
    </div>
  );
};
```
`src/components/Login.css`
```css
.Login_content {
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  text-align: center;
}
.Login_box {
  width: 50%;
}
.Login_title {
  height: 70px;
}
.Login_title h1 {
  margin: 10px 0;
}
.Login_form {
  width: 50%;
  padding: 0 25%;
}

.Login_item {
  margin: 20px 0;
  height: 75px;
}
.Login_item input {
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  border: solid 1px lightgray;
  background-color: #fafbfc;
  font-size: 16px;
  margin-top: 10px;
  outline: none;
}
.Login_item input:focus {
  background-color: white;
}
.Login_label {
  text-align: left;
}

.Login_buttonGruop {
  text-align: center;
  margin-top: 40px;
}
.Login_button {
  width: 175px;
  cursor: pointer;
  line-height: 1;
  border: none;
  font-size: 1rem;
  color: white;
  background-color: darkgreen;
  border-radius: 5px;
  padding: 15px 30px;
}
.Login_button:hover {
  background-color: green;
}
```

## 動作確認

ページを表示して確認したいところですが、複数のページをそれぞれ確認しづらいため、次に実装するURLルーティングが終わってから確認することにします。