# フロントエンドの確認

フロントエンドを開発するためのプロジェクトを確認します。

## フロントエンド開発プロジェクトを確認する

`frontend`ディレクトリが、フロントエンド開発プロジェクトになります。

このプロジェクトは、`create-next-app`のデフォルトのテンプレートで作成しています。  
（参考：[create-next-app | Next.js](https://nextjs.org/docs/app/api-reference/cli/create-next-app#with-the-default-template)）

実装を小さくするために、`create-next-app`で生成されたプロジェクトに次のような修正を加えた状態です。

- 開発に使用するDocker Composeの定義ファイルを追加
- HelloWorldを表示するだけの簡易なページに変更
- 不要ファイルの削除
- バリデーション用の共通部品を追加

ディレクトリ構造は、次のようになっています。

```
frontend
├── .gitignore
├── next.config.ts
├── package-lock.json
├── package.json
├── tsconfig.json
├── docker
│   ├── docker-compose.api-gen.yml
│   └── docker-compose.api-mock.yml
└── src
    ├── app
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    └── validation
        ├── index.ts
        ├── Validation.tsx
        └── field
            ├── FieldConstraint.ts
            ├── NumberFieldConstraint.ts
            ├── StringArrayFieldConstraint.ts
            └── StringFieldConstraint.ts
```

#### `.gitignore`

Gitで管理対象外とするファイルを定義するためのファイルです。

`create-next-app`でアプリ作成時に生成されたものを使用しています。

#### `next.config.ts`

Next.jsの設定ファイルです。

`create-next-app`でアプリ作成時に生成されたものにReactのStrictModeを明示的に適用しています。

StrictModeとは、出力されるページのコンテンツには影響を与えることなく、開発時に有用となる警告等を表示してくれる機能です。（参考：[next.config.js Options: reactStrictMode | Next.js](https://nextjs.org/docs/pages/api-reference/config/next-config-js/reactStrictMode)）

#### `package-lock.json`

プロジェクトの依存関係を正確に記録し、ビルドを再現可能に保証するためのファイルです。

`create-next-app`でアプリ作成時に生成されたものを使用しています。

#### `package.json`

フロントエンドアプリのプロジェクト定義ファイルです。

`create-next-app`でアプリ作成時に生成されたものを使用しています。

#### `tsconfig.json`

TypeScript用のプロジェクト定義ファイルです。

`create-next-app`でアプリ作成時に生成されたものを使用しています。

#### `docker/docker-compose.api-gen.yml`

OpenAPI定義ファイルからクライアント実装を生成するための、Docker Composeの定義ファイルです。

#### `docker/docker-compose.api-mock.yml`

OpenAPI定義ファイルからモックサーバを起動するための、Docker Composeの定義ファイルです。

#### `src/app/favicon.ico`

ファビコン用のアイコンです。

`create-next-app`でアプリ作成時に生成されたものを使用しています。

#### `src/app/globals.css`

アプリケーション全体にスタイルを適用するためのCSSファイルです。  
（参考：[Getting Started: Global CSS | Next.js](https://nextjs.org/docs/app/getting-started/css#global-css)）

`create-next-app`でアプリ作成時に生成されたものですが、生成時のコードは使用しないため、削除して空のファイルにしています。

#### `src/app/layout.tsx`

複数のページで共有されるUIです。

`create-next-app`でアプリ作成時に生成されたものから、今回作成するToDoアプリに必要のない部分を削除し、ハンズオンの初期状態にしています。

この実装の中では、JSXと呼ばれるJavaScript構文の拡張を使用しています。JSXを使用することで、React要素をHTMLのマークアップに近しいイメージで記述することができます。  
（参考：[JSX でマークアップを記述する – React](https://ja.react.dev/learn/writing-markup-with-jsx)）

なお、TypeScriptファイルの拡張子は通常`ts`ですが、後述のJSXを使用する場合は`tsx`とする必要があります。（参考：[TypeScript - JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)）

#### `src/app/page.tsx`

インデックスページ（`/`）でレンダリングされるUIです。  
（参考：[Layouts and Pages | Next.js](https://nextjs.org/docs/app/getting-started/layouts-and-pages)）

`create-next-app`でアプリ作成時に生成されたものを、`<h1>Hello, world</h1>`というHTML要素を表すReact要素を返すように変更しています。

#### `src/validation`

入力値バリデーション用の共通部品を格納しているディレクトリです。

example-chatの`frontend/src/framework/validation`からコピーして追加しました。今回はこれを流用します。

## フロントエンドのアプリを起動する

`create-next-app`では、開発モードとしてアプリを起動することができます。  
（参考：[Run the development server | Next.js](https://nextjs.org/docs/app/getting-started/installation#run-the-development-server)）

まず、依存モジュールをインストールするため、`frontend`ディレクトリで次のコマンドを実行します。実行時にはいくつかの警告（`npm WARN 〜`）が出力されますが、ここでは無視してください。

```
$ npm install
```

続いて、アプリを起動するため次のコマンドを実行します。

```
$ npm run dev
```

起動が完了したら、ブラウザで[トップページ](http://localhost:3000/)を開き、次の画面が表示されていることを確認します。

![frontend-test](img/frontend-test.png)

起動中はコマンドが実行中のままになりますので、確認が完了したら、`Ctrl`+`C`で終了します。