# Docuflow Hub: Comprehensive Beginner's User Guide

Welcome to **Docuflow Hub**! This step-by-step user guide is designed for new users and administrators to easily understand and operate every feature of the Docuflow Hub document management and approval workflow system.

---

## Table of Contents
1. [System Overview & Key Concepts](#1-system-overview--key-concepts)
2. [Step 1: Sign-In & Workspace Navigation](#step-1-sign-in--workspace-navigation)
3. [Step 2: User Onboarding & HR Setup (Admins Only)](#step-2-user-onboarding--hr-setup-admins-only)
4. [Step 3: Setting Branch Approval Limits (Admins Only)](#step-3-setting-branch-approval-limits-admins-only)
5. [Step 4: Configuring Document Approval Workflows (Admins Only)](#step-4-configuring-document-approval-workflows-admins-only)
6. [Step 5: Generating & Capturing Documents](#step-5-generating--capturing-documents)
7. [Step 6: Reviewing & Approving Documents](#step-6-reviewing--approving-documents)
8. [Step 7: Finance Payment Execution](#step-7-finance-payment-execution)
9. [Step 8: Viewing Routing Audit Logs](#step-8-viewing-routing-audit-logs)

---

## 1. System Overview & Key Concepts

Docuflow Hub automates financial and operational document creation, scanning, approval routing, and audit tracking across physical branch locations and Head Office tiers.

### Key Concepts to Know:
- **Originating Branch**: The physical branch location associated with a staff member (derived automatically from their HR record).
- **Branch Approval Limit**: The maximum transaction amount a branch can approve locally before escalating to Head Office.
- **Workflow Scope (`Branch` vs `Head Office`)**: Defines whether a stage is handled locally at the branch or at Head Office.
- **Mandatory Stage (`isRequired`)**: A stage switch that forces documents to stop for approval regardless of transaction size.
- **Quorum**: The minimum number of approver signatures required to pass a stage.

---

## Step 1: Sign-In & Workspace Navigation

1. Open your browser and navigate to the Docuflow Hub web application URL.
2. Sign in with your registered single sign-on or system credentials.
3. The main sidebar provides quick access to:
   - **Dashboard**: Overview of document activity and pending tasks.
   - **Document Capture**: Create new documents, upload PDFs, or scan hard copies.
   - **Documents Queue**: View draft, submitted, approved, and paid documents.
   - **Settings**: Admin maintenance controls (Users, Parameters, Branch Limits, Document Approval Setup, Beneficiary Setup).

---

## Step 2: User Onboarding & HR Setup (Admins Only)

Admins onboard staff members by connecting to the organization's HR employee system:

1. Navigate to **Settings $\rightarrow$ Users Tab**.
2. Click **Add New User**.
3. Select an employee from the HR employee dropdown. The system automatically populates their name, work email, employee ID, and official **Originating Branch**.
4. Select the user's **System Role** (e.g. *Requester*, *Approver*, *Finance*, or *Admin*).
5. Enter the user's **Approval Limit** (individual signing authority capacity).
6. If the role is **Approver**, upload the staff member's **Digital Signature** image (PNG/JPG format).
7. Click **Save User**.

---

## Step 3: Setting Branch Approval Limits (Admins Only)

Branch limits define when a document can be finalized locally at a branch vs when it must escalate to Head Office:

1. Navigate to **Settings $\rightarrow$ Branch Approval Limits Tab**.
2. Locate the card for the branch (e.g. *Main Branch* or *Retail Operations Branch*).
3. Enter the monetary ceiling for that branch in the **Approval Limit** input field.
   > **Note**: If a branch shows a red `"Limit Required"` badge, it must be configured immediately so staff can process high-value requests.
4. Click **Save Limit**.

---

## Step 4: Configuring Document Approval Workflows (Admins Only)

Admins configure stage-by-stage approval rules for specific document types (e.g., Payment Vouchers, Memos):

1. Navigate to **Settings $\rightarrow$ Document Approval Setup Tab**.
2. Click **Add New** (or edit an existing document setup).
3. Select the **Document Type** and enter the **Number of Approval Stages** (1–10).
4. For each stage step, configure:
   - **Stage Name**: e.g., *Branch Operations Review* or *Head of Administration*.
   - **Workflow Scope**: Select `Branch Flow` (local branch staff) or `Head Office Flow` (executive tiers).
   - **Stage Threshold**: Monetary limit ceiling for this stage.
   - **Mandatory Stage (`isRequired`)**: Enable the switch if documents **MUST STOP** for approval at this stage regardless of amount.
   - **Quorum**: Minimum number of approver signatures required.
   - **Select Approvers**: Check the eligible approvers for this stage.
5. Click **Save All**.

---

## Step 5: Generating & Capturing Documents

1. Navigate to **Document Capture** from the navigation menu.
2. Select the **Document Type** (e.g., *Payment Voucher*).
3. For transactional documents:
   - Enter the **Requested Amount**.
   - Select the **Beneficiary Account Number**.
   - Note the **Originating Branch Banner**: The system displays your branch and current approval limit. If the amount exceeds your branch limit, a amber **Escalation Alert** banner appears.
4. Enter the **Document Details** description.
5. Upload a PDF file or click **Scan Document** to capture hardcopy pages via your connected scanner.
6. Click **Confirm Upload** to generate a unique Document ID.
7. Click **Save as Draft** or **Submit for Approval**.

---

## Step 6: Reviewing & Approving Documents

1. Approvers receive instant websocket and email notifications when a document reaches their queue.
2. Open **Documents Queue $\rightarrow$ Pending Approvals**.
3. Click **View Details** on a document to inspect:
   - Request details, requested amount, and beneficiary information.
   - Embedded PDF document viewer.
   - The interactive **Routing Path** showing current and upcoming stages.
4. Click **Approve**:
   - Add an optional comment or recommended amount.
   - The system automatically stamps your digital signature onto the document audit trail.
5. Or click **Reject**:
   - Enter a mandatory decline reason. Rejections notify the requester immediately.

---

## Step 7: Finance Payment Execution

1. Once a financial document receives all required approvals, its status updates to **APPROVED**.
2. Users with the **Finance** role access the document under **Pending Payments**.
3. Click **Execute Payment** to initiate the bulk account transfer to the beneficiary account.
4. Upon successful core banking response, the document status updates to **PAID**.

---

## Step 8: Viewing Routing Audit Logs

To inspect the full transparent history of any document:
1. Click **View Details** on any document card.
2. Scroll to the **Routing Audit Log** section.
3. Review:
   - Timestamps and digital signatures for every approval step.
   - Audit explanations for skipped intermediate stages (e.g. *"Stage 2 Skipped: Amount 50,000 > Stage Limit 10,000; isRequired = false"*).
   - Fallback auto-escalation notes if a branch pool had no active staff available.

---

*Docuflow Hub User Guide — Generated for Production Deployment.*
