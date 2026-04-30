export function extractUrlLikeValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;

  const candidate = value as {
    url?: unknown;
    src?: unknown;
    href?: unknown;
    uri?: unknown;
  };

  if (typeof candidate.url === 'string' && candidate.url.trim()) return candidate.url;
  if (typeof candidate.src === 'string' && candidate.src.trim()) return candidate.src;
  if (typeof candidate.href === 'string' && candidate.href.trim()) return candidate.href;
  if (typeof candidate.uri === 'string' && candidate.uri.trim()) return candidate.uri;

  return null;
}

export function extractTaskVideoUrl(payload: any): string | null {
  const contentVideoUrl = extractUrlLikeValue(payload?.content?.video_url);
  if (contentVideoUrl) return contentVideoUrl;

  const rootVideoUrl = extractUrlLikeValue(payload?.video_url);
  if (rootVideoUrl) return rootVideoUrl;

  if (Array.isArray(payload?.content?.videos)) {
    for (const item of payload.content.videos) {
      const url = extractUrlLikeValue(item);
      if (url) return url;
    }
  }

  if (Array.isArray(payload?.videos)) {
    for (const item of payload.videos) {
      const url = extractUrlLikeValue(item);
      if (url) return url;
    }
  }

  return null;
}

export function extractTaskThumbnailUrl(payload: any): string | null {
  return extractUrlLikeValue(payload?.content?.thumbnail_url)
    ?? extractUrlLikeValue(payload?.thumbnail_url)
    ?? null;
}

export function extractTaskLastFrameUrl(payload: any): string | null {
  return extractUrlLikeValue(payload?.content?.last_frame_url)
    ?? extractUrlLikeValue(payload?.last_frame_url)
    ?? null;
}

export function extractTaskError(payload: any): string | null {
  return payload?.error?.message ?? payload?.error_message ?? (typeof payload?.error === 'string' ? payload.error : null);
}

export function isValidHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export function isExpiredSignedUrl(value: unknown, now = new Date()): boolean {
  if (typeof value !== 'string') return false;
  const match = value.match(/[?&]Expires=([^&]+)/i);
  if (!match) return false;

  const expiresAt = Date.parse(match[1]);
  if (!Number.isFinite(expiresAt)) return false;

  return expiresAt <= now.getTime();
}

export function needsRepairUrl(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== 'string') return true;
  const normalized = value.trim();
  if (!normalized) return true;
  if (normalized === '[object Object]') return true;
  if (!isValidHttpUrl(normalized)) return true;
  return isExpiredSignedUrl(normalized);
}
