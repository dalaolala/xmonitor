# X Monitor Backend

服务器监控系统后端服务，包含主控端和被控端。

## 功能特性

- **多服务器监控** - 同时监控多台服务器，按地区分类展示
- **实时数据** - CPU、内存、网络、负载实时更新（每秒刷新）
- **Telegram 通知** - 服务器上下线自动推送通知
- **远程查询** - Telegram 命令 `/akall`、`/status` 查询服务器状态
- **主机管理** - 记录到期时间、商家、价格、购买链接

## 技术栈

- **Go 1.24** - 编程语言
- **Hertz** - 字节跳动开源高性能 HTTP 框架
- **GORM** - ORM 框架
- **SQLite** - 轻量级数据库
- **WebSocket** - 实时数据传输
- **Telegram Bot API** - 消息通知

## 快速部署

### 一键管理脚本

```
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

支持以下功能：
- 安装主控前端
- 安装主控后端
- 卸载主控后端
- 查看主控配置
- 安装被控端
- 卸载被控端
- 查看被控配置

### 主控后端安装

```
wget -O setup-monitor.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-monitor.sh" && chmod +x setup-monitor.sh && sudo ./setup-monitor.sh
```

### 被控端安装

```
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

示例：
```
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh 123321 wss://api.example.com/ws HK-XMonitor
```

### Alpine 系统被控端安装

```
wget -O alpine-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/alpine-client.sh" && chmod +x alpine-client.sh && sudo ./alpine-client.sh <auth_secret> <url> <name>
```

### 主控前端安装

```
wget -O setup-monitor-fe.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-monitor-fe.sh" && chmod +x setup-monitor-fe.sh && sudo ./setup-monitor-fe.sh
```

### 更新脚本

```
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

支持更新：
- 主控前端
- 主控后端
- 被控端

## Docker 部署

详见 [DOCKER.md](./DOCKER.md)

## 支持架构

| 架构 | 主控端 | 被控端 |
|------|--------|--------|
| linux/amd64 | `x_monitor-linux-amd64` | `x_client-linux-amd64` |
| linux/arm64 | `x_monitor-linux-arm64` | `x_client-linux-arm64` |
| darwin/amd64 | `x_monitor-darwin-amd64` | `x_client-darwin-amd64` |

## 配置说明

### 主控端配置 (`/etc/x_monitor/config.json`)

| 字段 | 说明 |
|------|------|
| `auth_secret` | 认证密钥 |
| `listen` | 服务监听地址（如 `:3000`） |
| `enable_tg` | 是否启用 Telegram 通知 |
| `tg_token` | Telegram Bot Token |
| `tg_chat_id` | Telegram Chat ID |
| `hook_uri` | Hook 路径 |
| `update_uri` | 被控上报路径 |
| `web_uri` | WebSocket 路径 |
| `hook_token` | Hook 认证令牌 |

### 被控端配置 (`/etc/x_monitor/client.json`)

| 字段 | 说明 |
|------|------|
| `auth_secret` | 认证密钥（需与主控端一致） |
| `url` | 主控端 WebSocket 地址 |
| `net_name` | 监控网卡名称 |
| `name` | 主机名称 |

## 服务管理

### 主控端

```bash
# 启动
systemctl start x_monitor
# 停止
systemctl stop x_monitor
# 重启
systemctl restart x_monitor
# 查看状态
systemctl status x_monitor
```

### 被控端

```bash
# 启动
systemctl start x_client
# 停止
systemctl stop x_client
# 重启
systemctl restart x_client
# 查看状态
systemctl status x_client
```

## Telegram Bot 命令

| 命令 | 说明 |
|------|------|
| `/akall` | 查看所有服务器状态统计 |
| `/status <name>` | 查询指定服务器状态 |
| `/server <name>` | 查询指定服务器详情 |

## 本地开发

```bash
# 编译主控端
cd backend
go build -o x_monitor

# 编译被控端
cd backend/client
go build -o x_client

# 运行
./x_monitor  # 主控端
./x_client   # 被控端
```

## 项目地址

- 主项目：https://github.com/dalaolala/xmonitor
- 前端项目：https://github.com/dalaolala/xmonitor/tree/main/frontend