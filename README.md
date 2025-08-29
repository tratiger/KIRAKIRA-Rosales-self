![カバー](℩ɘvoↄ.svg)

# KIRAKIRA-Rosales
KIRAKIRA-Rosalesは、KoaフレームワークをベースにしたRESTfulなバックエンドAPIです。

APIリファレンスについては、[ルーティング](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/blob/develop/src/route/router.ts)を参照してください。
もっと知りたいですか？[Wikiを読む](https://deepwiki.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales)！

## 貢献
貢献したいですか？[開発ドキュメント](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/tree/develop/docs)を参照してください。

問題が発生しましたか？[こちら](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/issues)で解決策を探すか、Issueを作成してください。

## 開発
KIRAKIRA-Rosalesは、ローカルで実行できる開発サーバーを提供します。
デフォルトでは、以下の手順で開発サーバーが起動し、ポート9999をリッスンします。

### インストール
このリポジトリをクローンするには、次のコマンドまたは他のGit互換ツールを使用できます。
```
git clone https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales.git
```

クローンが完了したら、プログラムのルートディレクトリで次のコマンドを実行して、依存関係パッケージをインストールします。

```bash
npm install
```

### 環境変数の設定
> [!IMPORTANT]
> 以下のサンプルコードには、すべての環境変数が含まれているわけではありません。
> OSによって環境変数の設定方法が異なります。
> すべての環境変数とその役割については、[.env.powershell.temp](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/blob/develop/.env.powershell.temp)を参照してください。このファイルに記載されているほとんどの環境変数は必須です。

`Windows`をお使いの場合
```powershell
# 以下はWindows PowerShellの例です
$env:SERVER_PORT="9999"
$env:SERVER_ENV="dev"
$env:SERVER_ROOT_URL="kirakira.moe"
...
```

`Linux`をお使いの場合
```bash
# 以下はLinux Shellの例です
export SERVER_PORT="9999"
export SERVER_ENV="dev"
export SERVER_ROOT_URL="kirakira.moe"
...
```

環境変数の設定で問題が発生した場合は、[Issue](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/issues)または[ディスカッション](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/discussions)で回答を探すか、質問してください。

### バックエンドサービスの起動
> [!IMPORTANT]
> 開発モードでサービスを起動すると、コードはプロジェクトのルートディレクトリにある`.kirakira`ディレクトリにパッケージ化されます。
> 必要に応じて、package.jsonでパッケージ化パスを変更できます。[開発ドキュメント](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/tree/develop/docs)を参照してください。

#### ローカルバックエンド開発サーバーの起動
プログラムのルートディレクトリで次のコマンドを実行して起動できます。

```bash
npm run dev
```

または、キーボードの<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>を押し、`npm: dev`を選択します。

#### ローカルバックエンド開発ホットリロードサーバーの起動
プログラムのルートディレクトリで次のコマンドを実行して起動できます。

```bash
npm run dev-hot
```

または、キーボードの<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>を押し、`npm: dev`を選択します。

上記のコマンドを正常に実行すると、ポート9999をリッスンするKIRAKIRA-Rosales開発サーバーが取得できるはずです。🎉
これに基づいて、コードのレビュー、作成、貢献を行い、KIRAKIRAプロジェクトの開発に参加できます。

開発方法は？[開発ドキュメント](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/tree/develop/docs)を参照してください。

問題が発生しましたか？[こちら](https://github.com/KIKIRAKIRA-DOUGA/KIRAKIRA-Rosales/issues)で解決策を探すか、Issueを作成してください。

## ビルド / セルフホスティング
KIRAKIRA-Rosalesをビルドし、Node.jsがインストールされている任意のAMD64またはARM64インスタンスで実行できます。
DockerまたはDocker互換ツールを使用して、コンテナイメージとしてパッケージ化することもできます。

### ビルド

#### 環境変数の設定
設定方法は上記の開発モードと同じです。[環境変数の設定](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/tree/develop?tab=readme-ov-file#%E5%BC%80%E5%8F%91)を参照してください。

#### アプリケーションのビルド
> [!IMPORTANT]
> この操作を実行するには、すべての依存関係がインストールされていることを前提としています。
> デフォルトでは、コードはプロジェクトのルートディレクトリにある`dist`ディレクトリにパッケージ化されます。
> 必要に応じて、tsconfig.jsonでパッケージ化パスを変更できます。それに応じて、以下の3番目の手順でサーバーを起動するコマンドのパスも変更する必要があります。

キーボードの<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>を押し、`npm: build`を選択します。

```bash
npm run build
```

### コンテナイメージとしてのパッケージ化（ベストプラクティス）
KIRAKIRA-Rosalesをデプロイするためのベストプラクティスは、K8sクラスターで実行することです。現在使用しているKIRAKIRA-Rosalesサービスも同様です。
コンテナにデプロイする方法については、[開発ドキュメント](https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales/tree/develop/docs)を参照してください。

## ライセンス
BSD-3-Clause license
