# X Monitor Frontend

X Monitor 前端项目，基于 Vue 3 + Arco Design 构建。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 6** - 下一代前端构建工具
- **Arco Design Vue** - 字节跳动开源 UI 组件库
- **Highcharts** - 交互式图表库
- **vue-i18n** - 国际化支持

## 安装

```bash
cd frontend
npm install
```

## 配置文件

构建后在 `dist/config.json` 中修改：

```json
{
  "socket": "wss://api.example.com/ws",
  "apiURL": "https://api.example.com"
}
```

| 字段 | 说明 |
|------|------|
| `socket` | WebSocket 地址（用于实时数据） |
| `apiURL` | REST API 地址 |

## 开发

```bash
npm run dev
```

## 打包

```bash
npm run build
```

构建产物在 `dist/` 目录下。

## 多语言支持

支持以下语言：
- 简体中文 (zh)
- English (en)
- 日本語 (ja)
- 한국어 (ko)
- Deutsch (de)

语言文件位于 `src/locales/` 目录。

## 项目地址

- 主项目：https://github.com/dalaolala/xmonitor