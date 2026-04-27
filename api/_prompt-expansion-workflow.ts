import { callPromptExpander } from './_prompt-expander.js';

interface ParsedPromptIntent {
  subject: string;
  action: string;
  scene: string;
  lighting_mood: string;
  camera: string;
  style: string;
  quality: string;
  constraints: string[];
}

interface ExpandedPromptStructure {
  core_setting: string;
  motion_and_camera: string;
  quality_and_constraints: string;
}

interface PromptExpansionItem {
  id: string;
  title: string;
  prompt: string;
}

const INPUT_INTERPRETATION_PROMPT = `你是 Seedance 2.0 提示词工程的输入解析器。
请将用户提供的一句粗略视频需求，解析成后续生成阶段可直接消费的结构化语义。

要求：
1. 必须忠于用户原始需求，不要改写主体、核心动作或用途；
2. 每个字段都应尽量给出一个清晰、单一、可执行的主锚点，不要同时给多个相互竞争的方向；
3. 如果用户信息很少，可以做保守推断，但不要臆造复杂剧情；
4. subject 要体现主体身份和最关键的外观锚点；
5. action 要体现动作主线和用途定位，例如教学演示、节奏舞蹈、产品展示；
6. scene 要给出一个尽量具体的主场景，而不是空泛词语；
7. camera 只能保留一个主导运镜方向；
8. style、lighting_mood、quality 要偏生成可用，不要只写空泛形容词；
9. constraints 要优先输出工程化稳定性约束，例如面部稳定、肢体自然、手部正确、无穿模、无明显形变、无异常闪烁；
10. 只返回 JSON，不要解释，不要输出 markdown。

输出结构：
{
  "subject": "主体身份 + 外观锚点",
  "action": "动作主线 + 用途定位",
  "scene": "具体主场景锚点",
  "lighting_mood": "光线与氛围方向",
  "camera": "单一主导运镜",
  "style": "视觉风格倾向",
  "quality": "画质倾向",
  "constraints": ["基础稳定性约束1", "基础稳定性约束2"]
}`;

const STRUCTURED_ENRICHMENT_PROMPT = `你是 Seedance 2.0 提示词工程优化器。
请基于已有结构化语义，扩展成更稳定的生成上下文，用于后续候选提示词生成。

要求：
1. 必须保留用户原始意图，不要脱离主题扩写无关剧情；
2. 必须明确：主体身份与外观锚点、主场景、动作主线、主运镜、光线氛围、风格方向、画质要求、约束条件；
3. 运镜只能保留一个主导镜头语言，不要混入互相冲突的多种运镜；
4. 约束条件要偏工程化，优先包括人物面部稳定、肢体自然、手部正确、无穿模、无明显形变、无异常闪烁；
5. 不要写成列表解释，不要输出 markdown；
6. 输出内容应能直接供下一步生成三段式正式提示词。

只返回 JSON，不要解释。
输出结构：
{
  "core_setting": "主体身份、外观、环境、时间、氛围的一体化设定",
  "motion_and_camera": "动作主线 + 单一主运镜 + 节奏变化",
  "quality_and_constraints": "风格、光影、画质、稳定性与防崩坏约束"
}`;

