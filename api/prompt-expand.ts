import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPromptExpandErrorMessage, handlePromptExpandRequest } from './_prompt-expand-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { draftPrompt } = req.body ?? {};

    if (!draftPrompt || typeof draftPrompt !== 'string' || !draftPrompt.trim()) {
      return res.status(400).json({ error: 'draftPrompt is required.' });
    }

    const items = await handlePromptExpandRequest(draftPrompt);

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      error: getPromptExpandErrorMessage(error),
    });
  }
}
