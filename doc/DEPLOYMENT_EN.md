# XMonitor Complete Deployment Guide

This document provides detailed instructions for deploying the XMonitor server monitoring system.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Requirements](#requirements)
- [Domain Planning](#domain-planning)
- [Method 1: One-Click Script Deployment (Recommended)](#method-1-one-click-script-deployment-recommended)
- [Method 2: Docker Deployment](#method-2-docker-deployment)
- [Method 3: Manual Deployment](#method-3-manual-deployment)
- [Frontend Configuration](#frontend-configuration)
- [Client Agent Configuration](#client-agent-configuration)
- [Telegram Notification Setup](#telegram-notification-setup)
- [Common Issues](#common-issues)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                    https://monitor.com                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Service (Caddy)                    │
│                   Static Files + Reverse Proxy                   │
│                                                                  │
│  monitor.com → Static file service                              │
│  api.monitor.com → Reverse proxy to backend :3001               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Monitor Backend (x_monitor)                  │
│                       Listening on :3001                         │
│                                                                  │
│  - WebSocket (/ws) → Real-time data push                        │
│  - HTTP API (/monitor) → Client data reporting                  │
│  - HTTP API (/hook) → Telegram Webhook                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Client A │    │ Client B │    │ Client C │
    │ Hong Kong│    │  Japan   │    │   USA    │
    └──────────┘    └──────────┘    └──────────┘
```

---

## Requirements

### Monitor Server

- OS: Ubuntu 20.04+ / Debian 10+ / CentOS 7+
- Architecture: x86_64 (amd64) or aarch64 (arm64)
- Memory: 512MB+
- Disk: 1GB+
- Network: Port 80, 443 open (HTTPS)

### Client Server

- OS: Ubuntu / Debian / CentOS / Alpine
- Architecture: x86_64 (amd64) or aarch64 (arm64)
- Memory: 128MB+

---

## Domain Planning

Before deployment, plan your domains:

| Purpose | Domain Example | Description |
|---------|---------------|-------------|
| Frontend | `https://monitor.example.com` | User dashboard |
| Backend API | `https://api.monitor.example.com` | Backend service |
| WebSocket | `wss://api.monitor.example.com/ws` | Real-time connection |

### DNS Configuration

Add two A records at your domain provider:

```
monitor.example.com     A     Your Server IP
api.monitor.example.com A     Your Server IP
```

---

## Method 1: One-Click Script Deployment (Recommended)

### 1. Install Monitor Backend

Run on your monitor server:

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

Select "Install Monitor Backend" and enter:

1. **auth_secret**: Authentication key (use a strong password)
2. **listen port**: Backend port, default `3001`
3. **hook_token**: Hook authentication token (for Telegram callback)

### 2. Install Frontend

Continue with the script, select "Install Monitor Frontend":

1. **Frontend domain**: e.g., `monitor.example.com`
2. **Backend domain**: e.g., `api.monitor.example.com`
3. **Backend port**: e.g., `3001`

The script will:
- Install Caddy server
- Configure HTTPS auto-certificates
- Generate frontend config
- Set up reverse proxy

### 3. Install Client Agent

On each server to be monitored:

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

**Parameters**:

| Parameter | Description | Example |
|-----------|-------------|---------|
| auth_secret | Auth key (same as monitor) | `your_secret_key` |
| url | Monitor WebSocket address | `wss://api.monitor.example.com/monitor` |
| name | Host name (first 2 chars = region) | `HK-Server01` |

**Examples**:

```bash
# Hong Kong server
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor HK-Server01

# Japan server
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor JP-Tokyo01

# US server
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor US-LA01
```

> **Note**: First 2 characters of host name are used as region identifier for grouping.

---

## Method 2: Docker Deployment

### 1. Build Images

```bash
git clone https://github.com/dalaolala/xmonitor
cd xmonitor/backend

docker build --target server --tag xmonitor_server .
docker build --target fe --tag xmonitor_fe .
docker build --target client --tag xmonitor_client .
```

### 2. Deploy Monitor Backend

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

### 3. Deploy Frontend

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

### 4. Deploy Client Agent

> **Important**:
> - Must use `host` network mode for accurate traffic stats
> - Must mount `/var/run/docker.sock` for accurate system info

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

## Method 3: Manual Deployment

### 1. Download Binary

```bash
mkdir -p /etc/x_monitor
cd /etc/x_monitor

# amd64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-amd64
# arm64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-arm64

chmod +x x_monitor
```

### 2. Create Config

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

### 3. Create Systemd Service

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

### 4. Configure Reverse Proxy (Caddy)

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

## Frontend Configuration

Frontend config file: `/etc/x_monitor/frontend/config.json`

### Config Format

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

### Field Description

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| socket | string | WebSocket address | `wss://api.monitor.example.com/ws` |
| apiURL | string | Backend API address | `https://api.monitor.example.com` |

### Important Notes

1. **WebSocket Address**:
   - Format: `wss://<backend_domain>/<web_uri>`
   - `web_uri` defaults to `/ws`
   - Must use `wss://` (encrypted), not `ws://`

2. **API Address**:
   - Format: `https://<backend_domain>`
   - No path suffix needed

3. **After modifying**:
   - Refresh browser to apply changes

### Configuration Examples

**Same domain for frontend and backend**:

```json
{
  "socket": "wss://monitor.example.com/ws",
  "apiURL": "https://monitor.example.com"
}
```

**Separate domains**:

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

**Local development**:

```json
{
  "socket": "ws://localhost:3001/ws",
  "apiURL": "http://localhost:3001"
}
```

---

## Client Agent Configuration

Client config file: `/etc/x_monitor/client.json`

### Config Format

```json
{
  "auth_secret": "your_auth_secret_here",
  "url": "wss://api.monitor.example.com/monitor",
  "net_name": "eth0",
  "name": "HK-Server01"
}
```

### Field Description

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| auth_secret | string | Auth key (must match monitor) | `mySecretKey123` |
| url | string | Monitor report address | `wss://api.monitor.example.com/monitor` |
| net_name | string | Network interface name | `eth0` |
| name | string | Host name | `HK-Server01` |

### Important Notes

1. **Auth Secret**:
   - Must match monitor's `auth_secret` exactly
   - Mismatch will prevent connection

2. **Report Address**:
   - Format: `wss://<backend_domain>/<update_uri>`
   - `update_uri` defaults to `/monitor`
   - Note: It's `/monitor`, not `/ws`

3. **Network Interface**:
   - Check with: `ip link` or `ifconfig`
   - Common names: `eth0`, `ens3`, `ens18`, `enp0s3`

4. **Host Name**:
   - First 2 chars = region identifier
   - Format: `Region-Hostname`
   - Examples: `HK`, `JP`, `US`, `SG`

### How to Find Network Interface

```bash
ip link
ifconfig
cat /proc/net/dev | sort -k2 -n
```

---

## Telegram Notification Setup

### 1. Create Telegram Bot

1. Search `@BotFather` in Telegram
2. Send `/newbot` to create bot
3. Get Bot Token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Chat ID

1. Search `@userinfobot` in Telegram
2. Send any message to get your Chat ID

### 3. Configure Monitor

Edit `/etc/x_monitor/config.json`:

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

### 4. Restart Service

```bash
systemctl restart x_monitor
```

### Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/akall` | View all servers status summary |
| `/status <name>` | Query specific server status |
| `/server <name>` | Query specific server details |

---

## Service Management

### Monitor Service

```bash
systemctl start x_monitor    # Start
systemctl stop x_monitor     # Stop
systemctl restart x_monitor  # Restart
systemctl status x_monitor   # Status
journalctl -u x_monitor -f   # Logs
```

### Client Service

```bash
systemctl start x_client     # Start
systemctl stop x_client      # Stop
systemctl restart x_client   # Restart
systemctl status x_client    # Status
journalctl -u x_client -f    # Logs
```

### Caddy (Frontend)

```bash
systemctl start caddy        # Start
systemctl stop caddy         # Stop
systemctl restart caddy      # Restart
systemctl status caddy       # Status
```

---

## Update

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

---

## Common Issues

### 1. Frontend Cannot Connect to Backend

**Check**:
1. Frontend config `/etc/x_monitor/frontend/config.json`
2. WebSocket address (should be `wss://`)
3. Backend service: `systemctl status x_monitor`
4. Caddy reverse proxy config

### 2. Client Cannot Connect to Monitor

**Check**:
1. `auth_secret` matches monitor
2. Report address is `/monitor` path
3. Network connectivity: `curl -v https://api.monitor.example.com/monitor`
4. Client logs: `journalctl -u x_client -f`

### 3. Network Traffic Shows 0

**Cause**: Wrong network interface name

**Solution**:
1. Check interface: `ip link`
2. Edit `/etc/x_monitor/client.json`
3. Restart: `systemctl restart x_client`

### 4. HTTPS Certificate Issues

Check Caddy logs: `journalctl -u caddy -f`

**Common causes**:
- DNS not resolved
- Port 80/443 blocked
- Firewall blocking

---

## Config File Paths

| File | Path | Description |
|------|------|-------------|
| Monitor Config | `/etc/x_monitor/config.json` | Backend config |
| Monitor Database | `/etc/x_monitor/x_monitor.db` | SQLite database |
| Client Config | `/etc/x_monitor/client.json` | Client config |
| Frontend Config | `/etc/x_monitor/frontend/config.json` | Frontend API config |
| Caddy Config | `/etc/caddy/Caddyfile` | Reverse proxy config |
| Monitor Service | `/etc/systemd/system/x_monitor.service` | Systemd service |
| Client Service | `/etc/systemd/system/x_client.service` | Systemd service |

---

## Security Recommendations

1. **auth_secret**: Use strong password, 16+ random characters
2. **hook_token**: Use different random string
3. **HTTPS**: Ensure all connections use HTTPS
4. **Firewall**: Only open necessary ports (80, 443)
5. **Regular updates**: Keep up to date

---

## Support

- GitHub: https://github.com/dalaolala/xmonitor
- Issues: https://github.com/dalaolala/xmonitor/issues