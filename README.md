# HeyTea Sticker Tool

Vue 3 + TypeScript + Element Plus + Tailwind CSS + Node.js 代理，实现喜茶杯贴上传工具，逻辑参考 [FuQuan233/HeyTea_AutoUpload](https://github.com/FuQuan233/HeyTea_AutoUpload)。

本仓库从 [SuInk/HeyTea-DIY-Toolkit](https://github.com/SuInk/HeyTea-DIY-Toolkit) Fork而来

## 在线体验

如果想在线使用，可以使用托管的版本：<https://hey.jerryz.com.cn>

## 功能概览

- 手机号短信登录（Node 端转发喜茶接口）
- Token 快速登录与本地记忆
- 596×832 画布自动缩放、裁切、灰度、强制 PNG、自动压缩至 ≤ 200KB
- 处理结果预览、下载、重复上传提醒
- Node 代理直连官方 API：验证码、登录、用户信息、杯贴上传，并可托管前端静态文件

## 本地开发

```bash
# 1. 安装依赖（会自动安装 server/frontend）
npm install

# 2. 启动开发环境（代理 + Vite）
npm run dev
# 访问 http://localhost:5173
```

## 本地生产运行

```bash
npm run build   # 构建前端 dist
npm start       # Express 读取 dist 并提供 /api/*
# 访问 http://localhost:8787
```

## Vercel 部署（静态 + API 一体）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYangguangZhou%2FHeyTea-DIY-Toolkit&project-name=heytea-diy-toolkit&repository-name=heytea-diy-toolkit&build-command=npm%20run%20frontend%3Abuild&install-command=npm%20install&output-directory=frontend%2Fdist)

仓库根目录包含 `api/sms/send.js`、`api/login/sms.js`、`api/user.js`、`api/upload.js` 等 Serverless 端点（内部都复用 `server/app.js`），Vercel 会为每个端点生成函数，前端可直接访问同源 `/api/*`。

## Cloudflare Worker 部署

后端代理已抽离为 `worker/src/index.js`，可以直接运行在 Cloudflare Workers：

1. 安装依赖：`npm install`（需包含 `crypto-js` 等共享依赖）。额外安装 Wrangler：`npm install -g wrangler` 或在仓库根目录执行一次 `npx wrangler --version` 以按需拉取。
2. 登录 Cloudflare：`npx wrangler login`。
3. 本地模拟：`npm run worker:dev`（等价于 `wrangler dev --local worker/src/index.js`），前端的 `VITE_API_BASE` 指向 `http://127.0.0.1:8787` 或命令行提示的地址即可调试。
4. 部署：`npm run worker:deploy`。首次会根据 `wrangler.toml` 中的 `name` 创建 Worker，并输出如 `https://heytea-diy-worker.<subdomain>.workers.dev` 的地址。
5. 将线上前端（例如 Cloudflare Pages/Vercel/静态站）中的 `VITE_API_BASE` 或 `.env.production` 指向上一步的 Worker 域名，所有 `/api/*` 调用都会由 Worker 在边缘请求喜茶官方 API。

如需自定义 Worker 名称、KV、Routes 等，可修改根目录的 `wrangler.toml`。

## 目录结构

```
frontend/  # Vite + Vue3 前端
server/    # Express 代理层（本地/自建服务器使用）
shared/    # Express 与 Worker 复用的配置、加解密逻辑
worker/    # Cloudflare Worker 入口
```

开发环境下，`frontend/.env.development` 默认指向 `http://localhost:8787`。如需自定义，修改该文件或通过环境变量覆盖 `VITE_API_BASE`。
