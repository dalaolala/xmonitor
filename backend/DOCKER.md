# Docker 部署介绍

将前端、主控服务和被控客户端打包进容器，利用 Docker 进行快速部署。

## 支持架构

- linux/amd64
- linux/arm64

## 准备工作

> *以下所有 `/CHANGE_PATH` 替换为你的宿主机路径*
> *SQLite 数据库需要提前创建，避免 Docker 自动创建文件夹导致失败*

- [Docker](https://docs.docker.com/get-started/get-docker/) 安装

## 主控服务端

- SQLite 数据库路径：`/CHANGE_PATH/x_monitor/x_monitor.db`

### 配置文件

环境变量与配置文件二选一即可。

如需映射配置文件，请提前创建并挂载：`/CHANGE_PATH/x_monitor/config.json:/app/config.json`

配置文件示例：
```json
{
  "auth_secret": "your_secret",
  "listen": ":3000",
  "enable_tg": false,
  "tg_token": "your_telegram_bot_token",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "hook_token",
  "tg_chat_id": 0
}
```

### Docker Cli 部署

```bash
docker run -it --name x_monitor_server --restart always \
  -v /CHANGE_PATH/x_monitor/x_monitor.db:/app/x_monitor.db \
  -e AUTH_SECRET="auth_secret" \
  -e LISTEN=":3000" \
  -e ENABLE_TG=false \
  -e TG_TOKEN="your_telegram_bot_token" \
  -e HOOK_URI="/hook" \
  -e UPDATE_URI="/monitor" \
  -e WEB_URI="/ws" \
  -e HOOK_TOKEN="hook_token" \
  -e TG_CHAT_ID=0 \
  -p 3000:3000 \
  -e TZ="Asia/Shanghai" \
  xmonitor_server
```

### Docker Compose 部署

```bash
cat <<EOF > server-compose.yml
services:
  x_monitor_server:
    image: xmonitor_server
    container_name: x_monitor_server
    hostname: x_monitor_server
    restart: always
    ports:
      - 3000:3000
    volumes:
      - /CHANGE_PATH/x_monitor/x_monitor.db:/app/x_monitor.db
    environment:
      TZ: "Asia/Shanghai"
      AUTH_SECRET: "auth_secret"
      LISTEN: ":3000"
      ENABLE_TG: false
      TG_TOKEN: "your_telegram_bot_token"
      HOOK_URI: "/hook"
      UPDATE_URI: "/monitor"
      WEB_URI: "/ws"
      HOOK_TOKEN: "hook_token"
      TG_CHAT_ID: 0
EOF
docker compose -f server-compose.yml up -d
```

## 前端部署

前端使用 Caddy 作为 Web 服务器。

### 配置文件

环境变量与配置文件二选一即可。

配置文件示例：
```json
{
  "socket": "wss://api.example.com/ws",
  "apiURL": "https://api.example.com"
}
```

### Docker Cli 部署

```bash
docker run -it --name x_monitor_fe --restart always \
  -e SOCKET="wss://api.example.com/ws" \
  -e APIURL="https://api.example.com" \
  -p 80:80 \
  -e TZ="Asia/Shanghai" \
  xmonitor_fe
```

### Docker Compose 部署

```bash
cat <<EOF > fe-compose.yml
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
      SOCKET: "wss://api.example.com/ws"
      APIURL: "https://api.example.com"
EOF
docker compose -f fe-compose.yml up -d
```

## 被控客户端部署

> 重要提示：
> - 必须添加 `host` 网络模式，否则识别的流量为容器内的
> - 必须添加 `/var/run/docker.sock` 卷，否则识别的系统为容器内的

### 配置文件

环境变量与配置文件二选一即可。

如需映射配置文件：`/CHANGE_PATH/x_monitor/client/client.json:/app/client.json`

配置文件示例：
```json
{
  "auth_secret": "your_secret",
  "url": "wss://api.example.com/monitor",
  "net_name": "eth0",
  "name": "HK-XMonitor"
}
```

### Docker Cli 部署

```bash
docker run -it --name x_monitor_client --restart always \
  -e AUTH_SECRET="auth_secret" \
  -e URL="wss://api.example.com/monitor" \
  -e NET_NAME="eth0" \
  -e NAME="HK-XMonitor" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --net host \
  -e TZ="Asia/Shanghai" \
  xmonitor_client
```

### Docker Compose 部署

```bash
cat <<EOF > client-compose.yml
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
      AUTH_SECRET: "auth_secret"
      URL: "wss://api.example.com/monitor"
      NET_NAME: "eth0"
      NAME: "HK-XMonitor"
EOF
docker compose -f client-compose.yml up -d
```

## 本地构建镜像

```bash
git clone https://github.com/dalaolala/xmonitor
cd xmonitor/backend
docker build --target server --tag xmonitor_server .
docker build --target fe --tag xmonitor_fe .
docker build --target client --tag xmonitor_client .
```

## 已知问题

> *因为被控客户端在 Docker alpine 容器内，所以虚拟化始终显示为 `docker`*

解决方法：
1. 被控客户端采用二进制部署，详见 [README.md](./README.md)
2. 忽略虚拟化显示内容