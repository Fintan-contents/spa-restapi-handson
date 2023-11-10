# フロントエンドの確認

フロントエンドを開発するためのプロジェクトを確認します。

## フロントエンド開発プロジェクトを確認する

`frontend`ディレクトリが、フロントエンド開発プロジェクトになります。

このプロジェクトは、Create React App（以下CRA）のTypeScript用テンプレートで作成しています。（参考：[CRA - Adding TypeScript](https://create-react-app.dev/docs/adding-typescript)）

実装を小さくするために、CRAで生成されたプロジェクトに次のような修正を加えた状態です。

- 開発に使用するDockerCompose定義ファイルを追加
- HelloWorldを表示するだけの簡易なページに変更
- ページ変更に伴う不要ファイルの削除


ディレクトリ構造は、次のようになっています。

```
frontend
├── .gitignore
├── package.json
├── tsconfig.json
├── docker
│   ├── docker-compose.api-gen.yml
│   └── docker-compose.api-mock.yml
├── public
│   ├── favicon.ico
│   └── index.html
└── src
    ├── index.tsx
    ├── App.tsx
    ├── react-app-env.d.ts
    └── setupTests.ts
```

#### `.gitignore`

Gitで管理対象外とするファイルを定義するためのファイルです。

CRAでアプリ作成時に生成されたものを使用しています。

#### `package.json`

フロントエンドアプリのプロジェクト定義ファイルです。

CRAでアプリ作成時に生成されたものを使用しています。

#### `tsconfig.json`

TypeScript用のプロジェクト定義ファイルです。

CRAでアプリ作成時に生成されたものを使用しています。

#### `docker/docker-compose.api-gen.yml`

OpenAPI定義ファイルからクライアント実装を生成するための、Docker Composeの定義ファイルです。

#### `docker/docker-compose.api-mock.yml`

OpenAPI定義ファイルからモックサーバを起動するための、Docker Composeの定義ファイルです。

#### `public/favicon.ico`

ファビコン用のアイコン。

CRAでアプリ作成時に生成されたものを使用しています。

#### `public/index.html`

CRAで作成したアプリでページ表示のエントリポイントとなるHTMLファイルです。コンテンツは動的に生成するため、`<div>`タグのみ定義しています。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Todo App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

#### `src/index.tsx`

CRAで作成したアプリでJavaScript実行のエントリポイントとなる`src/index.js`のTypeScript実装です。

この実装の中では、JSXと呼ばれるJavaScript構文の拡張を使用しています。JSXを使用することで、React要素をHTMLのマークアップに近しいイメージで記述することができます。（参考：[React - JSXの導入]](https://ja.reactjs.org/docs/introducing-jsx.html)）

なお、TypeScriptファイルの拡張子は通常`ts`ですが、後述のJSXを使用する場合は`tsx`とする必要があります。（参考：[TypeScript - JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)）

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

`createRoot()`を使用してアプリのルートコンポーネントを作成しています。（参考：[createRoot](https://ja.react.dev/reference/react-dom/client/createRoot)）

`createRoot()`の引数にはレンダー先のDOM要素を指定します。ここでは[`Document.getElementById()`](https://developer.mozilla.org/ja/docs/Web/API/Document/getElementById)の実行結果を渡しています。

`root.render()`メソッドを使用してReactコンポーネントを指定されたルートにレンダリングします。（参考：[root.render(reactNode)](https://ja.react.dev/reference/react-dom/client/createRoot#root-render)）

`root.render()`の引数にはReactコンポーネントを指定します。ここでは、上で説明したJSXを使用して、`<React.StrictMode>`とその子要素に`<App>`があるReact要素を定義しています。

`<React.StrictMode>`は`React.StrictMode`のコンポーネントを指しており、`React.StrictMode`コンポーネントはReactが提供するコンポーネントです。このコンポーネントは、子要素でReactのstrictモードを有効にするためのコンポーネントになります。出力されるページのコンテンツには影響しませんが、開発時に有用となる警告等を表示してくれるようになります。（参考：[StrictMode](https://ja.react.dev/reference/react/StrictMode)）

同様に、`<App />`は`App`コンポーネントを指しています。このコンポーネントについては後述します。

ここでの`document`は前述の`public/index.html`を指しており、そこで定義されている`<div id="root"></div>`を表すDOMに、`root.render()`に作成されているReactコンポーネントがレンダーされることになります。

`public/index.html`の`<body>`には`<div id="root"></div>`しか無いため、コンテンツを全て更新していることになります。

#### `src/App.tsx`

`App`コンポーネントを実装しています。このコンポーネントは、`<h1>Hello, world</h1>`というHTML要素を表すReact要素を返します。

```jsx
import React from 'react';

function App() {
  return (
    <h1>Hello, world</h1>
  );
}

export default App;
```

#### `src/react-app-env.d.ts`

TypeScript用の定義ファイルです。

CRAでアプリ作成時に生成されたものを使用しています。

#### `src/setupTests.ts`

テスト用の定義ファイルです。

CRAでアプリ作成時に生成されたものを使用しています。

## フロントエンドのアプリを起動する

CRAでは、開発モードとしてアプリを起動することができます。（参考：[CRA - Available Scripts](https://create-react-app.dev/docs/available-scripts)）

まず、依存モジュールをインストールするため、`frontend`ディレクトリで次のコマンドを実行します。実行時にはいくつかの警告（`npm WARN 〜`）が出力されますが、ここでは無視してください。

```
$ npm install
```

続いて、アプリを起動するため次のコマンドを実行します。

```
$ npm start
```

起動が完了したら、自動的にデフォルトブラウザで[トップページ](http://localhost:3000/)が開きますので、次の画面が表示されていることを確認します。

![frontend-test](img/frontend-test.png)

起動中はコマンドが実行中のままになりますので、確認が完了したら、`Ctrl`+`C`で終了します。