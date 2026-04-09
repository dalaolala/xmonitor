# XMonitor 完全デプロイガイド

このドキュメントでは、XMonitorサーバー監視システムの完全なデプロイ手順を説明します。

---

## 目次

- [アーキテクチャ概要](#アーキテクチャ概要)
- [要件](#要件)
- [ドメイン計画](#ドメイン計画)
- [方法1：一括スクリプトデプロイ（推奨）](#方法1一括スクリプトデプロイ推奨)
- [方法2：Dockerデプロイ](#方法2dockerデプロイ)
- [方法3：手動デプロイ](#方法3手動デプロイ)
- [フロントエンド設定](#フロントエンド設定)
- [クライアントエージェント設定](#クライアントエージェント設定)
- [Telegram通知設定](#telegram通知設定)
- [よくある問題](#よくある問題)

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                         ユーザーブラウザ                          │
│                    https://monitor.com                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      フロントエンドサービス (Caddy)               │
│                   静的ファイル + リバースプロキシ                  │
│                                                                  │
│  monitor.com → 静的ファイルサービス                              │
│  api.monitor.com → バックエンド :3001 へのリバースプロキシ        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     モニターバックエンド (x_monitor)              │
│                       :3001 で待機                               │
│                                                                  │
│  - WebSocket (/ws) → リアルタイムデータ送信                      │
│  - HTTP API (/monitor) → クライアントデータ報告                  │
│  - HTTP API (/hook) → Telegram Webhook                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │クライアントA│   │クライアントB│   │クライアントC│
    │  香港    │    │  日本    │    │  米国    │
    └──────────┘    └──────────┘    └──────────┘
```

---

## 要件

### モニターサーバー

- OS: Ubuntu 20.04+ / Debian 10+ / CentOS 7+
- アーキテクチャ: x86_64 (amd64) または aarch64 (arm64)
- メモリ: 512MB以上
- ディスク: 1GB以上
- ネットワーク: ポート80、443が開いている（HTTPS）

### クライアントサーバー

- OS: Ubuntu / Debian / CentOS / Alpine
- アーキテクチャ: x86_64 (amd64) または aarch64 (arm64)
- メモリ: 128MB以上

---

## ドメイン計画

デプロイ前にドメインを計画してください：

| 用途 | ドメイン例 | 説明 |
|------|-----------|------|
| フロントエンド | `https://monitor.example.com` | ユーザーダッシュボード |
| バックエンドAPI | `https://api.monitor.example.com` | バックエンドサービス |
| WebSocket | `wss://api.monitor.example.com/ws` | リアルタイム接続 |

### DNS設定

ドメインプロバイダーで2つのAレコードを追加：

```
monitor.example.com     A     サーバーIP
api.monitor.example.com A     サーバーIP
```

---

## 方法1：一括スクリプトデプロイ（推奨）

### 1. モニターバックエンドのインストール

モニターサーバーで実行：

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

「モニターバックエンドをインストール」を選択し、以下を入力：

1. **auth_secret**: 認証キー（強力なパスワードを使用）
2. **listen port**: バックエンドポート、デフォルト `3001`
3. **hook_token**: Hook認証トークン（Telegramコールバック用）

### 2. フロントエンドのインストール

スクリプトを続行、「モニターフロントエンドをインストール」を選択：

1. **フロントエンドドメイン**: 例 `monitor.example.com`
2. **バックエンドドメイン**: 例 `api.monitor.example.com`
3. **バックエンドポート**: 例 `3001`

スクリプトは自動的に：
- Caddyサーバーをインストール
- HTTPS自動証明書を設定
- フロントエンド設定を生成
- リバースプロキシを設定

### 3. クライアントエージェントのインストール

監視対象の各サーバーで実行：

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

**パラメータ**：

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| auth_secret | 認証キー（モニターと同じ） | `your_secret_key` |
| url | モニターWebSocketアドレス | `wss://api.monitor.example.com/monitor` |
| name | ホスト名（最初の2文字=地域） | `HK-Server01` |

**例**：

```bash
# 香港サーバー
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor HK-Server01

# 日本サーバー
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor JP-Tokyo01

# 米国サーバー
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor US-LA01
```

> **注意**：ホスト名の最初の2文字は地域識別子として使用されます。

---

## 方法2：Dockerデプロイ

### 1. イメージのビルド

```bash
git clone https://github.com/dalaolala/xmonitor
cd xmonitor/backend

docker build --target server --tag xmonitor_server .
docker build --target fe --tag xmonitor_fe .
docker build --target client --tag xmonitor_client .
```

### 2. モニターバックエンドのデプロイ

```bash
mkdir -p /opt/xmonitor
touch /opt/xmonitor/x_monitor.db

cat > /opt/xmonitor/server-compose.yml << 'EOF'
services:
  x_monitor_server:
    image: xmonitor_server
    container_name: x_monitor_server
    hostname: x_monitor_server
    restart: always
    ports:
      - 3001:3001
    volumes:
      - /opt/xmonitor/x_monitor.db:/app/x_monitor.db
    environment:
      TZ: "Asia/Shanghai"
      AUTH_SECRET: "your_auth_secret_here"
      LISTEN: ":3001"
      ENABLE_TG: false
      TG_TOKEN: "your_telegram_bot_token"
      HOOK_URI: "/hook"
      UPDATE_URI: "/monitor"
      WEB_URI: "/ws"
      HOOK_TOKEN: "your_hook_token"
      TG_CHAT_ID: 0
EOF

docker compose -f /opt/xmonitor/server-compose.yml up -d
```

### 3. フロントエンドのデプロイ

```bash
cat > /opt/xmonitor/fe-compose.yml << 'EOF'
services:
  x_monitor_fe:
    image: xmonitor_fe
    container_name: x_monitor_fe
    hostname: x_monitor_fe
    restart: always
    ports:
      - 80:80
    environment:
      TZ: "Asia/Shanghai"
      SOCKET: "wss://api.monitor.example.com/ws"
      APIURL: "https://api.monitor.example.com"
EOF

docker compose -f /opt/xmonitor/fe-compose.yml up -d
```

### 4. クライアントエージェントのデプロイ

> **重要**：
> - 正確なトラフィック統計には `host` ネットワークモードが必要
> - 正確なシステム情報には `/var/run/docker.sock` のマウントが必要

```bash
cat > /opt/xmonitor/client-compose.yml << 'EOF'
services:
  x_monitor_client:
    image: xmonitor_client
    container_name: x_monitor_client
    hostname: x_monitor_client
    restart: always
    network_mode: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      TZ: "Asia/Shanghai"
      AUTH_SECRET: "your_auth_secret_here"
      URL: "wss://api.monitor.example.com/monitor"
      NET_NAME: "eth0"
      NAME: "HK-Docker01"
EOF

docker compose -f /opt/xmonitor/client-compose.yml up -d
```

---

## 方法3：手動デプロイ

### 1. バイナリのダウンロード

```bash
mkdir -p /etc/x_monitor
cd /etc/x_monitor

# amd64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-amd64
# arm64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-arm64

chmod +x x_monitor
```

### 2. 設定ファイルの作成

```bash
cat > /etc/x_monitor/config.json << 'EOF'
{
  "auth_secret": "your_auth_secret_here",
  "listen": ":3001",
  "enable_tg": false,
  "tg_token": "your_telegram_bot_token",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "your_hook_token",
  "tg_chat_id": 0
}
EOF
```

### 3. Systemdサービスの作成

```bash
cat > /etc/systemd/system/x_monitor.service << 'EOF'
[Unit]
Description=X Monitor Service
After=network.target nss-lookup.target
Wants=network.target

[Service]
User=root
Group=root
Type=simple
LimitAS=infinity
LimitRSS=infinity
LimitCORE=infinity
LimitNOFILE=999999999
WorkingDirectory=/etc/x_monitor/
ExecStart=/etc/x_monitor/x_monitor
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable x_monitor
systemctl start x_monitor
```

### 4. リバースプロキシの設定（Caddy）

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/setup.deb.sh' | sudo bash
sudo apt install caddy

cat > /etc/caddy/Caddyfile << 'EOF'
monitor.example.com {
    root * /etc/x_monitor/frontend
    file_server
    encode gzip
    try_files {path} /index.html
}

api.monitor.example.com {
    reverse_proxy localhost:3001
    header Access-Control-Allow-Origin "*"
}
EOF

systemctl restart caddy
systemctl enable caddy
```

---

## フロントエンド設定

フロントエンド設定ファイル：`/etc/x_monitor/frontend/config.json`

### 設定形式

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

### フィールド説明

| フィールド | 型 | 説明 | 例 |
|-----------|----|----- |-----|
| socket | string | WebSocketアドレス | `wss://api.monitor.example.com/ws` |
| apiURL | string | バックエンドAPIアドレス | `https://api.monitor.example.com` |

### 重要な注意点

1. **WebSocketアドレス**：
   - 形式：`wss://<バックエンドドメイン>/<web_uri>`
   - `web_uri` デフォルトは `/ws`
   - `wss://`（暗号化）を使用、`ws://` は不可

2. **APIアドレス**：
   - 形式：`https://<バックエンドドメイン>`
   - パスサフィックス不要

3. **変更後**：
   - ブラウザを更新して変更を適用

---

## クライアントエージェント設定

クライアント設定ファイル：`/etc/x_monitor/client.json`

### 設定形式

```json
{
  "auth_secret": "your_auth_secret_here",
  "url": "wss://api.monitor.example.com/monitor",
  "net_name": "eth0",
  "name": "HK-Server01"
}
```

### フィールド説明

| フィールド | 型 | 説明 | 例 |
|-----------|----|----- |-----|
| auth_secret | string | 認証キー（モニターと一致） | `mySecretKey123` |
| url | string | モニター報告アドレス | `wss://api.monitor.example.com/monitor` |
| net_name | string | ネットワークインターフェース名 | `eth0` |
| name | string | ホスト名 | `HK-Server01` |

### 重要な注意点

1. **認証キー**：
   - モニターの `auth_secret` と完全に一致させる必要
   - 不一致は接続失敗の原因

2. **報告アドレス**：
   - 形式：`wss://<バックエンドドメイン>/<update_uri>`
   - `update_uri` デフォルトは `/monitor`
   - 注意：`/ws` ではなく `/monitor`

3. **ネットワークインターフェース**：
   - 確認方法：`ip link` または `ifconfig`
   - 一般的な名前：`eth0`、`ens3`、`ens18`、`enp0s3`

4. **ホスト名**：
   - 最初の2文字 = 地域識別子
   - 形式：`地域-ホスト名`
   - 例：`HK`、`JP`、`US`、`SG`

---

## Telegram通知設定

### 1. Telegram Botの作成

1. Telegramで `@BotFather` を検索
2. `/newbot` を送信してBotを作成
3. Bot Tokenを取得（形式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. Chat IDの取得

1. Telegramで `@userinfobot` を検索
2. メッセージを送信してChat IDを取得

### 3. モニターの設定

`/etc/x_monitor/config.json` を編集：

```json
{
  "auth_secret": "your_auth_secret",
  "listen": ":3001",
  "enable_tg": true,
  "tg_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "your_hook_token",
  "tg_chat_id": 123456789
}
```

### 4. サービスの再起動

```bash
systemctl restart x_monitor
```

### Telegram Botコマンド

| コマンド | 説明 |
|---------|------|
| `/akall` | 全サーバーのステータス概要 |
| `/status <name>` | 特定サーバーのステータス |
| `/server <name>` | 特定サーバーの詳細 |

---

## サービス管理

### モニターサービス

```bash
systemctl start x_monitor    # 起動
systemctl stop x_monitor     # 停止
systemctl restart x_monitor  # 再起動
systemctl status x_monitor   # ステータス
journalctl -u x_monitor -f   # ログ
```

### クライアントサービス

```bash
systemctl start x_client     # 起動
systemctl stop x_client      # 停止
systemctl restart x_client   # 再起動
systemctl status x_client    # ステータス
journalctl -u x_client -f    # ログ
```

### Caddy（フロントエンド）

```bash
systemctl start caddy        # 起動
systemctl stop caddy         # 停止
systemctl restart caddy      # 再起動
systemctl status caddy       # ステータス
```

---

## 更新

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

---

## よくある問題

### 1. フロントエンドがバックエンドに接続できない

**確認**：
1. フロントエンド設定 `/etc/x_monitor/frontend/config.json`
2. WebSocketアドレス（`wss://` であるべき）
3. バックエンドサービス：`systemctl status x_monitor`
4. Caddyリバースプロキシ設定

### 2. クライアントがモニターに接続できない

**確認**：
1. `auth_secret` がモニターと一致
2. 報告アドレスが `/monitor` パス
3. ネットワーク接続：`curl -v https://api.monitor.example.com/monitor`
4. クライアントログ：`journalctl -u x_client -f`

### 3. ネットワークトラフィックが0を表示

**原因**：ネットワークインターフェース名が間違っている

**解決**：
1. インターフェース確認：`ip link`
2. `/etc/x_monitor/client.json` を編集
3. 再起動：`systemctl restart x_client`

### 4. HTTPS証明書の問題

Caddyログを確認：`journalctl -u caddy -f`

**一般的な原因**：
- DNSが解決されていない
- ポート80/443がブロックされている
- ファイアウォールがブロックしている

---

## 設定ファイルパス

| ファイル | パス | 説明 |
|---------|------|------|
| モニター設定 | `/etc/x_monitor/config.json` | バックエンド設定 |
| モニターDB | `/etc/x_monitor/x_monitor.db` | SQLiteデータベース |
| クライアント設定 | `/etc/x_monitor/client.json` | クライアント設定 |
| フロントエンド設定 | `/etc/x_monitor/frontend/config.json` | フロントエンドAPI設定 |
| Caddy設定 | `/etc/caddy/Caddyfile` | リバースプロキシ設定 |
| モニターサービス | `/etc/systemd/system/x_monitor.service` | Systemdサービス |
| クライアントサービス | `/etc/systemd/system/x_client.service` | Systemdサービス |

---

## セキュリティ推奨

1. **auth_secret**: 強力なパスワード、16文字以上のランダム文字
2. **hook_token**: 異なるランダム文字列を使用
3. **HTTPS**: 全接続でHTTPSを使用
4. **ファイアウォール**: 必要なポートのみ開放（80、443）
5. **定期更新**: 最新版に更新

---

## サポート

- GitHub: https://github.com/dalaolala/xmonitor
- Issues: https://github.com/dalaolala/xmonitor/issues