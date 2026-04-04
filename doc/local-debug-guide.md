# X Monitor 本地调试指南

## 项目结构

```
d:\acode\xmonitor\
├── backend/                    # 后端服务
│   ├── main.go                 # 服务端入口
│   ├── config.go               # 配置加载
│   ├── tgbot.go                # Telegram 告警机器人
│   ├── config.json             # 服务端配置
│   ├── client/                 # 客户端程序
│   │   ├── main.go             # 客户端入口
│   │   ├── monitor.go          # 监控数据采集
│   │   ├── config.go           # 客户端配置
│   │   ├── client.json         # 客户端配置
│   │   └── model/
│   │       └── model.go        # 数据模型
│   └── go.mod
│
└── frontend/                   # 前端界面
    ├── src/                    # Vue 源码
    ├── package.json            # 依赖配置
    ├── vite.config.js          # Vite 构建配置
    └── index.html              # 入口页面
```

## 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Go | 1.23.3+ | 后端运行环境 |
| Node.js | 18+ | 前端运行环境 |
| npm/yarn | 最新 | 前端包管理器 |

## 调试流程总览

```
┌─────────────────────────────────────────────────────────────┐
│                     本地调试顺序                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 启动后端服务端                                           │
│     cd backend && go run main.go config.go tgbot.go        │
│                                                             │
│  2. 启动前端                                                 │
│     cd frontend && npm run dev                             │
│                                                             │
│  3. 启动客户端（可选，用于测试上报）                          │
│     cd backend/client && go run main.go config.go monitor.go│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 一、后端服务端调试

### 1. 进入目录并下载依赖

```bash
cd d:\acode\xmonitor\backend
go mod download
```

### 2. 配置文件 config.json

文件位置：`backend/config.json`

```json
{
  "auth_secret": "auth_secret",
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

配置说明：

| 字段 | 说明 |
|------|------|
| `auth_secret` | 认证密钥，客户端需保持一致 |
| `listen` | 服务监听端口 |
| `enable_tg` | 是否启用 Telegram 告警 |
| `update_uri` | 客户端 WebSocket 上报路径 |
| `web_uri` | 前端 WebSocket 获取路径 |
| `hook_uri` | 数据导出 API 路径 |
| `hook_token` | 数据导出认证 token |

### 3. 运行服务端

```bash
# 方式一：直接运行（推荐调试时使用）
go run main.go config.go tgbot.go

# 方式二：编译后运行
go build -o akile-monitor.exe .
./akile-monitor.exe
```

### 4. 验证服务端启动

```bash
# 测试 info 接口
curl http://localhost:3000/info

# 测试数据导出接口
curl "http://localhost:3000/hook?token=hook_token"
```

---

## 二、前端调试

### 1. 进入目录并安装依赖

```bash
cd d:\acode\xmonitor\frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问前端界面

浏览器打开：`http://localhost:5173`（Vite 默认端口）

### 4. 前端连接配置

前端需要连接后端服务，确保配置正确：

```javascript
// WebSocket 地址
ws://localhost:3000/ws

// HTTP API 地址
http://localhost:3000
```

---

## 三、客户端调试

客户端用于模拟被监控的机器，向服务端上报监控数据。

### 1. 进入客户端目录

```bash
cd d:\acode\xmonitor\backend\client
```

### 2. 创建配置文件 client.json

文件位置：`backend/client/client.json`

```json
{
  "auth_secret": "auth_secret",
  "url": "ws://localhost:3000/monitor",
  "net_name": "Ethernet0",
  "name": "Local-Test"
}
```

配置说明：

| 字段 | 说明 |
|------|------|
| `auth_secret` | 认证密钥，与服务端保持一致 |
| `url` | 服务端 WebSocket 地址 |
| `net_name` | 网卡名称（Windows 需修改） |
| `name` | 主机名称（监控列表显示名） |

### 3. Windows 网卡名称查询

```powershell
# PowerShell 查看网卡名称
Get-NetAdapter | Select-Object Name, Status
```

常见 Windows 网卡名称：

| 类型 | 可能的名称 |
|------|-----------|
| 以太网 | `Ethernet0`, `Ethernet`, `以太网` |
| Wi-Fi | `Wi-Fi`, `WLAN`, `无线网络连接` |

### 4. 运行客户端

```bash
# 方式一：直接运行
go run main.go config.go monitor.go

# 方式二：编译后运行
go build -o akile-client.exe .
./akile-client.exe
```

### 5. 验证客户端连接

客户端启动后应显示：

```
connecting to ws://localhost:3000/monitor
auth_secret验证成功
正在上报数据...
```

---

## 四、完整调试流程示例

### Step 1: 启动后端服务端

```bash
cd d:\acode\xmonitor\backend
go run main.go config.go tgbot.go
```

预期输出：

```
[Hertz] Server listening on :3000
```

### Step 2: 启动前端

```bash
cd d:\acode\xmonitor\frontend
npm run dev
```

预期输出：

```
VITE v6.0.1 ready in 300 ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Step 3: 启动客户端

```bash
cd d:\acode\xmonitor\backend\client

# 确保 client.json 存在且配置正确
go run main.go config.go monitor.go
```

预期输出：

```
connecting to ws://localhost:3000/monitor
auth_secret验证成功
正在上报数据...
```

### Step 4: 查看监控界面

1. 浏览器打开 `http://localhost:5173`
2. 应能看到 "Local-Test" 主机
3. 实时显示 CPU、内存、网络等监控数据

---

## 五、API 接口说明

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/monitor` | WebSocket | 客户端上报数据 | auth_secret |
| `/ws` | WebSocket | 前端获取实时数据 | 无 |
| `/info` | GET | 获取主机元信息列表 | 无 |
| `/info` | POST | 更新主机元信息 | auth_secret |
| `/hook` | GET | 导出所有监控数据 | hook_token |
| `/delete` | POST | 删除主机 | auth_secret |

### 接口示例

```bash
# 获取主机列表
curl http://localhost:3000/info

# 导出监控数据
curl "http://localhost:3000/hook?token=hook_token"

# 添加主机元信息
curl -X POST http://localhost:3000/info \
  -H "Content-Type: application/json" \
  -d '{"auth_secret":"auth_secret","name":"Local-Test","due_time":1735689600,"buy_url":"https://example.com","seller":"Seller","price":"$10"}'

# 删除主机
curl -X POST http://localhost:3000/delete \
  -H "Content-Type: application/json" \
  -d '{"auth_secret":"auth_secret","name":"Local-Test"}'
```

---

## 六、VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend Server",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/backend",
      "cwd": "${workspaceFolder}/backend"
    },
    {
      "name": "Debug Backend Client",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/backend/client",
      "cwd": "${workspaceFolder}/backend/client"
    },
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

---

## 七、常见问题

### Q1: 网卡名称错误导致网络数据为 0

**问题**：客户端默认网卡名称 `eth0` 是 Linux 默认值，Windows 需修改。

**解决**：

```powershell
# 查看网卡名称
Get-NetAdapter | Select-Object Name

# 修改 client.json
{
  "net_name": "Ethernet0"  // 替换为实际网卡名称
}
```

### Q2: 端口被占用

**问题**：3000 或 5173 端口被其他程序占用。

**解决**：

```bash
# 查看端口占用
netstat -ano | findstr :3000

# 修改配置
# backend/config.json - 修改 listen 端口
# frontend/vite.config.js - 修改 server.port
```

### Q3: 客户端认证失败

**问题**：客户端显示 `auth_secret验证失败`。

**解决**：确保 `backend/config.json` 和 `backend/client/client.json` 的 `auth_secret` 值一致。

### Q4: 前端无法连接 WebSocket

**问题**：前端界面空白或无数据。

**解决**：

1. 检查后端是否已启动
2. 检查 WebSocket 地址配置是否正确
3. 浏览器开发者工具查看 WebSocket 连接状态

### Q5: 服务端重启后监控列表为空

**问题**：重启服务端后前端看不到监控数据。

**原因**：

1. 监控数据存储在内存数据库，重启后丢失
2. 客户端没有自动重连机制

**解决**：重启客户端程序，重新建立连接。

---

## 八、数据存储说明

| 数据库 | 类型 | 存储内容 | 重启后 |
|--------|------|----------|--------|
| `db` | 内存 SQLite | 监控数据（CPU/内存/网络等） | 丢失 |
| `filedb` | 文件 SQLite (`ak_monitor.db`) | 主机元信息（到期时间等） | 保留 |

---

## 九、技术栈

| 组件 | 技术 |
|------|------|
| 后端框架 | Hertz (CloudWeGo) |
| 数据库 | SQLite + GORM |
| 通信协议 | WebSocket |
| 数据压缩 | Gzip |
| 系统监控 | gopsutil |
| 前端框架 | Vue 3 + Vite |
| UI 组件 | Arco Design Vue |
| 图表 | Highcharts |

---

## 十、快速验证清单

```bash
# 1. 后端是否运行
curl http://localhost:3000/info
# 预期返回: [] 或主机列表 JSON

# 2. WebSocket 是否可用（使用 wscat）
wscat -c ws://localhost:3000/ws
# 发送任意消息，预期返回: data: [...]

# 3. 数据导出接口
curl "http://localhost:3000/hook?token=hook_token"
# 预期返回: 监控数据 JSON

# 4. 前端是否运行
curl http://localhost:5173
# 预期返回: HTML 页面
```