import type { Company } from "./domain/demoData";

export type PortalRole = "admin" | "client";

export type Toast = { id: number; text: string; tone?: "ok" | "warn" };

export type PortalTemplate = {
  id: string;
  name: string;
  accent: string;
  category: string;
  description: string;
  previewImage: string;
  badge: string;
  assigned: number;
  isDefault?: boolean;
};

export type DesktopLicense = {
  mode: "commercial" | "guest";
  companyId: string;
  companyName: string;
  authenticatedUser: string;
  deviceId: string;
  deviceName?: string;
  serialNumber: string;
  fingerprint: string;
  installationKey?: string;
  activated: boolean;
  verifiedAt: string;
  expiresAt: string;
};

export const GUEST_COMPANY_ID = "guest_local";

export function guestCompany(license: DesktopLicense): Company {
  return {
    id: GUEST_COMPANY_ID,
    name: license.companyName,
    code: "GUEST",
    email: "guest@local",
    superAdminUser: license.authenticatedUser,
    status: "active",
    plan: "72-hour Guest",
    license: "GUEST-72H",
    expires: new Date(license.expiresAt).toLocaleString(),
    seatsUsed: 1,
    seatsAllowed: 1,
    devicesAllowed: 1,
    templates: ["Default Invoice"],
    devices: [],
  };
}

export function commercialCompany(
  license: DesktopLicense,
  existingCompany?: Company | null,
): Company {
  return {
    id: license.companyId,
    name: license.companyName || existingCompany?.name || "Commercial Workspace",
    code: "COMMERCIAL",
    email: license.authenticatedUser || "companyname@gmail.com",
    superAdminUser: license.authenticatedUser || "Super Admin",
    installationKey: license.installationKey || "",
    status: "active",
    plan: "Business Annual",
    license: "COMMERCIAL-ACTIVE",
    expires: license.expiresAt
      ? new Date(license.expiresAt).toLocaleDateString()
      : "Active",
    seatsUsed: 1,
    seatsAllowed: 5,
    devicesAllowed: 3,
    logo: existingCompany?.logo,
    templates: ["Default Invoice"],
    devices: [
      {
        id: license.deviceId || "dev_installed",
        name: "Windows Desktop PC",
        os: "Windows 11 Pro 64-bit",
        user: license.authenticatedUser || "Super Admin",
        fingerprint: license.fingerprint || "fp:win",
        serialNumber: license.serialNumber,
        activated: license.verifiedAt
          ? new Date(license.verifiedAt).toLocaleDateString()
          : "Active",
        lastSeen: "Just now",
        leaseHours: 72,
        status: "active",
        live: true,
      },
    ],
  };
}

