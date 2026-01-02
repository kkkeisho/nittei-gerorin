# 日程げろりん

モダンでクリーンなGoogleカレンダー連携スケジュール管理アプリ

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

## 概要

日程げろりんは、Googleカレンダーと連携してスケジュールを簡単に選択・管理できるWebアプリケーションです。カレンダーから直接日程を選択し、フォーマットされたテキストとしてコピーできます。

### 主な機能

- **Googleカレンダー連携** - OAuth 2.0認証でGoogleカレンダーのイベントを取得
- **週間カレンダー表示** - 見やすい週間ビューでスケジュールを確認
- **日程選択** - カレンダー上でクリック・ドラッグして日程を選択
- **ワンクリックコピー** - 選択した日程をフォーマットしてクリップボードにコピー
- **レスポンシブデザイン** - デスクトップ・タブレット・モバイルに対応
- **モダンUI** - 白を基調としたクリーンでミニマルなデザイン

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI**: React Big Calendar, Custom CSS
- **認証**: Google Identity Services
- **API**: Google Calendar API v3
- **日付処理**: Moment.js

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/kkkeisho/nittei-gerorin.git
cd nittei-gerorin
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Google Cloud Consoleの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」に移動
4. OAuth 2.0クライアントIDを作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのJavaScript生成元: `http://localhost:3000`
   - 承認済みのリダイレクトURI: `http://localhost:3000`
5. Google Calendar APIを有効化
6. OAuth同意画面でテストユーザーを追加

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を追加:

```env
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)にアクセスしてアプリを確認できます。

## 使い方

1. **ログイン** - 右上の「ログイン」ボタンをクリックしてGoogleアカウントで認証
2. **日程選択** - カレンダー上で時間枠をクリックまたはドラッグして選択
3. **コピー** - 選択した日程を「📋 コピー」ボタンでクリップボードにコピー
4. **クリア** - 選択をリセットする場合は「🗑️ クリア」ボタンをクリック

### 出力フォーマット例

```
1月15日(月) 10:00-11:00, 14:00-15:00
1月16日(火) 13:00-14:30
```

## デプロイ

### Vercel (推奨)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kkkeisho/nittei-gerorin)

1. GitHubリポジトリをVercelにインポート
2. 環境変数（`NEXT_PUBLIC_API_KEY`、`NEXT_PUBLIC_CLIENT_ID`）を設定
3. デプロイ後、Google Cloud Consoleで本番URLを承認済みのURIに追加

## プロジェクト構成

```
nittei-gerorin/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── Banner.tsx      # バナーコンポーネント
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── page.tsx            # メインページ
│   │   └── layout.tsx          # レイアウト
│   └── images/
│       └── logo.png            # アプリロゴ
├── .env.local                  # 環境変数（Git管理外）
├── .env.local.example          # 環境変数のテンプレート
└── package.json
```

## ライセンス

MIT

## 作者

© 2026 日程げろりん - Calendar Schedule Manager
