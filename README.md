# xDMS — DocuFlow Hub (Enterprise Document Management & Workflow Automation System)

**xDMS (DocuFlow Hub)** is an enterprise-grade Document Management, Core Banking Integration, and Workflow Approval Automation platform. It enables organizations to capture documents via local PDF upload or direct TWAIN scanner hardware integration, validate beneficiary accounts against Core Banking systems in real-time, execute multi-tier quorum-based approval matrices, apply digital PDF signature stamps, and maintain verifiable audit trails.

---

## Key System Highlights & Core Capabilities

- **TWAIN Hardware Document Scanning**: Direct client-side hardware scanner capture integration supporting Fujitsu (fi-8170), Canon, HP, Epson, and Kodak TWAIN/WIA scanners via Asprise ScannerJS and `pdf-lib` PDF assembly.
- **Dual Document Capture Options**: Seamless selector allowing users to switch between local **Upload PDF File** dropzone and **Scan Document via Scanner** mode directly in document capture forms and edit modals.
- **Aspect-Ratio Preserved A4 Page Standardizer**: Automatic compilation of scanned image streams onto standard A4 PDF pages (`595.28 x 841.89 points`), preventing visual scaling discrepancies when appending digital approval signature trail sheets.
- **Real-Time Core Banking Integration**: Direct connection to Core Banking REST API (`http://10.203.14.33:8181`) for live expense account fetching and real-time beneficiary account lookup (`/account/lookup/account-number`).
- **Silent Debounced Account Lookup**: Automatic 450ms debounced verification displaying account description, currency, customer name, and branch details with inline visual indicators.
- **Dynamic Multi-Stage Approval Matrix**: Configurable approval workflows with stage quorum rules, supporting both mandatory and optional approver stages.
- **Real-Time Approver Verification Guard**: Form pre-validation checking if a selected Document Type has configured, active approvers before allowing draft generation or submission.
- **Role & Status Change Conflict Deadlock Safeguards**: Backend pre-validation (`/check-user-engagement`, `/remove-user-from-approvals`) and frontend guard modals preventing user role changes or deactivations that would break stage quorums or create unassigned approval stages.
- **Digital PDF Signature Overlay Engine**: Client-side PDF stamper embedding approver signatures, approval audit trails, timestamp watermarks, and clean numeric reference IDs (`1785747836`) for filesearch retrieval.
- **Finance Approval History Tab**: Specialized queue and historical audit trail for financial review and payment settlement.

---

## Hardware Scanner & Driver Requirements

To enable direct physical document scanning from connected scanner devices (e.g., **Fujitsu fi-8170**, **Canon MF series**, **Epson**, **HP**), the client workstation requires the following components:

