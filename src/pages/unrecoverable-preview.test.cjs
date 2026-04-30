const test = require('node:test');
const assert = require('node:assert/strict');

function isUnrecoverablePreview(generation) {
  return generation.status === 'completed' && generation.error_message === '视频源已失效，无法恢复预览';
}

test('isUnrecoverablePreview detects completed records marked as source expired', () => {
  const generation = {
    status: 'completed',
    error_message: '视频源已失效，无法恢复预览',
  };

  assert.equal(isUnrecoverablePreview(generation), true);
});
