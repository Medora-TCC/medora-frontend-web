export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface AdminUserItem {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  isOnline: boolean;
}

export interface AdminUserSummary {
  total: number;
  active: number;
  inactive: number;
  doctors: number;
  patients: number; 
  onlineNow: number;
}

export interface AdminUserPage {
  items: AdminUserItem[];
  total: number;
  summary: AdminUserSummary;
}

export interface AdminUserFilter {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page: number;
  pageSize: number;
  onlyOnline?: boolean;
}