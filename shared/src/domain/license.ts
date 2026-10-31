export type LicenseStatus = 'active' | 'suspended' | 'blocked' | 'expired' | 'revoked';

export interface SignedLeaseClaims {
  companyId: string;
  licenseId: string;
  userId: string;
  deviceFingerprint: string;
  issuedAt: number;
  expiresAt: number;
  serverTime: number;
  seatsAllowed: number;
  devicesAllowed: number;
  reverifyEpoch: number;
}

export interface LicenseContext {
  now: number;
  status: LicenseStatus;
  fingerprint: string;
  claims: SignedLeaseClaims;
  signatureValid: boolean;
  deviceAuthorized: boolean;
  activeDevices: number;
  activeUsers: number;
  lastSeenLocalTime?: number;
}

export type LicenseDecisionCode =
  | 'VALID_ONLINE'
  | 'VALID_OFFLINE'
  | 'LEASE_EXPIRED'
  | 'DEVICE_MISMATCH'
  | 'LICENSE_BLOCKED'
  | 'LICENSE_INACTIVE'
  | 'DEVICE_LIMIT_EXCEEDED'
  | 'USER_LIMIT_EXCEEDED'
  | 'INVALID_SIGNATURE'
  | 'CLOCK_ROLLBACK'
  | 'DEVICE_UNAUTHORIZED';

export interface LicenseDecision {
  allowed: boolean;
  code: LicenseDecisionCode;
  hoursRemaining: number;
}

const HOUR = 60 * 60 * 1000;
const CLOCK_TOLERANCE = 5 * 60 * 1000;

export function evaluateLicense(context: LicenseContext, online = false): LicenseDecision {
  const remaining = Math.max(0, (context.claims.expiresAt - context.now) / HOUR);
  if (!context.signatureValid) return { allowed: false, code: 'INVALID_SIGNATURE', hoursRemaining: 0 };
  if (context.status === 'blocked') return { allowed: false, code: 'LICENSE_BLOCKED', hoursRemaining: remaining };
  if (context.status !== 'active') return { allowed: false, code: 'LICENSE_INACTIVE', hoursRemaining: remaining };
  if (context.claims.deviceFingerprint !== context.fingerprint) return { allowed: false, code: 'DEVICE_MISMATCH', hoursRemaining: remaining };
  if (!context.deviceAuthorized) return { allowed: false, code: 'DEVICE_UNAUTHORIZED', hoursRemaining: remaining };
  if (context.activeDevices > context.claims.devicesAllowed) return { allowed: false, code: 'DEVICE_LIMIT_EXCEEDED', hoursRemaining: remaining };
  if (context.activeUsers > context.claims.seatsAllowed) return { allowed: false, code: 'USER_LIMIT_EXCEEDED', hoursRemaining: remaining };
  if (context.lastSeenLocalTime && context.now + CLOCK_TOLERANCE < context.lastSeenLocalTime) {
    return { allowed: false, code: 'CLOCK_ROLLBACK', hoursRemaining: remaining };
  }
  if (context.now > context.claims.expiresAt) return { allowed: false, code: 'LEASE_EXPIRED', hoursRemaining: 0 };
  return { allowed: true, code: online ? 'VALID_ONLINE' : 'VALID_OFFLINE', hoursRemaining: remaining };
}

export interface ReplacementApproval {
  authorizedDeviceIds: string[];
  deactivatedDeviceId: string;
  activatedDeviceId: string;
  tokenVersion: number;
}

export function approveReplacement(
  authorizedDeviceIds: string[],
  oldDeviceId: string,
  newDeviceId: string,
  limit: number,
  tokenVersion = 1
): ReplacementApproval {
  if (!authorizedDeviceIds.includes(oldDeviceId)) throw new Error('Selected old device is not authorized');
  if (authorizedDeviceIds.includes(newDeviceId)) throw new Error('New device is already authorized');
  const next = authorizedDeviceIds.filter((id) => id !== oldDeviceId).concat(newDeviceId);
  if (next.length > limit) throw new Error('Device limit exceeded after replacement');
  return { authorizedDeviceIds: next, deactivatedDeviceId: oldDeviceId, activatedDeviceId: newDeviceId, tokenVersion: tokenVersion + 1 };
}

export function createRequestCode(fingerprint: string, now: number): string {
  const input = `${fingerprint}:${Math.floor(now / 60000)}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  return `LS-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8)}`;
}

export interface PinLockConfig {
  enabled: boolean;
  pinLength: 4 | 5 | 6;
  pin: string;
  autoLockMinutes: number;
}

