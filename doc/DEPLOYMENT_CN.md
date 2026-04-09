# XMonitor 完整部署文档

本文档详细介绍了 XMonitor 服务器监控系统的完整部署流程。

---

## 目录

- [架构说明](#架构说明)
- [环境要求](#环境要求)
- [域名规划](#域名规划)
- [部署方式一：一键脚本部署](#部署方式一一键脚本部署)
- [部署方式二：Docker 部署](#部署方式二docker-部署)
- [部署方式三：手动部署](#部署方式三手动部署)
- [前端配置详解](#前端配置详解)
- [被控端配置详解](#被控端配置详解)
- [Telegram 通知配置](#telegram-通知配置)
- [常见问题](#常见问题)

---

## 架构说明

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                                │
│                    https://monitor.com                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前端服务 (Caddy)                            │
│                   静态文件 + 反向代理                              │
│                                                                  │
│  monitor.com → 静态文件服务                                       │
│  api.monitor.com → 反向代理到后端 :3001                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     主控后端 (x_monitor)                          │
│                       监听 :3001                                 │
│                                                                  │
│  - WebSocket (/ws) → 实时数据推送                                  │
│  - HTTP API (/monitor) → 被控端数据上报                           │
│  - HTTP API (/hook) → Telegram Webhook                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ 被控端 A │    │ 被控端 B │    │ 被控端 C │
    │  香港    │    │  日本    │    │  美国    │
    └──────────┘    └──────────┘    └──────────┘
```

---

## 环境要求

### 主控服务器

- 操作系统：Ubuntu 20.04+ / Debian 10+ / CentOS 7+
- 架构：x86_64 (amd64) 或 aarch64 (arm64)
- 内存：512MB+
- 磁盘：1GB+
- 网络：需要开放 80、443 端口（HTTPS）

### 被控服务器

- 操作系统：Ubuntu / Debian / CentOS / Alpine
- 架构：x86_64 (amd64) 或 aarch64 (arm64)
- 内存：128MB+

---

## 域名规划

在开始部署之前，请先规划好域名：

| 用途 | 域名示例 | 说明 |
|------|---------|------|
| 前端访问 | `https://monitor.example.com` | 用户访问的监控面板 |
| 后端 API | `https://api.monitor.example.com` | 后端服务地址 |
| WebSocket | `wss://api.monitor.example.com/ws` | 实时数据连接地址 |

### DNS 解析配置

在域名服务商处添加两条 A 记录：

```
monitor.example.com     A     你的服务器IP
api.monitor.example.com A     你的服务器IP
```

---

## 部署方式一：一键脚本部署（推荐）

### 1. 安装主控后端

在主控服务器上执行：

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

选择菜单中的「安装主控后端」，按提示输入：

1. **auth_secret**：认证密钥，用于前后端和被控端认证（请设置复杂密码）
2. **listen port**：后端监听端口，默认 `3001`
3. **hook_token**：Hook 认证令牌（用于 Telegram 回调）

### 2. 安装前端

继续使用一键脚本，选择「安装主控前端」，按提示输入：

1. **前端域名**：如 `monitor.example.com`
2. **后端域名**：如 `api.monitor.example.com`
3. **后端服务端口**：如 `3001`

脚本会自动：
- 安装 Caddy 服务器
- 配置 HTTPS 自动证书
- 生成前端配置文件
- 配置反向代理

### 3. 安装被控端

在每台需要监控的服务器上执行：

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

**参数说明**：

| 参数 | 说明 | 示例 |
|------|------|------|
| auth_secret | 认证密钥（与主控端一致） | `your_secret_key` |
| url | 主控端 WebSocket 地址 | `wss://api.monitor.example.com/monitor` |
| name | 主机名称（前两位为区域标识） | `HK-Server01` |

**示例**：

```bash
# 香港服务器
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor HK-Server01

# 日本服务器
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor JP-Tokyo01

# 美国服务器
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor US-LA01
```

> **注意**：主机名称的前两位会被识别为区域标识，用于前端区域分组显示。

---

## 部署方式二：Docker 部署

### 1. 构建镜像

```bash
git clone https://github.com/dalaolala/xmonitor
cd xmonitor/backend

# 构建三个镜像
docker build --target server --tag xmonitor_server .
docker build --target fe --tag xmonitor_fe .
docker build --target client --tag xmonitor_client .
```

### 2. 部署主控后端

创建数据库文件：

```bash
mkdir -p /opt/xmonitor
touch /opt/xmonitor/x_monitor.db
```

使用 Docker Compose 部署：

```bash
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

### 3. 部署前端

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

### 4. 部署被控端

> **重要提示**：
> - 必须使用 `host` 网络模式，否则流量统计不准确
> - 必须挂载 `/var/run/docker.sock`，否则系统信息不准确

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

## 部署方式三：手动部署

### 1. 下载二进制文件

```bash
# 创建目录
mkdir -p /etc/x_monitor
cd /etc/x_monitor

# 下载主控端（根据架构选择）
# amd64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-amd64
# arm64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-arm64

chmod +x x_monitor
```

### 2. 创建配置文件

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

### 3. 创建 Systemd 服务

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

### 4. 配置反向代理（Caddy）

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/setup.deb.sh' | sudo bash
sudo apt install caddy

# 配置 Caddyfile
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

## 前端配置详解

前端配置文件位于 `/etc/x_monitor/frontend/config.json`，用于指定后端 API 地址和 WebSocket 连接地址。

### 配置文件格式

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

### 配置项说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| socket | string | WebSocket 连接地址 | `wss://api.monitor.example.com/ws` |
| apiURL | string | 后端 API 地址 | `https://api.monitor.example.com` |

### 重要说明

1. **WebSocket 地址**：
   - 格式为 `wss://<后端域名>/<web_uri>`
   - `web_uri` 默认为 `/ws`，在主控端配置中设置
   - 必须使用 `wss://`（加密连接），不能使用 `ws://`

2. **API 地址**：
   - 用于前端调用后端 HTTP 接口
   - 格式为 `https://<后端域名>`
   - 不需要带路径后缀

3. **修改配置后**：
   - 配置文件修改后需要刷新浏览器才能生效
   - 如果使用 Caddy，无需重启服务

### 不同部署场景的配置示例

**场景一：前后端同域名部署**

```json
{
  "socket": "wss://monitor.example.com/ws",
  "apiURL": "https://monitor.example.com"
}
```

**场景二：前后端分离部署**

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

**场景三：本地开发调试**

```json
{
  "socket": "ws://localhost:3001/ws",
  "apiURL": "http://localhost:3001"
}
```

---

## 被控端配置详解

被控端配置文件位于 `/etc/x_monitor/client.json`。

### 配置文件格式

```json
{
  "auth_secret": "your_auth_secret_here",
  "url": "wss://api.monitor.example.com/monitor",
  "net_name": "eth0",
  "name": "HK-Server01"
}
```

### 配置项说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| auth_secret | string | 认证密钥（需与主控端一致） | `mySecretKey123` |
| url | string | 主控端上报地址 | `wss://api.monitor.example.com/monitor` |
| net_name | string | 监控网卡名称 | `eth0` |
| name | string | 主机名称 | `HK-Server01` |

### 重要说明

1. **认证密钥**：
   - 必须与主控端 `config.json` 中的 `auth_secret` 完全一致
   - 不一致会导致被控端无法连接

2. **上报地址**：
   - 格式为 `wss://<后端域名>/<update_uri>`
   - `update_uri` 默认为 `/monitor`，在主控端配置中设置
   - 注意：不是 `/ws`，而是 `/monitor`

3. **网卡名称**：
   - 查看网卡名称：`ip link` 或 `ifconfig`
   - 常见名称：`eth0`、`ens3`、`ens18`、`enp0s3`
   - 用于统计网络流量

4. **主机名称**：
   - 前两位为区域标识，用于前端分组显示
   - 建议格式：`区域缩写-主机名`
   - 区域示例：`HK`（香港）、`JP`（日本）、`US`（美国）、`SG`（新加坡）

### 如何查看网卡名称

```bash
# 方法一：使用 ip 命令
ip link

# 方法二：使用 ifconfig
ifconfig

# 方法三：查看流量最大的网卡
cat /proc/net/dev | sort -k2 -n
```

---

## Telegram 通知配置

### 1. 创建 Telegram Bot

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建新机器人
3. 按提示设置名称，获取 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. 获取 Chat ID

1. 在 Telegram 中搜索 `@userinfobot`
2. 发送任意消息，获取你的 Chat ID（数字）

### 3. 配置主控端

编辑 `/etc/x_monitor/config.json`：

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

### 4. 重启服务

```bash
systemctl restart x_monitor
```

### Telegram Bot 命令

| 命令 | 说明 |
|------|------|
| `/akall` | 查看所有服务器状态统计 |
| `/status <name>` | 查询指定服务器状态 |
| `/server <name>` | 查询指定服务器详情 |

---

## 服务管理命令

### 主控端

```bash
systemctl start x_monitor    # 启动
systemctl stop x_monitor     # 停止
systemctl restart x_monitor  # 重启
systemctl status x_monitor   # 查看状态
journalctl -u x_monitor -f   # 查看日志
```

### 被控端

```bash
systemctl start x_client     # 启动
systemctl stop x_client      # 停止
systemctl restart x_client   # 重启
systemctl status x_client    # 查看状态
journalctl -u x_client -f    # 查看日志
```

### Caddy（前端服务）

```bash
systemctl start caddy        # 启动
systemctl stop caddy         # 停止
systemctl restart caddy      # 重启
systemctl status caddy       # 查看状态
```

---

## 更新升级

使用更新脚本：

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

支持更新：
- 主控前端
- 主控后端
- 被控端

---

## 常见问题

### 1. 前端无法连接后端

**检查项**：

1. 检查前端配置文件 `/etc/x_monitor/frontend/config.json`
2. 确认 WebSocket 地址正确（应为 `wss://`）
3. 检查后端服务是否运行：`systemctl status x_monitor`
4. 检查 Caddy 反向代理配置

### 2. 被控端无法连接主控

**检查项**：

1. 确认 `auth_secret` 与主控端一致
2. 确认上报地址正确（应为 `/monitor` 路径）
3. 检查网络连通性：`curl -v https://api.monitor.example.com/monitor`
4. 查看被控端日志：`journalctl -u x_client -f`

### 3. 网卡流量显示为 0

**原因**：网卡名称配置错误

**解决方法**：

1. 查看正确的网卡名称：`ip link`
2. 修改配置文件 `/etc/x_monitor/client.json`
3. 重启服务：`systemctl restart x_client`

### 4. HTTPS 证书问题

检查 Caddy 日志：`journalctl -u caddy -f`

**常见原因**：
- DNS 解析未生效
- 80/443 端口未开放
- 防火墙阻止

### 5. Docker 被控端虚拟化显示为 docker

这是已知问题，因为被控端在容器内运行。解决方法：

1. 使用二进制部署被控端
2. 忽略虚拟化显示

---

## 配置文件路径汇总

| 文件 | 路径 | 说明 |
|------|------|------|
| 主控端配置 | `/etc/x_monitor/config.json` | 后端服务配置 |
| 主控端数据库 | `/etc/x_monitor/x_monitor.db` | SQLite 数据库 |
| 被控端配置 | `/etc/x_monitor/client.json` | 被控客户端配置 |
| 前端配置 | `/etc/x_monitor/frontend/config.json` | 前端 API 地址配置 |
| Caddy 配置 | `/etc/caddy/Caddyfile` | 反向代理配置 |
| 主控端服务 | `/etc/systemd/system/x_monitor.service` | Systemd 服务 |
| 被控端服务 | `/etc/systemd/system/x_client.service` | Systemd 服务 |

---

## 安全建议

1. **auth_secret**：使用强密码，建议 16 位以上随机字符
2. **hook_token**：使用不同的随机字符串
3. **HTTPS**：确保所有连接都使用 HTTPS
4. **防火墙**：只开放必要端口（80、443）
5. **定期更新**：及时更新到最新版本

---

## 技术支持

- GitHub: https://github.com/dalaolala/xmonitor
- Issues: https://github.com/dalaolala/xmonitor/issues