# 最终数据库结构总表

## 表：`generations`

| 字段名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | 主键，任务 ID |
| `prompt` | `text` | `''` | 用户输入提示词 |
| `mode` | `text` | `'text-to-video'` | 生成模式 |
| `model` | `text` | 旧表默认值可能存在 | 当前前端实际使用 `seedance2.0` |
| `category` | `text` | `'太极'` | 所属品类 |
| `storyboard_type` | `text` | `'口播类'` | 分镜类型 |
| `aspect_ratio` | `text` | `'16:9'` | 视频比例 |
| `duration` | `integer` | `10` | 视频时长（秒） |
| `generate_audio` | `boolean` | `true` | 是否有声音 |
| `watermark` | `boolean` | `false` | 是否带水印 |
| `status` | `text` | `'generating'` | 任务状态 |
| `video_url` | `text` | `null` | 成功后的视频地址 |
| `thumbnail_url` | `text` | `null` | 封面图地址 |
| `last_frame_url` | `text` | `null` | 末帧图地址 |
| `is_favorited` | `boolean` | `false` | 是否收藏 |
| `media_uploads` | `jsonb` | `'[]'` | 参考素材数组 |
| `provider` | `text` | `null` | 当前供应商（如 `seedance`） |
| `provider_task_id` | `text` | `null` | Seedance 任务 ID |
| `error_message` | `text` | `null` | 错误信息 |
| `completed_at` | `timestamptz` | `null` | 完成时间 |
| `created_at` | `timestamptz` | `now()` | 创建时间 |

## `mode` 合法值
- `omni-reference`
- `image-to-video-first-last`
- `image-to-video`
- `text-to-video`

## `category` 合法值
- `太极`
- `唱歌`
- `瑜伽`
- `普拉提`
- `手机摄影`

## `storyboard_type` 合法值
- `口播类`
- `情景类`
- `IP代练`

## `status` 合法值
- `pending`
- `generating`
- `completed`
- `failed`

## `media_uploads` JSON 结构

```json
{
  "name": "原始文件名.png",
  "displayName": "图片1",
  "path": "uploads/uuid.png",
  "publicUrl": "https://.../storage/v1/object/public/generation-assets/uploads/uuid.png",
  "type": "image",
  "size": 123456,
  "role": "reference_image"
}
```

### `role` 当前支持
- `reference_image`
- `reference_video`
- `reference_audio`
- `first_frame`
- `last_frame`
