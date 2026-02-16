# DocuFlow Hub (xDMS)

A modern, web-based Document Management System built with ReactJS, designed for efficient document capture, approval workflows, and organizational settings management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages & Components](#pages--components)
- [API Integration](#api-integration)
- [Theming](#theming)
- [Contributing](#contributing)

## 🎯 Overview

DocuFlow Hub (xDMS) is a comprehensive solution for managing organizational documents. It provides a clean, modern interface for document capture, approval workflows, and system configuration.

### Key Capabilities

- **Document Capture**: Upload, categorize, and manage documents.
- **Approval Workflows**: Multi-stage document approval with configurable approvers and quorums.
- **User Management**: Role-based access control with Active/Inactive status.
- **Beneficiary Management**: Track payment beneficiaries and account details.
- **Real-time Dashboard**: Visual overview of document statistics and financial summaries.

## ✨ Features

### Dashboard
- Welcome greeting with user name.
- Real-time date and time display.
- Summary cards showing document counts:
  - **Generated**: Total documents in the system.
  - **Approved**: Successfully processed documents.
  - **Unapproved**: Documents awaiting action.
  - **Rejected**: Documents that failed approval.
- **Paid Expenses**: Bar chart showing financial metrics by category.
- **Document Categories**: Doughnut chart visualizing document distribution.
- **Recent Documents**: Quick access to the latest document activities.

### Document Capture
- **Request Tab**: Form for new document requests with type selection, amount, and customer details.
- **Generated Tab**: Management view for draft and submitted documents.
- **Enquiry Tab**: Searchable history of all documents with status tracking.
- **Sidebars**: Quick Templates and Recent Uploads for improved efficiency.

### Settings
- **Users**: Complete CRUD for system users linked to employee records.
- **Parameters**: Manage Document Types, including transactional flags and account mappings.
- **Approval Setup**: Configure multi-stage approval workflows (1-10 stages) with mandatory approvers.
- **Beneficiary Setup**: Manage payment beneficiaries and their account details.

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📁 Project Structure

```
src/
├── components/
│   ├── capture/          # Document capture tabs and forms
│   ├── dashboard/        # Charts and summary cards
│   ├── layout/           # Sidebar and main layout wrappers
│   ├── settings/         # Management tabs (Users, Parameters, etc.)
│   ├── shared/           # Reusable UI (DataTable, SearchFilter, etc.)
│   ├── skeletons/        # Loading states
│   └── ui/               # shadcn/ui base components
├── hooks/                # Custom React hooks (e.g., use-toast)
├── lib/
│   ├── api.ts            # Central Axios configuration and interceptors
│   ├── auth.ts           # Authentication logic and token management
│   └── utils.ts          # Helper utilities
├── pages/                # Main application views/routes
├── App.tsx               # Root component and routing
├── index.css             # Global styles and Tailwind directives
└── main.tsx              # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aelmmmson/docuflow-hub.git

# Navigate to project directory
cd docuflow-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will typically be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

## 🔌 API Integration

The system uses a centralized Axios instance located in `src/lib/api.ts`. It handles base URL configuration, authentication headers, and automatic token refreshing.

### Configuration

- **Base URL**: `/v1/api/dms`
- **Authentication**: Bearer token via `Authorization` header.

### Key Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| Dashboard | `/get-dashboard-stats/:id/:role` | GET | Fetch statistical summaries |
| Users | `/get-users` | GET | List all system users |
| Users | `/user/register` | POST | Register a new user |
| Users | `/update-user/:id` | PUT | Update user details |
| Parameters | `/get-doc-types` | GET | Fetch document type configurations |
| Parameters | `/add-doc-type` | POST | Create new document type |
| Auth | `/user/refresh-token` | GET | Refresh session access token |

### Usage Example

```typescript
import api from '@/lib/api';

// Fetching data
const response = await api.get('/get-users');
const users = response.data.results;
```

## 🎨 Theming

Supported themes: **Light** and **Dark**.
Managed via `next-themes` and Tailwind CSS variables.

- **Primary Color**: Blue/Azure
- **Success**: Emerald
- **Warning**: Amber
- **Destructive**: Rose

## 🔐 User Roles

Roles are dynamically fetched from the system and assigned to users:
- **Admin**: Full system management and configuration.
- **Approver**: Review and approve document requests.
- **Finance**.
- **Originator**.

## 📱 Responsive Design

The UI is built with a mobile-first approach:
- **Mobile**: Collapsible navigation and card-based data views.
- **Desktop**: Full sidebar and comprehensive data tables.

---
