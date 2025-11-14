# HeyTea Cup Sticker Frontend

Vue 3 + TypeScript + Element Plus + Tailwind CSS，实现纯前端界面，配合 Node.js 代理（`server/`）转发所有接口，逻辑参考 [FuQuan233/HeyTea_AutoUpload](https://github.com/FuQuan233/HeyTea_AutoUpload)。

## 功能

- 手机号短信登录（Node 端转发喜茶接口，前端触发腾讯人机验证）
- Token 快速登录与本地记忆
- 596×832 画布自动缩放、裁切以及灰度处理
- 处理结果预览、下载、上传
- Node 代理直连官方 API：验证码、登录、用户信息、杯贴上传，并可作为静态资源服务器

⚠️ **注意**：所有真实请求仍然指向 `app-go.heytea.com`。若官方进一步收紧校验（设备指纹、IP 白名单等），代理同样会失效。

## 运行方式

> 需要安装 Node.js（建议 ≥ 18）。以下命令均在仓库根目录执行。

1. 安装依赖
   ```bash
   npm install --prefix frontend
   npm install --prefix server
   ```
2. 开发调试
   - 启动代理：`npm run dev --prefix server`
   - 另开一个终端启用 Vite：`npm run dev --prefix frontend`
   - 浏览器打开 `http://localhost:5173`（前端 `.env.development` 已指向 `http://localhost:8787`）
3. 生产构建 + 一体化启动
   ```bash
   npm run build --prefix frontend
   npm start --prefix server   # Express 会托管 dist 并提供 /api/*
   ```
   打开 `http://localhost:8787` 即可使用。

## 目录说明

- `frontend/`：Vite + Vue3 前端工程（主要代码在 `src/App.vue`、`src/services/heytea.ts`）
- `server/`：Express 代理层，负责加密、签名、请求转发以及静态托管

如需部署到线上，可以把 `server/` 部署到任意 Node 12+ 环境（或改写成 Serverless），前端只需要把 `VITE_API_BASE` 指向该地址即可。
