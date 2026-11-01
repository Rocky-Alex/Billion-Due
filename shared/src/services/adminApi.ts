const API =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "/api"
    : "http://localhost:8787/api");
export const windowsInstallerUrl = `${API}/downloads/windows`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => ({}))).error ||
        `API error ${response.status}`,
    );
  return response.json() as Promise<T>;
}

export const adminApi = {
  health: () => request<{ ok: boolean }>("/health"),
  bootstrap: () => request<Record<string, unknown>>("/admin/bootstrap"),
  createCompany: (company: unknown) =>
    request("/admin/companies", {
      method: "POST",
      body: JSON.stringify(company),
    }),
  updateCompany: (id: string, updates: Record<string, unknown>) =>
    request(`/admin/companies/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  assignCompanyTemplates: (companyId: string, templateIds: string[]) =>
    request<{ ok: boolean; companyId: string; templateIds: string[] }>(
      `/admin/companies/${encodeURIComponent(companyId)}/templates`,
      {
        method: "PUT",
        body: JSON.stringify({ templateIds }),
      },
    ),
  updateClientProfile: (id: string, updates: Record<string, unknown>) =>
    request(`/client/companies/${encodeURIComponent(id)}/profile`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  setCompanyStatus: (id: string, status: string) =>
    request(`/admin/companies/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteCompany: (id: string) =>
    request<{ ok: boolean; id: string; name?: string }>(
      `/admin/companies/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    ),
  updateCompanyCredentials: (
    id: string,
    credentials: {
      superAdminUser: string;
      superAdminPassword: string;
      installationKey?: string;
    },
  ) =>
    request(`/admin/companies/${encodeURIComponent(id)}/credentials`, {
      method: "PATCH",
      body: JSON.stringify(credentials),
    }),
  decideDeviceRequest: (id: string, approve: boolean) =>
    request(`/admin/device-requests/${encodeURIComponent(id)}/decision`, {
      method: "POST",
      body: JSON.stringify({ approve }),
    }),
  listDeviceRequests: () =>
    request<{ requests: Record<string, unknown>[] }>("/admin/device-requests"),
  createOtp: (companyId: string) =>
    request<{ code: string; expiresInSeconds: number }>("/admin/otp", {
      method: "POST",
      body: JSON.stringify({ companyId }),
    }),
  createDeviceRequest: (requestData: unknown) =>
    request<{
      ok?: boolean;
      alreadyApproved?: boolean;
      id?: string;
      status?: string;
      deviceId?: string;
      message?: string;
      securityCopyDispatched?: boolean;
      securityCopySentTo?: string;
    }>("/client/device-requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    }),
  clientBootstrap: (companyId: string) =>
    request<Record<string, unknown>>(
      `/client/bootstrap?companyId=${encodeURIComponent(companyId)}`,
    ),
  checkDeviceRequestStatus: (requestId: string) =>
    request<{
      id: string;
      status: "pending" | "approved" | "rejected";
      company_id: string;
      approved_device_id?: string;
      lease_expires_at?: string;
      last_verified_at?: string;
    }>(`/client/device-requests/${encodeURIComponent(requestId)}/status`),
  activateWithOtp: (data: {
    companyId: string;
    code: string;
    deviceName: string;
    fingerprint: string;
    user: string;
  }) =>
    request<{ ok: boolean; deviceId: string; companyId: string }>(
      "/client/activate-otp",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),
  requestInstallOtp: (emailOrUser: string, password: string) =>
    request<{
      ok: boolean;
      companyId: string;
      companyName: string;
      email: string;
      maskedEmail: string;
      otpPreview?: string;
      expiresInSeconds: number;
    }>("/client/install-request-otp", {
      method: "POST",
      body: JSON.stringify({ emailOrUser, password }),
    }),
  verifyInstallation: (data: {
    emailOrUser: string;
    password: string;
    otp: string;
    installationKey: string;
    deviceName: string;
    serialNumber: string;
    fingerprint: string;
    os?: string;
  }) =>
    request<{
      ok: boolean;
      message: string;
      company: Record<string, unknown>;
      device: {
        id: string;
        name: string;
        serialNumber: string;
        fingerprint: string;
        os: string;
        status: string;
        leaseExpiresAt: string;
        verifiedAt: string;
      };
      license: Record<string, unknown>;
    }>("/client/install-verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  refreshDesktopLease: (data: {
    companyId: string;
    deviceId: string;
    fingerprint: string;
    serialNumber: string;
  }) =>
    request<{
      ok: boolean;
      deviceId?: string;
      verifiedAt: string;
      leaseExpiresAt: string;
      companyName: string;
      authenticatedUser: string;
    }>("/client/lease/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkDeviceStatus: (params: {
    companyId: string;
    deviceId?: string;
    fingerprint: string;
  }) =>
    request<{
      active: boolean;
      revoked: boolean;
      deviceId?: string;
      reason?: string;
    }>(
      `/client/device/status?companyId=${encodeURIComponent(params.companyId)}&deviceId=${encodeURIComponent(params.deviceId || "")}&fingerprint=${encodeURIComponent(params.fingerprint)}`,
      { method: "GET" },
    ),
  addClientDevice: (
    companyId: string,
    data: {
      name: string;
      assignedUser: string;
      os?: string;
      serialNumber?: string;
      fingerprint?: string;
    },
  ) =>
    request<{
      ok: boolean;
      device: Record<string, unknown>;
    }>(`/client/companies/${encodeURIComponent(companyId)}/devices`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteClientDevice: (companyId: string, deviceId: string) =>
    request<{
      ok: boolean;
      deviceId: string;
      name?: string;
    }>(
      `/client/companies/${encodeURIComponent(companyId)}/devices/${encodeURIComponent(deviceId)}`,
      {
        method: "DELETE",
      },
    ),
  disconnectDevice: (data: { companyId: string; deviceId?: string; fingerprint?: string }) =>
    request<{
      ok: boolean;
      deviceId?: string;
      name?: string;
    }>("/client/device/disconnect", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  authLogin: (data: {
    portal: "admin" | "client";
    email: string;
    password: string;
  }) =>
    request<{
      ok: boolean;
      role: "admin" | "client";
      email?: string;
      companyId?: string;
      companyName?: string;
      superAdminUser?: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  changePassword: (data: {
    role: "admin" | "client";
    companyId?: string;
    currentPassword: string;
    newPassword: string;
  }) =>
    request<{ ok: boolean; message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data: {
    role: "admin" | "client";
    identifier?: string;
    email?: string;
    installationKey?: string;
    recoveryKey?: string;
    newPassword: string;
  }) =>
    request<{
      ok: boolean;
      message: string;
      companyName?: string;
      user?: string;
    }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAppVersion: () =>
    request<{
      currentVersion: string;
      latestVersion: string;
      hasUpdate: boolean;
      hotUpdateAvailable: boolean;
      updateType: string;
      releaseDate: string;
      releaseNotes: string;
      filesChanged: Array<{ path: string; size: string; hash: string }>;
      totalPatchSize: string;
    }>("/client/app-version"),
  applyHotUpdate: (targetVersion?: string) =>
    request<{
      ok: boolean;
      updatedVersion: string;
      message: string;
      filesUpdated: number;
      bytesDownloaded: number;
      appliedAt: string;
    }>("/client/app-hot-update", {
      method: "POST",
      body: JSON.stringify({ targetVersion }),
    }),
  getAdminProfile: () =>
    request<{
      ok: boolean;
      profile: {
        name: string;
        email: string;
        contactNo: string;
        address: string;
        roleTitle: string;
        recoveryKey: string;
      };
    }>("/admin/profile"),
  updateOwnerProfile: (profile: {
    name?: string;
    email?: string;
    contactNo?: string;
    address?: string;
    roleTitle?: string;
    recoveryKey?: string;
  }) =>
    request<{
      ok: boolean;
      message: string;
      profile?: {
        name: string;
        email: string;
        contactNo: string;
        address: string;
        roleTitle: string;
        recoveryKey: string;
      };
    }>("/admin/profile", {
      method: "PATCH",
      body: JSON.stringify(profile),
    }),
};

export function broadcastDeviceRevoked(payload: {
  companyId?: string;
  deviceId?: string;
  fingerprint?: string;
  reason?: string;
}) {
  try {
    localStorage.setItem(
      "ledgershield_device_revoked",
      JSON.stringify({
        deviceId: payload.deviceId,
        fingerprint: payload.fingerprint,
        companyId: payload.companyId,
        reason: payload.reason || "Device unlinked from web portal",
        timestamp: Date.now(),
      }),
    );
  } catch {}

  try {
    window.dispatchEvent(
      new CustomEvent("ledgershield_device_revoked", {
        detail: payload,
      }),
    );
  } catch {}

  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("ledgershield_device_channel");
      bc.postMessage({
        type: "device_revoked",
        ...payload,
        timestamp: Date.now(),
      });
      bc.close();
    }
  } catch {}
}
