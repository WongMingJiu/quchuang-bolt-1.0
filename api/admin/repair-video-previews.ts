import type { VercelRequest, VercelResponse } from '@vercel/node';
import { arkFetch, serverSupabase } from '../_seedance.js';
import {
  extractTaskLastFrameUrl,
  extractTaskThumbnailUrl,
  extractTaskVideoUrl,
  needsRepairUrl,
} from '../_seedance-task-result.js';

interface RepairFailure {
  id: string;
  provider_task_id: string;
  reason: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: generations, error } = await serverSupabase
      .from('generations')
      .select('id, provider_task_id, video_url, thumbnail_url, last_frame_url, status, asset_media_type')
      .eq('status', 'completed')
      .eq('asset_media_type', 'video')
      .not('provider_task_id', 'is', null);

    if (error) throw error;

    const scanned = generations?.length ?? 0;
    const matchedRows = generations ?? [];

    let repaired = 0;
    let failed = 0;
    const failures: RepairFailure[] = [];

    for (const item of matchedRows) {
      try {
        const providerTaskId = String(item.provider_task_id);
        const providerTask = await arkFetch(`/contents/generations/tasks/${providerTaskId}`, {
          method: 'GET',
        });

        const videoUrl = extractTaskVideoUrl(providerTask);
        const thumbnailUrl = extractTaskThumbnailUrl(providerTask) ?? null;
        const lastFrameUrl = extractTaskLastFrameUrl(providerTask) ?? null;

        if (!videoUrl) {
          throw new Error('Provider task did not return a playable video URL.');
        }

        const { error: updateError } = await serverSupabase
          .from('generations')
          .update({
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            last_frame_url: lastFrameUrl,
          })
          .eq('id', item.id);

        if (updateError) throw updateError;
        repaired += 1;
      } catch (repairError) {
        failed += 1;
        failures.push({
          id: String(item.id),
          provider_task_id: String(item.provider_task_id),
          reason: repairError instanceof Error ? repairError.message : 'Unknown repair error',
        });
      }
    }

    return res.status(200).json({
      scanned,
      matched: matchedRows.length,
      repaired,
      failed,
      failures: failures.slice(0, 10),
    });
  } catch (handlerError) {
    return res.status(500).json({
      error: handlerError instanceof Error ? handlerError.message : 'Failed to repair old video previews.',
    });
  }
}
