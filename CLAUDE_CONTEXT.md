# 项目背景
本项目是一个基于 `Vite + React + TypeScript + Supabase + Vercel Functions` 的 AIGC 视频创作平台，当前已接入火山方舟 `Seedance 2.0` 企业版。

核心能力包括：
- 文生视频 / 图生视频 / 图生视频-首尾帧 / 全能参考 四种生成模式
- 提示词输入框底部工具栏（模式 / 视频参数 / 业务参数）
- 参考资产上传、粘贴上传、`@` 引用与 mention 交互
- 历史记录 / 资产页统一播放器
- 可用性标注、下载前强拦截、标注持久化
- 管理中心（团队 / 个人 / 模型权限与额度）第一版骨架

# 当前进度
- 已完成：
  - Seedance 2.0 真实调用打通
  - 四种生成模式与上传规则
  - `generate_audio` / `watermark` / `last_frame_url` 全链路
  - 提示词粘贴上传与 `@` 引用交互
  - 统一播放器与历史记录 / 资产页播放体验
  - 可用性标注功能（历史记录、资产页、下载拦截、持久化、筛选）
  - 管理中心入口、页面骨架、团队/个人/权限额度三个 tab 骨架
  - 管理中心相关数据库 migration 与后端接口骨架
- 进行中：
  - 管理中心从 mock 驱动向真实数据驱动过渡
  - 团队 / 个人 / 权限额度页面的真实接口逐步接入
- 未开始：
  - 管理中心完整真实数据联调
  - 权限额度编辑真实保存
  - 个人 / 团队详情抽屉接真实接口
  - 管理中心图表、自定义时间范围、高级统计

# 当前运行状态
- 创作工作台主链路（生成、预览、标注、下载拦截）当前是**真实可用**的。
- 管理中心当前是**前端可见 + 可交互骨架**，团队页、个人页、权限页都可见且主要按钮有交互，但仍以 **mock 数据为主**。
- 当前决策：**暂不继续推进管理中心真实数据接入**，先将管理中心作为稳定的前端骨架保留，后续再统一处理 `/api/admin/*` 本地代理 / Vercel dev / 真实联调问题。
- 本地直接请求 `/api/admin/*` 在纯 `vite dev` 环境下可能返回非 JSON，因此当前策略是：
  - 管理中心页面优先保持 mock 驱动稳定可见
  - 后端 `/api/admin/*` 文件先独立落地，后续再统一接真实数据与本地代理

# 当前任务
资产体系重构：把当前资产统一整理为创作资产、参考资产、IP老师资产三类，并让资产页切换成三大 tab，同时限制可用性标注只作用于创作资产。

# 下一步计划
1. 先在类型和数据库层增加资产分类字段：`asset_category`、`asset_media_type`、`ip_asset_type`
2. 改造资产页为三大 tab：创作资产 / 参考素材 / IP老师
3. 给 IP老师 tab 增加形象 / 场景二级筛选
4. 收口标注逻辑，让非创作资产不显示标注与下载拦截

# 当前风险 / 注意事项
- 管理中心当前仍以 mock 驱动为主，不应误判为已经完成真实数据接入。
- 本地 `vite dev` 直接访问 `/api/admin/*` 可能得到非 JSON 响应，导致 `Unexpected token` 错误；需要后续统一处理本地 API 代理 / Vercel dev。
- 当前决策：管理中心真实数据接入暂缓，优先保持其前端骨架稳定可演示。
- 资产体系即将重构，现有资产页逻辑后续会发生较大调整。
- `quchuang-bolt-1.0/` 目录不要误提交。
- `.claude/` 目录不要提交。
- 标注功能依赖数据库字段，确保相关 migration 已执行。

# 本地访问入口
- 本地前端开发地址通常落在 `http://localhost:5173` ~ `http://localhost:5177` 之间，以当前终端输出为准。
- 当前重点验证入口：
  - 创作工作台
  - 历史记录
  - 资产页
  - 管理中心

# 关键约束 / 技术栈
- 使用：
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Supabase（Postgres + Storage）
  - Vercel Functions
  - Seedance 2.0（Ark）
- 不使用：
  - 复杂审计表（当前管理中心先复用 `generations` 做统计来源）
  - 自定义时间范围（当前先只做预设时间范围）
  - 多模型前端切换（前端当前只保留 `Seedance 2.0`）

# 重要代码位置
- `src/App.tsx`
- `src/types/index.ts`
- `src/lib/supabase.ts`
- `src/pages/CreationPage.tsx`
- `src/pages/AssetsPage.tsx`
- `src/components/creation/PromptInput.tsx`
- `src/components/creation/UploadArea.tsx`
- `src/components/history/HistoryCard.tsx`
- `src/components/media/VideoPreviewModal.tsx`
- `src/components/annotation/UsabilityAnnotationModal.tsx`
- `src/pages/AdminCenterPage.tsx`
- `src/components/admin/TeamDashboardTab.tsx`
- `src/components/admin/PersonalDashboardTab.tsx`
- `src/components/admin/QuotaManagementTab.tsx`
- `src/components/admin/MemberUsageDrawer.tsx`
- `src/components/admin/QuotaEditDrawer.tsx`
- `api/_seedance.ts`
- `api/generate.ts`
- `api/generate/[id].ts`
- `api/admin/_utils.ts`
- `api/admin/team/overview.ts`
- `api/admin/team/members.ts`
- `api/admin/team/members/[id]/usages.ts`
- `api/admin/personal/overview.ts`
- `api/admin/personal/usages.ts`
- `api/admin/quotas.ts`
- `api/admin/quotas/[id].ts`
- `supabase/migrations/20260416154221_create_aigc_platform_tables.sql`
- `supabase/migrations/20260418123000_add_seedance_task_fields.sql`
- `supabase/migrations/20260419100000_sync_generation_modes_and_audio.sql`
- `supabase/migrations/20260420093000_add_last_frame_url.sql`
- `supabase/migrations/20260420103000_add_category_and_storyboard_type.sql`
- `supabase/migrations/20260421103000_add_usability_annotation_fields.sql`
- `supabase/migrations/20260424110000_add_generation_usage_stats.sql`
- `supabase/migrations/20260424111000_create_model_quota_assignments.sql`
