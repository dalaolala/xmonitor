# X Monitor

简体中文 | [English](README.md) | [日本語](README_JA.md) | [한국어](README_KO.md)

一个轻量级、高性能的服务器监控系统，支持多服务器集中管理、实时状态监控和 Telegram Bot 通知。

## 功能特性

- **多服务器监控** - 同时监控多台服务器，按地区分类展示
- **实时数据** - CPU、内存、网络、负载实时更新（每秒刷新）
- **可视化图表** - Highcharts 实时性能趋势图
- **Telegram 通知** - 服务器上下线自动推送通知
- **远程查询** - Telegram 命令 `/akall`、`/status` 查询服务器状态
- **主机管理** - 记录到期时间、商家、价格、购买链接
- **多语言支持** - 中、英、日、韩、德五种语言
- **主题切换** - 亮色/暗色主题

## 快速安装

### 一键管理脚本

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
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

```bash
wget -O setup-monitor.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor.sh" && chmod +x setup-monitor.sh && sudo ./setup-monitor.sh
```

### 被控端安装

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

示例：
```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh 123321 wss://api.example.com/ws HK-XMonitor
```

### Alpine 系统被控端安装

```bash
wget -O alpine-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/alpine-client.sh" && chmod +x alpine-client.sh && sudo ./alpine-client.sh <auth_secret> <url> <name>
```

### 主控前端安装

```bash
wget -O setup-monitor-fe.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor-fe.sh" && chmod +x setup-monitor-fe.sh && sudo ./setup-monitor-fe.sh
```

### 更新脚本

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

支持更新：
- 主控前端
- 主控后端
- 被控端

## 技术栈

### 后端
- **Go** - 编程语言
- **Hertz** - 字节跳动开源高性能 HTTP 框架
- **GORM** - ORM 框架
- **SQLite** - 轻量级数据库
- **WebSocket** - 实时数据传输
- **Telegram Bot API** - 消息通知

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 6** - 下一代前端构建工具
- **Arco Design Vue** - 字节跳动开源 UI 组件库
- **Highcharts** - 交互式图表库
- **vue-i18n** - 国际化支持

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
systemctl start x_monitor    # 启动
systemctl stop x_monitor     # 停止
systemctl restart x_monitor  # 重启
systemctl status x_monitor   # 查看状态
```

### 被控端

```bash
systemctl start x_client     # 启动
systemctl stop x_client      # 停止
systemctl restart x_client   # 重启
systemctl status x_client    # 查看状态
```

## Telegram Bot 命令

| 命令 | 说明 |
|------|------|
| `/akall` | 查看所有服务器状态统计 |
| `/status <name>` | 查询指定服务器状态 |
| `/server <name>` | 查询指定服务器详情 |

## 支持架构

| 架构 | 主控端 | 被控端 |
|------|--------|--------|
| linux/amd64 | `x_monitor-linux-amd64` | `x_client-linux-amd64` |
| linux/arm64 | `x_monitor-linux-arm64` | `x_client-linux-arm64` |
| darwin/amd64 | `x_monitor-darwin-amd64` | `x_client-darwin-amd64` |

## 监控指标

| 指标 | 说明 |
|------|------|
| CPU 使用率 | 实时 CPU 占用百分比 |
| 内存使用 | 已用内存 / 总内存 |
| Swap 使用 | Swap 使用情况 |
| 网络流量 | 入站/出站流量统计 |
| 网络速度 | 实时上传/下载速度 |
| 系统负载 | Load1 / Load5 / Load15 |
| 运行时间 | 系统启动时长 |

## 本地开发

参考 [本地调试指南](doc/local-debug-guide.md)

## 许可证

[MIT License](LICENSE)

## 致谢

本项目代码参考了 [akile_monitor](https://github.com/akile-network/akile_monitor)，在此表示感谢。

## 作者

X Monitor Team