# 最终接口说明文档

## 1. 创建任务接口

### 路由
- `POST /api/generate`

### 请求体

```json
{
  "prompt": "一个未来城市的夜晚，霓虹灯倒映在雨后的街道上，镜头缓慢推进。",
  "mode": "text-to-video",
  "model": "seedance2.0",
  "category": "太极",
  "storyboard_type": "口播类",
  "aspect_ratio": "16:9",
  "duration": 10,
  "generate_audio": true,
  "watermark": false,
  "media_uploads": []
}
```

### 支持的 `mode`
- `text-to-video`
- `image-to-video`
- `image-to-video-first-last`
- `omni-reference`

### 返回结构

```json
{
  "generation": { ...数据库记录... },
  "providerTask": { ...Ark 原始返回... }
}
```

## 2. 四种模式发给 Seedance 的结构

### 文生视频
```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "..." }
  ],
  "generate_audio": true,
  "ratio": "16:9",
  "duration": 10,
  "watermark": false
}
```

### 图生视频
```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "..." },
    { "type": "image_url", "image_url": { "url": "..." }, "role": "reference_image" }
  ],
  "generate_audio": true,
  "ratio": "16:9",
  "duration": 10,
  "watermark": false
}
```

### 图生视频-首尾帧
```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "..." },
    { "type": "image_url", "image_url": { "url": "..." }, "role": "first_frame" },
    { "type": "image_url", "image_url": { "url": "..." }, "role": "last_frame" }
  ],
  "generate_audio": false,
  "ratio": "16:9",
  "duration": 10,
  "watermark": false
}
```

### 全能参考
```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "..." },
    { "type": "image_url", "image_url": { "url": "..." }, "role": "reference_image" },
    { "type": "video_url", "video_url": { "url": "..." }, "role": "reference_video" },
    { "type": "audio_url", "audio_url": { "url": "..." }, "role": "reference_audio" }
  ],
  "generate_audio": true,
  "ratio": "21:9",
  "duration": 12,
  "watermark": false
}
```

## 3. 轮询任务接口

### 路由
- `GET /api/generate/:id`

### 行为
- 根据本地 `generation.id` 查数据库
- 拿到 `provider_task_id`
- 调用 Seedance 查询任务状态
- 写回数据库：
  - `status`
  - `video_url`
  - `thumbnail_url`
  - `last_frame_url`
  - `error_message`
  - `completed_at`

### 成功返回示例

```json
{
  "generation": {
    "status": "completed",
    "video_url": "https://.../video.mp4",
    "thumbnail_url": null,
    "last_frame_url": "https://.../last-frame.jpg"
  },
  "providerTask": {
    "status": "succeeded",
    "content": {
      "video_url": "https://.../video.mp4",
      "last_frame_url": "https://.../last-frame.jpg"
    }
  }
}
```

### 失败返回示例

```json
{
  "generation": {
    "status": "failed",
    "error_message": "..."
  },
  "providerTask": {
    "status": "failed",
    "error": {
      "code": "AccessDenied",
      "message": "..."
    }
  }
}
```