### 1. Hardware Scanner Driver (TWAIN / WIA)
- The manufacturer's official TWAIN driver must be installed in Windows so Plug and Play detects the scanner (`Status: OK`).
- **Fujitsu fi Series**: Install the **PaperStream IP (TWAIN)** package (`PSIPTWAIN-3_*.exe`). Download from the [Official Fujitsu / Ricoh Portal](https://www.pfu-us.ricoh.com/scanners/fi/fi-8170#document-and-driver-downloads).
- **Canon / Other Brands**: Install the manufacturer's TWAIN / WIA driver software bundle.

### 2. Asprise Scanner Daemon Service
- Web browsers cannot access physical USB/TWAIN hardware directly due to browser security sandboxing. Asprise ScannerJS communicates with a background daemon listening on local WebSocket port `ws://127.0.0.1:9713`.
- **Installer**: Install `scan-setup.exe` (or run `java -jar asprise_scan.jar`).
- **Daemon Launcher Script**: A startup batch script is provided at `C:\Users\USG\Downloads\start-scanner-daemon.bat`:
  ```cmd
  C:\Users\USG\Downloads\start-scanner-daemon.bat
  ```
- **Service Verification**: Verify the daemon is listening on port `9713`:
  ```powershell
  Get-NetTCPConnection -LocalPort 9713
  ```

---

## Technology Stack

### Frontend

- **Framework**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Shadcn UI Components, Lucide Icons
- **Document Scanner Engine**: Asprise ScannerJS (`//cdn.asprise.com/scannerjs/scanner.js`)
- **PDF Assembly & Overlay**: Client-side `pdf-lib` for multi-page scanned PDF generation, page scaling, and signature stamp overlays
- **State & Routing**: React Router DOM v6, React Query, React Context

### Backend

- **Runtime**: Node.js & Express REST API
- **Database**: MySQL / MariaDB (Raw SQL & Prisma ORM support)
- **HTTP Gateway**: Axios (Core Banking integration with `x-api-key`, `x-api-secret`, `X-FORWARDED-FOR` headers)
- **Document Storage API**: Direct upload gateway to `http://10.203.14.169/dms/scan/insert_doc_api.php`
- **Authentication**: JWT, bcrypt password hashing, HTTP-only cookie support

---

## Core API Architecture

### Base URL

`http://localhost:5000/v1/api/dms`

### Key API Routes

| Module | Method | Endpoint | Description |
| --- | --- | --- | --- |
| **Auth** | `POST` | `/user/login` | User authentication & JWT issuance |
| **Auth** | `POST` | `/user/xauth-login` | SSO Callback Authentication |
| **Auth** | `GET` | `/user/logout` | Session destruction |
| **Users** | `GET` | `/get-users` | Fetch user directory |
| **Users** | `GET` | `/check-user-engagement/:userId` | Check active setup conflicts before role/status update |
| **Users** | `DELETE` | `/remove-user-from-approvals/:userId` | Safely remove user from approval setups |
| **Users** | `PUT` | `/update-user/:userId` | Update user role and status |
| **Core Banking** | `GET` | `/get-expense-accounts` | Proxied Core Banking expense accounts lookup |
| **Core Banking** | `GET` | `/get-account-lookup/:accountNumber` | Real-time Core Banking account number lookup |
| **Beneficiary** | `GET` | `/get-all-beneficiary-accounts` | List active beneficiary accounts |
| **Beneficiary** | `POST` | `/add-beneficiary-account` | Register new beneficiary account |
| **Approvals** | `GET` | `/get-approver-setups` | Fetch document approval setup matrices |
| **Approvals** | `POST` | `/create-doc-approvers-setup` | Create multi-tier approval matrix setup |
| **Documents** | `GET` | `/verify-doctype-approvers/:doctypeId` | Real-time check for configured, active approvers |
| **Documents** | `POST` | `/generate-doc` | Create new document request |
| **Documents** | `PUT` | `/submit-doc/:docId` | Submit document for multi-stage approval |
| **Documents** | `GET` | `/get-pending-docs` | Fetch documents pending user approval |
| **Documents** | `PUT` | `/approve-doc` | Advance document stage with approval comment & signature |
| **Documents** | `PUT` | `/reject-doc` | Decline document request |
| **Documents** | `GET` | `/get-approval-comments/:docId` | Retrieve complete approval trail history |

---

## Setup & Local Development

### 1. Prerequisites

- Node.js v18+
- MySQL / MariaDB Server
- Java Runtime (JRE 8+) for Asprise Scan Daemon (if using physical hardware scanner)

### 2. Environment Configuration (`backend/.env`)

```env
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/docuflow_db
JWT_SECRET=your_jwt_secret_key
CORE_BANKING_BASE_URL=http://10.203.14.33:8181
CORE_BANKING_API_KEY=test_PC
CORE_BANKING_API_SECRET=testPC
CORE_BANKING_FORWARDED_FOR=10.203.18.114
```

### 3. Frontend Configuration (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/v1/api/dms
```

### 4. Running the Backend

```bash
cd backend
npm install
npm run start
```

### 5. Running the Frontend

```bash
npm install
npm run dev
```

### 6. Starting the Scanner Background Daemon (For TWAIN Scanners)

```cmd
C:\Users\USG\Downloads\start-scanner-daemon.bat
```

### 7. Production Build

```bash
npm run build
```

---

## Postman Collection

Import the included Postman collection file (`./postman`) into Postman to test all endpoints. Set `{{base_url}}` to `http://localhost:5000`.