const CANDIDATE_GENERATION_PROMPT = `你是 Seedance 2.0 高级提示词优化器。
请基于完整上下文生成 3 条高质量候选提示词，风格尽量接近稳定的 sd2-pe 工程化输出。

总要求：
1. 三条候选都必须忠于原始需求，不能改变主体和核心动作；
2. 每条都必须写成适合直接生成的视频提示词正文，而不是说明文；
3. 每条都必须体现三段式结构：
   - 第一段：主体、外观、场景、时间、整体氛围
   - 第二段：动作主线、节奏变化、单一主运镜
   - 第三段：风格、光影、画质、稳定性与防崩坏约束
4. 不要输出列表，不要输出解释，不要输出 markdown；
5. 不要编造素材引用、asset id、@图1、@视频1；
6. 不要写互相冲突的运镜；同一条候选里只保留一个主导镜头语言；
7. 每条都要包含清晰的工程化约束：人物面部稳定、肢体自然、手部结构正确、无穿模、无明显形变、无异常闪烁、细节清晰。

三条候选的分工：
- opt-1：最稳妥、最标准、最适合直接生产使用的版本；
- opt-2：保持同一核心意图，但换一个更鲜明的场景氛围或环境表达；
- opt-3：保持同一核心意图，但换一个更电影化的镜头推进或视觉风格侧重；

差异要求：
- 三条不能只是换同义词；
- 差异应主要体现在场景氛围、镜头语言、风格侧重；
- 不能因为做差异化而偏离原始用途。

只返回 JSON，不要解释。
输出结构：
{
  "items": [
    {"id": "opt-1", "title": "优化结果 1", "prompt": "..."},
    {"id": "opt-2", "title": "优化结果 2", "prompt": "..."},
    {"id": "opt-3", "title": "优化结果 3", "prompt": "..."}
  ]
}`;

function normalizePromptExpansionItem(item: unknown, index: number): PromptExpansionItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const prompt = typeof (item as { prompt?: unknown }).prompt === 'string'
    ? (item as { prompt: string }).prompt.trim()
    : '';

  if (!prompt) {
    return null;
  }

  const id = typeof (item as { id?: unknown }).id === 'string' && (item as { id: string }).id.trim()
    ? (item as { id: string }).id.trim()
    : `opt-${index + 1}`;

  const title = typeof (item as { title?: unknown }).title === 'string' && (item as { title: string }).title.trim()
    ? (item as { title: string }).title.trim()
    : `优化结果 ${index + 1}`;

  return {
    id,
    title,
    prompt,
  };
}

async function parseJsonContent(result: any) {
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Prompt expansion model returned empty content.');
  }

  const normalizedContent = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');

  try {
    return JSON.parse(normalizedContent);
  } catch {
    throw new Error('Prompt expansion model returned invalid JSON content.');
  }
}

export async function parsePromptIntent(draftPrompt: string): Promise<ParsedPromptIntent> {
  const result = await callPromptExpander({
    draftPrompt: `${INPUT_INTERPRETATION_PROMPT}\n\n用户输入：${draftPrompt}`,
  });
  return parseJsonContent(result) as Promise<ParsedPromptIntent>;
}

export async function expandPromptStructure(parsedIntent: ParsedPromptIntent): Promise<ExpandedPromptStructure> {
  const result = await callPromptExpander({
    draftPrompt: `${STRUCTURED_ENRICHMENT_PROMPT}\n\n输入语义：${JSON.stringify(parsedIntent, null, 2)}`,
  });
  return parseJsonContent(result) as Promise<ExpandedPromptStructure>;
}

export async function generatePromptCandidates(
  draftPrompt: string,
  parsedIntent: ParsedPromptIntent,
  expandedStructure: ExpandedPromptStructure,
): Promise<PromptExpansionItem[]> {
  const result = await callPromptExpander({
    draftPrompt: `${CANDIDATE_GENERATION_PROMPT}\n\n原始需求：${draftPrompt}\n\n输入语义：${JSON.stringify(parsedIntent, null, 2)}\n\n完整上下文：${JSON.stringify(expandedStructure, null, 2)}`,
  });
  const parsed = await parseJsonContent(result);
  const items = Array.isArray(parsed?.items)
    ? parsed.items
        .map((item: unknown, index: number) => normalizePromptExpansionItem(item, index))
        .filter((item): item is PromptExpansionItem => Boolean(item))
    : [];

  if (!items.length) {
    throw new Error('Prompt expansion model returned no usable candidates.');
  }

  return items;
}

export async function runPromptExpansionWorkflow(draftPrompt: string): Promise<PromptExpansionItem[]> {
  const parsed = await parsePromptIntent(draftPrompt);
  const expanded = await expandPromptStructure(parsed);
  return generatePromptCandidates(draftPrompt, parsed, expanded);
}
