const test = require('node:test');
const assert = require('node:assert/strict');

function classifyRepairFailure(error) {
  const reason = error instanceof Error ? error.message : 'Unknown repair error';
  const unrecoverable = reason.includes('ResourceNotFound');

  return {
    reason: unrecoverable ? '视频源已失效，无法恢复预览' : reason,
    unrecoverable,
  };
}

test('classifyRepairFailure marks Ark ResourceNotFound as unrecoverable source loss', () => {
  const failure = classifyRepairFailure(new Error('Ark API error (404): {"error":{"code":"ResourceNotFound","message":"The specified resource is not found"}}'));
  assert.equal(failure.reason, '视频源已失效，无法恢复预览');
  assert.equal(failure.unrecoverable, true);
});
