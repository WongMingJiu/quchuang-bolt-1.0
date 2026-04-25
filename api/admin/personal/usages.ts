import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serverSupabase } from '../../_seedance.js';
import { resolveTimeRange, type AdminTimeRange } from '../_utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const range = (req.query.range as AdminTimeRange | undefined) ?? '7d';
    const { startAt, endAt } = resolveTimeRange(range);

    const { data, error } = await serverSupabase
      .from('generations')
      .select('id,created_at,model,mode,total_tokens,estimated_cost,usability_status')
      .gte('created_at', startAt)
      .lte('created_at', endAt)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = (data ?? []).map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      model: row.model,
      mode: row.mode,
      tokens: row.total_tokens ?? 0,
      cost: Number(row.estimated_cost ?? 0),
      annotationStatus: row.usability_status ?? 'pending',
    }));

    return res.status(200).json({ items, range });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load personal usage list.',
    });
  }
}
