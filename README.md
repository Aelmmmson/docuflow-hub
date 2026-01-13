# xDMS - Document Management System

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

xDMS (eXtended Document Management System) is a comprehensive solution for managing organizational documents. It provides a clean, modern interface for document capture, approval workflows, and system configuration.

### Key Capabilities

- **Document Capture**: Upload, categorize, and manage documents
- **Approval Workflows**: Multi-stage document approval with configurable approvers
- **User Management**: Role-based access control with Active/Inactive status
- **Beneficiary Management**: Track payment beneficiaries and account details
- **Real-time Dashboard**: Visual overview of document statistics

## ✨ Features

### Dashboard
- Welcome greeting with user name
- Real-time date and time display
- Summary cards showing document counts by status:
  - Generated Documents
  - Approved Documents
  - Unapproved Documents
  - Rejected Documents
- Interactive folder-style cards with count animations
- Paid Expenses bar chart
- Document Categories doughnut chart
- Recent Documents list (last 3 documents)

### Document Capture

#### Request Tab
- Document type selection dropdown
- Auto-generated Document ID
- Amount and Customer Number fields
- PDF file upload with drag-and-drop
- Quick Templates sidebar
- Recent Uploads list

#### Generated Tab
- Full document listing with search and filters
- Status-based filtering (Draft, Submitted, Approved, Rejected, Paid)
- Document type filtering
- Row actions based on status:
  - **Edit**: Modify draft documents
  - **View**: Preview document details
  - **Submit**: Submit for approval
  - **Declined Reason**: View rejection details (auto-closes after 15s)

#### Enquiry Tab
- Search and filter enquiries
- View enquiry details and responses
- Status tracking (Open, In Progress, Resolved, Closed)

### Settings

#### Users Tab
- List users with ID, Username, Email, Role, Status
- Search by username, email, or ID
- Filter by status (Active/Inactive) and role
- Add new users via right slide panel
- Edit existing users

#### Parameters Tab (Document Types)
- Manage document type definitions
- Set transactional flag
- Activate/deactivate document types

#### Document Approval Setup
- Multi-stage approval workflow wizard
- Configure 1-10 approval stages
- Set quorum (minimum approvals) per stage
- Select approvers from employee list
- Designate mandatory approvers
- Progress indicator with navigation dots

#### Beneficiary Setup
- Manage payment beneficiaries
- Account number tracking
- Description with 255 character limit
- Active/Inactive status management

### Approval Page
- List of pending approvals
- Document details preview
- Approve/Reject actions

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Fonts**: Urbanist (Google Fonts)

## 📁 Project Structure

```
src/
├── components/
│   ├── capture/              # Document capture components
│   │   ├── DocumentForm.tsx
│   │   ├── EnquiryTab.tsx
│   │   ├── FileUpload.tsx
│   │   ├── GeneratedTab.tsx
│   │   ├── QuickTemplates.tsx
│   │   └── RecentUploads.tsx
│   ├── dashboard/            # Dashboard components
│   │   ├── CategoriesChart.tsx
│   │   ├── ExpensesChart.tsx
│   │   ├── FolderCard.tsx
│   │   └── RecentDocuments.tsx
│   ├── layout/               # Layout components
│   │   ├── AppSidebar.tsx
│   │   └── MainLayout.tsx
│   ├── settings/             # Settings tab components
│   │   ├── ApprovalSetupTab.tsx
│   │   ├── BeneficiaryTab.tsx
│   │   ├── ParametersTab.tsx
│   │   └── UsersTab.tsx
│   ├── shared/               # Reusable components
│   │   ├── ActionMenu.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   ├── RightAside.tsx
│   │   ├── SearchFilter.tsx
│   │   └── StatusBadge.tsx
│   ├── skeletons/            # Loading skeletons
│   │   ├── ApprovalSkeleton.tsx
│   │   ├── DashboardSkeleton.tsx
│   │   ├── DocumentCaptureSkeleton.tsx
│   │   └── SettingsSkeleton.tsx
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── api.ts                # API configuration & services
│   └── utils.ts
├── pages/
│   ├── Approval.tsx
│   ├── Dashboard.tsx
│   ├── DocumentCapture.tsx
│   ├── Index.tsx
│   ├── NotFound.tsx
│   └── Settings.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd xdms

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

## 📄 Pages & Components

### Shared Components

#### PageHeader
Displays page title, description, current date/time, and theme toggle.

```tsx
<PageHeader 
  title="Dashboard" 
  description="Welcome to your document management system" 
