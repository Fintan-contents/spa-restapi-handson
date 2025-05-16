# 開発環境の準備

ToDoアプリの開発で使用するツールをインストールします。

## Node.jsのインストール

フロントエンドの開発では`create-next-app`やTypeScriptを使用するため、Node.jsをインストールします。Node.jsのバージョンには `22` を使用します。

[公式サイト](https://nodejs.org/ja/download)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## JDKのインストール

バックエンドの開発ではJavaを使用するため、JDKをインストールします。Javaのバージョンには `11` を使用します。

JDKはいくつかありますが、ここでは、OpenJDKの1つであるEclipse Temurinをインストールします。
[公式サイト](https://adoptium.net/temurin/releases/?version=11)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## Mavenのインストール

バックエンドの開発では構成管理にMavenを利用するため、Mavenをインストールします。Mavenのバージョンには `3.6` を使用します。

[こちら](https://archive.apache.org/dist/maven/maven-3/3.6.3/binaries/)からダウンロードおよび配置してください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

## Visual Studio Codeのインストール

開発時に使用するエディタをインストールします。

エディタは使い慣れたものなら何でもよいですが、何もインストールしていなければ、今回のハンズオンで使用するコードに対応できるVisual Studio Codeをインストールします。[公式サイト](https://azure.microsoft.com/ja-jp/products/visual-studio-code/)の案内に沿って、インストールしてください。

エディタが既に整っている場合は、この手順をスキップしてください。

{% hint style='tip' %}
[Eclipse](https://www.eclipse.org/)や[IntelliJ IDEA](https://www.jetbrains.com/idea/)などのIDE（統合開発環境）も利用可能です。それ以外にもいくつかのエディタやIDEがありますので、お好みに合わせてご利用ください。
{% endhint %}

## Docker（Docker Compose）のインストール

開発時にコンテナを使用するため、DockerとDocker Composeをインストールします。

WindowsでのDocker利用方法はいくつかありますが、ここではDocker Desktop for Windowsをインストールします。[公式サイト](https://docs.docker.com/docker-for-windows/install/)の案内に沿って、インストールしてください。

使用する環境が既に整っている場合は、この手順をスキップしてください。

{% hint style='danger' %}
本ハンズオンでは、Dockerコンテナ起動時にローカルディレクトリをマウントします。Docker Desktop for WindowsやDocker Desktop for Macでローカルディレクトリをマウントするためには事前にファイル共有を許可しておく必要があります。Docker Desktopの`Settings`→`Resources`→`FILE SHARING`から、本ハンズオンのプロジェクトを配置するドライブやディレクトリを共有可能に設定しておいてください。（参考：[File Sharing | Docker Docs](https://docs.docker.com/desktop/settings-and-maintenance/settings/#file-sharing)）
{% endhint %}

## Gitのインストール（オプション）

ハンズオン資料のダウンロードでGitを利用することもできるため、Gitをインストールします。ただし、他の手段でもダウンロードが出来るため、インストールは必須ではなく任意となります。

ここでは、Windows用にGitを使うための git for windows をインストールします。[公式サイト](https://gitforwindows.org/)の案内に沿って、インストールしてください。