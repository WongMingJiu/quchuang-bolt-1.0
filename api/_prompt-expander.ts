const PROMPT_EXPANDER_BASE_URL = process.env.PROMPT_EXPANDER_BASE_URL;
const PROMPT_EXPANDER_API_KEY = process.env.PROMPT_EXPANDER_API_KEY;
const PROMPT_EXPANDER_SKILL = process.env.PROMPT_EXPANDER_SKILL ?? 'sd2-pe';

export function getPromptExpanderConfig() {
  if (!PROMPT_EXPANDER_BASE_URL) {
    throw new Error('Missing PROMPT_EXPANDER_BASE_URL environment variable.');
  }

  return {
    baseUrl: PROMPT_EXPANDER_BASE_URL,
    apiKey: PROMPT_EXPANDER_API_KEY,
    skill: PROMPT_EXPANDER_SKILL,
  };
}

export async function callPromptExpander(payload: {
  draftPrompt: string;
}) {
  const { baseUrl, apiKey, skill } = getPromptExpanderConfig();

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      skill,
      draftPrompt: payload.draftPrompt,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Prompt expander error (${response.status}): ${text}`);
  }

  return response.json();
}
