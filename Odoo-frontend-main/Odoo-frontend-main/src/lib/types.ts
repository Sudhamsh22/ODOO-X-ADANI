import type { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'manager' | 'technician' | 'employee';

export type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string; // Kept optional as backend might not provide it
  role: UserRole;
  teamId?: number;
};

export type EquipmentStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'SCRAPPED';

export type Equipment = {
  id: number;
  name:string;
  serialNumber?: string;
  department?: string;
  assignedEmployeeId?: number;
  maintenanceTeamId: number;
  assignedTechnicianId?: number;
  purchaseDate?: string; // ISO 8601
  warrantyExpiry?: string; // ISO 8601
  location?: string;
  isScrapped?: boolean;
  status: EquipmentStatus;
  categoryId: number;
  health: number; // Percentage from 0 to 100
  assignedDate?: string; // ISO 8601
  description?: string;
  category?: { id: number, name: string }; // Nested from GET /api/equipment
  workCenterId?: number;
};

export type EquipmentCategory = {
  id: number;
  name: string;
  responsible: string;
  companyId: number;
};

export type Team = {
  id: number;
  name: string;
  members: number[]; // Array of user IDs
  totalMembers: number;
  companyId: number;
};

export type MaintenanceRequestStatus = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP';
export type MaintenanceRequestPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type MaintenanceRequestType = 'CORRECTIVE' | 'PREVENTIVE';

export type MaintenanceRequest = {
  id: number;
  subject: string;
  equipmentId: number;
  assignedTechnicianId?: number;
  dueDate: string; // ISO 8601 YYYY-MM-DD
  status: MaintenanceRequestStatus;
  requestType: MaintenanceRequestType;
  priority: MaintenanceRequestPriority;
  scheduledDate?: string; // ISO 8601
  duration?: number; // hours
  notes?: string;
  teamId: number;
  requesterId: number;
};

export type WorkCenter = {
  id: number;
  name: string;
  description: string;
  department: string;
  tag?: string;
  alternatives?: string;
  costPerHour?: number;
  capacity?: number;
  oee?: number;
};


export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredRoles: UserRole[];
};
