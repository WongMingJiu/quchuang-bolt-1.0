# quchuang-bolt-1.0

一个基于 `Vite + React + TypeScript + Supabase` 的 AIGC 视频创作演示项目。

## 本地开发

1. 安装依赖：`npm install`
2. 创建本地环境变量文件 `.env.local`：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. 启动开发服务：`npm run dev -- --host 0.0.0.0`
4. 打开浏览器访问终端输出的本地地址

### 开发模式说明

- 开发环境未配置 Supabase 时，应用会自动进入本地 demo 模式，便于预览 UI。
- 生产构建若缺少 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_ANON_KEY`，应用会直接报错，避免误发布成 demo 数据源。

## Supabase 初始化

项目自带建表 SQL：`supabase/migrations/20260416154221_create_aigc_platform_tables.sql`

在 Supabase 控制台的 `SQL Editor` 中执行该文件内容，可完成：
- 创建 `generations` 表
- 开启 RLS
- 配置演示站点所需的匿名 `SELECT / INSERT / UPDATE` 权限
- 插入示例数据

> 演示版默认不允许匿名 `DELETE`，避免公开站点被任意清空数据。

## 发布准备

### 构建命令

- `npm run build`

### 输出目录

- `dist`

### 必需环境变量

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 推荐发布平台

- Vercel
- Netlify
- 任意支持静态文件托管的平台

### Vercel / Netlify 配置

- Build Command: `npm run build`
- Output Directory: `dist`
- Node 版本建议：`20+`

## 演示版限制

- “立即生成” 当前仍为前端模拟生成流程，不会调用真实 AI 视频接口。
- 为支持演示体验，匿名用户仍可创建与更新任务记录（例如收藏、状态回写）。
- 如果需要正式商用发布，建议新增鉴权、后端任务队列、对象存储和更严格的 RLS 策略。

## 校验命令

- `npm run typecheck`
- `npm run build`
