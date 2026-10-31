import { generateKeyPairSync, sign, verify, type KeyObject } from 'node:crypto';
import type { SignedLeaseClaims } from '../../shared/src/domain/license';

export interface SignedLease {
  algorithm: 'Ed25519';
  claims: SignedLeaseClaims;
  signature: string;
}

export class LicenseAuthority {
  #privateKey: KeyObject;
  readonly publicKeyPem: string;

  constructor() {
    const pair = generateKeyPairSync('ed25519');
    this.#privateKey = pair.privateKey;
    this.publicKeyPem = pair.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  }

  issue(claims: SignedLeaseClaims): SignedLease {
    const payload = Buffer.from(JSON.stringify(claims));
    return { algorithm: 'Ed25519', claims, signature: sign(null, payload, this.#privateKey).toString('base64url') };
  }

  static verify(lease: SignedLease, publicKeyPem: string): boolean {
    return verify(null, Buffer.from(JSON.stringify(lease.claims)), publicKeyPem, Buffer.from(lease.signature, 'base64url'));
  }
}
