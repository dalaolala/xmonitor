# X Monitor

[简体中文](README_CN.md) | [English](../README.md) | 日本語 | [한국어](README_KO.md)

![X Monitor プレビュー](https://img.imgdd.com/67e21861-9a53-43ff-a0e0-246ecbb40770.png)

軽量で高性能なサーバー監視システム。複数サーバーの一元管理、リアルタイムステータス監視、Telegram Bot通知をサポート。

## 機能

- **マルチサーバー監視** - 複数のサーバーを同時に監視、地域別に分類表示
- **リアルタイムデータ** - CPU、メモリ、ネットワーク、負荷を毎秒更新
- **ビジュアルチャート** - Highchartsによるリアルタイムパフォーマンス推移グラフ
- **Telegram通知** - サーバーのオンライン/オフライン状態を自動通知
- **リモートクエリ** - Telegramコマンド `/akall`、`/status` でサーバー状態を照会
- **ホスト管理** - 有効期限、プロバイダー、価格、購入リンクを記録
- **多言語対応** - 中国語、英語、日本語、韓国語、ドイツ語の5言語対応
- **テーマ切替** - ライト/ダークテーマ対応

## クイックインストール

### ワンクリック管理スクリプト

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

機能：
- モニターフロントエンドのインストール
- モニターバックエンドのインストール
- モニターバックエンドのアンインストール
- モニター設定の表示
- クライアントエージェントのインストール
- クライアントエージェントのアンインストール
- クライアント設定の表示

### モニターバックエンドのインストール

```bash
wget -O setup-monitor.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor.sh" && chmod +x setup-monitor.sh && sudo ./setup-monitor.sh
```

### クライアントエージェントのインストール

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

例：
```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh 123321 wss://api.example.com/ws HK-XMonitor
```

### Alpine Linux クライアントエージェントのインストール

```bash
wget -O alpine-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/alpine-client.sh" && chmod +x alpine-client.sh && sudo ./alpine-client.sh <auth_secret> <url> <name>
```

### モニターフロントエンドのインストール

```bash
wget -O setup-monitor-fe.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor-fe.sh" && chmod +x setup-monitor-fe.sh && sudo ./setup-monitor-fe.sh
```

### アップデートスクリプト

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

アップデート対象：
- モニターフロントエンド
- モニターバックエンド
- クライアントエージェント

## 技術スタック

### バックエンド
- **Go** - プログラミング言語
- **Hertz** - ByteDance製高性能HTTPフレームワーク
- **GORM** - ORMフレームワーク
- **SQLite** - 軽量データベース
- **WebSocket** - リアルタイムデータ転送
- **Telegram Bot API** - メッセージ通知

### フロントエンド
- **Vue 3** - プログレッシブJavaScriptフレームワーク
- **Vite 6** - 次世代フロントエンドビルドツール
- **Arco Design Vue** - ByteDance製UIコンポーネントライブラリ
- **Highcharts** - インタラクティブチャートライブラリ
- **vue-i18n** - 国際化サポート

## 設定

### モニター設定 (`/etc/x_monitor/config.json`)

| フィールド | 説明 |
|------------|------|
| `auth_secret` | 認証シークレット |
| `listen` | サービスリッスンアドレス（例：`:3000`） |
| `enable_tg` | Telegram通知の有効化 |
| `tg_token` | Telegram Bot Token |
| `tg_chat_id` | Telegram Chat ID |
| `hook_uri` | Hookパス |
| `update_uri` | クライアント報告パス |
| `web_uri` | WebSocketパス |
| `hook_token` | Hook認証トークン |

### クライアント設定 (`/etc/x_monitor/client.json`)

| フィールド | 説明 |
|------------|------|
| `auth_secret` | 認証シークレット（モニターと一致させる必要あり） |
| `url` | モニターWebSocketアドレス |
| `net_name` | 監視するネットワークインターフェース名 |
| `name` | ホスト名 |

## サービス管理

### モニターサービス

```bash
systemctl start x_monitor    # 起動
systemctl stop x_monitor     # 停止
systemctl restart x_monitor  # 再起動
systemctl status x_monitor   # ステータス確認
```

### クライアントサービス

```bash
systemctl start x_client     # 起動
systemctl stop x_client      # 停止
systemctl restart x_client   # 再起動
systemctl status x_client    # ステータス確認
```

## Telegram Bot コマンド

| コマンド | 説明 |
|----------|------|
| `/akall` | 全サーバーのステータス概要を表示 |
| `/status <name>` | 指定サーバーのステータスを照会 |
| `/server <name>` | 指定サーバーの詳細を照会 |

## サポートアーキテクチャ

| アーキテクチャ | モニター | クライアント |
|----------------|----------|--------------|
| linux/amd64 | `x_monitor-linux-amd64` | `x_client-linux-amd64` |
| linux/arm64 | `x_monitor-linux-arm64` | `x_client-linux-arm64` |
| darwin/amd64 | `x_monitor-darwin-amd64` | `x_client-darwin-amd64` |

## 監視メトリクス

| メトリクス | 説明 |
|------------|------|
| CPU使用率 | リアルタイムCPU使用率 |
| メモリ使用量 | 使用メモリ / 総メモリ |
| Swap使用量 | Swapメモリ使用状況 |
| ネットワークトラフィック | 受信/送信トラフィック統計 |
| ネットワーク速度 | リアルタイムアップロード/ダウンロード速度 |
| システム負荷 | Load1 / Load5 / Load15 |
| 稼働時間 | システム稼働時間 |

## ローカル開発

[ローカルデバッグガイド](local-debug-guide.md)を参照

## ライセンス

[MIT License](LICENSE)

## 謝辞

本プロジェクトは [akile_monitor](https://github.com/akile-network/akile_monitor) を参考にしています。原作者に感謝いたします。

## 作者

X Monitor Team