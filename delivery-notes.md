# 最终交付说明

## 一、项目概述
本项目现已完成从演示型前端到真实 Seedance 2.0 工作流工具的升级，具备：
- 真实 Seedance 2.0 生成接入
- 四种模式创作工作流
- Supabase Storage 参考资产上传
- 提示词内粘贴上传与 `@` 资产引用
- 统一的视频预览播放器
- 业务参数（所属品类 / 分镜类型）下沉到工具栏

## 二、核心能力
### 1. 生成模式
- 文生视频
- 图生视频
- 图生视频-首尾帧
- 全能参考

### 2. 参考资产能力
- 支持图片、视频、音频上传
- 支持直接粘贴本地文件到提示词框触发上传
- 支持 `@` 引用已上传资产
- 资产自动顺序命名：图片1 / 视频1 / 音频1

### 3. 参数能力
- 视频比例：21:9 / 16:9 / 4:3 / 1:1 / 3:4 / 9:16
- 视频时长：4s~15s
- 声音开关：generate_audio
- 水印开关：watermark
- 所属品类：太极 / 唱歌 / 瑜伽 / 普拉提 / 手机摄影
- 分镜类型：口播类 / 情景类 / IP代练

### 4. 播放预览能力
- 历史记录和资产页共用统一播放器
- 支持播放 / 暂停 / 进度条 / 全屏 / 下载
- 支持快捷键：Space / F / M / ← / → / Esc
- 播放器中展示任务元信息与来源任务时间

## 三、数据库与环境变量
### 数据库新增字段
`generations` 表当前重点字段：
- mode
- category
- storyboard_type
- generate_audio
- watermark
- video_url
- thumbnail_url
- last_frame_url
- provider_task_id
- error_message

### 环境变量
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ARK_API_KEY
- ARK_BASE_URL
- ARK_SEEDANCE_MODEL

## 四、部署前检查
1. Supabase migration 全部执行完成
2. `generation-assets` bucket 已创建并可公开访问
3. Vercel 环境变量已完整配置
4. 最新代码已部署

## 五、联调建议
优先验证：
- 文生视频
- 图生视频
- 图生视频-首尾帧
- 全能参考

重点检查：
- category / storyboard_type 是否写入数据库
- generate_audio / watermark 是否写入数据库
- provider_task_id 是否生成
- video_url / last_frame_url 是否回写

## 六、后续建议
- 引入 webhook 替代前端轮询
- 细化 Storage 权限策略
- 增加任务取消与失败重试
- 继续增强 `@` 引用的富交互能力
