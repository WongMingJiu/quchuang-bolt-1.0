const test = require('node:test');
const assert = require('node:assert/strict');

function extractUrlLikeValue(value) {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;

  if (typeof value.url === 'string' && value.url.trim()) return value.url;
  if (typeof value.src === 'string' && value.src.trim()) return value.src;
  if (typeof value.href === 'string' && value.href.trim()) return value.href;
  if (typeof value.uri === 'string' && value.uri.trim()) return value.uri;

  return null;
}

function extractTaskVideoUrl(payload) {
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

function needsRepairUrl(value) {
  if (value == null) return true;
  if (typeof value !== 'string') return true;
  const normalized = value.trim();
  if (!normalized) return true;
  if (normalized === '[object Object]') return true;
  return !/^https?:\/\//i.test(normalized);
}

test('extractTaskVideoUrl returns plain string url when provider returns string', () => {
  const payload = {
    content: {
      video_url: 'https://cdn.example.com/video.mp4',
    },
  };

  assert.equal(extractTaskVideoUrl(payload), 'https://cdn.example.com/video.mp4');
});

test('extractTaskVideoUrl unwraps nested url object when provider returns object', () => {
  const payload = {
    content: {
      video_url: {
        url: 'https://cdn.example.com/video.mp4',
      },
    },
  };

  assert.equal(extractTaskVideoUrl(payload), 'https://cdn.example.com/video.mp4');
});

test('extractTaskVideoUrl falls back to first item in content videos array', () => {
  const payload = {
    content: {
      videos: [
        { url: 'https://cdn.example.com/video.mp4' },
      ],
    },
  };

  assert.equal(extractTaskVideoUrl(payload), 'https://cdn.example.com/video.mp4');
});

test('needsRepairUrl marks object serialization and non-http values as broken', () => {
  assert.equal(needsRepairUrl('[object Object]'), true);
  assert.equal(needsRepairUrl('blob:abc'), true);
  assert.equal(needsRepairUrl('https://cdn.example.com/video.mp4'), false);
});
