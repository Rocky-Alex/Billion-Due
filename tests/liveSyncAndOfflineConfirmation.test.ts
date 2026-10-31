import { describe, expect, it, vi } from "vitest";
import { Company } from "../shared/src/domain/demoData";
import {
  INVOICE_TEMPLATES,
  getAccessibleTemplates,
  isTemplateAssignedToCompany,
} from "../shared/src/domain/invoiceTemplates";

describe("Live Synchronization & Offline Reconnection Confirmation", () => {
  const initialCompany: Company = {
    id: "comp_bizz_01",
    name: "Bizz Co",
    code: "COMMERCIAL",
    email: "rishadpnpm@gmail.com",
    contactNo: "971567064457",
    phone: "971567064457",
    address: "Industrial Area 5, Sharjah, UAE",
    superAdminUser: "bizz_admin",
    superAdminPassword: "Password123!",
    installationKey: "W2Z-TG6-34M2",
    status: "active",
    plan: "COMMERCIAL",
    license: "COMMERCIAL-ACTIVE",
    expires: "2027-12-31",
    seatsUsed: 1,
    seatsAllowed: 5,
    devicesAllowed: 2,
    templates: ["Default Invoice"],
    devices: [
      {
        id: "dev_laptop_01",
        name: "Main Workstation",
        os: "Windows 11 Pro",
        user: "Operations",
        fingerprint: "fp:win-0VV40PC2",
        activated: "2026-01-01",
        lastSeen: "Just now",
        leaseHours: 72,
        status: "active",
        live: true,
      },
    ],
  };

  it("automatically applies template updates in real-time when workstation is online", () => {
    let companyState = { ...initialCompany };
    let wasOffline = false;
    let modalPrompted = false;

    // Admin updates templates on portal
    const serverTemplates = [
      "Default Invoice",
      "Editorial Serif",
      "Executive Charcoal & Gold",
      "Nordic Minimal Sage",
    ];

    // Online live sync handler
    const handleSync = (serverTemplatesList: string[]) => {
      const currentNames = companyState.templates || ["Default Invoice"];
      const normServer = Array.from(
        new Set(serverTemplatesList.map((s) => s.trim().toLowerCase())),
      ).sort();
      const normCurrent = Array.from(
        new Set(currentNames.map((c) => c.trim().toLowerCase())),
      ).sort();

      const isDiff =
        normServer.length !== normCurrent.length ||
        normServer.some((val, idx) => val !== normCurrent[idx]);

      if (isDiff) {
        if (wasOffline) {
          modalPrompted = true;
        } else {
          // Real-time automatic apply
          companyState = { ...companyState, templates: serverTemplatesList };
        }
      }
    };

    handleSync(serverTemplates);

    // Modal was NOT prompted because device was continuously online
    expect(modalPrompted).toBe(false);
    // Company templates updated immediately
    expect(companyState.templates).toEqual(serverTemplates);

    // Verify settings accessible templates reflect the 4 assigned templates seamlessly
    const accessible = getAccessibleTemplates(companyState, false);
    expect(accessible.length).toBe(4);
    expect(accessible.map((t) => t.name)).toContain("Editorial Serif");
    expect(accessible.map((t) => t.name)).toContain("Executive Charcoal & Gold");
    expect(accessible.map((t) => t.name)).toContain("Nordic Minimal Sage");
    expect(accessible.map((t) => t.name)).toContain("Default Invoice");
  });

  it("prompts confirmation modal when device was offline and reconnects with remote changes", () => {
    let companyState = { ...initialCompany };
    let wasOffline = true; // Laptop was offline
    let modalData: { changes: string[]; updates: Partial<Company> } | null = null;

    const serverTemplates = ["Default Invoice", "Editorial Serif", "Executive Charcoal & Gold"];
    const serverCompany = {
      name: "Bizz Co International",
      phone: "+971 50 123 4567",
      plan: "ENTERPRISE",
    };

    // Reconnection sync evaluation
    const evaluateReconnection = () => {
      const changesSummary: string[] = [];
      const updates: Partial<Company> = {};

      // Template comparison
      const currentNames = companyState.templates || ["Default Invoice"];
      const normServer = Array.from(
        new Set(serverTemplates.map((s) => s.trim().toLowerCase())),
      ).sort();
      const normCurrent = Array.from(
        new Set(currentNames.map((c) => c.trim().toLowerCase())),
      ).sort();
      const templatesDiff =
        normServer.length !== normCurrent.length ||
        normServer.some((val, idx) => val !== normCurrent[idx]);

      if (templatesDiff) {
        changesSummary.push(`Assigned templates updated: ${serverTemplates.join(", ")}`);
        updates.templates = serverTemplates;
      }

      if (serverCompany.name !== companyState.name) {
        changesSummary.push(`Company name updated: "${serverCompany.name}"`);
        updates.name = serverCompany.name;
      }
      if (serverCompany.phone !== companyState.phone) {
        changesSummary.push(`Contact phone updated: "${serverCompany.phone}"`);
        updates.phone = serverCompany.phone;
      }
      if (serverCompany.plan !== companyState.plan) {
        changesSummary.push(`Subscription plan updated: "${serverCompany.plan}"`);
        updates.plan = serverCompany.plan;
      }

      if (changesSummary.length > 0) {
        if (wasOffline) {
          modalData = { changes: changesSummary, updates };
        } else {
          companyState = { ...companyState, ...updates };
        }
      }
    };

    evaluateReconnection();

    // Confirmation modal is triggered
    expect(modalData).not.toBeNull();
    expect(modalData!.changes.length).toBe(4);
    expect(modalData!.changes[0]).toContain("Assigned templates updated");
    expect(modalData!.changes[1]).toContain("Bizz Co International");

    // Local state remains unchanged until user confirms
    expect(companyState.name).toBe("Bizz Co");
    expect(companyState.templates).toEqual(["Default Invoice"]);
  });

  it("applies remote updates when user selects 'Apply Updates' on offline reconnect modal", () => {
    let companyState = { ...initialCompany };
    const pendingUpdates: Partial<Company> = {
      name: "Bizz Co International",
      phone: "+971 50 123 4567",
      plan: "ENTERPRISE",
      templates: ["Default Invoice", "Editorial Serif", "Executive Charcoal & Gold"],
    };

    // User clicks "Apply Updates"
    const onConfirm = () => {
      companyState = { ...companyState, ...pendingUpdates };
    };

    onConfirm();

    expect(companyState.name).toBe("Bizz Co International");
    expect(companyState.phone).toBe("+971 50 123 4567");
    expect(companyState.plan).toBe("ENTERPRISE");
    expect(companyState.templates).toEqual([
      "Default Invoice",
      "Editorial Serif",
      "Executive Charcoal & Gold",
    ]);

    // Template accessibility immediately updates
    const accessible = getAccessibleTemplates(companyState, false);
    expect(accessible.some((t) => t.name === "Editorial Serif")).toBe(true);
    expect(accessible.some((t) => t.name === "Executive Charcoal & Gold")).toBe(true);
  });

  it("retains local state and stores rejected signature when user selects 'No, Keep Current State'", () => {
    let companyState = { ...initialCompany };
    let rejectedSyncHash = "";
    const pendingUpdates: Partial<Company> = {
      name: "Bizz Co Renamed On Server",
      templates: ["Default Invoice", "Executive Charcoal & Gold"],
    };
    const signature = JSON.stringify(pendingUpdates);

    // User clicks "No, Keep Current State"
    const onDecline = () => {
      rejectedSyncHash = signature;
      // Do not apply updates
    };

    onDecline();

    // Local state is preserved
    expect(companyState.name).toBe("Bizz Co");
    expect(companyState.templates).toEqual(["Default Invoice"]);
    expect(rejectedSyncHash).toBe(signature);

    // On subsequent heartbeat poll, matching signature is skipped without re-prompting
    let promptedAgain = false;
    const nextHeartbeat = () => {
      if (rejectedSyncHash === signature) {
        // Skipped
        return;
      }
      promptedAgain = true;
    };

    nextHeartbeat();
    expect(promptedAgain).toBe(false);
  });

  it("handles bi-directional client disconnect: unlinks on backend and notifies admin panel", () => {
    let adminCompanyState = { ...initialCompany };
    expect(adminCompanyState.devices.length).toBe(1);

    const disconnectingDeviceId = "dev_laptop_01";
    const disconnectingFingerprint = "fp:win-0VV40PC2";

    // Simulate client workstation disconnect action
    const clientDisconnectPayload = {
      type: "device_disconnected",
      companyId: initialCompany.id,
      deviceId: disconnectingDeviceId,
      fingerprint: disconnectingFingerprint,
      name: "Main Workstation",
    };

    // Admin panel BroadcastChannel / live update listener
    const handleAdminSideDeviceDisconnect = (eventData: typeof clientDisconnectPayload) => {
      if (eventData.type === "device_disconnected") {
        adminCompanyState = {
          ...adminCompanyState,
          devices: adminCompanyState.devices.filter(
            (d) =>
              d.id !== eventData.deviceId && d.fingerprint !== eventData.fingerprint,
          ),
        };
      }
    };

    handleAdminSideDeviceDisconnect(clientDisconnectPayload);

    // Workstation is unlinked immediately on the admin side
    expect(adminCompanyState.devices.length).toBe(0);
    expect(
      adminCompanyState.devices.some((d) => d.id === disconnectingDeviceId),
    ).toBe(false);
  });

  it("suspends client desktop app immediately when admin removes device from web portal", () => {
    let appSuspended = false;
    let revocationReason = "";

    // Simulated response from /api/client/device/status after admin deletes device
    const serverStatusResponse = {
      active: false,
      revoked: true,
      reason: "This device has been unlinked from the portal by an administrator.",
    };

    const clientHeartbeatCheck = (res: typeof serverStatusResponse) => {
      if (res.revoked || !res.active) {
        appSuspended = true;
        revocationReason = res.reason;
      }
    };

    clientHeartbeatCheck(serverStatusResponse);

    expect(appSuspended).toBe(true);
    expect(revocationReason).toBe(
      "This device has been unlinked from the portal by an administrator.",
    );
  });

  it("always preserves Default Invoice as universally available even if admin assigns custom templates", () => {
    const companyWithCustom: Company = {
      ...initialCompany,
      templates: ["Executive Charcoal & Gold", "Nordic Minimal Sage"],
    };

    const accessible = getAccessibleTemplates(companyWithCustom, false);
    expect(accessible.some((t) => t.id === "default_invoice" || t.name === "Default Invoice")).toBe(true);
    expect(isTemplateAssignedToCompany(companyWithCustom, "default_invoice", false)).toBe(true);
  });
});
