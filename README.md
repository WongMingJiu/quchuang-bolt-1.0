# quchuang-bolt-1.0

一个基于 `Vite + React + TypeScript + Supabase + Vercel Functions` 的 AIGC 视频创作项目，现已支持对接火山方舟 `Seedance 2.0` 企业版。

## 本地开发

1. 安装依赖：`npm install`
2. 创建本地环境变量文件 `.env.local`：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ARK_API_KEY=your-ark-api-key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_SEEDANCE_MODEL=doubao-seedance-2-0-260128
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

3. 启动开发服务：`npm run dev -- --host 0.0.0.0`
4. 打开浏览器访问终端输出的本地地址

### 开发模式说明

- 开发环境未配置 Supabase 时，应用会自动进入本地 demo 模式，便于预览 UI。
- 生产构建若缺少 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_ANON_KEY`，应用会直接报错，避免误发布成 demo 数据源。
- 真实 Seedance 生成需要同时配置 `ARK_API_KEY` 与 `SUPABASE_SERVICE_ROLE_KEY`。

## Supabase 初始化

项目自带建表 SQL：
- `supabase/migrations/20260416154221_create_aigc_platform_tables.sql`
- `supabase/migrations/20260418123000_add_seedance_task_fields.sql`
- `supabase/migrations/20260419100000_sync_generation_modes_and_audio.sql`
- `supabase/migrations/20260420093000_add_last_frame_url.sql`
- `supabase/migrations/20260420103000_add_category_and_storyboard_type.sql`

在 Supabase 控制台的 `SQL Editor` 中按顺序执行上述文件，可完成：
- 创建 `generations` 表
- 开启 RLS
- 配置演示站点所需的匿名 `SELECT / INSERT / UPDATE` 权限
- 新增 Seedance 任务追踪字段
- 同步最新 4 种模式约束
- 新增 `generate_audio` / `watermark`
- 新增 `last_frame_url`
- 插入示例数据

> 演示版默认不允许匿名 `DELETE`，避免公开站点被任意清空数据。

## Supabase Storage 配置

请创建公开 bucket：`generation-assets`

用途：
- 存放图生视频的参考图片
- 存放视频生视频的参考视频
- 生成前端上传素材后，使用公开 URL 交给 Seedance

## Seedance 接入说明

当前已支持四种模式：
- `omni-reference`：图片 / 视频 / 音频混合参考，最多 9 个文件
- `image-to-video-first-last`：必须上传 2 张图片（首帧 / 尾帧）
- `image-to-video`：最多 9 张图片
- `text-to-video`：无需上传素材

当前还支持两个业务字段：
- `所属品类`：太极、唱歌、瑜伽、普拉提、手机摄影
- `分镜类型`：口播类、情景类、IP代练

支持文件类型：
- 图片：`jpeg` `jpg` `png` `webp` `bmp` `tiff` `gif`
- 视频：`mp4` `mov`
- 音频：`wav` `mp3`

服务端通过 Vercel API Routes 调用火山方舟：
- `POST /api/generate`
- `GET /api/generate/:id`

Seedance 相关环境变量：
- `ARK_API_KEY`
- `ARK_BASE_URL`（可选，默认 `https://ark.cn-beijing.volces.com/api/v3`）
- `ARK_SEEDANCE_MODEL`（可选，默认 `doubao-seedance-2-0-260128`）

Supabase 服务端环境变量：
- `SUPABASE_SERVICE_ROLE_KEY`

## 发布准备

### 构建命令

- `npm run build`

### 输出目录

- `dist`

### 必需环境变量

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ARK_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- 可选：`ARK_BASE_URL`

### 推荐发布平台

- Vercel

### Vercel 配置

- Build Command: `npm run build`
- Output Directory: `dist`
- Node 版本建议：`20+`
- 将以上环境变量添加到 `Production / Preview / Development`

## 输入交互增强

当前创作输入框支持以下交互：
- 直接在提示词输入框中粘贴本地图片 / 视频 / 音频文件，自动上传到 `generation-assets`
- 上传成功后，自动把对应的 `@资源名` 插入到当前光标位置
- 输入 `@` 时，弹出当前已上传资产列表，可继续插入引用
- 资产显示名按上传顺序自动命名：
  - `图片1`、`图片2`
  - `视频1`、`视频2`
  - `音频1`、`音频2`
- `@` 选择器支持：
  - 键盘上下选择
  - Enter 选中
  - Esc 关闭
  - mention 整块删除
  - 当前高亮项自动滚动跟随

说明：
- `@引用` 目前属于前端写作辅助能力，不参与服务端 prompt 结构化解析
- 服务端仍然只依据 `media_uploads` 构造 Seedance 的 `content`

## 播放预览交互

当前历史记录与资产页已统一使用弹层播放器：
- hover 时显示播放按钮
- 鼠标移出后播放按钮隐藏
- 支持播放 / 暂停 / 进度条 / 全屏 / 下载
- 支持快捷键：Space / F / M / ← / → / Esc
- 头部展示模式、品类、分镜、比例、时长、声音、水印、来源任务时间

## 交付说明

项目交付说明详见：`delivery-notes.md`

## 后续建议

## 校验命令

- `npm run typecheck`
- `npm run build`
