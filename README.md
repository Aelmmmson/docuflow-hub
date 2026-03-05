# DocuFlow Hub (xDMS) 🚀

A modern, high-performance, web-based Document Management System (DMS) built with React, Vite, and Tailwind CSS. Designed to streamline organizational document capture, enforce strict approval workflows, and manage complex system configurations.

![DocuFlow Hub](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Core Features](#-core-features)
- [Technical Architecture](#-technical-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Integration](#-api-integration)
- [🔮 Future Roadmap & Ideas](#-future-roadmap--ideas)

---

## 🎯 Overview

DocuFlow Hub (xDMS) replaces legacy paper trails with a slick, fully digital ecosystem. It empowers teams to upload documents, securely route them through dynamic approval chains based on financial limits and quorums, and provides administrators with absolute control over employee and parameter management.

### Key Capabilities
- **Effortless Document Capture:** Upload, categorize, and track documents in real-time.
- **Dynamic Approval Workflows:** Configure multi-stage approvals with exact required quorums and mandatory approvers.
- **Live User & Employee Syncing:** Instantaneous search and mapping of internal HR employees to DMS accounts.
- **Financial Tracking:** Native tracking of transaction types, paid expenses, and account mapping.

---

## ✨ Core Features

### 📊 Dashboard Engine
- **Real-Time Analytics:** Visualize Generated, Approved, Unapproved, and Rejected document volumes.
- **Financial Breakdowns:** Recharts-powered bar charts and doughnut graphs detailing document categories and paid expenses.
- **Smart Date Filtering:** Fully dynamic custom range filters that operate flawlessly across desktop and mobile.

### 📝 Document Capture & Enquiry
- **Streamlined Requests:** Form validations enforced using `zod` and `react-hook-form`.
- **Enquiry Tab:** Deep-search historical documents and view detailed rejection/approval audit trails.
- **Modern UI Cards:** Minimalistic, animated Document Cards that visually communicate status via subtle colored indicators.

### ⚙️ System Settings & Configurations
- **Combobox Lookups:** Replaced lagging dropdowns with virtualized, searchable popovers powered by `@tanstack/react-query` to immediately filter through thousands of employees.
- **Approval Engine Setup:** Build custom approval stages. If a quorum is `1`, the app natively prevents multi-selection using Radio Buttons to enforce rules strictly.

---

## 🛠 Technical Architecture

The architecture prioritizes developer experience (DX), application speed, and robust typing.

- **Frontend Framework:** `React 18` + `TypeScript`
- **Build System:** `Vite` + `@vitejs/plugin-react-swc` for blazing fast HMR.
- **Styling & UI:** 
  - `Tailwind CSS` for utility-first styling.
  - `shadcn/ui` (Radix Primitives) for accessible, unstyled core components.
  - `Framer Motion` for fluid micro-animations.
- **Data Management:**
  - `@tanstack/react-query` for intelligent API caching and background fetching.
  - `Axios` interceptors for seamless global error handling and network failure detection.
- **Form State:** `react-hook-form` + `zod` schema validation.
- **Icons:** `lucide-react`

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── capture/          # Document upload, logic, and Enquiry layouts
│   ├── dashboard/        # Analytical charts and core metrics
│   ├── layout/           # AppSidebar, Header, Layout Wrappers
│   ├── settings/         # Admin tabs (Users, Parameters, Approval Setups)
│   ├── shared/           # Reusable generic components (DataTable, DateFilter)
│   ├── skeletons/        # Loading placeholders for queries
│   └── ui/               # Base shadcn/ui generic components (Buttons, Inputs)
├── hooks/                # Custom React hooks
├── lib/
│   ├── api.ts            # Centralized Axios configs & Response Error logic
│   ├── auth.ts           # Authentication and token parsing logic
│   └── utils.ts          # Helper functions (cn formatting, getErrorMessage)
├── pages/                # Top-level Page Views (Dashboard, Approval)
├── index.css             # Tailwind base styles and CSS Theme Variables
└── main.tsx              # Application React DOM Entry
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aelmmmson/docuflow-hub.git
   cd docuflow-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🔌 API Integration

All API calls are intercepted through `src/lib/api.ts` to automatically attach Bearer tokens. 
**Global Network Handling:** If a network drop occurs, the system's `getErrorMessage` utility automatically intercepts the `ERR_NETWORK` code and broadcasts a clean UI warning.

---

## 🔮 Future Roadmap & Ideas

To truly scale DocuFlow Hub into an enterprise powerhouse, here are some creative avenues and architectural concepts to pursue in the future:

### 1. AI-Powered OCR (Optical Character Recognition)
- **Concept:** Integrate AWS Textract, Google Cloud Vision, or a local python-based ML model via the backend.
- **Why:** When users upload a physical invoice/receipt, the system can automatically auto-fill the `Amount`, `Vendor Name`, and `Date` fields during Document Capture, drastically reducing human data-entry errors.
- **Execution:** Connect a serverless function that triggers when a file is uploaded to the `/capture` endpoint. The function parses the binary data through an OCR API, returning a structured JSON payload that is mapped directly into the React Hook Form values via `setValue()`.

### 2. Deep Analytics & Forecasting
- **Concept:** Enhance the Dashboard with predictive modeling.
- **Why:** Analyze historical turnaround times for document approvals. The system could alert Originators if a specific approver currently has a "bottleneck" (e.g., "This manager usually takes 3 days to approve. Consider expediting").
- **Execution:** Utilize `recharts` to build a time-series graph. Fetch metadata tracking approval timestamps and run a simple moving average algorithm on the backend to predict future delay times, rendering dynamic UI alert badges on the dashboard cards.

### 3. Progressive Web App (PWA) & Offline Mode
- **Concept:** Configure `vite-plugin-pwa` and Service Workers.
- **Why:** Allow executives to view and cache pending approvals while on a flight or commuting. They can click "Approve" while offline, and the app will sync the mutations with the server the moment their network is restored.
- **Execution:** Implement `@tanstack/react-query`'s offline mutation queue (`onlineManager`). Store the fetched approval lists in `IndexedDB`. When the network status switches back to online, background sync processes the queued approval POST requests automatically.

### 4. Advanced Audit Trails & Version Control
- **Concept:** Implement a visual timeline (like Git history) for documents.
- **Why:** Right now, documents are tracked via status. A full version control system would allow auditors to see *who* changed the document amount, *when* it was changed, and view side-by-side diffs of previous metadata vs new metadata.
- **Execution:** Modify the `DocumentCard` and Enquiry tables to include a "History" modal. The backend will store an append-only ledger of JSON diffs. The frontend parses these diffs to visually highlight deleted (red) and added (green) text for monetary amounts or workflow changes.

### 5. Configurable Webhooks & Integrations
- **Concept:** Add a "Webhooks" configuration panel in Settings.
- **Why:** Upon a document hitting "APPROVED" status, automatically dispatch a JSON payload to a corporate Slack/Microsoft Teams channel, or trigger a webhook that fires off a Zapier action to notify the finance department via an external ERP system.
- **Execution:** Create a new `WebhooksTab.tsx` component in Settings with inputs for Callback URLs and Authorization Headers. Hook this into a backend event listener that fires HTTP POST requests asynchronously whenever the document state machine reaches `APPROVED` or `PAID`.

### 6. Bulk Actions & Smart Batch Approvals (UI/UX & Functional)
- **Concept:** Implement an interactive data grid that allows Approvers to select multiple similar requests and approve them simultaneously.
- **Execution:** Extend the `DataTable` component with bulk-select checkboxes (using `@tanstack/react-table` row selection state). Create a batch API endpoint (`/batch-approve`) that accepts an array of document IDs. Provide a summary modal confirming the total financial amount being approved before submission.

### 7. In-App Document Annotation & Preview (UI/UX)
- **Concept:** Allow users to view and draw on attached files directly within the Enquiry/Approval modal without downloading them.
- **Execution:** Integrate `react-pdf` for native PDF rendering and a canvas overlay library (like `fabric.js` or `tldraw`) for annotations. Users can highlight specific line items on an invoice, and those annotations are saved back to the server as attached metadata or an overlaid image layer.

### 8. Custom Workspace Theming & White-Labeling (UI/UX)
- **Concept:** Enable enterprise clients or distinct departments to customize the color palette and logo of the DMS directly from the UI.
- **Execution:** Expand the existing `next-themes` setup. Instead of hardcoding HSL variables in `index.css`, dynamically inject a `<style>` block into the document head based on a "theme profile" fetched from a `/get-tenant-config` endpoint. This allows for fully personalized branding per organization.

### 9. Legally Binding E-Signatures (Functional)
- **Concept:** Require cryptographic digital signatures on high-value documents before they can hit "Paid" status.
- **Execution:** Integrate with the DocuSign API or Adobe Sign API. When a document passes the final internal approval stage, a webhook triggers an e-signature envelope generation. Only when the callback from the signature provider confirms completion does thexDMS flag it as fully signed.

### 10. Temporary Role Delegation (Functional)
- **Concept:** Allow Approvers going on leave to safely delegate their approval authority to a peer for a specified time window.
- **Execution:** Add a "Delegation" tab in Settings. The UI will feature a date-range picker (`react-day-picker`) and a user combobox. The backend will intercept authorization checks: if an approver is out of office, the system temporarily grants their assigned delegate the rights to authorize specific workflows within that date range.
