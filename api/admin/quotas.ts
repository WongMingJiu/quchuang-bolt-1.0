import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serverSupabase } from '../_seedance.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await serverSupabase
      .from('model_quota_assignments')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const items = (data ?? []).map((row: any) => ({
      id: row.id,
      subjectName: row.subject_id,
      subjectType: row.subject_type,
      enabledModels: row.enabled_models ?? [],
      monthlyQuota: row.monthly_quota ?? 0,
      usedQuota: row.used_quota ?? 0,
      remainingQuota: row.remaining_quota ?? 0,
      status: row.status,
      note: row.note ?? '',
    }));

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load quota assignments.',
    });
  }
}
