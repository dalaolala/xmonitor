# X Monitor 项目技术架构文档

## 项目概述

**X Monitor** 是一个开源的服务器监控系统，用于集中监控多台服务器的实时状态。项目采用主控-被控架构，支持 Telegram Bot 通知和多语言界面。

---

## 一、后端技术栈

### 1. 语言与框架

| 类别 | 技术 |
|------|------|
| **编程语言** | Go (Golang) |
| **Web框架** | Hertz (字节跳动开源的高性能HTTP框架，cloudwego生态) |
| **ORM** | GORM |
| **数据库** | SQLite (内存数据库 + 持久化数据库) |
| **WebSocket** | hertz-contrib/websocket |
| **Telegram Bot** | go-telegram-bot-api/telegram-bot-api/v5 |

### 2. 主要依赖

```
github.com/cloudwego/hertz          # 字节跳动高性能HTTP框架
github.com/glebarez/sqlite         # 纯Go SQLite驱动
github.com/hertz-contrib/cors      # 跨域支持
github.com/hertz-contrib/websocket # WebSocket支持
gorm.io/gorm                       # ORM框架
github.com/go-telegram-bot-api/telegram-bot-api/v5  # Telegram Bot
github.com/shirou/gopsutil/v3      # 系统信息采集（客户端使用）
```

### 3. 后端架构

后端分为两个部分：

#### 主控端 (Server)

**主要文件：**
- `backend/main.go` - 主服务入口
- `backend/config.go` - 配置加载
- `backend/tgbot.go` - Telegram Bot功能

**功能模块：**

| 模块 | 功能描述 |
|------|----------|
| **WebSocket接收端** | `/monitor` 路径接收被控端上报数据，支持gzip压缩解压 |
| **WebSocket推送端** | `/ws` 路径向前端实时推送监控数据 |
| **REST API** | `/info` (主机信息管理)、`/delete` (删除主机) |
| **Telegram Bot** | 服务器上下线通知、`/akall` 统计命令、`/status` 查询单个服务器 |
| **数据存储** | 内存数据库存储实时数据，文件数据库存储主机元信息 |

#### 被控端 (Client)

**主要文件：**
- `backend/client/main.go` - 客户端入口
- `backend/client/monitor.go` - 系统信息采集
- `backend/client/model/model.go` - 数据模型

**功能模块：**

| 模块 | 功能描述 |
|------|----------|
| **CPU监控** | CPU使用率、核心数、型号 |
| **内存监控** | 内存使用量、总量、Swap |
| **网络监控** | 网络流量统计、实时速度计算 |
| **系统负载** | Load1/Load5/Load15 |
| **系统信息** | 平台、架构、虚拟化类型、运行时间 |
| **数据上报** | 每秒通过WebSocket上报，gzip压缩 |

### 4. 数据模型

```go
// 主机静态信息
type Host struct {
    Name, Platform, PlatformVersion, Arch, Virtualization string
    CPU []string
    MemTotal, SwapTotal, BootTime uint64
}

// 主机动态状态
type HostState struct {
    CPU float64
    MemUsed, SwapUsed uint64
    NetInTransfer, NetOutTransfer, NetInSpeed, NetOutSpeed uint64
    Uptime uint64
    Load1, Load5, Load15 float64
}
```

---

## 二、前端技术栈

### 1. 框架与工具

| 类别 | 技术 |
|------|------|
| **框架** | Vue 3 (Composition API) |
| **构建工具** | Vite 6 |
| **UI组件库** | Arco Design Vue (字节跳动开源) |
| **图表库** | Highcharts + highcharts-vue |
| **HTTP客户端** | Axios |
| **国际化** | vue-i18n |
| **样式** | Sass/SCSS |
| **图标** | @iconoir/vue |
| **国旗图标** | flag-icons-svg |
| **日期处理** | moment |

### 2. 前端目录结构

```
frontend/
├── src/
│   ├── App.vue              # 主应用组件 (监控面板)
│   ├── components/
│   │   ├── CPU.vue          # CPU使用率图表
│   │   ├── Mem.vue          # 内存使用率图表
│   │   ├── NetIn.vue        # 网络入站速度图表
│   │   ├── NetOut.vue       # 网络出站速度图表
│   │   ├── StatsCard.vue    # 统计卡片组件
│   │   └── HeaderLocale.vue # 语言切换组件
│   ├── locales/
│   │   ├── zh.json          # 中文
│   │   ├── en.json          # 英文
│   │   ├── ja.json          # 日语
│   │   ├── ko.json          # 韩语
│   │   └── de.json          # 德语
├── public/
│   └── config.json          # WebSocket/API配置
└── package.json
```

### 3. 前端主要功能

