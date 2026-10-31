export type DeviceStatus = "active" | "blocked" | "expired" | "pending";

export interface Device {
  id: string;
  name: string;
  os: string;
  user: string;
  fingerprint: string;
  serialNumber?: string;
  activated: string;
  lastSeen: string;
  leaseHours: number;
  status: DeviceStatus;
  live: boolean;
}

export function generateInstallationKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${pick(3)}-${pick(3)}-${pick(4)}`;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  email: string;
  contactNo?: string;
  phone?: string;
  logo?: string;
  address?: string;
  superAdminUser?: string;
  superAdminPassword?: string;
  installationKey?: string;
  status: "active" | "suspended" | "blocked";
  plan: string;
  offlineLeaseOverride?: string;
  license: string;
  expires: string;
  seatsUsed: number;
  seatsAllowed: number;
  devicesAllowed: number;
  templates: string[];
  devices: Device[];
}

export interface DeviceRequest {
  id: string;
  companyId: string;
  company: string;
  user: string;
  userEmail?: string;
  license: string;
  deviceName: string;
  fingerprint: string;
  appVersion: string;
  attemptTime: string;
  replaceDeviceId?: string;
  status: "pending" | "approved" | "rejected";
  isRelogin?: boolean;
  securityCopySentTo?: string;
}

export interface SecurityEvent {
  id: string;
  company: string;
  device: string;
  fingerprint: string;
  reason: string;
  time: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}
export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  tax?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  issued: string;
  due: string;
  amount: number;
  status: string;
  template?: string;
  items?: InvoiceItem[];
  notes?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  advancePaid?: number;
  balanceDue?: number;
  isTaxInvoice?: boolean;
}
export interface Product {
  id?: string;
  name: string;
  sku: string;
  price: number;
  tax: number;
  stock: number | null;
  category?: string;
  brand?: string;
  specs?: string;
  condition?: "Brand New" | "Refurbished (Grade A)" | "Open Box" | "Used";
  warranty?: string;
  serialNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
}

export interface SoftwareOwnerProfile {
  name: string;
  email: string;
  contactNo: string;
  address: string;
  roleTitle: string;
  recoveryKey: string;
}

export function generateRecoveryKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `OWNER-REC-${pick(4)}-${pick(4)}`;
}

export function getInitials(text?: string, fallback = "SO"): string {
  if (!text || !text.trim()) return fallback;
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const initialOwnerProfile: SoftwareOwnerProfile = {
  name: "",
  email: "",
  contactNo: "",
  address: "",
  roleTitle: "",
  recoveryKey: "",
};

// The UI starts empty and is populated only from Neon or local desktop storage.
export const companies: Company[] = [];
export const initialRequests: DeviceRequest[] = [];
export const unauthorizedAttempts: SecurityEvent[] = [];
export const invoices: Invoice[] = [];
export const products: Product[] = [];
export const customers: Customer[] = [];

