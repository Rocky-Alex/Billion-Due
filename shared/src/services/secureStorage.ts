declare global {
  interface Window {
    ledgerShield?: {
      platform: "electron";
      protectSecret(value: string): Promise<string>;
      revealSecret(value: string): Promise<string>;
      getInstalledLicense(): Promise<Record<string, unknown> | null>;
      saveInstalledLicense(value: Record<string, unknown>): Promise<boolean>;
      startGuestTrial(fingerprint: string): Promise<{
        fingerprint: string;
        startedAt: string;
        expiresAt: string;
      }>;
      readLocalData(): Promise<Record<string, unknown>>;
      writeLocalData(value: Record<string, unknown>): Promise<boolean>;
      windowAction?(action: "minimize" | "maximize" | "close"): Promise<void>;
      setTitleBarTheme?(theme: string): Promise<boolean>;
    };
  }
}

export interface SecureStorageAdapter {
  productionProtected: boolean;
  protect(value: string): Promise<string>;
  reveal(value: string): Promise<string>;
}

const browserAdapter: SecureStorageAdapter = {
  productionProtected: false,
  async protect(value) {
    return btoa(value);
  },
  async reveal(value) {
    return atob(value);
  },
};

const electronAdapter: SecureStorageAdapter | undefined =
  window.ledgerShield && {
    productionProtected: true,
    protect: window.ledgerShield.protectSecret,
    reveal: window.ledgerShield.revealSecret,
  };

export const secureStorage = electronAdapter ?? browserAdapter;