| 功能 | 描述 |
|------|------|
| **实时监控面板** | WebSocket实时接收数据，展示服务器状态卡片 |
| **地区筛选** | 按服务器名称前缀（国旗图标）筛选，如 CN、HK、US 等 |
| **状态筛选** | 全部/在线/离线三种筛选模式 |
| **统计概览** | 服务器总数、在线数、离线数、总流量、总带宽 |
| **实时图表** | CPU、内存、网络速度实时折线图 |
| **主机详情** | 点击展开详细信息（系统、CPU型号、虚拟化、商家、价格、到期时间等） |
| **主机管理** | 编辑主机信息（到期时间、商家、购买链接）、删除主机 |
| **主题切换** | 亮色/暗色主题，本地存储偏好 |
| **多语言** | 支持中、英、日、韩、德五种语言 |

---

## 三、系统架构

### 架构图

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   被控端        │ ──────────────────►│                 │
│  (各服务器)     │   上报监控数据      │    主控端       │
│  client/main.go │                    │   main.go       │
└─────────────────┘                    │                 │
                                       │   - 数据接收     │
                                       │   - 数据存储     │
                                       │   - WebSocket推送│
                                       │   - REST API    │
                                       │   - TG Bot      │
                                       └────────┬────────┘
                                                │
                          WebSocket             │ REST API
                       ┌────────────────────────┼─────────────────┐
                       │                        │                 │
                       ▼                        ▼                 ▼
              ┌─────────────────┐      ┌─────────────────┐  ┌─────────────┐
              │    前端         │      │   Telegram      │  │  Hook接口   │
              │   App.vue       │      │   Bot用户       │  │  外部集成   │
              │                 │      │                 │  │             │
              │  - 实时面板     │      │  - 状态通知     │  │  数据获取   │
              │  - 图表展示     │      │  - 命令查询     │  │             │
              │  - 主机管理     │      │                 │  │             │
              └─────────────────┘      └─────────────────┘  └─────────────┘
```

### 数据流

1. **被控端采集** → 每秒采集系统信息（CPU、内存、网络、负载）
2. **WebSocket上报** → 通过gzip压缩上报到主控端 `/monitor`
3. **主控端处理** → 存储到内存数据库，广播到前端连接
4. **前端展示** → WebSocket `/ws` 接收数据，实时更新图表
5. **Telegram通知** → 服务器上下线时推送通知

---

## 四、核心功能

### 项目定位

**X Monitor** 是一个**多服务器集中监控系统**，适用于：
- VPS/云服务器批量管理
- 服务器健康状态实时监控
- 商家/到期时间信息管理
- Telegram 远程查询与通知

### 功能列表

| 功能 | 说明 |
|------|------|
| **多服务器监控** | 同时监控多台服务器，按地区分类展示 |
| **实时数据** | CPU、内存、网络、负载实时更新（每秒） |
| **上下线通知** | Telegram Bot 自动推送服务器上下线通知 |
| **远程查询** | Telegram 命令 `/akall`、`/status`、`/server` |
| **主机信息管理** | 记录到期时间、商家、价格、购买链接 |
| **流量统计** | 上下行流量、速度、流量对等性计算 |
| **可视化图表** | Highcharts 实时性能趋势图 |

---

## 五、配置文件说明

| 文件 | 用途 |
|------|------|
| `backend/config.json` | 主控端配置（监听端口、认证密钥、Telegram Token） |
| `backend/client.json` | 被控端配置（主控URL、认证密钥、网卡名称、主机名） |
| `frontend/public/config.json` | 前端配置（WebSocket地址、API地址） |

### 主控端配置示例 (config.json)

```json
{
    "port": 3000,
    "secret": "your-secret-key",
    "tgbot_token": "your-telegram-bot-token",
    "tgbot_chat_id": "your-chat-id"
}
```

### 被控端配置示例 (client.json)

```json
{
    "server": "ws://your-server:3000/monitor",
    "secret": "your-secret-key",
    "interface": "eth0",
    "name": "CN-Server-01"
}
```

---

## 六、部署方式

- **Docker 部署**：支持 Docker Compose 一键部署
- **脚本安装**：提供 `setup-monitor-fe.sh` 和 `setup-client.sh` 安装脚本
- **手动部署**：编译后直接运行二进制文件

---

## 七、技术亮点

1. **高性能**：采用字节跳动 Hertz 框架，性能优异
2. **轻量级**：SQLite 数据库，无需额外数据库服务
3. **实时性**：WebSocket 双向通信，数据秒级更新
4. **跨平台**：Go 语言编译，支持多平台运行
5. **现代化UI**：Vue 3 + Arco Design，界面美观
6. **国际化**：支持多语言切换
7. **通知集成**：Telegram Bot 实时告警

---

## 八、版本信息

- **当前版本**：v0.0.3
- **开源协议**：MIT License