# DocuFlow Hub (Enterprise Document Management & Tiered Approval Workflow Automation System)

**DocuFlow Hub** is an enterprise-grade Document Management, Core Banking Integration, and Workflow Approval Automation platform. It enables organizations to capture documents via local PDF upload or direct TWAIN scanner hardware integration, validate beneficiary accounts against Core Banking systems in real-time, execute two-tier limit-driven approval matrices (Branch Flow & Head Office Flow), apply digital PDF signature stamps, and maintain verifiable audit trails.

---

## Key System Highlights & Core Capabilities

- **Two-Tier Limit-Driven Approval Hierarchy**: 
  - **Branch Approval Flow**: Governed by local branch thresholds and local branch approvers.
  - **Head Office Approval Flow**: Triggers when amounts exceed branch limits, starting with mandatory Head of Administration review.
- **Universal Stage-Level `isRequired` Toggle**: Allows admins to flag any stage (Branch or Head Office) as mandatory (`isRequired = true`), enforcing a stop for approval regardless of transaction amount.
- **Smart Tier Skipping**: Skips non-mandatory intermediate stages (`isRequired = false`) for high-value transactions, jumping directly to the qualified executive tier.
- **Dynamic Branch Limit Ceiling Management**: Dedicated **Branch Approval Limits Tab** under Settings allows admins to manage monetary limits for each physical branch location.
- **Unconfigured Branch Limit Alerts**: Replaces fallback default assumptions with mandatory warning alerts on document forms and branch setting cards.
- **TWAIN Hardware Document Scanning**: Direct client-side hardware scanner capture integration supporting Fujitsu (fi-8170), Canon, HP, Epson, and Kodak TWAIN/WIA scanners via Asprise ScannerJS and `pdf-lib` PDF assembly.
- **Dual Document Capture Options**: Selector allowing users to switch between local **Upload PDF File** dropzone and **Scan Document via Scanner** mode.
- **Real-Time Core Banking Integration**: Direct connection to Core Banking REST API (`http://10.203.14.33:8181`) for live expense account fetching and real-time beneficiary account lookup.
- **Digital PDF Signature Overlay Engine**: Client-side PDF stamper embedding approver signatures, approval audit trails, timestamp watermarks, and clean numeric reference IDs (`1785747836`).
- **Comprehensive Beginner User Guide**: Includes a dedicated `HELP.md` user guide providing step-by-step instructions for non-technical users.

---

## Hardware Scanner & Driver Requirements

To enable direct physical document scanning from connected scanner devices (e.g., **Fujitsu fi-8170**, **Canon MF series**, **Epson**, **HP**), the client workstation requires:

### 1. Hardware Scanner Driver (TWAIN / WIA)
- Official TWAIN driver installed in Windows so Plug and Play detects the scanner (`Status: OK`).
- **Fujitsu fi Series**: Install **PaperStream IP (TWAIN)** package (`PSIPTWAIN-3_*.exe`) from the [Official Fujitsu / Ricoh Portal](https://www.pfu-us.ricoh.com/scanners/fi/fi-8170#document-and-driver-downloads).

### 2. Asprise Scanner Daemon Service
- Asprise ScannerJS communicates with a background daemon listening on local WebSocket port `ws://127.0.0.1:9713`.
- **Installer**: Install `scan-setup.exe` (or run `java -jar asprise_scan.jar`).
- **Daemon Launcher Script**: `C:\Users\USG\Downloads\start-scanner-daemon.bat`:
  ```cmd
  C:\Users\USG\Downloads\start-scanner-daemon.bat
  ```
- **Service Verification**:
  ```powershell
  Get-NetTCPConnection -LocalPort 9713
  ```

---

## Technology Stack

### Frontend
- **Framework**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Shadcn UI Components, Lucide Icons
- **Document Scanner Engine**: Asprise ScannerJS (`//cdn.asprise.com/scannerjs/scanner.js`)
- **PDF Assembly & Overlay**: Client-side `pdf-lib` for multi-page scanned PDF generation and signature stamp overlays
- **State & Routing**: React Router DOM v6, React Query, React Context

### Backend
- **Runtime**: Node.js & Express REST API
- **Database**: MySQL / MariaDB (`dms_db_live` on port `3307`)
- **HTTP Gateway**: Axios (Core Banking integration with `x-api-key`, `x-api-secret`, `X-FORWARDED-FOR` headers)
- **Document Storage API**: Direct upload gateway to `http://10.203.14.169/dms/scan/insert_doc_api.php`
- **Authentication**: JWT, bcrypt password hashing, HTTP-only cookie support

---

## Environment Configuration (`backend/.env`)

```env
PORT=8087
DATABASE_URL="mysql://root:@127.0.0.1:3307/dms_db_live"
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=dms_db_live
DB_PORT=3307

# Frontend Application URL
APP_BASE_URL=http://localhost:8046

# Core Banking Integration Configuration
CORE_BANKING_BASE_URL=http://10.203.14.33:8181
CORE_BANKING_API_KEY=test_PC
CORE_BANKING_API_SECRET=testPC
CORE_BANKING_FORWARDED_FOR=10.203.18.114
```

---

## Setup & Local Development

### 1. Database Schema Migration (`dms_db_live`)

Ensure your MariaDB instance is running on port 3307, then run the schema migration script:

```bash
cd backend
node scripts/apply_tiered_schema.js
```

### 2. Running the Backend Server

```bash
cd backend
npm install
npm run start
```

### 3. Running the Frontend App

```bash
npm install
npm run dev
```

### 4. Production Build

```bash
npm run build
```

---

## User Help & Documentation

For detailed step-by-step instructions on operating Docuflow Hub (from admin sign-in and user onboarding to document creation, approvals, and audit logs), refer to the included **[HELP.md](./HELP.md)** guide.