/>
```

#### SearchFilter
Reusable search bar with dropdown filters.

```tsx
<SearchFilter
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search..."
  filters={[
    { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: [...] }
  ]}
/>
```

#### DataTable
Responsive data table with mobile card view.

```tsx
<DataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  emptyMessage="No data found"
/>
```

#### RightAside
Slide-in panel from right side with optional auto-close.

```tsx
<RightAside
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Panel Title"
  subtitle="Optional subtitle"
  autoCloseAfter={15} // Optional: seconds
>
  {/* Content */}
</RightAside>
```

#### StatusBadge
Colored status indicator.

```tsx
<StatusBadge status="approved" />
<StatusBadge status="rejected" />
<StatusBadge status="pending" />
```

#### ActionMenu
Dropdown menu for row actions.

```tsx
<ActionMenu
  actions={[
    { label: "Edit", icon: <Edit />, onClick: handleEdit },
    { label: "Delete", icon: <Trash />, onClick: handleDelete, variant: "destructive" }
  ]}
/>
```

## 🔌 API Integration

The `src/lib/api.ts` file provides a complete API layer ready for backend integration.

### Configuration

```typescript
// Set API base URL via environment variable
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Available Services

```typescript
import { userService, documentService, approvalSetupService } from '@/lib/api';

// Users
await userService.getAll({ search: 'john', status: 'Active' });
await userService.create({ username: 'john', email: 'john@example.com', role: 'User', status: 'Active' });

// Documents
await documentService.getAll({ status: 'DRAFT', type: 'INVOICE' });
await documentService.submit('doc-id');
await documentService.reject('doc-id', 'Missing information');

// Approval Setup
await approvalSetupService.create({
  documentType: 'Invoice',
  stages: [
    { description: 'Manager Review', quorum: 1, approvers: ['John'], mandatoryApprovers: ['John'] }
  ]
});
```

### API Endpoints

| Service | Endpoints |
|---------|-----------|
| Auth | `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/me` |
| Users | `/users`, `/users/:id`, `/users/search` |
| Documents | `/documents`, `/documents/:id`, `/documents/upload`, `/documents/:id/submit`, `/documents/:id/approve`, `/documents/:id/reject` |
| Parameters | `/parameters`, `/parameters/:id`, `/parameters/document-types` |
| Approval Setup | `/approval-setup`, `/approval-setup/:id`, `/approval-setup/:id/stages` |
| Beneficiaries | `/beneficiaries`, `/beneficiaries/:id`, `/beneficiaries/search` |
| Enquiries | `/enquiries`, `/enquiries/:id`, `/enquiries/search` |

## 🎨 Theming

The application supports light and dark themes using CSS custom properties.

### Theme Toggle
Located in the page header, accessible from any page.

### Custom Colors

```css
/* Light theme */
:root {
  --primary: 217 91% 50%;
  --background: 220 20% 97%;
  --card: 0 0% 100%;
  /* ... */
}

/* Dark theme */
.dark {
  --primary: 217 91% 60%;
  --background: 222 47% 6%;
  --card: 222 47% 9%;
  /* ... */
}
```

### Status Colors

- **Success/Approved**: Emerald
- **Primary/Submitted**: Blue
- **Warning/Pending**: Amber
- **Destructive/Rejected**: Red
- **Paid**: Teal
- **Inactive**: Gray

## 🔐 User Roles

| Role | Description |
|------|-------------|
| Admin | Full system access |
| Manager | Approval workflows, team management |
| User | Document creation and submission |
| Viewer | Read-only access |

## 📱 Responsive Design

- **Desktop**: Full sidebar, data tables
- **Tablet**: Collapsible sidebar, responsive grid
- **Mobile**: Hidden sidebar with hamburger menu, card-based tables

## 🧪 Development

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting

### Component Guidelines
- Use shadcn/ui primitives
- Follow atomic design principles
- Implement loading skeletons
- Use semantic color tokens

## 📝 License

This project is proprietary software.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
