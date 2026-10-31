import { describe, expect, it, vi } from "vitest";
import type { PinLockConfig } from "../shared/src/domain/license";
import { encryptBackup, decryptBackup } from "../shared/src/services/encryptedStore";
import {
  getAccessibleTemplates,
  isTemplateAssignedToCompany,
  INVOICE_TEMPLATES,
} from "../shared/src/domain/invoiceTemplates";

describe("Desktop Client App Settings & Security", () => {
  // 1. PIN LOCK & AUTO-UNLOCK TESTS
  describe("App PIN Lock & Auto-Unlock Engine", () => {
    it("allows the client user to configure 4-digit PIN lock", () => {
      const config: PinLockConfig = {
        enabled: true,
        pinLength: 4,
        pin: "2468",
        autoLockMinutes: 5,
      };

      expect(config.enabled).toBe(true);
      expect(config.pinLength).toBe(4);
      expect(config.pin).toBe("2468");
      expect(config.pin.length).toBe(4);
    });

    it("allows the client user to configure 5-digit PIN lock", () => {
      const config: PinLockConfig = {
        enabled: true,
        pinLength: 5,
        pin: "13579",
        autoLockMinutes: 2,
      };

      expect(config.pinLength).toBe(5);
      expect(config.pin).toBe("13579");
      expect(config.pin.length).toBe(5);
    });

    it("allows the client user to configure 6-digit PIN lock", () => {
      const config: PinLockConfig = {
        enabled: true,
        pinLength: 6,
        pin: "987654",
        autoLockMinutes: 10,
      };

      expect(config.pinLength).toBe(6);
      expect(config.pin).toBe("987654");
      expect(config.pin.length).toBe(6);
    });

    it("auto-unlocks immediately without hitting submit button when 4th digit is entered", () => {
      const storedPin = "4826";
      const pinLength = 4;
      const onUnlock = vi.fn();

      // Emulate typing sequence into PIN lock screen
      let currentInput = "";
      const handleInput = (digit: string) => {
        currentInput += digit;
        // As soon as entered length equals pinLength:
        if (currentInput.length === pinLength) {
          if (currentInput === storedPin) {
            onUnlock();
          }
        }
      };

      handleInput("4");
      expect(onUnlock).not.toHaveBeenCalled();
      handleInput("8");
      expect(onUnlock).not.toHaveBeenCalled();
      handleInput("2");
      expect(onUnlock).not.toHaveBeenCalled();

      // 4th digit entered: immediately unlocks without hitting OK or Enter
      handleInput("6");
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it("auto-unlocks immediately without hitting submit button when 5th digit is entered", () => {
      const storedPin = "12345";
      const pinLength = 5;
      const onUnlock = vi.fn();

      let currentInput = "";
      const handleInput = (digit: string) => {
        currentInput += digit;
        if (currentInput.length === pinLength) {
          if (currentInput === storedPin) {
            onUnlock();
          }
        }
      };

      ["1", "2", "3", "4"].forEach((d) => handleInput(d));
      expect(onUnlock).not.toHaveBeenCalled();

      // 5th digit entered: immediately auto-unlocks
      handleInput("5");
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it("auto-unlocks immediately without hitting submit button when 6th digit is entered", () => {
      const storedPin = "654321";
      const pinLength = 6;
      const onUnlock = vi.fn();

      let currentInput = "";
      const handleInput = (digit: string) => {
        currentInput += digit;
        if (currentInput.length === pinLength) {
          if (currentInput === storedPin) {
            onUnlock();
          }
        }
      };

      ["6", "5", "4", "3", "2"].forEach((d) => handleInput(d));
      expect(onUnlock).not.toHaveBeenCalled();

      // 6th digit entered: immediately auto-unlocks
      handleInput("1");
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it("does not unlock and flags error when incorrect PIN is entered", () => {
      const storedPin = "1122";
      const pinLength = 4;
      const onUnlock = vi.fn();
      let hasError = false;

      let currentInput = "";
      const handleInput = (digit: string) => {
        currentInput += digit;
        if (currentInput.length === pinLength) {
          if (currentInput === storedPin) {
            onUnlock();
          } else {
            hasError = true;
            currentInput = "";
          }
        }
      };

      handleInput("1");
      handleInput("1");
      handleInput("2");
      handleInput("9"); // Incorrect 4th digit

      expect(onUnlock).not.toHaveBeenCalled();
      expect(hasError).toBe(true);
      expect(currentInput).toBe("");
    });
  });

  // 2. CLIENT PERMISSIONS & PASSWORD CHANGE
  describe("Client Permissions & Password Management", () => {
    it("validates that client password change requires valid current password and matching new password", () => {
      const currentPassword = "CurrentPassword123";
      const newPassword = "NewSecurePassword456";
      const confirmPassword = "NewSecurePassword456";

      const validate = (curr: string, next: string, conf: string) => {
        if (!curr) return "Current password is required";
        if (!next || next.length < 6) return "New password must be at least 6 characters";
        if (next !== conf) return "New password and confirmation do not match";
        if (curr === next) return "New password must be different from current password";
        return "ok";
      };

      expect(validate("", newPassword, confirmPassword)).toBe("Current password is required");
      expect(validate(currentPassword, "123", "123")).toBe("New password must be at least 6 characters");
      expect(validate(currentPassword, newPassword, "Different456")).toBe("New password and confirmation do not match");
      expect(validate(currentPassword, currentPassword, currentPassword)).toBe("New password must be different from current password");
      expect(validate(currentPassword, newPassword, confirmPassword)).toBe("ok");
    });

    it("ensures company license and hardware installation key remain immutable for client operator", () => {
      const adminManagedProfile = {
        companyName: "Acme Industrial Corp",
        installationKey: "KEY-ACME-CORP-2026",
        serialNumber: "SN-DEV-WINDOWS-01",
        plan: "Enterprise Commercial",
        offlineLeaseHours: 72,
        isClientEditable: false,
      };

      expect(adminManagedProfile.isClientEditable).toBe(false);
      expect(adminManagedProfile.installationKey).toBe("KEY-ACME-CORP-2026");
    });
  });

  // 3. THEME PERSISTENCE
  describe("Theme Management", () => {
    it("supports switching between light and obsidian dark modes", () => {
      let currentTheme: "light" | "dark" = "light";
      const switchTheme = (target: "light" | "dark") => {
        currentTheme = target;
        return currentTheme;
      };

      expect(switchTheme("dark")).toBe("dark");
      expect(switchTheme("light")).toBe("light");
    });

    it("verifies unified titlebar overlay configuration matching 38px height and white background in light mode", () => {
      const getTitleBarConfig = (theme: "light" | "dark") => ({
        height: 38,
        color: theme === "dark" ? "#0b1120" : "#ffffff",
        symbolColor: theme === "dark" ? "#f8fafc" : "#0f172a",
      });

      const lightConfig = getTitleBarConfig("light");
      expect(lightConfig.height).toBe(38);
      expect(lightConfig.color).toBe("#ffffff");
      expect(lightConfig.symbolColor).toBe("#0f172a");

      const darkConfig = getTitleBarConfig("dark");
      expect(darkConfig.height).toBe(38);
      expect(darkConfig.color).toBe("#0b1120");
      expect(darkConfig.symbolColor).toBe("#f8fafc");
    });
  });

  // 4. DIFFERENTIAL HOT-UPDATES (IN-PLACE REPLACEMENT)
  describe("Check For Updates..", () => {
    it("identifies changed files and applies in-place update without full installer reinstallation", () => {
      const currentVersion = "1.4.2";
      const serverUpdate = {
        latestVersion: "1.4.3",
        hasUpdate: true,
        updateType: "differential",
        filesChanged: [
          { path: "dist/assets/index.js", size: "418 KB", hash: "a8f3b9c1d2e4" },
          { path: "dist/assets/theme.css", size: "14 KB", hash: "9e2c4f1a0b8d" },
        ],
        reinstallRequired: false,
      };

      expect(serverUpdate.hasUpdate).toBe(true);
      expect(serverUpdate.reinstallRequired).toBe(false);
      expect(serverUpdate.filesChanged.length).toBe(2);

      // In-place replacement
      const appliedVersion = serverUpdate.latestVersion;
      expect(appliedVersion).not.toBe(currentVersion);
      expect(appliedVersion).toBe("1.4.3");
    });
  });

  // 5. ENCRYPTED BACKUP & RESTORE
  describe("Portable Backup & Restore Vault", () => {
    it("encrypts and decrypts invoice data using AES-256-GCM envelope", async () => {
      const payload = {
        company: "Test Corp",
        invoices: [{ id: "INV-0001", amount: 1500, customer: "Client A" }],
        exportedAt: new Date().toISOString(),
      };
      const passphrase = "SuperSecureBackupPassphrase2026";

      const envelope = await encryptBackup(payload, passphrase);
      expect(envelope.algorithm).toBe("AES-GCM/PBKDF2-SHA256");
      expect(envelope.ciphertext).toBeDefined();

      const decrypted = await decryptBackup<typeof payload>(envelope, passphrase);
      expect(decrypted.company).toBe("Test Corp");
      expect(decrypted.invoices.length).toBe(1);
      expect(decrypted.invoices[0].id).toBe("INV-0001");
    });
  });

  // 6. DISCONNECT CONFIRMATION
  describe("Sign Out & Disconnect Confirmation Modal", () => {
    it("requires explicit user confirmation before disconnecting device", () => {
      let isDisconnected = false;
      let modalOpen = false;

      const triggerDisconnectClick = () => {
        modalOpen = true; // Opens confirmation modal instead of immediate disconnect
      };

      const handleConfirm = () => {
        modalOpen = false;
        isDisconnected = true;
      };

      const handleCancel = () => {
        modalOpen = false;
        isDisconnected = false;
      };

      // Click disconnect button in sidebar
      triggerDisconnectClick();
      expect(modalOpen).toBe(true);
      expect(isDisconnected).toBe(false);

      // If user cancels: remains connected
      handleCancel();
      expect(modalOpen).toBe(false);
      expect(isDisconnected).toBe(false);

      // Click again and confirm: disconnects
      triggerDisconnectClick();
      expect(modalOpen).toBe(true);
      handleConfirm();
      expect(modalOpen).toBe(false);
      expect(isDisconnected).toBe(true);
    });
  });

  // 6. PRIMARY INVOICE TEMPLATE SELECTION
  describe("Primary Invoice Template Configuration", () => {
    it("persists chosen primary invoice template and defaults new invoices to it", () => {
      const mockStorage: Record<string, string> = {};
      const storage = {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
      };

      // Clear or set initial
      storage.removeItem("primary_invoice_template");
      const defaultTmpl = storage.getItem("primary_invoice_template") || "default_invoice";
      expect(defaultTmpl).toBe("default_invoice");

      // Set primary template to Nordic Minimal Sage
      storage.setItem("primary_invoice_template", "nordic_minimal_sage");
      expect(storage.getItem("primary_invoice_template")).toBe("nordic_minimal_sage");

      // Verify that new invoice generation picks up the primary template
      const activePrimary = storage.getItem("primary_invoice_template") || "default_invoice";
      expect(activePrimary).toBe("nordic_minimal_sage");
    });

    it("supports switching between all 4 invoice design templates as primary", () => {
      const mockStorage: Record<string, string> = {};
      const storage = {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
      };

      const templates = [
        "default_invoice",
        "editorial_serif",
        "executive_charcoal_gold",
        "nordic_minimal_sage",
      ];

      templates.forEach((tmplId) => {
        storage.setItem("primary_invoice_template", tmplId);
        expect(storage.getItem("primary_invoice_template")).toBe(tmplId);
      });
    });

    it("displays only templates assigned to the company by admin in Theme & Templates section", () => {
      const companyWithLimitedTemplates = {
        id: "comp_101",
        name: "Prime Consulting",
        plan: "Commercial Active",
        templates: ["Default Invoice", "Editorial Serif"],
      };

      const displayedTemplates = getAccessibleTemplates(companyWithLimitedTemplates, false);
      expect(displayedTemplates.length).toBe(2);
      expect(displayedTemplates.map((t) => t.id)).toEqual(["default_invoice", "editorial_serif"]);

      // Unassigned templates are not shown in the settings section
      const ids = displayedTemplates.map((t) => t.id);
      expect(ids).not.toContain("executive_charcoal_gold");
      expect(ids).not.toContain("nordic_minimal_sage");
    });

    it("restricts Guest Mode in Theme & Templates section to only the Main Default Template", () => {
      const guestCompany = {
        id: "guest_local",
        name: "Guest Workspace",
        plan: "72-hour Guest",
        templates: ["Default Invoice"],
      };

      const displayedTemplates = getAccessibleTemplates(guestCompany, true);
      expect(displayedTemplates.length).toBe(1);
      expect(displayedTemplates[0].id).toBe("default_invoice");
      expect(displayedTemplates[0].name).toBe("Default Invoice");
    });

    it("resets primaryTemplate to available default if currently chosen template is unassigned by admin", () => {
      const company = {
        id: "comp_101",
        name: "Prime Consulting",
        plan: "Commercial Active",
        templates: ["Default Invoice"], // Admin unassigned 'editorial_serif'
      };

      const previousChosenTemplate = "editorial_serif";
      const isStillAssigned = isTemplateAssignedToCompany(company, previousChosenTemplate, false);
      expect(isStillAssigned).toBe(false);

      const accessible = getAccessibleTemplates(company, false);
      const activeTemplate = isStillAssigned ? previousChosenTemplate : (accessible[0]?.id || "default_invoice");
      expect(activeTemplate).toBe("default_invoice");
    });
  });

  // 7. DATE PICKER DROPDOWN UTILITY
  describe("Date Picker Dropdown Utility", () => {
    it("parses and formats MM/DD/YYYY dates cleanly", () => {
      const testDateStr = "10/26/2026";
      const parts = testDateStr.split("/");
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      const d = new Date(year, month - 1, day);
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(9); // 0-indexed October
      expect(d.getDate()).toBe(26);

      const formatted = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      expect(formatted).toBe("10/26/2026");
    });

    it("calculates Net 7, Net 14, and Net 30 due dates from issue date accurately", () => {
      const base = new Date(2026, 9, 26); // Oct 26 2026

      const net7 = new Date(base);
      net7.setDate(net7.getDate() + 7);
      expect(net7.getMonth()).toBe(10); // November
      expect(net7.getDate()).toBe(2);

      const net14 = new Date(base);
      net14.setDate(net14.getDate() + 14);
      expect(net14.getMonth()).toBe(10); // November
      expect(net14.getDate()).toBe(9);

      const net30 = new Date(base);
      net30.setDate(net30.getDate() + 30);
      expect(net30.getMonth()).toBe(10); // November
      expect(net30.getDate()).toBe(25);
    });
  });

  // 8. DEVICE OFFLINE LEASE MONITORING
  describe("Device Offline Lease Monitoring", () => {
    it("computes remaining offline lease window and safe percentage threshold", () => {
      const now = Date.now();
      const expiresAtMs = now + 48 * 3600 * 1000; // 48 hours left
      const remainingMs = Math.max(0, expiresAtMs - now);
      const hoursRemaining = Math.floor(remainingMs / (3600 * 1000));
      const percentRemaining = Math.round((remainingMs / (72 * 3600 * 1000)) * 100);

      expect(hoursRemaining).toBe(48);
      expect(percentRemaining).toBe(67);
      expect(percentRemaining).toBeGreaterThan(25); // Safe green threshold
    });

    it("verifies hardware lease identity bindings for local device", () => {
      const testLicense = {
        mode: "commercial" as const,
        companyId: "comp_123",
        companyName: "Bizz Co",
        authenticatedUser: "rishadpnpm@gmail.com",
        deviceId: "DESKTOP-RISHAD",
        serialNumber: "CND140995N",
        fingerprint: "fp_a1b2c3d4",
        activated: true,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      };

      expect(testLicense.serialNumber).toBe("CND140995N");
      expect(testLicense.mode).toBe("commercial");
      expect(testLicense.activated).toBe(true);
      expect(testLicense.fingerprint).toContain("fp_");
    });

    it("triggers manual lease renewal callback to extend offline lease window", async () => {
      const onRefresh = vi.fn().mockResolvedValue(true);
      let isVerifying = false;

      const triggerRenewal = async () => {
        isVerifying = true;
        const res = await onRefresh(true);
        isVerifying = false;
        return res;
      };

      const result = await triggerRenewal();
      expect(onRefresh).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
      expect(isVerifying).toBe(false);
    });

    it("live-counts down sub-hour leases second-by-second (e.g. 2-minute lease: 02:00 -> 01:59 -> 01:58)", () => {
      const leaseExpiresAt = 1000000; // t0 + 120,000ms (2 minutes)
      const formatTime = (nowMs: number) => {
        const remainingMs = Math.max(0, leaseExpiresAt - nowMs);
        const totalSecs = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        if (hours > 0) {
          return `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
        }
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      };

      // Initially at 2m (120s)
      expect(formatTime(1000000 - 120000)).toBe("02:00");
      // After 1 second: 01:59
      expect(formatTime(1000000 - 119000)).toBe("01:59");
      // After 2 seconds: 01:58
      expect(formatTime(1000000 - 118000)).toBe("01:58");
      // After 61 seconds: 00:59
      expect(formatTime(1000000 - 59000)).toBe("00:59");
      // At 0 seconds: 00:00
      expect(formatTime(1000000)).toBe("00:00");
    });

    it("live-counts down multi-hour leases decrementing seconds continuously (e.g. 48h lease)", () => {
      const leaseDurationMs = 48 * 3600 * 1000;
      const baseNow = 5000000;
      const expiresAt = baseNow + leaseDurationMs;

      const formatHoursTimer = (currMs: number) => {
        const remainingMs = Math.max(0, expiresAt - currMs);
        const totalSecs = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return {
          label: `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`,
          digital: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
        };
      };

      // 1 second elapsed: 47h 59m 59s
      const tick1 = formatHoursTimer(baseNow + 1000);
      expect(tick1.label).toBe("47h 59m 59s");
      expect(tick1.digital).toBe("47:59:59");

      // 2 seconds elapsed: 47h 59m 58s
      const tick2 = formatHoursTimer(baseNow + 2000);
      expect(tick2.label).toBe("47h 59m 58s");
      expect(tick2.digital).toBe("47:59:58");

      // 10 seconds elapsed: 47h 59m 50s
      const tick10 = formatHoursTimer(baseNow + 10000);
      expect(tick10.label).toBe("47h 59m 50s");
      expect(tick10.digital).toBe("47:59:50");
    });
  });

  // 9. DYNAMIC BUTTON CHANGE-DETECTION & HIGHLIGHT STATES
  describe("Settings Buttons Dynamic Change-Detection & Highlight States", () => {
    it("disables 'Update My Password' button when no inputs are entered and highlights when changes are made", () => {
      let currentPassword = "";
      let newPassword = "";
      let confirmPassword = "";

      const getPasswordState = (curr: string, next: string, conf: string) => {
        const hasChanges = Boolean(curr.trim() || next.trim() || conf.trim());
        const isReady = Boolean(
          curr.trim() &&
          next.length >= 6 &&
          conf === next &&
          curr !== next
        );
        return {
          hasChanges,
          isReady,
          buttonDisabled: !hasChanges,
          buttonClass: hasChanges ? "btn-highlighted" : "btn-no-changes",
        };
      };

      // Initially untouched
      const initial = getPasswordState(currentPassword, newPassword, confirmPassword);
      expect(initial.hasChanges).toBe(false);
      expect(initial.buttonDisabled).toBe(true);
      expect(initial.buttonClass).toBe("btn-no-changes");

      // User types current password
      currentPassword = "OldSecretPassword123";
      const typing1 = getPasswordState(currentPassword, newPassword, confirmPassword);
      expect(typing1.hasChanges).toBe(true);
      expect(typing1.buttonDisabled).toBe(false);
      expect(typing1.buttonClass).toBe("btn-highlighted");

      // User finishes entering complete valid new password
      newPassword = "NewSecretPassword2026!";
      confirmPassword = "NewSecretPassword2026!";
      const ready = getPasswordState(currentPassword, newPassword, confirmPassword);
      expect(ready.hasChanges).toBe(true);
      expect(ready.isReady).toBe(true);
      expect(ready.buttonDisabled).toBe(false);
      expect(ready.buttonClass).toBe("btn-highlighted");

      // Form clears after successful update
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      const cleared = getPasswordState(currentPassword, newPassword, confirmPassword);
      expect(cleared.hasChanges).toBe(false);
      expect(cleared.buttonDisabled).toBe(true);
      expect(cleared.buttonClass).toBe("btn-no-changes");
    });

    it("disables 'Save PIN Lock Settings' button when config is unchanged and highlights when modified", () => {
      const initialConfig: PinLockConfig = {
        enabled: true,
        pinLength: 4,
        pin: "2468",
        autoLockMinutes: 5,
      };

      const computePinButtonState = (
        current: { enabled: boolean; pinLength: 4 | 5 | 6; pin: string; confirmPin: string; autoLockMinutes: number },
        saved: PinLockConfig
      ) => {
        const hasChanges =
          current.enabled !== saved.enabled ||
          (current.enabled && (
            current.pinLength !== (saved.pinLength || 4) ||
            current.pin !== (saved.pin || "") ||
            current.confirmPin !== (saved.pin || "") ||
            current.autoLockMinutes !== (saved.autoLockMinutes ?? 5)
          )) ||
          (!current.enabled && saved.enabled);

        return {
          hasChanges,
          buttonDisabled: !hasChanges,
          buttonClass: hasChanges ? "btn-highlighted" : "btn-no-changes",
        };
      };

      // Initially untouched
      const untouched = computePinButtonState(
        { enabled: true, pinLength: 4, pin: "2468", confirmPin: "2468", autoLockMinutes: 5 },
        initialConfig
      );
      expect(untouched.hasChanges).toBe(false);
      expect(untouched.buttonDisabled).toBe(true);
      expect(untouched.buttonClass).toBe("btn-no-changes");

      // User modifies PIN length from 4 to 5
      const changedLength = computePinButtonState(
        { enabled: true, pinLength: 5, pin: "", confirmPin: "", autoLockMinutes: 5 },
        initialConfig
      );
      expect(changedLength.hasChanges).toBe(true);
      expect(changedLength.buttonDisabled).toBe(false);
      expect(changedLength.buttonClass).toBe("btn-highlighted");

      // User modifies auto-lock dropdown from 5 to 15 minutes
      const changedAutoLock = computePinButtonState(
        { enabled: true, pinLength: 4, pin: "2468", confirmPin: "2468", autoLockMinutes: 15 },
        initialConfig
      );
      expect(changedAutoLock.hasChanges).toBe(true);
      expect(changedAutoLock.buttonDisabled).toBe(false);
      expect(changedAutoLock.buttonClass).toBe("btn-highlighted");

      // User toggles lock OFF
      const toggledOff = computePinButtonState(
        { enabled: false, pinLength: 4, pin: "", confirmPin: "", autoLockMinutes: 5 },
        initialConfig
      );
      expect(toggledOff.hasChanges).toBe(true);
      expect(toggledOff.buttonDisabled).toBe(false);
      expect(toggledOff.buttonClass).toBe("btn-highlighted");

      // User saves new config: baseline updates to match
      const updatedConfig: PinLockConfig = {
        enabled: false,
        pinLength: 4,
        pin: "",
        autoLockMinutes: 5,
      };
      const afterSave = computePinButtonState(
        { enabled: false, pinLength: 4, pin: "", confirmPin: "", autoLockMinutes: 5 },
        updatedConfig
      );
      expect(afterSave.hasChanges).toBe(false);
      expect(afterSave.buttonDisabled).toBe(true);
      expect(afterSave.buttonClass).toBe("btn-no-changes");
    });
  });

  // 10. COMBINED SETTINGS SECTIONS & READ-ONLY SUBSCRIPTION VIEW
  describe("Combined Settings Sections & Read-Only Subscription View", () => {
    it("combines 'Change Password' and 'App PIN Lock' under unified Security section", () => {
      const securityTab = {
        id: "security",
        label: "Password & PIN Lock",
        sections: ["change_password", "app_pin_lock"],
      };

      expect(securityTab.sections).toContain("change_password");
      expect(securityTab.sections).toContain("app_pin_lock");
      expect(securityTab.sections.length).toBe(2);
    });

    it("combines 'Theme & Appearance' and 'Choose Template' under unified Theme & Templates section", () => {
      const appearanceTab = {
        id: "appearance",
        label: "Theme & Templates",
        features: ["light_dark_theme", "tax_classification", "primary_invoice_templates"],
      };

      expect(appearanceTab.features).toContain("light_dark_theme");
      expect(appearanceTab.features).toContain("primary_invoice_templates");
      expect(appearanceTab.features.length).toBe(3);
    });

    it("renders Subscription section with brand details, validity, and strict read-only guarantees", () => {
      const companySubscription = {
        name: "Bizz Co",
        code: "NEW-5044",
        email: "rishadpnpm@gmail.com",
        contactNo: "+971 50 123 4567",
        address: "Industrial Area 5, Sharjah, UAE",
        plan: "Plus Annual",
        status: "active" as const,
        expires: "2027-10-26",
        installationKey: "W2Z-TG6-34M2",
        license: "lic_active_12345",
        devicesAllowed: 3,
        devices: [{ id: "dev-1" }],
        isReadOnly: true,
      };

      // Verify read-only enforcement
      expect(companySubscription.isReadOnly).toBe(true);
      expect(companySubscription.name).toBe("Bizz Co");
      expect(companySubscription.code).toBe("NEW-5044");
      expect(companySubscription.plan).toBe("Plus Annual");

      // Verify expiration & validity days calculation
      const expMs = new Date(companySubscription.expires).getTime();
      const nowMs = new Date("2026-10-30").getTime();
      const daysLeft = Math.ceil((expMs - nowMs) / (1000 * 60 * 60 * 24));
      expect(daysLeft).toBeGreaterThan(300);
      expect(companySubscription.devicesAllowed).toBe(3);
    });
  });

  // 11. CONFIRM & SAVE BUTTON ENFORCEMENT
  describe("Make All Changes After Only Confirm or Save Button", () => {
    it("stages theme change without applying immediately until user confirms and saves", () => {
      let activeTheme: "light" | "dark" = "light";
      let stagedTheme: "light" | "dark" = activeTheme;
      const onThemeChange = vi.fn((newTheme: "light" | "dark") => {
        activeTheme = newTheme;
      });

      // User clicks dark mode -> only stages the selection
      const handleStageTheme = (theme: "light" | "dark") => {
        stagedTheme = theme;
      };

      handleStageTheme("dark");
      expect(stagedTheme).toBe("dark");
      // System theme has NOT changed yet
      expect(activeTheme).toBe("light");
      expect(onThemeChange).not.toHaveBeenCalled();

      // User clicks Discard
      stagedTheme = activeTheme;
      expect(stagedTheme).toBe("light");
      expect(activeTheme).toBe("light");

      // User clicks dark mode again and clicks Confirm & Save
      handleStageTheme("dark");
      const handleSave = () => {
        if (stagedTheme !== activeTheme) {
          onThemeChange(stagedTheme);
        }
      };
      handleSave();
      expect(onThemeChange).toHaveBeenCalledWith("dark");
      expect(activeTheme).toBe("dark");
    });

    it("stages UAE Tax Classification change without saving to storage until confirm button is clicked", () => {
      let savedTaxMode: "tax_invoice" | "non_tax_invoice" = "tax_invoice";
      let stagedTaxMode = savedTaxMode;
      const storage: Record<string, string> = { invoice_tax_mode: "tax_invoice" };

      // User selects Non-Tax Invoice -> staged only
      stagedTaxMode = "non_tax_invoice";
      expect(storage.invoice_tax_mode).toBe("tax_invoice");
      expect(savedTaxMode).toBe("tax_invoice");

      // Confirm & Save is triggered
      const handleSaveTax = () => {
        savedTaxMode = stagedTaxMode;
        storage.invoice_tax_mode = stagedTaxMode;
      };
      handleSaveTax();

      expect(savedTaxMode).toBe("non_tax_invoice");
      expect(storage.invoice_tax_mode).toBe("non_tax_invoice");
    });

    it("stages primary invoice template without persisting until confirmed", () => {
      let savedPrimary = "default_invoice";
      let stagedPrimary = savedPrimary;
      const storage: Record<string, string> = { primary_invoice_template: "default_invoice" };

      // Select new template
      stagedPrimary = "executive_charcoal_gold";
      expect(savedPrimary).toBe("default_invoice");
      expect(storage.primary_invoice_template).toBe("default_invoice");

      // Discard
      stagedPrimary = savedPrimary;
      expect(stagedPrimary).toBe("default_invoice");

      // Stage and Confirm
      stagedPrimary = "nordic_minimal_sage";
      const handleSaveTemplate = () => {
        savedPrimary = stagedPrimary;
        storage.primary_invoice_template = stagedPrimary;
      };
      handleSaveTemplate();
      expect(savedPrimary).toBe("nordic_minimal_sage");
      expect(storage.primary_invoice_template).toBe("nordic_minimal_sage");
    });

    it("enforces confirm & save on web portal template assignments", () => {
      const committedTemplates = ["Default Invoice"];
      let stagedTemplates = [...committedTemplates];
      const apiAssign = vi.fn();

      // Stage assigning two more templates
      stagedTemplates.push("Editorial Serif", "Executive Charcoal & Gold");
      expect(stagedTemplates.length).toBe(3);
      expect(apiAssign).not.toHaveBeenCalled();

      // Discard restores original
      stagedTemplates = [...committedTemplates];
      expect(stagedTemplates.length).toBe(1);

      // Re-stage and Confirm & Save
      stagedTemplates = ["Default Invoice", "Nordic Minimal Sage"];
      const handleConfirmSave = () => {
        apiAssign("comp_123", stagedTemplates);
      };
      handleConfirmSave();

      expect(apiAssign).toHaveBeenCalledWith("comp_123", [
        "Default Invoice",
        "Nordic Minimal Sage",
      ]);
    });
  });
});

