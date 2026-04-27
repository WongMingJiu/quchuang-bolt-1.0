import { runPromptExpansionWorkflow } from './_prompt-expansion-workflow.js';

export function getPromptExpandErrorMessage(error) {
  if (!(error instanceof Error)) {
    return 'Prompt expansion failed.';
  }

  if (error.message.includes('timed out')) {
    return '提示词扩写超时，请稍后重试。';
  }

  if (error.message.includes('no usable candidates')) {
    return '扩写服务未返回可用候选结果，请稍后重试。';
  }

  if (error.message.includes('invalid JSON')) {
    return '扩写服务返回格式异常，请稍后重试。';
  }

  return error.message;
}

export async function handlePromptExpandRequest(draftPrompt) {
  return runPromptExpansionWorkflow(draftPrompt.trim());
}
