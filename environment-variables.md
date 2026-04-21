# 最终环境变量总表

## 前端环境变量

### `VITE_SUPABASE_URL`
Supabase 项目 URL。

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
```

### `VITE_SUPABASE_ANON_KEY`
前端访问 Supabase 的匿名 key。

```env
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 服务端环境变量

### `ARK_API_KEY`
火山方舟 / Seedance API Key。

```env
ARK_API_KEY=your-ark-api-key
```

### `ARK_BASE_URL`
Ark API 根地址。

```env
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

### `ARK_SEEDANCE_MODEL`
当前服务端实际调用的 Seedance 模型 ID。

```env
ARK_SEEDANCE_MODEL=doubao-seedance-2-0-260128
```

### `SUPABASE_SERVICE_ROLE_KEY`
服务端高权限写库 key。

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 推荐完整示例

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

ARK_API_KEY=your-ark-api-key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_SEEDANCE_MODEL=doubao-seedance-2-0-260128

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 作用归纳

| 变量名 | 使用位置 | 作用 |
|---|---|---|
| `VITE_SUPABASE_URL` | 前端 + 服务端 | Supabase 项目地址 |
| `VITE_SUPABASE_ANON_KEY` | 前端 | 匿名访问 Supabase |
| `ARK_API_KEY` | 服务端 | 调用 Seedance |
| `ARK_BASE_URL` | 服务端 | Ark 接口根地址 |
| `ARK_SEEDANCE_MODEL` | 服务端 | 指定当前模型 ID |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 | 高权限写库 |
