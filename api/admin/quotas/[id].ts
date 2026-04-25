import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serverSupabase } from '../../_seedance.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const id = req.query.id;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing quota assignment id' });
    }

    const body = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (Array.isArray(body.enabledModels)) {
      updates.enabled_models = body.enabledModels;
    }
    if (typeof body.monthlyQuota === 'number') {
      updates.monthly_quota = body.monthlyQuota;
    }
    if (typeof body.usedQuota === 'number') {
      updates.used_quota = body.usedQuota;
    }
    if (typeof body.remainingQuota === 'number') {
      updates.remaining_quota = body.remainingQuota;
    }
    if (body.status === 'enabled' || body.status === 'disabled') {
      updates.status = body.status;
    }
    if (typeof body.note === 'string') {
      updates.note = body.note;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await serverSupabase
      .from('model_quota_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, item: data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update quota assignment.',
    });
  }
}
