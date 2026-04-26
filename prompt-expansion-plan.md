# 提示词扩写优化功能开发清单

## 一、目标

在创作页中新增一个“提示词扩写 / 优化”能力：

1. 放在正式提示词框上方；
2. 用户输入简短想法或草稿提示词；
3. 通过中转站 URL + API 调用官方 `sd2-pe` skill 进行优化；
4. 返回 1~3 条候选扩写结果；
5. 点击“使用”后，**覆盖正式提示词框**；
6. 保持与现有上传、`@` 引用、正式提示词主输入区兼容。

---

## 二、功能边界

### 本期包含
- 前端扩写输入区
- 扩写结果候选展示
- 后端 `POST /api/prompt-expand`
- 中转站 URL / API 调用接入
- 使用候选结果覆盖正式提示词框

### 本期不包含
- 多轮扩写对话
- 资产自动参与扩写上下文
- 自动生成 `@图片1` / `@视频1` 引用
- 历史扩写记录

---

## 三、前端任务

### Task 1：新增扩写组件
建议文件：
- `src/components/creation/PromptExpansionPanel.tsx`

能力：
- 输入草稿提示词
- 点击“扩写提示词”
- 展示 1~3 条候选结果
- 每条支持：
  - 使用
  - 可选复制

---

### Task 2：接入创作工作台
修改文件：
- `src/components/creation/CreationWorkspace.tsx`

结构建议：
```text
CreationWorkspace
 ├─ PromptExpansionPanel
 ├─ PromptInput（正式提示词框）
 └─ UploadArea
```

---

### Task 3：实现“覆盖正式提示词框”
修改文件：
- `src/components/creation/PromptExpansionPanel.tsx`
- `src/components/creation/CreationWorkspace.tsx`

要求：
- 点击 `使用` 后
- 用候选内容直接覆盖 `CreationFormState.prompt`

---

### Task 4：状态处理
前端需要明确 4 种状态：
- 空状态
- 扩写中
- 成功
- 失败

---

## 四、后端任务

### Task 5：新增扩写接口
建议文件：
- `api/prompt-expand.ts`

路由：
- `POST /api/prompt-expand`

请求体示例：
```json
{
  "draftPrompt": "帮我生成一个太极老师教学的视频"
}
```

返回示例：
```json
{
  "items": [
    { "id": "opt-1", "title": "优化结果 1", "prompt": "..." },
    { "id": "opt-2", "title": "优化结果 2", "prompt": "..." },
    { "id": "opt-3", "title": "优化结果 3", "prompt": "..." }
  ]
}
```

---

### Task 6：接入中转站 URL
建议环境变量：
- `PROMPT_EXPANDER_BASE_URL`
- `PROMPT_EXPANDER_API_KEY`
- `PROMPT_EXPANDER_SKILL=sd2-pe`

修改文件：
- `api/prompt-expand.ts`
- 建议新增 `api/_prompt-expander.ts`

---

### Task 7：封装中转站调用逻辑
建议文件：
- `api/_prompt-expander.ts`

职责：
- 读取环境变量
- 组织 skill 请求体
- 处理 headers
- 统一错误解析

---

### Task 8：按 `SKILL.md` 组织请求
参考官方 skill：
- `C:\Users\MatthewWong\Downloads\SKILL.md`

当前第一版建议：
- 只传文本 draft prompt
- 不强行把现有上传资产塞进上下文

后续可扩展：
- 让扩写器感知当前 `@图片1` / `@视频1` 体系

---

### Task 9：错误处理与超时
要处理：
- 中转站 4xx / 5xx
- 网络失败
- 返回结构异常
- 空结果
- 超时

目标：
- 前端拿到友好的错误提示
- 页面不白屏

---

## 五、配置任务

### Task 10：环境变量接入
建议增加：
```env
PROMPT_EXPANDER_BASE_URL=...
PROMPT_EXPANDER_API_KEY=...
PROMPT_EXPANDER_SKILL=sd2-pe
```

同步位置：
- `.env.local`
- Vercel 环境变量
- `README.md`
- `environment-variables.md`

---

## 六、文档任务

### Task 11：更新 README
补充：
- 提示词扩写能力说明
- 中转站相关环境变量
- 页面使用方式

### Task 12：更新 `CLAUDE_CONTEXT.md`
补充：
- 提示词扩写优化作为当前新主线 / 当前任务

### Task 13：更新 `TASKS.md`
补充：
- 当前正在推进的扩写任务
- 未来多模态扩写增强作为 backlog

---

## 七、推荐实施顺序

### Phase 1：前端骨架
1. 新增 `PromptExpansionPanel.tsx`
2. 接入 `CreationWorkspace`
3. 先用 mock 扩写结果跑通
4. 验证“使用 = 覆盖正式提示词框”

### Phase 2：后端接口
5. 新增 `api/_prompt-expander.ts`
6. 新增 `api/prompt-expand.ts`
7. 接中转站 URL 与 skill 调用

### Phase 3：前端接真实请求
8. 前端从 mock 切到 `/api/prompt-expand`
9. 加 loading / error / success 收口

### Phase 4：文档与配置
10. README / env / context / tasks 同步

---

## 八、建议的 MVP 范围

### 本轮优先做到
- 扩写输入框
- 扩写按钮
- 1~3 条候选结果
- 点击“使用”覆盖正式提示词框
- 通过中转站 URL 调后端接口

### 暂不做
- 自动把已上传资产作为扩写上下文
- 自动生成 `@` 引用
- 多轮扩写会话
- 扩写历史

---

## 九、下一步建议

最推荐的实际开发顺序是：

1. **先做前端骨架 + mock 扩写结果**
2. 交互确认后，再接中转站和后端 API

这样风险最低，也最容易快速看到价值。
