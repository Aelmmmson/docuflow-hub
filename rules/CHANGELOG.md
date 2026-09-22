# DocuFlow Hub - System Update Changelog Rule

This file maintains a concise, structured changelog of system updates, bug fixes, and architectural enhancements.

---

## [1.3.0] - 2026-09-18

### Added
- **TWAIN Document Scanner Integration**: Added native scanner capture support via Asprise ScannerJS (`//cdn.asprise.com/scannerjs/scanner.js`) and `pdf-lib` PDF assembly.
- **Dual Capture Selector**: Upgraded `FileUpload.tsx` with a dual tab interface (`Upload PDF File` vs `Scan Document`) matching system UI/UX.
- **Scanner Component**: Created `Scanner.tsx` supporting TWAIN hardware scanner interaction, base64 PNG capture, multi-page PDF compilation, error boundary alerts, and auto-upload to server endpoint `http://10.203.14.169/dms/scan/insert_doc_api.php`.
- **Auto Token Assignment**: Integrated scanned document token/ID back into `DocumentForm.tsx`, enabling instant document viewing (`/dms/filesearch-${documentId}`) and single-click *Save as Draft*.

### Fixed
- **Scanned PDF Page Dimension Scaling**: Fixed page size mismatch in `Scanner.tsx` by scaling scanned image streams onto standard A4 PDF pages (`595.28 x 841.89 pt`).
- **Signature Sheet Header Stale Count Fix**: Removed static `TOTAL APPROVALS: N` count text from `documentStamper.ts` header bar to eliminate stale approval counts as new approval cards are appended.
- **Gmail Email Logo Rendering Fix**: Replaced unattached `cid:usg-logo` Content-ID references and broken external HTTP image requests in `emailService.js` with a 100% bulletproof pure HTML/CSS USG brand badge (`#0b64f4` rounded tile), guaranteeing instant, zero-error rendering across Gmail app, iOS, Android, and desktop clients without broken image boxes.

### Security
- **Password Reset Exposure Hardening**: Updated `/user/forgot-password` endpoint in `backend/controllers/users.js` and `Login.tsx` to strictly deliver temporary passwords via email (`notifyPasswordReset`) and remove on-screen password disclosure and clipboard copying.

---

## [1.2.0] - 2026-09-17

### Added
- **Document Type Approver Guard**: Added real-time verification when selecting a Document Type in `DocumentForm.tsx`.
- **Approver Verification API**: Created GET `/v1/api/dms/verify-doctype-approvers/:doctypeId` to check if a Document Type has configured, active approvers.
- **Form Guarding**: Disabled the *Save as Draft* button and displayed inline alert banners if a Document Type has no approvers configured or has inactive required approvers.

### Fixed
- **Single Approver Workflow Bug**: Fixed `approveDoc` in `backend/controllers/approvalActivity.js` where documents with a single approver were not updating status to `APPROVED`.
- **Stage Level Calculation**: Fixed `max_approval_level` calculation to evaluate maximum active stage in `doc_approvers` and `doc_approval_setups`.
- **Primary Key Matching**: Updated document lookup queries to support both numeric `id` and string `doc_id` (`WHERE rd.id = ? OR rd.doc_id = ?`).
- **Quorum Safety Cap**: Automatically capped stage quorum at total assigned approvers count (`Math.min(quorum, countAllApprovers)`).

---

## Instructions for Future System Updates
Whenever a new feature, bug fix, or security update is applied to DocuFlow Hub:
1. Append an entry under the appropriate version section with date (`YYYY-MM-DD`).
2. Use clear categories: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`.
3. Keep entries brief, concise, and focused on functional impact.
