# X Monitor

[简体中文](doc/README_CN.md) | English | [日本語](doc/README_JA.md) | [한국어](doc/README_KO.md)

![X Monitor Preview](https://img.imgdd.com/67e21861-9a53-43ff-a0e0-246ecbb40770.png)

A lightweight, high-performance server monitoring system with multi-server management, real-time status monitoring, and Telegram Bot notifications.

## Features

- **Multi-Server Monitoring** - Monitor multiple servers simultaneously, organized by region
- **Real-Time Data** - CPU, memory, network, and load metrics updated every second
- **Visual Charts** - Highcharts real-time performance trend graphs
- **Telegram Notifications** - Automatic alerts for server online/offline status
- **Remote Query** - Telegram commands `/akall`, `/status` to query server status
- **Host Management** - Track expiration dates, providers, pricing, and purchase links
- **Multi-Language Support** - Chinese, English, Japanese, Korean, German
- **Theme Switching** - Light/Dark theme support

## Installation

For detailed deployment instructions, see:

- [English Deployment Guide](doc/DEPLOYMENT_EN.md)
- [中文部署文档](doc/DEPLOYMENT_CN.md)
- [日本語デプロイガイド](doc/DEPLOYMENT_JA.md)
- [한국어 배포 가이드](doc/DEPLOYMENT_KO.md)

### Quick Start

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

## Tech Stack

### Backend
- **Go** - Programming language
- **Hertz** - ByteDance high-performance HTTP framework
- **GORM** - ORM framework
- **SQLite** - Lightweight database
- **WebSocket** - Real-time data transmission
- **Telegram Bot API** - Message notifications

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite 6** - Next-generation frontend build tool
- **Arco Design Vue** - ByteDance UI component library
- **Highcharts** - Interactive charting library
- **vue-i18n** - Internationalization support

## Configuration

### Monitor Configuration (`/etc/x_monitor/config.json`)

| Field | Description |
|-------|-------------|
| `auth_secret` | Authentication secret |
| `listen` | Service listen address (e.g., `:3000`) |
| `enable_tg` | Enable Telegram notifications |
| `tg_token` | Telegram Bot Token |
| `tg_chat_id` | Telegram Chat ID |
| `hook_uri` | Hook path |
| `update_uri` | Client report path |
| `web_uri` | WebSocket path |
| `hook_token` | Hook authentication token |

### Client Configuration (`/etc/x_monitor/client.json`)

| Field | Description |
|-------|-------------|
| `auth_secret` | Authentication secret (must match monitor) |
| `url` | Monitor WebSocket address |
| `net_name` | Network interface name to monitor |
| `name` | Host name |

## Service Management

### Monitor Service

```bash
systemctl start x_monitor    # Start
systemctl stop x_monitor     # Stop
systemctl restart x_monitor  # Restart
systemctl status x_monitor   # View status
```

### Client Service

```bash
systemctl start x_client     # Start
systemctl stop x_client      # Stop
systemctl restart x_client   # Restart
systemctl status x_client    # View status
```

## Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/akall` | View all server status summary |
| `/status <name>` | Query specific server status |
| `/server <name>` | Query specific server details |

## Supported Architectures

| Architecture | Monitor | Client |
|--------------|---------|--------|
| linux/amd64 | `x_monitor-linux-amd64` | `x_client-linux-amd64` |
| linux/arm64 | `x_monitor-linux-arm64` | `x_client-linux-arm64` |
| darwin/amd64 | `x_monitor-darwin-amd64` | `x_client-darwin-amd64` |

## Monitoring Metrics

| Metric | Description |
|--------|-------------|
| CPU Usage | Real-time CPU usage percentage |
| Memory Usage | Used memory / Total memory |
| Swap Usage | Swap memory usage |
| Network Traffic | Inbound/Outbound traffic statistics |
| Network Speed | Real-time upload/download speed |
| System Load | Load1 / Load5 / Load15 |
| Uptime | System uptime |

## Local Development

See [Local Debug Guide](doc/local-debug-guide.md)

## License

[MIT License](LICENSE)

## Acknowledgments

This project references [akile_monitor](https://github.com/akile-network/akile_monitor). Special thanks to the original authors.

## Author

X Monitor Team