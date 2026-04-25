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
      .select('id,total_tokens,estimated_cost,created_at')
      .gte('created_at', startAt)
      .lte('created_at', endAt);

    if (error) throw error;

    const rows = data ?? [];
    const totalCalls = rows.length;
    const totalTokens = rows.reduce((sum, row) => sum + (row.total_tokens ?? 0), 0);
    const estimatedCost = rows.reduce((sum, row) => sum + Number(row.estimated_cost ?? 0), 0);
    const monthlyRemainingTokens = 0;

    return res.status(200).json({
      range,
      totalCalls,
      totalTokens,
      estimatedCost,
      monthlyRemainingTokens,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load personal overview.',
    });
  }
}
