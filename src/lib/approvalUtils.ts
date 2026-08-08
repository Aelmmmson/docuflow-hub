// src/lib/approvalUtils.ts

export interface AwaitingApprover {
  name: string;
  role: string;
  stage: number;
  isMandatory: boolean;
}

export interface ApprovalComment {
  comment?: string;
  approver?: string;
  activity_id?: number;
  signature?: string;
  role_name?: string;
  created_at?: string;
  approval_stage?: number | string;
}

/**
 * Computes the awaiting approvers list for a document based on approval matrix stages,
 * comments history, and stage mandatory/optional rules.
 *
 * Rules:
 * - If no optional approver has approved in stage N, both unsigned mandatory and unsigned optional approvers are shown.
 * - Once 1 optional approver has approved in stage N, optional approvers are excluded from awaiting list for stage N,
 *   so ONLY unsigned mandatory approvers are shown.
 */
export function computeAwaitingApprovers(
  docSetupDetails: string | any[],
  currentStageNum: number,
  comments: (ApprovalComment | any)[] = [],
  documentStatus?: string
): AwaitingApprover[] {
  const awaitingApprovers: AwaitingApprover[] = [];

  if (!docSetupDetails) return awaitingApprovers;

  // Once a document is declined/rejected, no approver can perform any action
  const isDeclined =
    (documentStatus && (documentStatus.toUpperCase().includes("REJECT") || documentStatus.toUpperCase().includes("DECLIN"))) ||
    comments.some((c: any) => {
      const act = String(c.action || c.status || "").toUpperCase();
      return act.includes("REJECT") || act.includes("DECLIN");
    });

  if (isDeclined) return [];

  let stages: any[] = [];
  try {
    stages = typeof docSetupDetails === "string" ? JSON.parse(docSetupDetails) : docSetupDetails;
  } catch (e) {
    console.warn("[APPROVAL UTILS] Error parsing setup details:", e);
    return awaitingApprovers;
  }

  if (!Array.isArray(stages)) return awaitingApprovers;

  // We check ONLY the document's active current stage
  stages.forEach((stageItem: any, idx: number) => {
    const stageNum = idx + 1;
    if (stageNum === currentStageNum && stageItem.approvers && Array.isArray(stageItem.approvers)) {
      // Find approvals recorded for this stage
      const stageComments = comments.filter((c) => {
        if (c.approval_stage !== undefined && c.approval_stage !== null) {
          return Number(c.approval_stage) === stageNum;
        }
        // Fallback: match approver name
        return stageItem.approvers.some(
          (a: any) => a.name?.toLowerCase() === c.approver?.toLowerCase()
        );
      });

      // Check if any optional approver has ALREADY approved in this stage
      const optionalApproved = stageItem.approvers.some((appr: any) => {
        if (appr.isMandatory) return false;
        return stageComments.some(
          (c) => c.approver?.toLowerCase() === appr.name?.toLowerCase()
        );
      });

      const quorum = Number(stageItem.quorum || 1);
      const hasMandatoryApprover = stageItem.approvers.some((appr: any) => appr.isMandatory);

      stageItem.approvers.forEach((appr: any) => {
        const hasSigned = comments.some(
          (c) => c.approver?.toLowerCase() === appr.name?.toLowerCase()
        );

        if (!hasSigned) {
          // If quorum is 1 and a mandatory approver exists, optional approvers are excluded
          const excludeOptionalBecauseQuorumOne = quorum === 1 && hasMandatoryApprover && !appr.isMandatory;

          if (!excludeOptionalBecauseQuorumOne && (appr.isMandatory || !optionalApproved)) {
            awaitingApprovers.push({
              name: appr.name,
              role: `Stage ${stageNum} ${appr.isMandatory ? "Mandatory" : "Optional"} Approver`,
              stage: stageNum,
              isMandatory: !!appr.isMandatory,
            });
          }
        }
      });
    }
  });

  return awaitingApprovers;
}
