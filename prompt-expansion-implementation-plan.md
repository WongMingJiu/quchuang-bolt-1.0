# 提示词扩写优化功能实现计划

## 一、目标

将当前“提示词扩写”功能从：
- 单次 system prompt 调用
- 简单候选输出

升级为：
> **后端多步骤工作流**
> - 输入解析
> - 结构化补全
> - 候选生成

底层仍使用：
- PackyCode OpenAI 兼容接口
- `MiniMax-M2.7`

并保持当前前端交互不变：
- 提示词扩写区位于正式提示词框上方
- 用户输入草稿提示词
- 获得候选结果
- 点击 `使用` 覆盖正式提示词框

---

## 二、整体架构

### 当前架构
```text
前端 PromptExpansionPanel
  -> /api/prompt-expand
    -> _prompt-expander.ts
      -> PackyCode /v1/chat/completions
```

### 升级后架构
```text
前端 PromptExpansionPanel
  -> /api/prompt-expand
    -> Prompt Expansion Workflow
       1. 输入解析
       2. 结构化补全
       3. 候选生成
       4. JSON 解析与收口
    -> 返回 items[]
```

---

## 三、后端工作流拆分

### Step 1：输入解析（Input Interpretation）
#### 目标
把用户非常粗糙的一句话，先转成稳定的中间语义结构。

#### 输入
前端传来：
```json
{
  "draftPrompt": "帮我生成一个太极老师教学的视频"
}
```

#### 输出（中间结构）
建议先得到类似：
```json
{
  "subject": "太极老师",
  "action": "教学演示",
  "scene": "教学场景",
  "style": "写实教学",
  "constraints": ["动作自然", "人物稳定"]
}
```

#### 说明
这一层不是直接给前端，而是后端内部使用。

---

### Step 2：结构化补全（Structured Expansion）
#### 目标
基于 Step 1 的中间语义，补足：
- 主体
- 动作
- 场景
- 光影
- 运镜
- 风格
- 画质
- 约束

#### 输出
例如：
```json
{
  "core_setting": "...",
  "motion_and_camera": "...",
  "quality_and_constraints": "..."
}
```

---

### Step 3：候选生成（Prompt Candidate Generation）
#### 目标
基于前两步结果，生成 3 条真正可直接使用的候选提示词。

#### 输出
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

### Step 4：结果解析与收口（Parsing & Normalization）
#### 目标
无论模型返回的是：
- JSON
- 半结构化文本
- 单条文本

都统一收口成前端可消费的：
```json
{
  "items": [...]
}
```

---

## 四、代码层拆分建议

### 1. 保留现有路由文件
- `api/prompt-expand.ts`

职责：
- 接收前端请求
- 调用工作流
- 返回最终 `items`

### 2. 重构 `_prompt-expander.ts`
- `api/_prompt-expander.ts`

职责：
- 读取环境变量
- 发起 PackyCode OpenAI 兼容请求
- 返回原始模型响应

### 3. 新增工作流文件
建议新增：
- `api/_prompt-expansion-workflow.ts`

职责：
- Step 1 输入解析
- Step 2 结构化补全
- Step 3 候选生成
- Step 4 JSON 收口

### 4. Prompt 常量文件
建议新增：
- `api/prompt-expansion-prompts.ts`

内容：
- `INPUT_INTERPRETATION_PROMPT`
- `STRUCTURED_ENRICHMENT_PROMPT`
- `CANDIDATE_GENERATION_PROMPT`

---

## 五、环境变量方案

建议使用：
```env
PROMPT_EXPANDER_BASE_URL=https://www.packyapi.com/v1/chat/completions
PROMPT_EXPANDER_API_KEY=...
PROMPT_EXPANDER_MODEL=MiniMax-M2.7
```

说明：
- `PROMPT_EXPANDER_SKILL` 可以不再作为运行时强依赖
- `sd2-pe` 的能力通过三阶段 prompt 规则体现

---

## 六、推荐实施顺序

### Phase 1：代码结构
1. 新建 `api/_prompt-expansion-workflow.ts`
2. 新建 `api/prompt-expansion-prompts.ts`
3. `_prompt-expander.ts` 保持只做模型调用

### Phase 2：工作流实现
4. 实现 `parsePromptIntent()`
5. 实现 `expandPromptStructure()`
6. 实现 `generatePromptCandidates()`

### Phase 3：路由收口
7. 让 `api/prompt-expand.ts` 调用 workflow
8. 统一输出 `items`

### Phase 4：联调前端
9. `PromptExpansionPanel` 调 `/api/prompt-expand`
10. 验证候选结果显示与覆盖正式提示词框

---

## 七、MVP 范围

### 本次先做
- 前端扩写区
- 后端多步骤工作流
- 真实 PackyCode 调用
- 1~3 条候选返回
- 点击 `使用` 覆盖正式提示词框

### 本次不做
- 上传资产自动注入扩写上下文
- 自动生成 `@` 引用
- 多轮澄清
- 扩写历史记录

---

## 八、后续优化

### 后续可做
- 把已上传资产（图片 / 视频 / 音频）作为扩写上下文输入
- 让扩写结果自动懂 `@图片1` / `@视频1`
- 多轮澄清模式
- 扩写结果缓存 / 历史
- 扩写结果评分与收藏
