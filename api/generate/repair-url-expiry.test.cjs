const test = require('node:test');
const assert = require('node:assert/strict');

function isValidHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function isExpiredSignedUrl(value, now = new Date('2026-04-30T07:06:52Z')) {
  if (typeof value !== 'string') return false;
  const match = value.match(/[?&]Expires=([^&]+)/i);
  if (!match) return false;

  const expiresAt = Date.parse(match[1]);
  if (!Number.isFinite(expiresAt)) return false;

  return expiresAt <= now.getTime();
}

function needsRepairUrl(value) {
  if (value == null) return true;
  if (typeof value !== 'string') return true;
  const normalized = value.trim();
  if (!normalized) return true;
  if (normalized === '[object Object]') return true;
  if (!isValidHttpUrl(normalized)) return true;
  return isExpiredSignedUrl(normalized);
}

test('needsRepairUrl marks expired signed URLs as broken even when they are valid https URLs', () => {
  const expiredUrl = 'https://example.com/video.mp4?Expires=2026-04-23T04:42:08Z&Signature=abc';
  assert.equal(needsRepairUrl(expiredUrl), true);
});
