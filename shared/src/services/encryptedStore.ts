const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface EncryptedEnvelope {
  version: 1;
  algorithm: "AES-GCM/PBKDF2-SHA256";
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  usages: KeyUsage[],
) {
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 210_000,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    usages,
  );
}

export async function encryptBackup(
  data: unknown,
  passphrase: string,
): Promise<EncryptedEnvelope> {
  if (passphrase.length < 8)
    throw new Error("Backup passphrase must be at least 8 characters");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoder.encode(JSON.stringify(data)),
  );
  return {
    version: 1,
    algorithm: "AES-GCM/PBKDF2-SHA256",
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    createdAt: new Date().toISOString(),
  };
}

export async function decryptBackup<T>(
  envelope: EncryptedEnvelope,
  passphrase: string,
): Promise<T> {
  if (envelope.version !== 1 || envelope.algorithm !== "AES-GCM/PBKDF2-SHA256")
    throw new Error("Unsupported backup format");
  const key = await deriveKey(passphrase, fromBase64(envelope.salt), [
    "decrypt",
  ]);
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) as BufferSource },
    key,
    fromBase64(envelope.ciphertext) as BufferSource,
  );
  return JSON.parse(decoder.decode(clear)) as T;
}

export async function storeEncrypted<T>(
  storageKey: string,
  value: T,
  secret: string,
): Promise<void> {
  const envelope = await encryptBackup(value, secret);
  localStorage.setItem(storageKey, JSON.stringify(envelope));
}

export function downloadEncryptedBackup(
  envelope: EncryptedEnvelope,
  filename = "billiondue-backup.lsbak",
) {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: "application/vnd.ledgershield.backup+json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
