const assert = require("assert");

/**
 * Universal Workflow Engine Stage Resolver (Unit Testable Pure Function)
 *
 * Evaluates sequence of stages for transaction amount A and originating branch.
 */
function resolveWorkflowStages(stages, transactionAmount, branchApproversAvailable = true) {
  const resolvedPath = [];

  stages.forEach((stage, index) => {
    const isFirstStage = index === 0;
    const threshold = parseFloat(stage.threshold_amount || stage.thresholdAmount || 0);
    const isRequired = Boolean(stage.is_required || stage.isRequired);
    const scope = stage.scope || (isFirstStage ? "BRANCH" : "HEAD_OFFICE");

    // Empty branch pool fallback check
    if (scope === "BRANCH" && !branchApproversAvailable) {
      resolvedPath.push({
        stage: stage.name,
        action: "FALLBACK_ESCALATED_TO_HO",
        reason: "No active approvers available in branch pool for this tier."
      });
      return;
    }

    // Universal evaluation rule
    if (isRequired) {
      resolvedPath.push({
        stage: stage.name,
        action: "ENFORCED",
        reason: "Stage is flagged as Mandatory (isRequired = true)."
      });
    } else if (transactionAmount <= threshold || isFirstStage) {
      resolvedPath.push({
        stage: stage.name,
        action: "ENFORCED",
        reason: `Transaction amount GHS ${transactionAmount} is within threshold GHS ${threshold}.`
      });
    } else {
      resolvedPath.push({
        stage: stage.name,
        action: "SKIPPED",
        reason: `Transaction amount GHS ${transactionAmount} exceeds threshold GHS ${threshold}; stage is non-mandatory (isRequired = false).`
      });
    }
  });

  return resolvedPath;
}

// ────────────────────────────────────────────────
// Test Suite Execution
// ────────────────────────────────────────────────
function runTests() {
  console.log("=== Running Workflow Engine Unit Tests ===");

  const sampleWorkflow = [
    { name: "Branch Ops Review", scope: "BRANCH", thresholdAmount: 5000, isRequired: true },
    { name: "Head of Administration", scope: "HEAD_OFFICE", thresholdAmount: 10000, isRequired: true },
    { name: "Senior Manager Review", scope: "HEAD_OFFICE", thresholdAmount: 25000, isRequired: false },
    { name: "Executive Director", scope: "HEAD_OFFICE", thresholdAmount: 100000, isRequired: false }
  ];

  // Test 1: Small Amount (GHS 3,000)
  const path1 = resolveWorkflowStages(sampleWorkflow, 3000, true);
  assert.strictEqual(path1[0].action, "ENFORCED");
  assert.strictEqual(path1[1].action, "ENFORCED");
  assert.strictEqual(path1[2].action, "ENFORCED");
  console.log("✓ Test 1 Passed: Small amount includes initial tiers.");

  // Test 2: Large Amount (GHS 50,000) with non-mandatory skip
  const path2 = resolveWorkflowStages(sampleWorkflow, 50000, true);
  assert.strictEqual(path2[0].action, "ENFORCED"); // Branch stage (isRequired = true)
  assert.strictEqual(path2[1].action, "ENFORCED"); // Head of Admin (isRequired = true)
  assert.strictEqual(path2[2].action, "SKIPPED");  // Senior Manager (exceeded & isRequired = false)
  console.log("✓ Test 2 Passed: Non-mandatory intermediate stage skipped for high amount.");

  // Test 3: Mandatory stage enforcement regardless of amount
  const path3 = resolveWorkflowStages([
    { name: "Mandatory Risk Check", scope: "HEAD_OFFICE", thresholdAmount: 5000, isRequired: true }
  ], 500000, true);
  assert.strictEqual(path3[0].action, "ENFORCED");
  console.log("✓ Test 3 Passed: Mandatory stage enforced despite high amount.");

  // Test 4: Empty Branch Pool Fallback
  const path4 = resolveWorkflowStages(sampleWorkflow, 3000, false); // branchApproversAvailable = false
  assert.strictEqual(path4[0].action, "FALLBACK_ESCALATED_TO_HO");
  console.log("✓ Test 4 Passed: Empty branch pool triggers auto-escalation fallback.");

  console.log("=== All Workflow Engine Unit Tests Passed Successfully ===");
}

runTests();
