import { createClient } from '@supabase/supabase-js';

const ARK_BASE_URL = process.env.ARK_BASE_URL ?? 'https://ark.cn-beijing.volces.com/api/v3';
const ARK_API_KEY = process.env.ARK_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing server-side Supabase environment variables. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const serverSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function assertArkConfig() {
  if (!ARK_API_KEY) {
    throw new Error('Missing ARK_API_KEY environment variable.');
  }

  return {
    apiKey: ARK_API_KEY,
    baseUrl: ARK_BASE_URL,
  };
}

export function mapModel(_model: string) {
  return 'doubao-seedance-2-0-260128';
}

export async function arkFetch(path: string, init?: RequestInit) {
  const { apiKey, baseUrl } = assertArkConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ark API error (${response.status}): ${text}`);
  }

  return response.json();
}
