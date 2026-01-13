/**
 * API Configuration and Service Layer
 * =====================================
 * 
 * This file contains the API configuration and service functions
 * for connecting to backend endpoints in the future.
 * 
 * Usage:
 * ------
 * import { api, userService, documentService } from '@/lib/api';
 * 
 * // Example: Fetch users
 * const users = await userService.getAll();
 * 
 * // Example: Create document
 * const doc = await documentService.create({ type: 'INVOICE', description: 'Test' });
 */

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Users Management
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    SEARCH: '/users/search',
  },
  
  // Documents
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    SUBMIT: (id: string) => `/documents/${id}/submit`,
    APPROVE: (id: string) => `/documents/${id}/approve`,
    REJECT: (id: string) => `/documents/${id}/reject`,
  },
  
  // Parameters (Document Types)
  PARAMETERS: {
    BASE: '/parameters',
    BY_ID: (id: string) => `/parameters/${id}`,
    DOCUMENT_TYPES: '/parameters/document-types',
  },
  
  // Approval Setup
  APPROVAL_SETUP: {
    BASE: '/approval-setup',
    BY_ID: (id: string) => `/approval-setup/${id}`,
    STAGES: (setupId: string) => `/approval-setup/${setupId}/stages`,
  },
  
  // Beneficiaries
  BENEFICIARIES: {
    BASE: '/beneficiaries',
    BY_ID: (id: string) => `/beneficiaries/${id}`,
    SEARCH: '/beneficiaries/search',
  },
  
  // Enquiries
  ENQUIRIES: {
    BASE: '/enquiries',
    BY_ID: (id: string) => `/enquiries/${id}`,
    SEARCH: '/enquiries/search',
  },
} as const;

// ============================================
// Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'User' | 'Viewer';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  id: string;
  code: string;
  description: string;
  isTransactional: boolean;
  status: 'Active' | 'Inactive';
}

export interface ApprovalStage {
  id: string;
  stageNumber: number;
  description: string;
  quorum: number;
  approvers: string[];
  mandatoryApprovers: string[];
}

export interface ApprovalSetup {
  id: string;
  documentType: string;
  stages: ApprovalStage[];
  approversCount: number;
  requiredApproversCount: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Document {
  id: string;
  referenceNumber: string;
  type: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  amount?: number;
  customerNumber?: string;
  fileUrl?: string;
  fileName?: string;
  uploadDate: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: string;
}

export interface Enquiry {
  id: string;
  referenceNumber: string;
  type: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  resolvedAt?: string;
}

// ============================================
// API Client
// ============================================

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const api = new ApiClient(API_BASE_URL);

// ============================================
// Service Functions
// ============================================

export const userService = {
  getAll: (params?: { search?: string; role?: string; status?: string }) => 
    api.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, params as Record<string, string>),
  
  getById: (id: string) => 
    api.get<User>(API_ENDPOINTS.USERS.BY_ID(id)),
  
  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<User>(API_ENDPOINTS.USERS.BASE, data),
  
  update: (id: string, data: Partial<User>) => 
    api.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.USERS.BY_ID(id)),
};

export const documentTypeService = {
  getAll: (params?: { search?: string; status?: string }) => 
    api.get<PaginatedResponse<DocumentType>>(API_ENDPOINTS.PARAMETERS.DOCUMENT_TYPES, params as Record<string, string>),
  
  create: (data: Omit<DocumentType, 'id'>) => 
    api.post<DocumentType>(API_ENDPOINTS.PARAMETERS.BASE, data),
  
  update: (id: string, data: Partial<DocumentType>) => 
    api.put<DocumentType>(API_ENDPOINTS.PARAMETERS.BY_ID(id), data),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.PARAMETERS.BY_ID(id)),
};

export const approvalSetupService = {
  getAll: () => 
    api.get<PaginatedResponse<ApprovalSetup>>(API_ENDPOINTS.APPROVAL_SETUP.BASE),
  
  getById: (id: string) => 
    api.get<ApprovalSetup>(API_ENDPOINTS.APPROVAL_SETUP.BY_ID(id)),
  
  create: (data: { documentType: string; stages: Omit<ApprovalStage, 'id'>[] }) => 
    api.post<ApprovalSetup>(API_ENDPOINTS.APPROVAL_SETUP.BASE, data),
  
  update: (id: string, data: { stages: Omit<ApprovalStage, 'id'>[] }) => 
    api.put<ApprovalSetup>(API_ENDPOINTS.APPROVAL_SETUP.BY_ID(id), data),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.APPROVAL_SETUP.BY_ID(id)),
};

export const beneficiaryService = {
  getAll: (params?: { search?: string; status?: string }) => 
    api.get<PaginatedResponse<Beneficiary>>(API_ENDPOINTS.BENEFICIARIES.BASE, params as Record<string, string>),
  
  create: (data: Omit<Beneficiary, 'id'>) => 
    api.post<Beneficiary>(API_ENDPOINTS.BENEFICIARIES.BASE, data),
  
  update: (id: string, data: Partial<Beneficiary>) => 
    api.put<Beneficiary>(API_ENDPOINTS.BENEFICIARIES.BY_ID(id), data),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.BENEFICIARIES.BY_ID(id)),
};

export const documentService = {
  getAll: (params?: { search?: string; status?: string; type?: string }) => 
    api.get<PaginatedResponse<Document>>(API_ENDPOINTS.DOCUMENTS.BASE, params as Record<string, string>),
  
  getById: (id: string) => 
    api.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id)),
  
  create: (data: Omit<Document, 'id' | 'referenceNumber' | 'uploadDate' | 'createdBy'>) => 
    api.post<Document>(API_ENDPOINTS.DOCUMENTS.BASE, data),
  
  update: (id: string, data: Partial<Document>) => 
    api.put<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id), data),
  
  upload: (file: File, metadata: { type: string; description: string }) => 
    api.upload<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, file, metadata),
  
  submit: (id: string) => 
    api.post<Document>(API_ENDPOINTS.DOCUMENTS.SUBMIT(id)),
  
  approve: (id: string) => 
    api.post<Document>(API_ENDPOINTS.DOCUMENTS.APPROVE(id)),
  
  reject: (id: string, reason: string) => 
    api.post<Document>(API_ENDPOINTS.DOCUMENTS.REJECT(id), { reason }),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id)),
};

export const enquiryService = {
  getAll: (params?: { search?: string; status?: string; type?: string }) => 
    api.get<PaginatedResponse<Enquiry>>(API_ENDPOINTS.ENQUIRIES.BASE, params as Record<string, string>),
  
  getById: (id: string) => 
    api.get<Enquiry>(API_ENDPOINTS.ENQUIRIES.BY_ID(id)),
  
  create: (data: Omit<Enquiry, 'id' | 'createdAt'>) => 
    api.post<Enquiry>(API_ENDPOINTS.ENQUIRIES.BASE, data),
  
  update: (id: string, data: Partial<Enquiry>) => 
    api.put<Enquiry>(API_ENDPOINTS.ENQUIRIES.BY_ID(id), data),
};
