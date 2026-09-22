const assert = require("assert");

function evaluateApprovalStep({ userLimit, requestedAmount, isMD, isLastStage }) {
  const isSufficient = isMD || (userLimit > 0 && requestedAmount <= userLimit);
  const isFullyApproved = isSufficient || isLastStage;
  return {
    isFullyApproved,
    status: isFullyApproved ? "APPROVED" : "PENDING"
  };
}

function sortApproversByLeastLimit(approvers) {
  return [...approvers].sort((a, b) => a.approval_limit - b.approval_limit);
}

function testLeastLimitEngine() {
  console.log("Running Least-Limit Workflow Engine Tests...");

  // Test 1: Sorting approvers by limit ASC
  const mockApprovers = [
    { id: 2, name: "Manager B", approval_limit: 50000 },
    { id: 1, name: "Supervisor A", approval_limit: 10000 },
    { id: 3, name: "MD Top Tier", approval_limit: 999999999 }
  ];
  const sorted = sortApproversByLeastLimit(mockApprovers);
  assert.strictEqual(sorted[0].name, "Supervisor A");
  assert.strictEqual(sorted[1].name, "Manager B");
  assert.strictEqual(sorted[2].name, "MD Top Tier");
  console.log("✓ Test 1 Passed: Approvers correctly sequenced by lowest limit first");

  // Test 2: Lower-limit sign off forces escalation when amount exceeds limit
  const res1 = evaluateApprovalStep({ userLimit: 10000, requestedAmount: 30000, isMD: false, isLastStage: false });
  assert.strictEqual(res1.status, "PENDING");
  console.log("✓ Test 2 Passed: 10,000 limit sign-off for 30,000 request escalates (PENDING)");

  // Test 3: Higher-limit sign off completes document early
  const res2 = evaluateApprovalStep({ userLimit: 50000, requestedAmount: 30000, isMD: false, isLastStage: false });
  assert.strictEqual(res2.status, "APPROVED");
  console.log("✓ Test 3 Passed: 50,000 limit sign-off for 30,000 request completes document immediately (APPROVED)");

  // Test 4: MD unlimited signing authority unconditionally completes document
  const res3 = evaluateApprovalStep({ userLimit: 999999999, requestedAmount: 5000000, isMD: true, isLastStage: false });
  assert.strictEqual(res3.status, "APPROVED");
  console.log("✓ Test 4 Passed: MD sign-off unconditionally approves 5,000,000 request (APPROVED)");

  console.log("ALL LEAST-LIMIT ENGINE TESTS PASSED!");
}

testLeastLimitEngine();
