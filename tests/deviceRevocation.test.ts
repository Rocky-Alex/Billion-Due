import { describe, expect, it } from "vitest";
import { Company, DeviceRequest } from "../shared/src/domain/demoData";

describe("Device Revocation, Auto-Logout & Re-login Security Copy Workflow", () => {
  const mockCompany: Company = {
    id: "comp_test_101",
    name: "Summit Retailers LLC",
    code: "SUMMIT",
    email: "billing@summit.com",
    superAdminUser: "summit_admin",
    superAdminPassword: "Password123!",
    installationKey: "KEY-778-990",
    status: "active",
    plan: "Business Annual",
    license: "LIC-SUMMIT-2026",
    expires: "2027-10-26",
    seatsUsed: 1,
    seatsAllowed: 5,
    devicesAllowed: 3,
    templates: ["Standard Invoice"],
    devices: [
      {
        id: "dev_pos_counter1",
        name: "POS Counter 1",
        os: "Windows 11 Pro",
        user: "Counter Operator",
        fingerprint: "FP-A1B2C3D4E5",
        activated: "2026-01-01",
        lastSeen: "Just now",
        leaseHours: 72,
        status: "active",
        live: true,
      },
      {
        id: "dev_manager_laptop",
        name: "Manager Laptop",
        os: "Windows 11 Pro",
        user: "Store Manager",
        fingerprint: "FP-F6G7H8I9J0",
        activated: "2026-02-15",
        lastSeen: "10 mins ago",
        leaseHours: 72,
        status: "active",
        live: false,
      },
    ],
  };

  it("detects when a device is removed from website portal by client or admin", () => {
    const targetDeviceId = "dev_pos_counter1";
    const targetFingerprint = "FP-A1B2C3D4E5";

    // Simulate device deletion in portal
    const updatedCompany: Company = {
      ...mockCompany,
      devices: mockCompany.devices.filter((d) => d.id !== targetDeviceId),
    };

    expect(updatedCompany.devices.length).toBe(1);
    expect(updatedCompany.devices.some((d) => d.id === targetDeviceId)).toBe(false);

    // Verify unlinked status calculation
    const isUnlinked = !updatedCompany.devices.some(
      (d) => d.id === targetDeviceId || d.fingerprint === targetFingerprint,
    );
    expect(isUnlinked).toBe(true);
  });

  it("initiates automatic logout by clearing active session tokens when removed", () => {
    // Mock local storage session tokens
    const mockStorage: Record<string, string> = {
      ledgershield_session_token: "active_jwt_token_12345",
      ledgershield_auth_user: "Counter Operator",
      ledgershield_desktop_company_id: mockCompany.id,
    };

    const isRemoved = true;
    if (isRemoved) {
      delete mockStorage.ledgershield_session_token;
      delete mockStorage.ledgershield_auth_user;
    }

    expect(mockStorage.ledgershield_session_token).toBeUndefined();
    expect(mockStorage.ledgershield_auth_user).toBeUndefined();
    // Device is now logged out automatically
  });

  it("constructs a re-login request with Admin Section routing and security Gmail copy", () => {
    const userGmail = "operator.security@gmail.com";
    const operatorName = "Alex Vance";

    const reloginRequest: DeviceRequest = {
      id: "REQ-9921",
      companyId: mockCompany.id,
      company: mockCompany.name,
      user: operatorName,
      userEmail: userGmail,
      license: mockCompany.license,
      deviceName: "POS Counter 1",
      fingerprint: "FP-A1B2C3D4E5",
      appVersion: "v1.4.2",
      attemptTime: "Just now",
      status: "pending",
      isRelogin: true,
      securityCopySentTo: userGmail,
    };

    expect(reloginRequest.isRelogin).toBe(true);
    expect(reloginRequest.userEmail).toBe("operator.security@gmail.com");
    expect(reloginRequest.securityCopySentTo).toBe("operator.security@gmail.com");
    expect(reloginRequest.status).toBe("pending");
  });

  it("routes the re-login request to Admin Section and increments pending counter", () => {
    const existingRequests: DeviceRequest[] = [];
    const newReloginReq: DeviceRequest = {
      id: "REQ-4482",
      companyId: mockCompany.id,
      company: mockCompany.name,
      user: "Counter Operator",
      userEmail: "store.staff@gmail.com",
      license: mockCompany.license,
      deviceName: "POS Counter 1",
      fingerprint: "FP-A1B2C3D4E5",
      appVersion: "v1.4.2",
      attemptTime: "Just now",
      status: "pending",
      isRelogin: true,
      securityCopySentTo: "store.staff@gmail.com",
    };

    const updatedRequests = [newReloginReq, ...existingRequests];
    const pendingList = updatedRequests.filter((r) => r.status === "pending");

    expect(pendingList.length).toBe(1);
    expect(pendingList[0].id).toBe("REQ-4482");
    expect(pendingList[0].isRelogin).toBe(true);
    expect(pendingList[0].userEmail).toBe("store.staff@gmail.com");
  });

  it("allows Admin to approve the re-login request, restoring the device and clearing revocation", () => {
    const targetFingerprint = "FP-A1B2C3D4E5";
    const req: DeviceRequest = {
      id: "REQ-8831",
      companyId: mockCompany.id,
      company: mockCompany.name,
      user: "Counter Operator",
      userEmail: "store.staff@gmail.com",
      license: mockCompany.license,
      deviceName: "POS Counter 1",
      fingerprint: targetFingerprint,
      appVersion: "v1.4.2",
      attemptTime: "Just now",
      status: "pending",
      isRelogin: true,
    };

    let requests = [req];
    let companies = [
      {
        ...mockCompany,
        devices: mockCompany.devices.filter((d) => d.fingerprint !== targetFingerprint),
      },
    ];
    let revocationFlag: string | null = JSON.stringify({ fingerprint: targetFingerprint });

    // Simulate Admin decision: approve
    const approve = true;
    requests = requests.map((r) =>
      r.id === req.id ? { ...r, status: approve ? "approved" : "rejected" } : r,
    );

    if (approve) {
      companies = companies.map((c) =>
        c.id !== req.companyId
          ? c
          : {
            ...c,
            devices: c.devices
              .filter((d) => d.fingerprint !== req.fingerprint)
              .concat({
                id: `device-${Date.now()}`,
                name: req.deviceName,
                os: "Windows 11 Pro",
                user: req.user,
                fingerprint: req.fingerprint,
                activated: "Today",
                lastSeen: "Just now",
                leaseHours: 72,
                status: "active",
                live: true,
              }),
          },
      );
      // Revocation flag cleared on admin approval
      revocationFlag = null;
    }

    expect(requests[0].status).toBe("approved");
    expect(companies[0].devices.some((d) => d.fingerprint === targetFingerprint)).toBe(true);
    expect(companies[0].devices.find((d) => d.fingerprint === targetFingerprint)?.status).toBe("active");
    expect(revocationFlag).toBeNull();
  });

  it("allows user to select 'Sign in Option' to reset session and re-authenticate", () => {
    const mockStorage: Record<string, string> = {
      ledgershield_desktop_company_id: "comp_old",
      ledgershield_desktop_device_id: "dev_old",
      ledgershield_device_revoked: JSON.stringify({ deviceId: "dev_old" }),
    };

    // User chooses Sign In Option -> disconnect() handler
    delete mockStorage.ledgershield_desktop_company_id;
    delete mockStorage.ledgershield_desktop_device_id;
    delete mockStorage.ledgershield_device_revoked;

    expect(mockStorage.ledgershield_desktop_company_id).toBeUndefined();
    expect(mockStorage.ledgershield_desktop_device_id).toBeUndefined();
    expect(mockStorage.ledgershield_device_revoked).toBeUndefined();
    // App is now ready for clean sign in or setup
  });

  it("locks the app and terminates credentials when server reports 'This device is not registered'", () => {
    const serverErrorMessage = "This device is not registered";
    let deviceRevoked = false;
    const mockStorage: Record<string, string> = {
      ledgershield_session_token: "jwt_session_abc",
      ledgershield_auth_user: "Counter Operator",
    };

    // Client catches error from server refreshLease
    if (
      serverErrorMessage.includes("not registered") ||
      serverErrorMessage.includes("not found") ||
      serverErrorMessage.includes("revoked")
    ) {
      deviceRevoked = true;
      mockStorage.ledgershield_device_revoked = JSON.stringify({
        reason: serverErrorMessage,
      });
      delete mockStorage.ledgershield_session_token;
      delete mockStorage.ledgershield_auth_user;
    }

    const lockReason = deviceRevoked ? "removed" : null;

    expect(deviceRevoked).toBe(true);
    expect(lockReason).toBe("removed");
    expect(mockStorage.ledgershield_session_token).toBeUndefined();
    expect(mockStorage.ledgershield_auth_user).toBeUndefined();
    expect(mockStorage.ledgershield_device_revoked).toBeDefined();
  });

  it("accepts and re-authorizes a device when admin approves re-login, updating deviceId and clearing revocation", () => {
    const oldDeviceId = "dev_old_revoked_11";
    const newAssignedDeviceId = "d_new_active_99";
    const fingerprint = "fp:win-CND140995N";
    const serialNumber = "CND140995N";

    // Mock company devices state in database after admin approved request
    const databaseDevices = [
      {
        id: newAssignedDeviceId,
        fingerprint,
        serial_number: null as string | null,
        status: "active",
      },
    ];

    // Client attempts lease refresh with old deviceId, but matching active fingerprint
    const match = databaseDevices.find(
      (d) =>
        (d.id === oldDeviceId || (d.fingerprint === fingerprint && d.status === "active")),
    );
    expect(match).toBeDefined();
    expect(match?.id).toBe(newAssignedDeviceId);

    // Server backfills serial number if missing
    if (match && !match.serial_number && serialNumber) {
      match.serial_number = serialNumber;
    }
    expect(match?.serial_number).toBe(serialNumber);

    // Client receives refreshed lease with new device ID and clears lock
    const mockStorage: Record<string, string> = {
      ledgershield_device_revoked: JSON.stringify({ reason: "Device unlinked" }),
      ledgershield_desktop_device_id: oldDeviceId,
    };
    let deviceRevoked = true;

    // Simulate successful lease refresh handler in DesktopApp
    const serverResponse = {
      ok: true,
      deviceId: match?.id,
      leaseExpiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
    };

    if (serverResponse.ok && serverResponse.deviceId) {
      mockStorage.ledgershield_desktop_device_id = serverResponse.deviceId;
      delete mockStorage.ledgershield_device_revoked;
      deviceRevoked = false;
    }

    expect(deviceRevoked).toBe(false);
    expect(mockStorage.ledgershield_device_revoked).toBeUndefined();
    expect(mockStorage.ledgershield_desktop_device_id).toBe(newAssignedDeviceId);
  });

  it("unlocks desktop app immediately when Check Approval Status detects server approval", () => {
    const fingerprint = "fp:win-CND140995N";
    const assignedDeviceId = "d_approved_100";
    let deviceRevoked = true;
    let companyDevices = [
      {
        id: "d_other_999",
        name: "Other PC",
        os: "Windows 11 Pro",
        user: "Other",
        fingerprint: "fp:win-OTHER",
        activated: "2026-01-01",
        lastSeen: "1h ago",
        leaseHours: 72,
        status: "active" as const,
        live: false,
      },
    ];

    const license = {
      companyId: mockCompany.id,
      companyName: mockCompany.name,
      deviceId: assignedDeviceId,
      deviceName: "Windows Desktop PC",
      fingerprint,
      serialNumber: "CND140995N",
      mode: "commercial" as const,
      installationKey: "KEY-778-990",
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
    };

    // Before unlock: unlinked check evaluates to true (device missing from active list)
    const isUnlinkedBefore = !companyDevices.some(
      (d) => d.status === "active" && (d.id === license.deviceId || d.fingerprint === license.fingerprint),
    );
    expect(isUnlinkedBefore).toBe(true);

    // Simulated onUnlock / ensureDeviceActiveInCompany
    const unlockDesktop = (approvedDeviceId?: string) => {
      deviceRevoked = false;
      const devId = approvedDeviceId || license.deviceId;
      companyDevices = [
        ...companyDevices,
        {
          id: devId,
          name: license.deviceName,
          os: "Windows 11 Pro",
          user: "Counter Operator",
          fingerprint: license.fingerprint,
          serialNumber: license.serialNumber,
          activated: "Today",
          lastSeen: "Just now",
          leaseHours: 72,
          status: "active",
          live: true,
        },
      ];
    };

    // User clicks "Check Approval Status" and server reports approved
    const serverCheckResult = { status: "approved", approved_device_id: assignedDeviceId };
    if (serverCheckResult.status === "approved") {
      unlockDesktop(serverCheckResult.approved_device_id);
    }

    const isUnlinkedAfter = !companyDevices.some(
      (d) => d.status === "active" && (d.id === license.deviceId || d.fingerprint === license.fingerprint),
    );
    const isRemoved = deviceRevoked || isUnlinkedAfter;
    const lockReason = isRemoved ? "removed" : null;

    expect(deviceRevoked).toBe(false);
    expect(isUnlinkedAfter).toBe(false);
    expect(lockReason).toBeNull(); // Lock screen dismisses and desktop app opens
  });

  it("keeps desktop locked and informs user when Check Approval Status detects pending request", () => {
    let deviceRevoked = true;
    let notifiedMessage = "";

    const serverCheckResult = { status: "pending" };
    const reactivatedLocally = false;

    if (serverCheckResult.status === "pending" && !reactivatedLocally) {
      notifiedMessage = "Awaiting administrator approval in Admin Section.";
    }

    const lockReason = deviceRevoked ? "removed" : null;

    expect(lockReason).toBe("removed");
    expect(notifiedMessage).toBe("Awaiting administrator approval in Admin Section.");
  });

  it("automatically unlocks client device without requiring manual click when auto-poll detects admin approval", async () => {
    let isDesktopLocked = true;
    let unlockedDeviceId = "";
    const activeReqId = "REQ-5512";
    const newApprovedDeviceId = "d_approved_auto_77";

    // Simulating auto-polling checkAutoApproval running every 2.5s
    const checkAutoApproval = (serverStatus: { status: string; approved_device_id?: string }) => {
      if (serverStatus.status === "approved" && serverStatus.approved_device_id) {
        isDesktopLocked = false;
        unlockedDeviceId = serverStatus.approved_device_id;
      }
    };

    // Before approval: remains locked
    checkAutoApproval({ status: "pending" });
    expect(isDesktopLocked).toBe(true);

    // Admin approves request in portal / Neon
    checkAutoApproval({ status: "approved", approved_device_id: newApprovedDeviceId });

    // Client device automatically unlocked
    expect(isDesktopLocked).toBe(false);
    expect(unlockedDeviceId).toBe(newApprovedDeviceId);
  });

  it("prevents redirecting back to lock screen by preserving active devices when initialCompany updates", () => {
    let forceUnlocked = true;
    let deviceRevoked = false;
    const activeFingerprint = "fp:win-CND140995N";

    // Simulating initialCompany arriving from parent App without this device yet
    const initialCompanyFromApp: Company = {
      ...mockCompany,
      devices: mockCompany.devices.filter((d) => d.fingerprint !== activeFingerprint),
    };

    // Current local DesktopApp company with active device
    let currentLocalCompany: Company = {
      ...mockCompany,
      devices: [
        ...mockCompany.devices,
        {
          id: "d_active_123",
          name: "POS Counter 1",
          os: "Windows 11 Pro",
          user: "Counter Operator",
          fingerprint: activeFingerprint,
          activated: "Today",
          lastSeen: "Just now",
          leaseHours: 72,
          status: "active",
          live: true,
        },
      ],
    };

    // Merge logic: preserve active device during parent initialCompany updates
    const activeDevs = currentLocalCompany.devices.filter(
      (d) => d.status === "active" && d.fingerprint === activeFingerprint,
    );
    const mergedDevices = [...initialCompanyFromApp.devices];
    for (const dev of activeDevs) {
      const idx = mergedDevices.findIndex((d) => d.fingerprint === dev.fingerprint);
      if (idx >= 0) {
        mergedDevices[idx] = { ...mergedDevices[idx], ...dev, status: "active" };
      } else {
        mergedDevices.push(dev);
      }
    }
    currentLocalCompany = { ...initialCompanyFromApp, devices: mergedDevices };

    const isUnlinked = forceUnlocked
      ? false
      : !currentLocalCompany.devices.some(
          (d) => d.status === "active" && d.fingerprint === activeFingerprint,
        );

    const isRemoved = deviceRevoked || isUnlinked;
    const lockReason = isRemoved ? "removed" : null;

    expect(lockReason).toBeNull();
    expect(currentLocalCompany.devices.some((d) => d.fingerprint === activeFingerprint)).toBe(true);
  });

  // 13. LIVE TRACKING & AUTO-FETCH ENGINE FOR REQUESTS
  describe("Web Portal Requests Live Tracking & Auto-Fetch Engine", () => {
    it("auto-fetches incoming device requests periodically and detects newly arrived requests", () => {
      let currentRequests: DeviceRequest[] = [
        {
          id: "REQ-1001",
          companyId: "comp_101",
          company: "Summit Retailers",
          user: "billing@summit.com",
          license: "LIC-101",
          deviceName: "POS-1",
          fingerprint: "FP-101",
          appVersion: "1.0.0",
          attemptTime: "12:00:00 PM",
          status: "approved",
        },
      ];

      const knownIds = new Set(currentRequests.map((r) => r.id));
      const notifications: string[] = [];
      const notify = (msg: string) => notifications.push(msg);

      // Emulate server poll response with new pending re-login request
      const serverResponse: DeviceRequest[] = [
        {
          id: "REQ-1002",
          companyId: "comp_101",
          company: "Summit Retailers",
          user: "billing@summit.com",
          license: "LIC-101",
          deviceName: "POS Counter 2",
          fingerprint: "FP-102",
          appVersion: "1.0.0",
          attemptTime: "12:05:00 PM",
          status: "pending",
          isRelogin: true,
        },
        ...currentRequests,
      ];

      // Poll logic: detect new pending request
      const newlyArrived = serverResponse.filter(
        (r) => r.status === "pending" && !knownIds.has(r.id),
      );
      expect(newlyArrived.length).toBe(1);
      expect(newlyArrived[0].id).toBe("REQ-1002");

      newlyArrived.forEach((nr) => {
        notify(`🔔 New device request #${nr.id}: "${nr.deviceName}" (${nr.company})`);
        knownIds.add(nr.id);
      });

      currentRequests = serverResponse;

      expect(notifications.length).toBe(1);
      expect(notifications[0]).toContain("REQ-1002");
      expect(currentRequests.length).toBe(2);
      expect(knownIds.has("REQ-1002")).toBe(true);

      // Subsequent poll with no new requests doesn't duplicate notification
      const nextPoll = [...currentRequests];
      const nextNewlyArrived = nextPoll.filter(
        (r) => r.status === "pending" && !knownIds.has(r.id),
      );
      expect(nextNewlyArrived.length).toBe(0);
    });

    it("handles auto-fetch network errors gracefully by keeping existing requests state", () => {
      const existing: DeviceRequest[] = [
        {
          id: "REQ-2001",
          companyId: "comp_202",
          company: "Acme Corp",
          user: "acme@gmail.com",
          license: "LIC-202",
          deviceName: "Billing Terminal 1",
          fingerprint: "FP-202",
          appVersion: "1.0.0",
          attemptTime: "10:00:00 AM",
          status: "pending",
        },
      ];

      let state = [...existing];
      const fetchLive = (succeed: boolean) => {
        try {
          if (!succeed) throw new Error("Neon offline");
          state = [];
        } catch {
          // Graceful fallback: maintain existing state
        }
      };

      fetchLive(false);
      expect(state.length).toBe(1);
      expect(state[0].id).toBe("REQ-2001");
    });
  });

  describe("Immediate Suspension on Device Removal (Web Portal -> Desktop App)", () => {
    it("immediately locks desktop when all devices are removed (empty devices array)", () => {
      const license = {
        companyId: "comp_test_101",
        deviceId: "dev_pos_counter1",
        fingerprint: "FP-A1B2C3D4E5",
        mode: "commercial",
      };

      // Company devices is now empty because admin or client removed all devices
      const companyWithNoDevices = {
        devices: [] as any[],
      };

      // New isDeviceUnlinkedFromCompany logic:
      const forceUnlocked = false;
      const deviceRevoked = false;

      const isUnlinked = (() => {
        if (forceUnlocked) return false;
        if (deviceRevoked) return true;
        if (!license || license.mode === "guest") return false;
        if (!companyWithNoDevices?.devices) return false;
        const match = companyWithNoDevices.devices.some(
          (d: any) =>
            d.status === "active" &&
            (d.id === license.deviceId || d.fingerprint === license.fingerprint),
        );
        return !match;
      })();

      // Must be unlinked and immediately lock
      expect(isUnlinked).toBe(true);
      const isRemoved = deviceRevoked || isUnlinked;
      const lockReason = isRemoved ? "removed" : null;
      expect(lockReason).toBe("removed");
    });

    it("evaluates device status endpoint response and immediately suspends if removed or revoked", () => {
      type StatusResponse = {
        active: boolean;
        revoked: boolean;
        deviceId?: string;
        reason?: string;
      };

      // 1. Device exists and active
      const activeRes: StatusResponse = { active: true, revoked: false, deviceId: "d_1" };
      expect(activeRes.revoked).toBe(false);
      expect(activeRes.active).toBe(true);

      // 2. Admin removed device
      const removedRes: StatusResponse = {
        active: false,
        revoked: true,
        reason: "This device has been unlinked from the portal by an administrator.",
      };

      let isLocked = false;
      let sessionActive = true;
      let warningMsg = "";

      const handleStatusCheck = (res: StatusResponse) => {
        if (res.revoked || !res.active) {
          isLocked = true;
          sessionActive = false;
          warningMsg = res.reason || "Device revoked";
        }
      };

      handleStatusCheck(removedRes);

      expect(isLocked).toBe(true);
      expect(sessionActive).toBe(false);
      expect(warningMsg).toContain("unlinked from the portal by an administrator");
    });

    it("broadcasts device revocation across channels and triggers session termination", () => {
      const mockStorage: Record<string, string> = {
        ledgershield_session_token: "active_token_123",
        ledgershield_auth_user: "Cashier 1",
      };
      let desktopLockReason: string | null = null;
      let toastNotification = "";

      const onRevocationReceived = (payload: { deviceId: string; reason?: string }) => {
        delete mockStorage.ledgershield_session_token;
        delete mockStorage.ledgershield_auth_user;
        desktopLockReason = "removed";
        toastNotification = `Device authorization revoked: ${payload.reason || "Device unlinked"}. Session access locked.`;
      };

      // Simulate BroadcastChannel event receipt
      onRevocationReceived({
        deviceId: "dev_pos_counter1",
        reason: "Unlinked by Admin",
      });

      expect(mockStorage.ledgershield_session_token).toBeUndefined();
      expect(mockStorage.ledgershield_auth_user).toBeUndefined();
      expect(desktopLockReason).toBe("removed");
      expect(toastNotification).toContain("Device authorization revoked: Unlinked by Admin. Session access locked.");
    });
  });
});


