# X Monitor

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

## 系统架构

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   被控端        │ ──────────────────►│     主控端      │
│  (各服务器)     │   上报监控数据      │   (服务端)      │
└─────────────────┘                    └────────┬────────┘
                                                │
                          WebSocket             │ REST API
                       ┌────────────────────────┼─────────────┐
                       ▼                        ▼             ▼
              ┌─────────────────┐      ┌─────────────┐  ┌─────────┐
              │    前端面板     │      │  Telegram   │  │  Hook   │
              └─────────────────┘      └─────────────┘  └─────────┘
```

## 快速开始

### 环境要求

- Go 1.19+
- Node.js 18+
- npm 或 yarn

### 后端部署

1. 配置主控端
```bash
cd backend
# 编辑 config.json
{
    "port": 3000,
    "secret": "your-secret-key",
    "tgbot_token": "your-telegram-bot-token",
    "tgbot_chat_id": "your-chat-id"
}
```

2. 编译运行
```bash
go build -o monitor
./monitor
```

### 被控端部署

1. 配置被控端
```bash
# 编辑 client.json
{
    "server": "ws://your-server:3000/monitor",
    "secret": "your-secret-key",
    "interface": "eth0",
    "name": "CN-Server-01"
}
```

2. 编译运行
```bash
cd backend/client
go build -o client
./client
```

### 前端部署

1. 安装依赖
```bash
cd frontend
npm install
# 或
yarn install
```

2. 配置前端
```bash
# 编辑 public/config.json
{
    "ws": "ws://your-server:3000/ws",
    "api": "http://your-server:3000"
}
```

3. 开发模式
```bash
npm run dev
# 或
yarn dev
```

4. 生产构建
```bash
npm run build
# 或
yarn build
```

## Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d
```

## 配置说明

### 主控端配置 (backend/config.json)

| 字段 | 说明 |
|------|------|
| `port` | 服务监听端口 |
| `secret` | 认证密钥 |
| `tgbot_token` | Telegram Bot Token |
| `tgbot_chat_id` | Telegram Chat ID |

### 被控端配置 (backend/client.json)

| 字段 | 说明 |
|------|------|
| `server` | 主控端 WebSocket 地址 |
| `secret` | 认证密钥（需与主控端一致） |
| `interface` | 监控网卡名称 |
| `name` | 主机名称 |

### 前端配置 (frontend/public/config.json)

| 字段 | 说明 |
|------|------|
| `ws` | WebSocket 地址 |
| `api` | REST API 地址 |

## Telegram Bot 命令

| 命令 | 说明 |
|------|------|
| `/akall` | 查看所有服务器状态统计 |
| `/status <name>` | 查询指定服务器状态 |
| `/server <name>` | 查询指定服务器详情 |

## 项目结构

```
xmonitor/
├── backend/
│   ├── main.go           # 主控端入口
│   ├── config.go         # 配置加载
│   ├── tgbot.go          # Telegram Bot
│   ├── config.json       # 主控端配置
│   ├── client.json       # 被控端配置示例
│   └── client/
│       ├── main.go       # 被控端入口
│       ├── monitor.go    # 系统信息采集
│       └── model/        # 数据模型
├── frontend/
│   ├── src/
│   │   ├── App.vue       # 主应用
│   │   ├── components/   # 组件
│   │   └── locales/      # 多语言
│   ├── public/
│   │   └── config.json   # 前端配置
│   └── package.json
└── doc/
    └── project-architecture.md  # 架构文档
```

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

## 开发

### 本地调试

参考 [本地调试指南](doc/local-debug-guide.md)

### 构建发布

```bash
# 后端
cd backend
go build -o monitor

# 被控端
cd backend/client
go build -o client

# 前端
cd frontend
npm run build
```

## 许可证

[MIT License](LICENSE)

## 作者

X Monitor Team