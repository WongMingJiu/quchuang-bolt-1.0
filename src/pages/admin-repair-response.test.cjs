const test = require('node:test');
const assert = require('node:assert/strict');

async function parseRepairResponse(response) {
  const raw = await response.text();
  if (!raw.trim()) {
    throw new Error(`修复旧视频预览接口返回空响应（HTTP ${response.status}）。请确认本地开发环境已接通 /api 路由。`);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`修复旧视频预览接口返回了无法解析的响应（HTTP ${response.status}）。`);
  }
}

test('parseRepairResponse throws a clear error for empty non-JSON bodies', async () => {
  const response = {
    status: 404,
    async text() {
      return '';
    },
  };

  await assert.rejects(
    () => parseRepairResponse(response),
    /空响应（HTTP 404）/,
  );
});
