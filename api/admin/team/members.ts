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
      .select('id,created_at,total_tokens,estimated_cost,provider')
      .gte('created_at', startAt)
      .lte('created_at', endAt)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data ?? [];

    const items = [
      {
        id: 'current-user',
        name: '当前用户',
        role: '默认角色',
        calls: rows.length,
        tokens: rows.reduce((sum, row) => sum + (row.total_tokens ?? 0), 0),
        cost: rows.reduce((sum, row) => sum + Number(row.estimated_cost ?? 0), 0),
        monthlyRemainingTokens: 0,
        lastUsedAt: rows[0]?.created_at ?? null,
      },
    ];

    return res.status(200).json({ items, range });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load team member usage.',
    });
  }
}
