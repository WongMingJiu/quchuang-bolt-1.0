import type { VercelRequest, VercelResponse } from '@vercel/node';
import { arkFetch, serverSupabase } from '../_seedance.js';
import {
  extractTaskError,
  extractTaskLastFrameUrl,
  extractTaskThumbnailUrl,
  extractTaskVideoUrl,
} from '../_seedance-task-result.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const generationId = req.query.id;

    if (typeof generationId !== 'string') {
      return res.status(400).json({ error: 'Missing generation id' });
    }

    const { data: generation, error: selectError } = await serverSupabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .single();

    if (selectError || !generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    if (!generation.provider_task_id) {
      return res.status(400).json({ error: 'Generation has no provider task id' });
    }

    const arkResponse = await arkFetch(`/contents/generations/tasks/${generation.provider_task_id}`, {
      method: 'GET',
    });

    const status = arkResponse.status;
    const videoUrl = extractTaskVideoUrl(arkResponse);
    const thumbnailUrl = extractTaskThumbnailUrl(arkResponse) ?? generation.thumbnail_url ?? null;
    const lastFrameUrl = extractTaskLastFrameUrl(arkResponse) ?? generation.last_frame_url ?? null;
    const updatePayload: Record<string, unknown> = {
      provider: 'seedance',
      error_message: null,
    };

    if (status === 'succeeded') {
      updatePayload.status = 'completed';
      updatePayload.video_url = videoUrl;
      updatePayload.thumbnail_url = thumbnailUrl;
      updatePayload.last_frame_url = lastFrameUrl;
      updatePayload.completed_at = new Date().toISOString();
    } else if (status === 'failed') {
      updatePayload.status = 'failed';
      updatePayload.error_message = extractTaskError(arkResponse) ?? 'Seedance generation failed.';
    } else {
      updatePayload.status = 'generating';
    }

    const { data: updated, error: updateError } = await serverSupabase
      .from('generations')
      .update(updatePayload)
      .eq('id', generationId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ generation: updated, providerTask: arkResponse });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to query Seedance generation task.',
    });
  }
}
