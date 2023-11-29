# 開発環境の準備

ToDoアプリの開発で使用するツールをインストールします。

## Node.jsのインストール

フロントエンドの開発ではCreate React AppやTypeScriptを使用するため、Node.jsをインストールします。Node.jsのバージョンには `20` を使用します。

[公式サイト](https://nodejs.org/)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## JDKのインストール

バックエンドの開発ではJavaを使用するため、JDKをインストールします。Javaのバージョンには `11` を使用します。

JDKはいくつかありますが、ここでは、OpenJDKの1つであるAdoptOpenJDKをインストールします。
[公式サイト](https://adoptopenjdk.net/)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## Mavenのインストール

バックエンドの開発では構成管理にMavenを利用するため、Mavenをインストールします。Mavenのバージョンには `3.6` を使用します。

[公式サイト](https://maven.apache.org/download.cgi)の案内に沿って、ダウンロードおよび配置してください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## Visual Studio Codeのインストール

開発時に使用するエディタをインストールします。

エディタは使い慣れたものなら何でもよいですが、何もインストールしていなければ、今回のハンズオンで使用するコードに対応できるVisual Studio Codeをインストールします。[公式サイト](https://azure.microsoft.com/ja-jp/products/visual-studio-code/)の案内に沿って、インストールしてください。

エディタが既に整っている場合は、この手順をスキップしてください。

## Docker(Docker Compose)のインストール

開発時にコンテナを使用するため、DockerとDocker Composeをインストールします。

WindowsでのDocker利用方法はいくつかありますがは、ここではDocker Desktop for Windowsをインストールします。[公式サイト](https://docs.docker.com/docker-for-windows/install/)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

{% hint style='danger' %}
本ハンズオンでは、Dockerコンテナ起動時にローカルディレクトリをマウントします。Docker Desktop for WindowsやDocker Desktop for Macでローカルディレクトリをマウントするためには事前にファイル共有を許可しておく必要があります。Docker Desktopの`Settings`→`Resources`→`FILE SHARING`から、本ハンズオンのプロジェクトを配置するドライブやディレクトリを共有可能に設定しておいてください。（参考：[Docker Desktop for Windows user manual](https://docs.docker.com/docker-for-windows/)、[Docker Desktop for Mac user manual](https://docs.docker.com/docker-for-mac/)）
{% endhint %}

## Gitのインストール（オプション）

ハンズオン資料のダウンロードでGitを利用することもできるため、Gitをインストールします。ただし、他の手段でもダウンロードが出来るため、インストールは必須ではなく任意となります。

ここでは、Windows用にGitを使うための git fow windows をインストールします。[公式サイト](https://gitforwindows.org/)の案内に沿って、インストールしてください。