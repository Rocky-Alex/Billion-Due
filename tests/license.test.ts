import { describe, expect, it } from 'vitest';
import { approveReplacement, evaluateLicense, type LicenseContext, type SignedLeaseClaims } from "../shared/src/domain/license";
import { LicenseAuthority } from "../website/server/licenseAuthority";

const now = Date.UTC(2026, 9, 19, 8, 0, 0);
const claims: SignedLeaseClaims = {
  companyId: 'c_acme', licenseId: 'LIC-001', userId: 'u1', deviceFingerprint: 'fp:device-1',
  issuedAt: now - 60_000, expiresAt: now + 72 * 60 * 60 * 1000, serverTime: now,
  seatsAllowed: 10, devicesAllowed: 3, reverifyEpoch: 2
};

const valid: LicenseContext = {
  now, status: 'active', fingerprint: 'fp:device-1', claims, signatureValid: true,
  deviceAuthorized: true, activeDevices: 3, activeUsers: 6, lastSeenLocalTime: now - 1000
};

describe('license state transitions', () => {
  it('allows a valid offline lease for up to 72 hours', () => {
    expect(evaluateLicense(valid)).toMatchObject({ allowed: true, code: 'VALID_OFFLINE', hoursRemaining: 72 });
  });

  it('hard-locks after the 72-hour lease expires', () => {
    expect(evaluateLicense({ ...valid, now: claims.expiresAt + 1 }).code).toBe('LEASE_EXPIRED');
  });

  it('locks on a device fingerprint mismatch', () => {
    expect(evaluateLicense({ ...valid, fingerprint: 'fp:copied-device' }).code).toBe('DEVICE_MISMATCH');
  });

  it('locks a blocked license', () => {
    expect(evaluateLicense({ ...valid, status: 'blocked' }).code).toBe('LICENSE_BLOCKED');
  });

  it('denies a fourth device when the limit is three', () => {
    expect(evaluateLicense({ ...valid, activeDevices: 4 }).code).toBe('DEVICE_LIMIT_EXCEEDED');
  });

  it('atomically replaces the selected old device and increments token version', () => {
    expect(approveReplacement(['d1', 'd2', 'd3'], 'd3', 'd4', 3, 7)).toEqual({
      authorizedDeviceIds: ['d1', 'd2', 'd4'], deactivatedDeviceId: 'd3', activatedDeviceId: 'd4', tokenVersion: 8
    });
  });

  it('detects an obvious system clock rollback', () => {
    expect(evaluateLicense({ ...valid, now: now - 20 * 60 * 1000, lastSeenLocalTime: now }).code).toBe('CLOCK_ROLLBACK');
  });

  it('signs and verifies lease claims with Ed25519 and rejects tampering', () => {
    const authority = new LicenseAuthority();
    const signed = authority.issue(claims);
    expect(LicenseAuthority.verify(signed, authority.publicKeyPem)).toBe(true);
    signed.claims.devicesAllowed = 99;
    expect(LicenseAuthority.verify(signed, authority.publicKeyPem)).toBe(false);
  });
});
