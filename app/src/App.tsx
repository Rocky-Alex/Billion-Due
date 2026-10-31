import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CloudOff,
  Copy,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Headphones,
  KeyRound,
  Laptop,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Minus,
  MonitorCog,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Store,
  Trash2,
  Upload,
  Image as ImageIcon,
  UserRound,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import {
  companies as initialCompanies,
  initialRequests as initialDeviceRequests,
  invoices as emptyInvoices,
  products as emptyProducts,
  type Company,
  type Customer,
  type Device,
  type DeviceRequest,
  type Invoice,
  type Product,
  type SecurityEvent,
  generateInstallationKey,
  isDummyProduct,
  getNextInvoiceNumber,
  createRequestCode,
  downloadEncryptedBackup,
  encryptBackup,
  decryptBackup,
  type EncryptedEnvelope,
  secureStorage,
  adminApi,
  windowsInstallerUrl,
  INVOICE_TEMPLATES,
  populateInvoiceTemplate,
  isTemplateAssignedToCompany,
  getAccessibleTemplates,
  getTierInfo,
  type InvoiceTemplateItem,
  type InvoiceRenderData,
  Logo,
  StatusPill,
  Toasts,
  Metric,
  EmptyRows,
  money,
  guestCompany,
  commercialCompany,
  GUEST_COMPANY_ID,
  type DesktopLicense,
  type PortalRole,
  type Toast,
} from "@billiondue/shared";
import {
  DesktopAppSettings,
  type PinLockConfig,
} from "./components/DesktopAppSettings";
import { PinLockScreen } from "./components/PinLockScreen";
import { DisconnectConfirmModal } from "./components/DisconnectConfirmModal";
import { OfflineSyncConfirmModal } from "./components/OfflineSyncConfirmModal";
import { DatePickerDropdown } from "./components/DatePickerDropdown";
import { CustomerManager } from "./components/CustomerManager";
import { ProductManager } from "./components/ProductManager";
import {
  ProductAutocomplete,
  CustomerAutocomplete,
} from "./components/InvoiceAutocomplete";

export function App() {
  const [activeDesktopCompanyId, setActiveDesktopCompanyId] = useState<string>(
    () => localStorage.getItem("ledgershield_desktop_company_id") || "",
  );
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [requests, setRequests] = useState<DeviceRequest[]>(initialDeviceRequests);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [desktopLicense, setDesktopLicense] = useState<DesktopLicense | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ text: string; time: number }>({
    text: "",
    time: 0,
  });

  const notify = (text: string, tone: Toast["tone"] = "ok") => {
    const now = Date.now();
    if (
      lastToastRef.current.text === text &&
      now - lastToastRef.current.time < 4000
    ) {
      return;
    }
    lastToastRef.current = { text, time: now };

    const id = now + Math.random();
    setToasts((old) => {
      if (old.some((t) => t.text === text)) {
        return old;
      }
      return [...old, { id, text, tone }];
    });
    window.setTimeout(
      () => setToasts((old) => old.filter((x) => x.id !== id)),
      3200,
    );
  };

  useEffect(() => {
    const bridge =
      typeof window !== "undefined" ? window.ledgerShield : undefined;
    if (bridge?.getInstalledLicense) {
      bridge
        .getInstalledLicense()
        .then((raw) => {
          const lic = raw as DesktopLicense | null;
          if (lic && lic.companyId && lic.activated) {
            setDesktopLicense(lic);
            localStorage.setItem(
              "ledgershield_desktop_company_id",
              lic.companyId,
            );
            setActiveDesktopCompanyId(lic.companyId);
            const comp =
              lic.mode === "guest"
                ? guestCompany(lic)
                : commercialCompany(lic);
            setCompanies([comp]);
            if (lic.serialNumber) {
              localStorage.setItem(
                "ledgershield_device_serial",
                lic.serialNumber,
              );
            }
            if (lic.fingerprint) {
              localStorage.setItem(
                "ledgershield_device_fingerprint",
                lic.fingerprint,
              );
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (desktopLicense?.mode === "guest") return;
        const clientTargetCompanyId =
          activeDesktopCompanyId ||
          localStorage.getItem("ledgershield_desktop_company_id") ||
          "";
        if (!clientTargetCompanyId) return;
        const payload: any = await adminApi.clientBootstrap(clientTargetCompanyId);
        const rawCompanies: any[] = payload.company ? [payload.company] : [];
        const rawLicenses: any[] = payload.license ? [payload.license] : [];
        const rawDevices: any[] = payload.devices || [];
        const rawTemplates: any[] = payload.templates || [];
        if (rawCompanies.length) {
          const mapped: Company[] = rawCompanies.map((c: any) => {
            const lic = rawLicenses.find((l: any) => l.company_id === c.id) || {};
            const devices = rawDevices
              .filter((d: any) => d.company_id === c.id)
              .map((d: any) => ({
                id: d.id,
                name: d.name,
                os: d.os,
                user: d.assigned_user,
                fingerprint: d.fingerprint,
                serialNumber: d.serial_number || d.serialNumber || undefined,
                activated: d.activated_at
                  ? new Date(d.activated_at).toLocaleDateString()
                  : "Pending",
                lastSeen: d.last_verified_at
                  ? new Date(d.last_verified_at).toLocaleString()
                  : "Never",
                leaseHours: d.lease_expires_at
                  ? Math.max(
                      0,
                      (new Date(d.lease_expires_at).getTime() - Date.now()) /
                        3600000,
                    )
                  : 0,
                status: d.status === "replaced" ? "expired" : d.status,
                live: d.last_verified_at
                  ? Date.now() - new Date(d.last_verified_at).getTime() < 300000
                  : false,
              }));
            return {
              id: c.id,
              name: c.name,
              code: c.code,
              email: c.email,
              contactNo: c.contact_no || c.contactNo || c.phone || undefined,
              phone: c.phone || c.contact_no || c.contactNo || undefined,
              logo: c.logo || undefined,
              address: c.address || undefined,
              superAdminUser: c.super_admin_user || c.superAdminUser || c.email,
              superAdminPassword:
                c.super_admin_password || c.superAdminPassword || undefined,
              installationKey: c.installation_key || c.installationKey || "",
              status: c.status,
              plan: c.plan,
              license: lic.id || "Not issued",
              expires: lic.expires_at
                ? new Date(lic.expires_at).toLocaleDateString()
                : "—",
              seatsUsed: c.seats_used,
              seatsAllowed: c.seats_allowed,
              devicesAllowed: c.devices_allowed,
              templates: (() => {
                if (Array.isArray(payload.templates) && payload.templates.length > 0) {
                  const names = payload.templates
                    .map((t: any) => t.name || t.id)
                    .filter(Boolean);
                  if (!names.includes("Default Invoice")) {
                    names.unshift("Default Invoice");
                  }
                  return names;
                }
                const templateAssignments: any[] = payload.templateAssignments || [];
                const cAssigns = templateAssignments.filter(
                  (a: any) => a.company_id === c.id,
                );
                if (cAssigns.length > 0) {
                  const names = cAssigns
                    .map((a: any) => {
                      const t = (rawTemplates || []).find(
                        (rt: any) => rt.id === a.template_id,
                      );
                      return t ? t.name : a.template_id;
                    })
                    .filter(Boolean);
                  if (!names.includes("Default Invoice")) {
                    names.unshift("Default Invoice");
                  }
                  return names;
                }
                return ["Default Invoice"];
              })(),
              devices,
            };
          });
          setCompanies(mapped);
        }
      } catch {
        // offline or local mode
      }
    };
    void load();
  }, [activeDesktopCompanyId, desktopLicense?.mode]);

  const desktopCompany =
    companies.find((c) => c.id === activeDesktopCompanyId) ||
    companies.find(
      (c) =>
        c.id === desktopLicense?.companyId ||
        c.name === desktopLicense?.companyName,
    ) ||
    (activeDesktopCompanyId && companies.length ? companies[0] : null) ||
    (desktopLicense
      ? desktopLicense.mode === "guest"
        ? guestCompany(desktopLicense)
        : commercialCompany(desktopLicense)
      : null);

  return (
    <div className="app surface-desktop">
      {desktopCompany ? (
        <DesktopApp
          company={desktopCompany}
          license={desktopLicense}
          notify={notify}
          onLicenseUpdate={(nextLicense) => {
            setDesktopLicense(nextLicense);
            void window.ledgerShield?.saveInstalledLicense(nextLicense);
          }}
          onUpdateCompany={(updated) => {
            setCompanies((prev) => {
              const targetId = updated.id || desktopCompany.id;
              const exists = prev.some((c) => c.id === targetId);
              if (!exists) {
                return [...prev, { ...desktopCompany, ...updated } as Company];
              }
              return prev.map((c) =>
                c.id === targetId ? { ...c, ...updated } : c,
              );
            });
          }}
          onRequestRelogin={async (details) => {
            const reqId = details.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
            const newReq: DeviceRequest = {
              id: reqId,
              companyId: desktopCompany.id,
              company: desktopCompany.name,
              user: details.userName,
              userEmail: details.userEmail,
              license:
                desktopLicense?.installationKey ||
                desktopCompany.license ||
                "Commercial",
              deviceName: desktopLicense?.deviceName || "Windows Desktop",
              fingerprint: desktopLicense?.fingerprint || "DEV-FP",
              appVersion: "v1.4.2",
              attemptTime: "Just now",
              status: "pending",
              isRelogin: true,
              securityCopySentTo: details.userEmail,
            };
            setRequests((prev) => [newReq, ...prev]);
            setSecurityEvents((prev) => [
              {
                id: `sec-${Date.now()}`,
                company: desktopCompany.name,
                device: desktopLicense?.deviceName || "Windows Desktop",
                fingerprint: desktopLicense?.fingerprint || "DEV-FP",
                reason: `Re-login request dispatched by ${details.userName}. Security audit copy sent to ${details.userEmail}.`,
                time: "Just now",
                severity: "Medium",
              },
              ...prev,
            ]);
            try {
              await adminApi.createDeviceRequest({
                id: reqId,
                companyId: desktopCompany.id,
                companyName: desktopCompany.name,
                user: details.userName,
                userEmail: details.userEmail,
                deviceName: desktopLicense?.deviceName || "Windows Desktop",
                fingerprint: desktopLicense?.fingerprint || "DEV-FP",
                appVersion: "v1.4.2",
                isRelogin: true,
              });
              notify(
                `Re-login request sent to Admin · Security copy dispatched to ${details.userEmail}`,
              );
            } catch {
              notify(
                `Re-login request queued locally · Security copy dispatched to ${details.userEmail}`,
              );
            }
          }}
          onDisconnect={() => {
            localStorage.removeItem("ledgershield_desktop_company_id");
            localStorage.removeItem("ledgershield_desktop_device_id");
            localStorage.removeItem("ledgershield_device_revoked");
            setActiveDesktopCompanyId("");
            setDesktopLicense(null);
          }}
        />
      ) : (
        <DesktopSetup
          companies={companies}
          notify={notify}
          onActivated={(comp, license) => {
            localStorage.setItem("ledgershield_desktop_company_id", comp.id);
            setCompanies([comp]);
            setDesktopLicense(license);
            setActiveDesktopCompanyId(comp.id);
          }}
        />
      )}
      <Toasts items={toasts} />
    </div>
  );
}

function DesktopSetup({
  companies,
  notify,
  onActivated,
}: {
  companies: Company[];
  notify: (s: string, tone?: Toast["tone"]) => void;
  onActivated: (company: Company, license: DesktopLicense) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [installationKey, setInstallationKey] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [demoOtpNotice, setDemoOtpNotice] = useState("");
  const [verifiedCompany, setVerifiedCompany] = useState<Company | null>(null);
  const [registeredDevice, setRegisteredDevice] = useState<{
    id: string;
    serialNumber: string;
    fingerprint: string;
    name: string;
    os: string;
  } | null>(null);
  const [activatedLicense, setActivatedLicense] =
    useState<DesktopLicense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const [serialNumber] = useState(() => {
    let saved = localStorage.getItem("ledgershield_device_serial");
    if (!saved) {
      const randHex = () =>
        Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1)
          .toUpperCase();
      saved = `SN-WIN-${randHex()}-${randHex()}`;
      localStorage.setItem("ledgershield_device_serial", saved);
    }
    return saved;
  });

  const [fingerprint] = useState(() => {
    let saved = localStorage.getItem("ledgershield_device_fingerprint");
    if (!saved) {
      saved = `fp:win-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      localStorage.setItem("ledgershield_device_fingerprint", saved);
    }
    return saved;
  });

  const [deviceName] = useState(
    `Office Workstation (${navigator.userAgent.includes("Windows") ? "Windows 11" : "Desktop PC"})`,
  );
  const os = "Windows 11 Pro 64-bit";

  const startGuestMode = async () => {
    setError("");
    try {
      const trial = await window.ledgerShield?.startGuestTrial(fingerprint);
      if (!trial) {
        setError("Secure guest-trial storage is unavailable on this device.");
        return;
      }
      if (trial.fingerprint !== fingerprint) {
        setError("This guest trial belongs to different device hardware.");
        return;
      }
      if (new Date(trial.expiresAt).getTime() <= Date.now()) {
        setError(
          "The one-time 72-hour Guest period has already ended on this device. Activate an approved commercial account to continue.",
        );
        return;
      }
      const license: DesktopLicense = {
        mode: "guest",
        companyId: GUEST_COMPANY_ID,
        companyName: "Guest Workspace",
        authenticatedUser: "Guest User",
        deviceId: `guest-${fingerprint}`,
        serialNumber,
        fingerprint,
        activated: true,
        verifiedAt: trial.startedAt,
        expiresAt: trial.expiresAt,
      };
      await window.ledgerShield?.saveInstalledLicense(license);
      notify(
        "72-hour guest workspace activated with the default template",
        "ok",
      );
      onActivated(guestCompany(license), license);
    } catch (guestError) {
      setError(
        guestError instanceof Error
          ? guestError.message
          : "The secure guest trial could not be started.",
      );
    }
  };

  const [pendingRequestId, setPendingRequestId] = useState<string>(
    () => localStorage.getItem("ledgershield_pending_req_id") || "",
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleKeyChange = (val: string) => {
    const raw = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }
    setInstallationKey(formatted);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your Super Admin username/email and password.");
      return;
    }
    if (!isOnline) {
      setError(
        "Active Internet connection is required during installation to verify Super Admin credentials.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.requestInstallOtp(
        email.trim(),
        password.trim(),
      );
      setMaskedEmail(res.maskedEmail || res.email);
      if (res.otpPreview) {
        setDemoOtpNotice(res.otpPreview);
      }
      const existing = companies.find((c) => c.id === res.companyId);
      if (existing) {
        setVerifiedCompany(existing);
      }
      notify(`OTP sent to ${res.maskedEmail || "Super Admin email"}.`, "ok");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Invalid Super Admin credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanedOtp = otp.trim().replace(/\D/g, "");
    if (cleanedOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }
    setStep(3);
  };

  const handleCompleteInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rawKey = installationKey.replace(/[^A-Z0-9]/g, "");
    if (rawKey.length !== 10) {
      setError("Installation Key must be exactly 10 characters (split 3-3-4).");
      return;
    }
    if (!isOnline) {
      setError(
        "Active Internet connection is required to register device hardware on the central server.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.verifyInstallation({
        emailOrUser: email.trim(),
        password: password.trim(),
        otp: otp.trim(),
        installationKey: installationKey.trim(),
        deviceName,
        serialNumber,
        fingerprint,
        os,
      });

      const rawComp = res.company as any;
      const compObj: Company = {
        id: rawComp.id || `c_${Date.now()}`,
        name: rawComp.name || "Commercial Client",
        code: rawComp.code || "APP-001",
        email: rawComp.email || email.trim(),
        superAdminUser: rawComp.super_admin_user || email.trim(),
        installationKey: rawComp.installation_key || installationKey,
        status: "active",
        plan: rawComp.plan || "Business Annual",
        offlineLeaseOverride: rawComp.offline_lease_override || undefined,
        license: (res.license as any).id,
        expires: new Date((res.license as any).expires_at).toLocaleDateString(),
        seatsUsed: rawComp.seats_used || 0,
        seatsAllowed: rawComp.seats_allowed || 5,
        devicesAllowed: rawComp.devices_allowed || 3,
        templates: [],
        devices: [
          {
            id: res.device.id,
            name: res.device.name,
            os: res.device.os,
            user: email.trim(),
            fingerprint: res.device.fingerprint,
            serialNumber: res.device.serialNumber,
            activated: new Date().toLocaleDateString(),
            lastSeen: "Just now",
            leaseHours: getTierInfo(
              rawComp.plan,
              rawComp.devices_allowed,
              rawComp.offline_lease_override,
            ).offlineHours,
            status: "active",
            live: true,
          },
        ],
      };

      const license: DesktopLicense = {
        mode: "commercial",
        companyId: compObj.id,
        companyName: compObj.name,
        authenticatedUser: compObj.superAdminUser || compObj.email,
        deviceId: res.device.id,
        serialNumber: res.device.serialNumber,
        fingerprint: res.device.fingerprint,
        installationKey: compObj.installationKey,
        activated: true,
        verifiedAt: res.device.verifiedAt,
        expiresAt: res.device.leaseExpiresAt,
      };

      setVerifiedCompany(compObj);
      setRegisteredDevice(res.device);
      setActivatedLicense(license);
      await window.ledgerShield?.saveInstalledLicense(license);
      localStorage.setItem("ledgershield_device_activated_company", compObj.id);
      localStorage.setItem(
        "ledgershield_device_serial",
        res.device.serialNumber,
      );
      localStorage.setItem(
        "ledgershield_device_fingerprint",
        res.device.fingerprint,
      );
      notify(
        "Installation verified & hardware registered on Neon database!",
        "ok",
      );
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to verify installation key or OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const checkPendingStatus = async () => {
    if (!pendingRequestId) return;
    setChecking(true);
    try {
      const res = await adminApi.checkDeviceRequestStatus(pendingRequestId);
      if (res.status === "approved") {
        localStorage.removeItem("ledgershield_pending_req_id");
        localStorage.removeItem("ledgershield_pending_company_id");
        setPendingRequestId("");
        const comp = companies.find((c) => c.id === res.company_id);
        if (!comp) {
          notify(
            "Approval received. Restart once to load the licensed company profile.",
            "warn",
          );
          return;
        }
        const now = new Date();
        const license: DesktopLicense = {
          mode: "commercial",
          companyId: comp.id,
          companyName: comp.name,
          authenticatedUser: comp.superAdminUser || comp.email,
          deviceId: res.approved_device_id || "",
          serialNumber,
          fingerprint,
          installationKey: comp.installationKey,
          activated: true,
          verifiedAt: res.last_verified_at || now.toISOString(),
          expiresAt:
            res.lease_expires_at ||
            new Date(
              now.getTime() +
                getTierInfo(
                  comp.plan,
                  comp.devicesAllowed,
                  comp.offlineLeaseOverride,
                ).offlineHours *
                  60 *
                  60 *
                  1000,
            ).toISOString(),
        };
        await window.ledgerShield?.saveInstalledLicense(license);
        notify(
          "Device approved by Administrator! Unlocking workspace...",
          "ok",
        );
        onActivated(comp, license);
      } else if (res.status === "rejected") {
        notify("Device request was rejected by Administrator", "warn");
        localStorage.removeItem("ledgershield_pending_req_id");
        setPendingRequestId("");
      } else {
        notify("Device request is still pending Administrator review", "ok");
      }
    } catch {
      notify("Could not check status with server; will retry", "warn");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="desktop-setup-container">
      <div style={{ marginBottom: 20 }}>
        <Logo />
      </div>

      <div className="install-wizard">
        <div className="wizard-header">
          <div>
            <span
              className="eyebrow"
              style={{ color: "#a5b4fc", letterSpacing: "1.5px" }}
            >
              COMMERCIAL DESKTOP INSTALLATION & SECURITY SETUP
            </span>
            <h1>Hardware License Setup Wizard</h1>
            <p>
              Verify Super Admin credentials, confirm email OTP, enter the
              10-character key, and register this PC's hardware.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: isOnline ? "#064e3b" : "#7f1d1d",
                color: isOnline ? "#A7F3D0" : "#fecaca",
                padding: "5px 11px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "Internet Active" : "No Internet"}
            </span>
          </div>
        </div>

        <div className="wizard-stepper">
          <div
            className={`wizard-step-item ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}
          >
            <span className="wizard-step-num">
              {step > 1 ? <Check size={12} /> : "1"}
            </span>
            <span>Super Admin</span>
          </div>
          <div className="wizard-step-sep" />
          <div
            className={`wizard-step-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}
          >
            <span className="wizard-step-num">
              {step > 2 ? <Check size={12} /> : "2"}
            </span>
            <span>Email OTP</span>
          </div>
          <div className="wizard-step-sep" />
          <div
            className={`wizard-step-item ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}
          >
            <span className="wizard-step-num">
              {step > 3 ? <Check size={12} /> : "3"}
            </span>
            <span>Install Key (10-Digit)</span>
          </div>
          <div className="wizard-step-sep" />
          <div
            className={`wizard-step-item ${step === 4 ? "completed active" : ""}`}
          >
            <span className="wizard-step-num">
              {step === 4 ? <Check size={12} /> : "4"}
            </span>
            <span>Ready</span>
          </div>
        </div>

        <div className="wizard-body">
          {/* Internet Banner */}
          <div className={`network-bar ${isOnline ? "online" : "offline"}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isOnline ? (
                <ShieldCheck size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span>
                {isOnline
                  ? "Active Internet Connected · High-Security TLS Handshake to Neon DB"
                  : "Internet Connection Required · Desktop installation security requires internet connection"}
              </span>
            </div>
            <button
              type="button"
              className="text-btn"
              onClick={() => setIsOnline(navigator.onLine)}
              style={{ fontSize: 10 }}
            >
              <RefreshCcw size={10} /> Check
            </button>
          </div>

          {error && (
            <div
              className="login-error"
              style={{ marginBottom: 16, fontSize: 11 }}
            >
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Super Admin Credentials */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    font: "700 16px 'Manrope'",
                    margin: "0 0 6px",
                    color: "#1e293b",
                  }}
                >
                  Step 1: Super Admin Credentials
                </h3>
                <p
                  className="muted"
                  style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}
                >
                  Enter the registered Super Admin Gmail / username and password
                  provided by the Software Administrator.
                </p>
              </div>

              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                Super Admin Gmail / Email
                <div className="input-with-actions">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Registered Super Admin email"
                    required
                    style={{ padding: "11px 13px", fontSize: 13 }}
                  />
                  {companies.length > 0 && (
                    <div className="input-addon-btns">
                      <button
                        type="button"
                        className="input-addon-btn"
                        title="Auto-fill first available company email"
                        onClick={() => {
                          const c = companies[0];
                          if (c) {
                            setEmail(c.superAdminUser || c.email);
                            setPassword("");
                          }
                        }}
                      >
                        <Zap size={11} /> Quick Fill
                      </button>
                    </div>
                  )}
                </div>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Super Admin Password
                <div className="input-with-actions">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Super Admin password"
                    required
                    style={{ padding: "11px 13px", fontSize: 13 }}
                  />
                  <div className="input-addon-btns">
                    <button
                      type="button"
                      className="input-addon-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => void startGuestMode()}
                  title="Local guest workspace expires automatically after 72 hours"
                >
                  <Clock3 size={14} /> Continue as 72-hour guest
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={submitting || !email.trim() || !password.trim()}
                  style={{ marginLeft: "auto", minWidth: 200 }}
                >
                  {submitting ? (
                    <RefreshCcw size={14} className="spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {submitting ? "Verifying..." : "Authenticate & Request OTP"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Email OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    font: "700 16px 'Manrope'",
                    margin: "0 0 6px",
                    color: "#1e293b",
                  }}
                >
                  Step 2: Enter Email Verification OTP
                </h3>
                <p
                  className="muted"
                  style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}
                >
                  A 6-digit one-time password (OTP) has been sent to{" "}
                  <strong>{maskedEmail || email}</strong>. Active internet
                  connection is mandatory.
                </p>
              </div>

              {demoOtpNotice && (
                <div
                  className="notice-banner"
                  style={{
                    background: "#eef2ff",
                    borderColor: "#c7d2fe",
                    color: "#047857",
                  }}
                >
                  <Sparkles size={16} />
                  <div>
                    <strong>Dev / Testing One-Time Code Ready:</strong>
                    <div>
                      For testing convenience, your generated OTP is:{" "}
                      <span className="otp-display-pill">
                        <b>{demoOtpNotice}</b>
                      </span>
                      <button
                        type="button"
                        className="secondary-btn btn-sm"
                        style={{ marginLeft: 10, padding: "2px 8px" }}
                        onClick={() => setOtp(demoOtpNotice)}
                      >
                        Click to Auto-Fill
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                6-Digit Verification OTP
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="• • • • • •"
                  required
                  style={{
                    fontFamily: "monospace",
                    fontSize: 24,
                    letterSpacing: 8,
                    textAlign: "center",
                    fontWeight: 800,
                    padding: "12px",
                    color: "#4338ca",
                    background: "#f8fafd",
                  }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={otp.length !== 6}
                  style={{ minWidth: 160 }}
                >
                  <BadgeCheck size={14} /> Verify OTP & Continue
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: 10-Character Installation Key & Hardware Binding */}
          {step === 3 && (
            <form onSubmit={handleCompleteInstall}>
              <div style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    font: "700 16px 'Manrope'",
                    margin: "0 0 6px",
                    color: "#1e293b",
                  }}
                >
                  Step 3: 10-Character Installation Key
                </h3>
                <p
                  className="muted"
                  style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}
                >
                  Enter the unique 10-character Installation Key (split 3-3-4)
                  issued by your Software Administrator. This key will
                  permanently bind this device to your commercial license.
                </p>
              </div>

              {verifiedCompany?.installationKey && (
                <div
                  className="notice-banner"
                  style={{
                    background: "#ECFDF5",
                    borderColor: "#D1FAE5",
                    color: "#047857",
                  }}
                >
                  <ShieldCheck size={16} />
                  <div>
                    <strong>Authorized Installation Key Detected:</strong>
                    <div>
                      Company key for <b>{verifiedCompany.name}</b>:{" "}
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          letterSpacing: 1.5,
                        }}
                      >
                        {verifiedCompany.installationKey}
                      </span>
                      <button
                        type="button"
                        className="secondary-btn btn-sm"
                        style={{ marginLeft: 10, padding: "2px 8px" }}
                        onClick={() =>
                          setInstallationKey(
                            verifiedCompany.installationKey || "",
                          )
                        }
                      >
                        Auto-Fill Key
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Installation Key (Format: XXX-XXX-XXXX)
                <input
                  type="text"
                  maxLength={12}
                  className="install-key-input"
                  value={installationKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="XXX-XXX-XXXX"
                  required
                />
                <small
                  className="muted"
                  style={{ fontSize: 10, textAlign: "center", marginTop: 4 }}
                >
                  Alphanumeric code ·{" "}
                  {installationKey.replace(/[^A-Z0-9]/g, "").length} of 10
                  characters entered
                </small>
              </label>

              {/* Hardware Registration Box */}
              <div className="hardware-box">
                <div className="hardware-box-head">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#1e293b",
                    }}
                  >
                    <Fingerprint size={14} color="#047857" />
                    <strong>Automatic Hardware Binding Details</strong>
                  </span>
                  <span
                    style={{
                      color: "#047857",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    ● Stored on Neon Cloud & Device
                  </span>
                </div>
                <div className="hardware-grid">
                  <div className="hardware-cell">
                    <span>Hardware Serial Number</span>
                    <strong>{serialNumber}</strong>
                  </div>
                  <div className="hardware-cell">
                    <span>Device Fingerprint</span>
                    <strong>{fingerprint}</strong>
                  </div>
                  <div className="hardware-cell">
                    <span>Machine Name</span>
                    <strong style={{ fontSize: 11 }}>{deviceName}</strong>
                  </div>
                  <div className="hardware-cell">
                    <span>Operating System</span>
                    <strong style={{ fontSize: 11 }}>{os}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    submitting ||
                    installationKey.replace(/[^A-Z0-9]/g, "").length !== 10
                  }
                  style={{ minWidth: 220 }}
                >
                  {submitting ? (
                    <RefreshCcw size={14} className="spin" />
                  ) : (
                    <KeyRound size={14} />
                  )}
                  {submitting
                    ? "Binding Hardware..."
                    : "Install & Bind Hardware"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Workspace Launch */}
          {step === 4 && (
            <div className="success-card">
              <div className="success-icon-wrap">
                <ShieldCheck size={38} />
              </div>
              <h2>Installation & Hardware Bound!</h2>
              <p>
                This desktop computer has been authenticated, verified via Super
                Admin email OTP, and permanently registered in the central Neon
                database.
              </p>

              <div className="activation-summary">
                <div className="activation-summary-row">
                  <span>Licensed Company:</span>
                  <strong>{verifiedCompany?.name || "Client Company"}</strong>
                </div>
                <div className="activation-summary-row">
                  <span>Super Admin Account:</span>
                  <strong>{verifiedCompany?.superAdminUser || email}</strong>
                </div>
                <div className="activation-summary-row">
                  <span>Installation Key:</span>
                  <strong style={{ fontFamily: "monospace" }}>
                    {installationKey || verifiedCompany?.installationKey}
                  </strong>
                </div>
                <div className="activation-summary-row">
                  <span>Registered Hardware Serial:</span>
                  <strong style={{ fontFamily: "monospace", color: "#4338ca" }}>
                    {registeredDevice?.serialNumber || serialNumber}
                  </strong>
                </div>
                <div className="activation-summary-row">
                  <span>Cloud Database Status:</span>
                  <strong style={{ color: "#047857" }}>
                    ● Registered & Active in Neon
                  </strong>
                </div>
              </div>

              <button
                className="primary-btn full"
                style={{ padding: "14px 20px", fontSize: 14 }}
                onClick={() => {
                  if (verifiedCompany && activatedLicense) {
                    onActivated(verifiedCompany, activatedLicense);
                  }
                }}
                disabled={!verifiedCompany || !activatedLicense}
              >
                <Store size={16} /> Launch BillionDue Invoice Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingRequestId && (
        <div
          style={{
            marginTop: 20,
            maxWidth: 720,
            width: "100%",
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: 10, color: "#d97706", fontWeight: 800 }}>
              PENDING ADMIN APPROVAL REQUEST
            </span>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              Request: {pendingRequestId}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="primary-btn btn-sm"
              disabled={checking}
              onClick={checkPendingStatus}
            >
              <RefreshCcw size={12} className={checking ? "spin" : ""} />{" "}
              {checking ? "Checking..." : "Check Status"}
            </button>
            <button
              className="secondary-btn btn-sm"
              onClick={() => {
                localStorage.removeItem("ledgershield_pending_req_id");
                localStorage.removeItem("ledgershield_pending_company_id");
                setPendingRequestId("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function ResetPasswordModal({
  initialRole = "client",
  companies,
  setCompanies,
  notify,
  close,
  onSuccess,
}: {
  initialRole?: PortalRole;
  companies: Company[];
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  notify?: (s: string, t?: Toast["tone"]) => void;
  close: () => void;
  onSuccess: (creds: { email?: string; password?: string }) => void;
}) {
  const [role, setRole] = useState<PortalRole>(initialRole);
  // Client state
  const [identifier, setIdentifier] = useState("");
  const [installationKey, setInstallationKey] = useState("");
  // Admin state
  const [adminEmail, setAdminEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  // Common password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePass = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p = "";
    for (let i = 0; i < 8; i++)
      p += chars[Math.floor(Math.random() * chars.length)];
    const pass = `${role === "admin" ? "Owner!" : "Client!"}${p}`;
    setNewPassword(pass);
    setConfirmPassword(pass);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (role === "admin") {
        if (!recoveryKey.trim()) {
          setError("Master Admin Recovery Key is required.");
          setIsSubmitting(false);
          return;
        }

        await adminApi.resetPassword({
          role: "admin",
          email: adminEmail,
          recoveryKey: recoveryKey.trim().toUpperCase(),
          newPassword,
        });
        notify?.("Software Owner master password successfully reset!");
        onSuccess({ email: adminEmail, password: newPassword });
        close();
        return;
      } else {
        if (!identifier.trim()) {
          setError("Company Code, Email, or Super Admin username is required.");
          setIsSubmitting(false);
          return;
        }
        const cleanKey = installationKey
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
        if (!cleanKey || cleanKey.length !== 10) {
          setError(
            "Valid 10-character Installation Key (XXX-XXX-XXXX) is required.",
          );
          setIsSubmitting(false);
          return;
        }

        try {
          const res = await adminApi.resetPassword({
            role: "client",
            identifier: identifier.trim(),
            installationKey: cleanKey,
            newPassword,
          });
          setCompanies?.((all) =>
            all.map((c) => {
              const matches =
                c.code.toLowerCase() === identifier.trim().toLowerCase() ||
                c.email.toLowerCase() === identifier.trim().toLowerCase() ||
                (c.superAdminUser || "").toLowerCase() ===
                identifier.trim().toLowerCase();
              return matches ? { ...c, superAdminPassword: newPassword } : c;
            }),
          );
          notify?.(res.message || "Super Admin password reset successfully!");
          onSuccess({ email: identifier.trim(), password: newPassword });
          close();
          return;
        } catch (apiErr: unknown) {
          const trimmedId = identifier.trim().toLowerCase();
          const localComp = companies.find((c) => {
            const matches =
              c.code.toLowerCase() === trimmedId ||
              c.email.toLowerCase() === trimmedId ||
              (c.superAdminUser || "").toLowerCase() === trimmedId;
            const compKey = (c.installationKey || "")
              .replace(/[^A-Z0-9]/gi, "")
              .toUpperCase();
            return matches && compKey === cleanKey;
          });

          if (localComp) {
            setCompanies?.((all) =>
              all.map((c) =>
                c.id === localComp.id
                  ? { ...c, superAdminPassword: newPassword }
                  : c,
              ),
            );
            notify?.(
              "Super Admin password reset locally (Neon offline)",
              "warn",
            );
            onSuccess({ email: identifier.trim(), password: newPassword });
            close();
            return;
          }
          throw apiErr;
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please verify your details.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 490 }}>
        <div className="modal-head">
          <div>
            <span
              className="eyebrow"
              style={{ color: "var(--accent, #047857)" }}
            >
              SECURITY & RECOVERY
            </span>
            <h2>Self-Service Password Reset</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              Reset your credentials using your verified recovery credentials
            </p>
          </div>
          <button onClick={close} type="button">
            <X />
          </button>
        </div>

        <div className="portal-choice" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={role === "client" ? "active" : ""}
            onClick={() => {
              setRole("client");
              setError("");
            }}
          >
            <Building2 size={16} />
            <span>
              <b>Client Super Admin</b>
              <small>Via 10-char Installation Key</small>
            </span>
          </button>
          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => {
              setRole("admin");
              setError("");
            }}
          >
            <Shield size={16} />
            <span>
              <b>Software Owner (Admin)</b>
              <small>Via Master Recovery Key</small>
            </span>
          </button>
        </div>

        {role === "client" ? (
          <div className="notice-banner" style={{ marginBottom: 14 }}>
            <KeyRound size={16} />
            <div>
              <strong>Client Self-Service Password Recovery</strong>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                Enter your company identifier along with the 10-character
                Installation Key (XXX-XXX-XXXX) issued during onboarding.
              </div>
            </div>
          </div>
        ) : (
          <div className="notice-banner" style={{ marginBottom: 14 }}>
            <ShieldAlert size={16} />
            <div>
              <strong>Software Owner Master Admin Recovery</strong>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                Enter your Software Owner admin email and the Master Recovery
                Key issued when BillionDue was initialized.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleReset}>
          {role === "client" ? (
            <>
              <label>
                Company Code, Email, or Username
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Company code or registered email"
                  autoFocus
                />
              </label>
              <label>
                10-Character Installation Key (Format: XXX-XXX-XXXX)
                <input
                  required
                  value={installationKey}
                  onChange={(e) =>
                    setInstallationKey(e.target.value.toUpperCase())
                  }
                  placeholder="XXX-XXX-XXXX"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "1.5px",
                    fontWeight: "bold",
                  }}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Admin Email Address
                <input
                  required
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter your gmail..."
                />
              </label>
              <label>
                Master Admin Recovery Key
                <input
                  required
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                  placeholder="Enter the issued recovery key"
                  style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                />
              </label>
            </>
          )}

          <label>
            New Password (minimum 6 characters)
            <div className="input-with-actions">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <div className="input-addon-btns">
                <button
                  type="button"
                  className="input-addon-btn"
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button
                  type="button"
                  className="input-addon-btn"
                  title="Generate secure password"
                  onClick={generatePass}
                >
                  <RefreshCcw size={12} /> Generate
                </button>
              </div>
            </div>
          </label>

          <label>
            Confirm New Password
            <input
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>

          {error && (
            <div className="login-error" style={{ marginTop: 8 }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: 18 }}>
            <button
              className="secondary-btn"
              type="button"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="primary-btn"
              type="submit"
              disabled={isSubmitting}
            >
              <KeyRound size={13} />
              {isSubmitting ? "Resetting..." : "Reset & Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ClientChangePasswordModal({
  company,
  setCompanies,
  notify,
  close,
}: {
  company: Company;
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  notify: (s: string, t?: Toast["tone"]) => void;
  close: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePass = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p = "";
    for (let i = 0; i < 8; i++)
      p += chars[Math.floor(Math.random() * chars.length)];
    const pass = `Shield!${p}`;
    setNewPassword(pass);
    setConfirmPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.changePassword({
        role: "client",
        companyId: company.id,
        currentPassword,
        newPassword,
      });

      setCompanies?.((all) =>
        all.map((c) =>
          c.id === company.id ? { ...c, superAdminPassword: newPassword } : c,
        ),
      );
      notify(res.message || "Super Admin password changed successfully!");
      close();
    } catch (apiErr: unknown) {
      const msg =
        apiErr instanceof Error
          ? apiErr.message
          : "Incorrect current password or server error.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <div>
            <span
              className="eyebrow"
              style={{ color: "var(--accent, #047857)" }}
            >
              AUTHENTICATION SECURITY
            </span>
            <h2>Change Super Admin Password</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              {company.name} ({company.code}) ·{" "}
              {company.superAdminUser || company.email}
            </p>
          </div>
          <button onClick={close} type="button">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Current Super Admin Password
            <div className="input-with-actions">
              <input
                required
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoFocus
              />
              <div className="input-addon-btns">
                <button
                  type="button"
                  className="input-addon-btn"
                  title={showCurrent ? "Hide password" : "Show password"}
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>
          </label>

          <label>
            New Super Admin Password (min 6 characters)
            <div className="input-with-actions">
              <input
                required
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <div className="input-addon-btns">
                <button
                  type="button"
                  className="input-addon-btn"
                  title={showNew ? "Hide password" : "Show password"}
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button
                  type="button"
                  className="input-addon-btn"
                  title="Generate secure password"
                  onClick={generatePass}
                >
                  <RefreshCcw size={12} /> Generate
                </button>
              </div>
            </div>
          </label>

          <label>
            Confirm New Password
            <input
              required
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>

          {error && (
            <div className="login-error" style={{ marginTop: 8 }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: 18 }}>
            <button
              className="secondary-btn"
              type="button"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="primary-btn"
              type="submit"
              disabled={isSubmitting}
            >
              <KeyRound size={13} />
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DesktopLockReason =
  | "expired"
  | "mismatch"
  | "blocked"
  | "clock"
  | "removed";

function DesktopApp({
  company: initialCompany,
  license,
  notify,
  onLicenseUpdate,
  onUpdateCompany,
  onRequestRelogin,
  onDisconnect,
}: {
  company: Company;
  license: DesktopLicense | null;
  notify: (s: string, t?: Toast["tone"]) => void;
  onLicenseUpdate: (license: DesktopLicense) => void;
  onUpdateCompany?: (updated: Partial<Company>) => void;
  onRequestRelogin?: (details: {
    id?: string;
    userName: string;
    userEmail: string;
    reason: string;
  }) => Promise<void> | void;
  onDisconnect?: () => void;
}) {
  const [company, setCompany] = useState<Company>(initialCompany);
  const [forceUnlocked, setForceUnlocked] = useState(false);
  useEffect(() => {
    setCompany((prev) => {
      if (!forceUnlocked || !license) return initialCompany;
      const currentActiveDevices = (prev.devices || []).filter(
        (d) =>
          d.status === "active" &&
          license &&
          (d.id === license.deviceId || d.fingerprint === license.fingerprint),
      );
      if (currentActiveDevices.length === 0) return initialCompany;

      const mergedDevices = [...(initialCompany.devices || [])];
      for (const dev of currentActiveDevices) {
        const idx = mergedDevices.findIndex(
          (d) => d.id === dev.id || d.fingerprint === dev.fingerprint,
        );
        if (idx >= 0) {
          mergedDevices[idx] = { ...mergedDevices[idx], ...dev, status: "active" };
        } else {
          mergedDevices.push(dev);
        }
      }
      return { ...initialCompany, devices: mergedDevices };
    });
  }, [initialCompany, forceUnlocked, license]);

  useEffect(() => {
    if (initialCompany?.templates) {
      setCompany((prev) => {
        const prevTemplates = prev.templates || [];
        const nextTemplates = initialCompany.templates || [];
        const isSame =
          prevTemplates.length === nextTemplates.length &&
          prevTemplates.every((t, i) => t === nextTemplates[i]);
        return isSame ? prev : { ...prev, templates: nextTemplates };
      });
    }
  }, [initialCompany?.templates]);
  const [page, setPage] = useState("dashboard");
  const [invoices, setInvoices] = useState<Invoice[]>(emptyInvoices);
  const [localDataLoaded, setLocalDataLoaded] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [prefilledCustomer, setPrefilledCustomer] = useState<Customer | null>(null);
  const [backup, setBackup] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // Pending offline sync confirmation state
  const [pendingOfflineSync, setPendingOfflineSync] = useState<{
    companyUpdates: Partial<Company>;
    serverTemplates: string[];
    changesSummary: string[];
    changeSignature: string;
  } | null>(null);

  // Track if workstation was offline since last sync
  const wasOfflineRef = useRef<boolean>(!navigator.onLine);
  // Track rejected sync hash so poller doesn't repeatedly prompt if user chose to keep current state
  const rejectedSyncHashRef = useRef<string>("");

  // Keep ref to latest company to avoid resetting live polling timer on state updates
  const companyRef = useRef<Company>(company);
  useEffect(() => {
    companyRef.current = company;
  }, [company]);

  // Customers state - persisted per company and in fallback
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored =
        localStorage.getItem(`ledgershield_customers_${initialCompany.id}`) ||
        localStorage.getItem("ledgershield_customers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [];
  });

  // Products & services catalog state - starts clean with zero dummy data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored =
        localStorage.getItem(`ledgershield_products_${initialCompany.id}`) ||
        localStorage.getItem("ledgershield_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return (parsed as Product[]).filter((p) => !isDummyProduct(p));
        }
      }
    } catch { }
    return [];
  });

  // Sync customers to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(`ledgershield_customers_${company.id}`, JSON.stringify(customers));
      localStorage.setItem("ledgershield_customers", JSON.stringify(customers));
    } catch { }
  }, [customers, company.id]);

  // Sync products to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(`ledgershield_products_${company.id}`, JSON.stringify(products));
      localStorage.setItem("ledgershield_products", JSON.stringify(products));
    } catch { }
  }, [products, company.id]);

  // Automatically sync any customer from loaded invoices into customers list if not present
  useEffect(() => {
    if (!invoices || invoices.length === 0) return;
    setCustomers((prev) => {
      let changed = false;
      const updated = [...prev];
      for (const inv of invoices) {
        if (!inv.customer?.trim()) continue;
        const key = inv.customer.trim().toLowerCase();
        const existing = updated.find((c) => c.name.trim().toLowerCase() === key);
        if (!existing) {
          updated.push({
            id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: inv.customer.trim(),
            phone: inv.customerPhone || "",
            email: inv.customerEmail || "",
            address: inv.customerAddress || "",
            createdAt: inv.issued || new Date().toLocaleDateString(),
          });
          changed = true;
        } else {
          if (!existing.phone && inv.customerPhone) {
            existing.phone = inv.customerPhone;
            changed = true;
          }
          if (!existing.email && inv.customerEmail) {
            existing.email = inv.customerEmail;
            changed = true;
          }
        }
      }
      return changed ? updated : prev;
    });
  }, [invoices]);

  // App Theme state ('light' | 'dark') with persistent storage
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const storedTheme = localStorage.getItem("ledgershield_theme");
      if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    } catch { }
    return "light";
  });

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    try {
      localStorage.setItem("ledgershield_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch { }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (window.ledgerShield?.setTitleBarTheme) {
      void window.ledgerShield.setTitleBarTheme(theme);
    }
  }, [theme]);

  // App PIN Lock configuration (4, 5, or 6 digits)
  const [pinConfig, setPinConfig] = useState<PinLockConfig>(() => {
    try {
      const stored = localStorage.getItem("ledgershield_pin_lock_config");
      if (stored) return JSON.parse(stored) as PinLockConfig;
    } catch { }
    return {
      enabled: false,
      pinLength: 4,
      pin: "",
      autoLockMinutes: 5,
    };
  });

  // App Lock Screen Status (auto-locks on launch if configured)
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("ledgershield_pin_lock_config");
      if (stored) {
        const parsed = JSON.parse(stored) as PinLockConfig;
        return Boolean(parsed.enabled && parsed.pin);
      }
    } catch { }
    return false;
  });

  // Disconnect Confirmation Modal state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Auto-lock on inactivity timer
  useEffect(() => {
    if (!pinConfig.enabled || !pinConfig.pin || pinConfig.autoLockMinutes <= 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsPinLocked(true);
      }, pinConfig.autoLockMinutes * 60 * 1000);
    };

    const handleVisibility = () => {
      if (document.hidden && pinConfig.autoLockMinutes === 0) {
        setIsPinLocked(true);
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    document.addEventListener("visibilitychange", handleVisibility);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pinConfig]);
  const [deviceRevoked, setDeviceRevoked] = useState<boolean>(() => {
    try {
      const revokedItem = localStorage.getItem("ledgershield_device_revoked");
      if (!revokedItem) return false;
      const parsed = JSON.parse(revokedItem);
      if (
        license &&
        (parsed.deviceId === license.deviceId ||
          parsed.fingerprint === license.fingerprint)
      ) {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  });

  const requestCode = useMemo(
    () => createRequestCode(license?.fingerprint || "unregistered", Date.now()),
    [license?.fingerprint],
  );
  const hours = license
    ? Math.max(0, (new Date(license.expiresAt).getTime() - now) / 3600000)
    : 0;
  const currentFingerprint =
    localStorage.getItem("ledgershield_device_fingerprint") ||
    license?.fingerprint;

  const ensureDeviceActiveInCompany = (activeDeviceId?: string) => {
    const devId = activeDeviceId || license?.deviceId || `device-${Date.now()}`;
    const fp = license?.fingerprint || "fp:win-default";
    const sn =
      license?.serialNumber ||
      (fp.startsWith("fp:win-") ? fp.replace("fp:win-", "") : "SN-DEFAULT");
    const devName = license?.deviceName || "Windows Desktop PC";
    const devUser =
      license?.authenticatedUser || company?.superAdminUser || "Counter Operator";

    const currentDevices = company?.devices || [];
    const existingIndex = currentDevices.findIndex(
      (d) =>
        d.id === devId ||
        d.fingerprint === fp ||
        (license?.serialNumber && d.serialNumber === license.serialNumber),
    );

    const tierOfflineHours = getTierInfo(
      license?.mode === "guest" ? "guest" : company?.plan,
      company?.devicesAllowed,
      company?.offlineLeaseOverride,
    ).offlineHours;

    let nextDevices = [...currentDevices];
    if (existingIndex >= 0) {
      nextDevices[existingIndex] = {
        ...nextDevices[existingIndex],
        id: devId,
        fingerprint: fp,
        serialNumber: sn,
        status: "active",
        leaseHours: tierOfflineHours,
        live: true,
        lastSeen: "Just now",
      };
    } else {
      nextDevices.push({
        id: devId,
        name: devName,
        os: "Windows 11 Pro",
        user: devUser,
        fingerprint: fp,
        serialNumber: sn,
        activated: new Date().toLocaleDateString(),
        lastSeen: "Just now",
        leaseHours: tierOfflineHours,
        status: "active",
        live: true,
      });
    }

    const updatedCompany = { ...company, devices: nextDevices };
    setCompany(updatedCompany);
    onUpdateCompany?.(updatedCompany);
    return updatedCompany;
  };

  const unlockDesktop = (approvedDeviceId?: string) => {
    setForceUnlocked(true);
    setDeviceRevoked(false);
    localStorage.removeItem("ledgershield_device_revoked");
    localStorage.removeItem("ledgershield_last_relogin_req");
    if (license) {
      const tierHours = getTierInfo(
        company?.plan,
        company?.devicesAllowed,
        company?.offlineLeaseOverride,
      ).offlineHours;
      const nextLicense = {
        ...license,
        deviceId: approvedDeviceId || license.deviceId,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + tierHours * 3600 * 1000).toISOString(),
      };
      onLicenseUpdate(nextLicense);
      if (approvedDeviceId && approvedDeviceId !== license.deviceId) {
        localStorage.setItem("ledgershield_desktop_device_id", approvedDeviceId);
        void window.ledgerShield?.saveInstalledLicense({
          ...nextLicense,
          activated: true,
        });
      }
    }
    ensureDeviceActiveInCompany(approvedDeviceId);
    setNow(Date.now());
  };

  const triggerDeviceRevocation = useCallback(
    (reasonMsg?: string) => {
      const finalReason =
        reasonMsg ||
        "This device has been unlinked from the portal by an administrator.";
      setForceUnlocked(false);
      setDeviceRevoked(true);
      try {
        localStorage.setItem(
          "ledgershield_device_revoked",
          JSON.stringify({
            deviceId: license?.deviceId,
            fingerprint: license?.fingerprint,
            reason: finalReason,
            timestamp: Date.now(),
          }),
        );
        localStorage.removeItem("ledgershield_session_token");
        localStorage.removeItem("ledgershield_auth_user");
      } catch {}
      notify(
        `Device authorization revoked: ${finalReason}. Session access locked.`,
        "warn",
      );
    },
    [license?.deviceId, license?.fingerprint, notify],
  );

  // Check if device was removed from company.devices list by admin or client portal
  const isDeviceUnlinkedFromCompany = useMemo(() => {
    if (forceUnlocked) return false;
    if (deviceRevoked) return true;
    if (!license || license.mode === "guest") return false;
    if (!company?.devices) return false;
    const match = company.devices.some(
      (d) =>
        d.status === "active" &&
        (d.id === license.deviceId ||
          d.fingerprint === license.fingerprint ||
          (license.serialNumber && d.serialNumber === license.serialNumber)),
    );
    return !match;
  }, [company?.devices, license, deviceRevoked, forceUnlocked]);

  const isRemoved = deviceRevoked || isDeviceUnlinkedFromCompany;

  useEffect(() => {
    if (isRemoved) {
      // Automatic logout on device removal for security
      localStorage.removeItem("ledgershield_session_token");
      localStorage.removeItem("ledgershield_auth_user");
    }
  }, [isRemoved]);

  useEffect(() => {
    const handleRevoke = (e: Event) => {
      const evt = e as CustomEvent;
      const detail = evt?.detail;
      if (!detail || !license) {
        triggerDeviceRevocation(detail?.reason);
        return;
      }
      if (
        !detail.deviceId ||
        detail.deviceId === license.deviceId ||
        (detail.fingerprint && detail.fingerprint === license.fingerprint)
      ) {
        triggerDeviceRevocation(detail?.reason);
      }
    };
    const handleReactivate = (e: Event) => {
      const evt = e as CustomEvent;
      const detail = evt?.detail;
      if (
        !detail ||
        (license &&
          (!detail.fingerprint ||
            detail.fingerprint === license.fingerprint ||
            detail.deviceId === license.deviceId))
      ) {
        unlockDesktop(detail?.deviceId);
      }
    };
    const handleTemplatesUpdated = (e: Event) => {
      const evt = e as CustomEvent;
      const detail = evt?.detail;
      if (detail?.companyId === company.id && Array.isArray(detail.templates)) {
        setCompany((prev) => ({ ...prev, templates: detail.templates }));
        onUpdateCompany?.({ templates: detail.templates });
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ledgershield_device_revoked" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (
            license &&
            (!parsed.deviceId ||
              parsed.deviceId === license.deviceId ||
              (parsed.fingerprint && parsed.fingerprint === license.fingerprint))
          ) {
            triggerDeviceRevocation(parsed.reason);
          }
        } catch {}
      }
      if (e.key === "ledgershield_device_reactivated") {
        unlockDesktop();
      }
      if (e.key === `ledgershield_templates_${company.id}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed?.templates)) {
            setCompany((prev) => ({ ...prev, templates: parsed.templates }));
            onUpdateCompany?.({ templates: parsed.templates });
          }
        } catch {}
      }
    };

    let bc: BroadcastChannel | null = null;
    let templatesBc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("ledgershield_device_channel");
        bc.onmessage = (event) => {
          const data = event.data;
          if (data?.type === "device_revoked") {
            if (
              !license ||
              !data.deviceId ||
              license.deviceId === data.deviceId ||
              (data.fingerprint && license.fingerprint === data.fingerprint)
            ) {
              triggerDeviceRevocation(data.reason);
            }
          }
        };
      } catch {}

      try {
        templatesBc = new BroadcastChannel("ledgershield_templates_channel");
        templatesBc.onmessage = (event) => {
          const data = event.data;
          if (
            data?.type === "templates_updated" &&
            data.companyId === company.id &&
            Array.isArray(data.templates)
          ) {
            setCompany((prev) => ({ ...prev, templates: data.templates }));
            onUpdateCompany?.({ templates: data.templates });
          }
        };
      } catch {}
    }

    window.addEventListener("ledgershield_device_revoked", handleRevoke);
    window.addEventListener("ledgershield_device_reactivated", handleReactivate);
    window.addEventListener("ledgershield_templates_updated", handleTemplatesUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("ledgershield_device_revoked", handleRevoke);
      window.removeEventListener(
        "ledgershield_device_reactivated",
        handleReactivate,
      );
      window.removeEventListener("ledgershield_templates_updated", handleTemplatesUpdated);
      window.removeEventListener("storage", handleStorage);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      if (templatesBc) {
        try {
          templatesBc.close();
        } catch {}
      }
    };
  }, [license, triggerDeviceRevocation, company.id, onUpdateCompany]);

  const lockReason: DesktopLockReason | null = isRemoved
    ? "removed"
    : !license
      ? "mismatch"
      : company.status !== "active"
        ? "blocked"
        : currentFingerprint !== license.fingerprint
          ? "mismatch"
          : hours <= 0
            ? "expired"
            : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    const online = () => setIsOnline(true);
    const offline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    void window.ledgerShield
      ?.readLocalData()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices as typeof emptyInvoices);
        }
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          setCustomers(data.customers as Customer[]);
        }
        if (Array.isArray(data.products)) {
          setProducts((data.products as Product[]).filter((p) => !isDummyProduct(p)));
        }
        setLocalDataLoaded(true);
      })
      .catch(() => {
        if (active) {
          setInvoices([]);
          setLocalDataLoaded(true);
          notify("Encrypted local data could not be opened", "warn");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!localDataLoaded) return;
    void window.ledgerShield?.writeLocalData({
      version: 1,
      companyId: company.id,
      invoices,
      customers,
      products,
      updatedAt: new Date().toISOString(),
    });
  }, [company.id, invoices, customers, products, localDataLoaded]);

  const refreshLease = async (isManualOrInitial = false): Promise<boolean> => {
    if (!license) return false;
    if (license.mode === "guest") {
      if (isManualOrInitial) {
        notify(
          "Guest access cannot be renewed. Activate a commercial licence to continue.",
          "warn",
        );
      }
      return false;
    }
    if (!navigator.onLine) {
      if (isManualOrInitial) {
        notify("Connect to the internet to verify this device", "warn");
      }
      return false;
    }
    try {
      const sn =
        license.serialNumber ||
        (license.fingerprint?.startsWith("fp:win-")
          ? license.fingerprint.replace("fp:win-", "")
          : localStorage.getItem("ledgershield_device_serial") || "SN-DEFAULT");
      const refreshed = await adminApi.refreshDesktopLease({
        companyId: license.companyId,
        deviceId: license.deviceId,
        fingerprint: license.fingerprint,
        serialNumber: sn,
      });
      const next = {
        ...license,
        deviceId: refreshed.deviceId || license.deviceId,
        authenticatedUser: refreshed.authenticatedUser,
        verifiedAt: refreshed.verifiedAt,
        expiresAt: refreshed.leaseExpiresAt,
      };
      if (refreshed.deviceId && refreshed.deviceId !== license.deviceId) {
        localStorage.setItem(
          "ledgershield_desktop_device_id",
          refreshed.deviceId,
        );
        void window.ledgerShield?.saveInstalledLicense({
          ...next,
          activated: true,
        });
      }
      onLicenseUpdate(next);
      setForceUnlocked(true);
      setDeviceRevoked(false);
      localStorage.removeItem("ledgershield_device_revoked");
      localStorage.removeItem("ledgershield_last_relogin_req");
      ensureDeviceActiveInCompany(refreshed.deviceId || license.deviceId);
      window.dispatchEvent(
        new CustomEvent("ledgershield_device_reactivated", {
          detail: { deviceId: next.deviceId, fingerprint: next.fingerprint },
        }),
      );
      setNow(Date.now());
      const tierWindow = getTierInfo(
        company?.plan,
        company?.devicesAllowed,
        company?.offlineLeaseOverride,
      ).offlineLeaseWindowLabel.toLowerCase();
      if (isManualOrInitial) {
        // User explicitly clicked "Verify now" button
        notify(`Device verified · fresh ${tierWindow} lease installed`);
      } else {
        // Automatic background or startup check: notify ONLY ONCE per session
        const alreadyNotified = sessionStorage.getItem(
          "ledgershield_lease_notified_session",
        );
        if (!alreadyNotified) {
          sessionStorage.setItem("ledgershield_lease_notified_session", "true");
          notify(`Device verified · fresh ${tierWindow} lease installed`);
        }
      }
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "License verification failed";

      // If the device is not registered, unlinked, or revoked on the server:
      if (
        msg.includes("not registered") ||
        msg.includes("not found") ||
        msg.includes("revoked") ||
        msg.includes("blocked") ||
        msg.includes("identity mismatch")
      ) {
        triggerDeviceRevocation(msg);
        return false;
      }

      if (isManualOrInitial) {
        notify(msg, "warn");
      }
      return false;
    }
  };

  useEffect(() => {
    if (license?.mode === "commercial" && isOnline) {
      void refreshLease(false);
      const interval = window.setInterval(() => {
        void refreshLease(false);
      }, 30000);
      return () => window.clearInterval(interval);
    } else if (!isOnline) {
      sessionStorage.removeItem("ledgershield_lease_notified_session");
    }
  }, [isOnline, license?.companyId, license?.deviceId]);

  // Fast 2-second heartbeat checking device status on portal/backend for immediate suspension and live synchronization
  useEffect(() => {
    if (
      license?.mode !== "commercial" ||
      !license.companyId ||
      deviceRevoked
    ) {
      return;
    }

    let mounted = true;
    const checkLiveDeviceStatus = async () => {
      try {
        const res = await adminApi.checkDeviceStatus({
          companyId: license.companyId,
          deviceId: license.deviceId,
          fingerprint: license.fingerprint,
        });
        if (!mounted) return;
        if (res.revoked || !res.active) {
          triggerDeviceRevocation(
            res.reason ||
              "This device has been unlinked from the portal by an administrator.",
          );
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes("not registered") ||
          msg.includes("not found") ||
          msg.includes("revoked")
        ) {
          if (mounted) {
            triggerDeviceRevocation(msg);
          }
          return;
        }
        wasOfflineRef.current = true;
        setIsOnline(false);
      }

      // Live sync of assigned templates and company details from backend
      try {
        const boot: any = await adminApi.clientBootstrap(license.companyId);
        if (!mounted || !boot) return;

        setIsOnline(true);
        const currentComp = companyRef.current;
        const serverCompany = boot.company || {};
        const serverTemplates: string[] = Array.isArray(boot.templates)
          ? boot.templates.map((t: any) => t.name || t.id)
          : [];
        if (!serverTemplates.includes("Default Invoice")) {
          serverTemplates.unshift("Default Invoice");
        }

        const changesSummary: string[] = [];
        const updates: Partial<Company> = {};

        // 1. Template layouts diff
        const currentNames = currentComp.templates || ["Default Invoice"];
        const normServer = Array.from(
          new Set(serverTemplates.map((s: string) => String(s).trim().toLowerCase())),
        ).sort();
        const normCurrent = Array.from(
          new Set(currentNames.map((c: string) => String(c).trim().toLowerCase())),
        ).sort();
        const templatesDiff =
          normServer.length !== normCurrent.length ||
          normServer.some((val: string, idx: number) => val !== normCurrent[idx]);

        if (templatesDiff) {
          changesSummary.push(
            `Assigned templates updated (${serverTemplates.length} layouts): ${serverTemplates.join(", ")}`,
          );
          updates.templates = serverTemplates;
        }

        // 2. Company profile diffs
        if (serverCompany.name && serverCompany.name !== currentComp.name) {
          changesSummary.push(`Company name updated: "${serverCompany.name}"`);
          updates.name = serverCompany.name;
        }
        if (serverCompany.email && serverCompany.email !== currentComp.email) {
          changesSummary.push(`Official email updated: "${serverCompany.email}"`);
          updates.email = serverCompany.email;
        }
        const serverPhone = serverCompany.phone || serverCompany.contact_no;
        const currentPhone = currentComp.phone || currentComp.contactNo;
        if (serverPhone && serverPhone !== currentPhone) {
          changesSummary.push(`Contact phone updated: "${serverPhone}"`);
          updates.phone = serverPhone;
          updates.contactNo = serverPhone;
        }
        if (serverCompany.address && serverCompany.address !== currentComp.address) {
          changesSummary.push(`Registered address updated: "${serverCompany.address}"`);
          updates.address = serverCompany.address;
        }
        if (serverCompany.plan && serverCompany.plan !== currentComp.plan) {
          changesSummary.push(`Subscription plan updated: "${serverCompany.plan}"`);
          updates.plan = serverCompany.plan;
        }
        if (
          serverCompany.devices_allowed &&
          serverCompany.devices_allowed !== currentComp.devicesAllowed
        ) {
          changesSummary.push(
            `Terminal device limit updated: ${serverCompany.devices_allowed} seats`,
          );
          updates.devicesAllowed = serverCompany.devices_allowed;
        }
        const serverOverride = serverCompany.offline_lease_override || undefined;
        if (serverOverride !== currentComp.offlineLeaseOverride) {
          changesSummary.push(
            serverOverride
              ? `Offline lease policy updated: ${serverOverride} (Custom Override)`
              : `Offline lease policy updated: reset to standard package default`,
          );
          updates.offlineLeaseOverride = serverOverride;
        }
        if (boot.license?.expires_at) {
          const serverExpires = new Date(boot.license.expires_at).toLocaleDateString();
          if (currentComp.expires && currentComp.expires !== serverExpires && currentComp.expires !== "—") {
            changesSummary.push(`License validity period updated: ${serverExpires}`);
            updates.expires = serverExpires;
          }
        }

        if (changesSummary.length > 0) {
          const changeSignature = JSON.stringify({
            templates: updates.templates || currentComp.templates,
            name: updates.name || currentComp.name,
            phone: updates.phone || currentComp.phone,
            address: updates.address || currentComp.address,
            plan: updates.plan || currentComp.plan,
            override: updates.offlineLeaseOverride || currentComp.offlineLeaseOverride,
          });

          // If the user already declined these exact changes while offline, don't re-prompt
          if (rejectedSyncHashRef.current === changeSignature) {
            wasOfflineRef.current = false;
            return;
          }

          if (wasOfflineRef.current) {
            // Workstation was offline and has reconnected: display confirmation modal!
            setPendingOfflineSync({
              companyUpdates: updates,
              serverTemplates,
              changesSummary,
              changeSignature,
            });
          } else {
            // Workstation was continuously online: apply seamlessly in real time!
            setCompany((prev) => ({ ...prev, ...updates }));
            onUpdateCompany?.(updates);
            if (updates.templates) {
              notify(
                `⚡ Real-time sync: ${updates.templates.length} template(s) updated from admin panel`,
                "ok",
              );
            }
          }
        } else {
          // No differences, clear wasOffline flag
          wasOfflineRef.current = false;
        }
      } catch {
        wasOfflineRef.current = true;
      }
    };

    void checkLiveDeviceStatus();
    const statusTimer = window.setInterval(checkLiveDeviceStatus, 2000);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("ledgershield_templates_channel");
      bc.onmessage = (event) => {
        if (
          event.data?.type === "templates_updated" &&
          (!event.data.companyId || event.data.companyId === license?.companyId)
        ) {
          void checkLiveDeviceStatus();
        }
      };
    }

    return () => {
      mounted = false;
      window.clearInterval(statusTimer);
      if (bc) bc.close();
    };
  }, [
    deviceRevoked,
    license?.companyId,
    license?.deviceId,
    license?.fingerprint,
    license?.mode,
    notify,
    onUpdateCompany,
    triggerDeviceRevocation,
  ]);

  if (lockReason)
    return (
      <LockedDesktop
        reason={lockReason}
        requestCode={requestCode}
        notify={notify}
        verify={refreshLease}
        canVerify={license?.mode === "commercial"}
        company={company}
        license={license}
        onUnlock={unlockDesktop}
        onRequestRelogin={onRequestRelogin}
        disconnect={() => {
          localStorage.removeItem("ledgershield_desktop_company_id");
          localStorage.removeItem("ledgershield_desktop_device_id");
          localStorage.removeItem("ledgershield_device_revoked");
          if (license?.mode !== "guest") {
            void window.ledgerShield?.saveInstalledLicense({
              activated: false,
            });
          }
          onDisconnect?.();
        }}
      />
    );
  const nav = [
    ["dashboard", <LayoutDashboard />, "Dashboard"],
    ["invoices", <ReceiptText />, "Invoices"],
    ["customers", <Users />, "Customers"],
    ["products", <Package />, "Products & services"],
    ["payments", <CreditCard />, "Payments"],
    ["reports", <BarChart3 />, "Reports"],
    ["settings", <Settings />, "Settings"],
  ];
  return (
    <div className="desktop-frame" data-theme={theme}>
      <div className="win-titlebar">
        <div className="win-titlebar-left">
          <Logo />
          <span className="titlebar-divider" />
          <span className="desktop-product">Invoice Desktop</span>
        </div>
        {window.ledgerShield?.platform === "electron" ? (
          <div className="electron-controls-spacer" />
        ) : (
          <div className="window-controls">
            <button
              type="button"
              className="win-ctrl-btn"
              title="Minimize"
              onClick={() => window.ledgerShield?.windowAction?.("minimize")}
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              className="win-ctrl-btn"
              title="Maximize"
              onClick={() => window.ledgerShield?.windowAction?.("maximize")}
            >
              <Square size={11} />
            </button>
            <button
              type="button"
              className="win-ctrl-btn win-ctrl-close"
              title="Close"
              onClick={() => window.ledgerShield?.windowAction?.("close")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="desktop-body">
        <aside className="desktop-sidebar">
          <nav>
            {nav.map(([id, icon, label]) => (
              <button
                key={String(id)}
                className={page === id ? "active" : ""}
                onClick={() => setPage(String(id))}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="desktop-side-bottom">
            <div
              className="desktop-user"
              onClick={() => setPage("settings")}
              style={{ cursor: "pointer" }}
              title="Click to manage User & Company Settings"
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 7,
                    objectFit: "contain",
                    background: "#ffffff",
                    padding: 2,
                  }}
                />
              ) : (
                <span>{company.name.slice(0, 2).toUpperCase()}</span>
              )}
              <div>
                <b>
                  {license?.authenticatedUser ||
                    company.superAdminUser ||
                    "Operator"}
                </b>
                <small>{company.name}</small>
              </div>
            </div>
          </div>
        </aside>
        <main className="desktop-main">
          <header className="desktop-top">
            <div>
              <span className="eyebrow">{company.name.toUpperCase()}</span>
              <h1>
                {page === "dashboard"
                  ? "Business dashboard"
                  : page === "settings"
                    ? "User & Account Settings"
                    : page.replace(/^./, (m) => m.toUpperCase())}
              </h1>
            </div>
          </header>
          {page === "dashboard" && (
            <DesktopDashboard
              invoices={invoices}
              setShowInvoice={setShowInvoice}
              setShowPreview={setShowPreview}
              onPreviewInvoice={(inv) => {
                setPreviewInvoice(inv);
                setShowPreview(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setShowInvoice(true);
              }}
            />
          )}
          {page === "invoices" && (
            <InvoiceList
              invoices={invoices}
              setInvoices={setInvoices}
              company={company}
              setShowInvoice={setShowInvoice}
              onPreviewInvoice={(inv) => {
                setPreviewInvoice(inv);
                setShowPreview(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setShowInvoice(true);
              }}
              notify={notify}
            />
          )}
          {page === "customers" && (
            <CustomerManager
              customers={customers}
              setCustomers={setCustomers}
              invoices={invoices}
              onOpenPreview={(inv) => {
                setPreviewInvoice(inv);
                setShowPreview(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setShowInvoice(true);
              }}
              onCreateInvoiceForCustomer={(cust) => {
                setPrefilledCustomer(cust);
                setShowInvoice(true);
              }}
              notify={notify}
            />
          )}
          {page === "products" && (
            <ProductManager
              products={products}
              setProducts={setProducts}
              notify={notify}
            />
          )}
          {page === "payments" && <PaymentsView invoices={invoices} />}
          {page === "reports" && <ReportsView invoices={invoices} />}
          {page === "settings" && (
            <DesktopAppSettings
              company={company}
              license={license}
              currentTheme={theme}
              onThemeChange={handleThemeChange}
              pinConfig={pinConfig}
              onSavePinConfig={(newConfig) => {
                setPinConfig(newConfig);
                try {
                  localStorage.setItem(
                    "ledgershield_pin_lock_config",
                    JSON.stringify(newConfig),
                  );
                } catch { }
              }}
              onLockNow={() => setIsPinLocked(true)}
              onDisconnectRequest={() => setShowDisconnectConfirm(true)}
              invoices={invoices}
              notify={notify}
              onRefreshLease={(isManual) => refreshLease(isManual ?? true)}
              isOnline={isOnline}
            />
          )}
        </main>
      </div>
      {showInvoice && (
        <NewInvoiceModal
          company={company}
          templates={company.templates}
          notify={notify}
          invoices={invoices}
          products={products}
          customers={customers}
          prefilledCustomer={prefilledCustomer}
          editingInvoice={editingInvoice}
          close={() => {
            setShowInvoice(false);
            setEditingInvoice(null);
            setPrefilledCustomer(null);
          }}
          save={(invoice) => {
            if (editingInvoice) {
              setInvoices((all) =>
                all.map((inv) => (inv.id === editingInvoice.id ? invoice : inv)),
              );
              if (previewInvoice && previewInvoice.id === editingInvoice.id) {
                setPreviewInvoice(invoice);
              }
              notify(`Invoice ${invoice.id} updated successfully!`);
            } else {
              setInvoices((all) => [invoice, ...all]);
              notify(`${invoice.id} saved to encrypted local storage`);
            }
            if (invoice.customer?.trim()) {
              setCustomers((prev) => {
                const nameKey = invoice.customer.trim().toLowerCase();
                const existingIdx = prev.findIndex(
                  (c) => c.name.trim().toLowerCase() === nameKey
                );
                let updated: Customer[];
                if (existingIdx >= 0) {
                  updated = [...prev];
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    phone: invoice.customerPhone || updated[existingIdx].phone,
                    email: invoice.customerEmail || updated[existingIdx].email,
                    address: invoice.customerAddress || updated[existingIdx].address,
                  };
                } else {
                  const newCust: Customer = {
                    id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: invoice.customer.trim(),
                    phone: invoice.customerPhone || "",
                    email: invoice.customerEmail || "",
                    address: invoice.customerAddress || "",
                    createdAt: invoice.issued || new Date().toLocaleDateString(),
                  };
                  updated = [newCust, ...prev];
                }
                try {
                  localStorage.setItem(
                    `ledgershield_customers_${company.id}`,
                    JSON.stringify(updated)
                  );
                } catch { }
                return updated;
              });
            }
            setShowInvoice(false);
            setEditingInvoice(null);
            setPrefilledCustomer(null);
          }}
        />
      )}
      {showPreview && (
        <InvoicePreview
          company={company}
          invoice={previewInvoice || invoices[0]}
          close={() => {
            setShowPreview(false);
            setPreviewInvoice(null);
          }}
          onEdit={(inv) => {
            setEditingInvoice(inv);
            setShowInvoice(true);
          }}
          onStatusChange={(newStatus) => {
            const targetId = (previewInvoice || invoices[0])?.id;
            if (!targetId) return;
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.id === targetId ? { ...inv, status: newStatus } : inv,
              ),
            );
            if (previewInvoice && previewInvoice.id === targetId) {
              setPreviewInvoice((prev) =>
                prev ? { ...prev, status: newStatus } : null,
              );
            }
            notify(`Invoice ${targetId} status updated to ${newStatus}`);
          }}
          onTemplateChange={(newTemplate) => {
            const targetId = (previewInvoice || invoices[0])?.id;
            if (!targetId) return;
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.id === targetId ? { ...inv, template: newTemplate } : inv,
              ),
            );
            if (previewInvoice && previewInvoice.id === targetId) {
              setPreviewInvoice((prev) =>
                prev ? { ...prev, template: newTemplate } : null,
              );
            }
          }}
          notify={notify}
        />
      )}{" "}
      {backup && (
        <BackupModal
          close={() => setBackup(false)}
          invoices={invoices}
          company={company}
          notify={notify}
        />
      )}
      {showPasswordChange && license?.mode === "commercial" && (
        <ClientChangePasswordModal
          company={company}
          notify={notify}
          close={() => setShowPasswordChange(false)}
        />
      )}
      {showDisconnectConfirm && (
        <DisconnectConfirmModal
          companyName={company.name}
          deviceName={license?.deviceName || "This Workstation"}
          onCancel={() => setShowDisconnectConfirm(false)}
          onConfirm={async () => {
            setShowDisconnectConfirm(false);
            try {
              if (license?.companyId) {
                await adminApi.disconnectDevice({
                  companyId: license.companyId,
                  deviceId: license.deviceId,
                  fingerprint: license.fingerprint,
                });
              }
            } catch (err) {
              console.warn("Server device disconnect failed (possibly offline):", err);
            }

            if (typeof BroadcastChannel !== "undefined") {
              const ch = new BroadcastChannel("ledgershield_device_channel");
              ch.postMessage({
                type: "device_disconnected",
                companyId: license?.companyId,
                deviceId: license?.deviceId,
                fingerprint: license?.fingerprint,
                name: license?.deviceName,
              });
              ch.close();
            }

            localStorage.removeItem("ledgershield_desktop_company_id");
            localStorage.removeItem("ledgershield_desktop_device_id");
            localStorage.removeItem("ledgershield_device_revoked");
            if (license?.mode !== "guest") {
              void window.ledgerShield?.saveInstalledLicense({
                activated: false,
              });
            }
            onDisconnect?.();
          }}
        />
      )}
      {pendingOfflineSync && (
        <OfflineSyncConfirmModal
          companyName={company.name}
          changesSummary={pendingOfflineSync.changesSummary}
          serverTemplates={pendingOfflineSync.serverTemplates}
          currentTemplates={company.templates}
          onConfirm={() => {
            const updates = pendingOfflineSync.companyUpdates;
            setCompany((prev) => ({ ...prev, ...updates }));
            onUpdateCompany?.(updates);
            notify("✅ Remote administrative updates successfully applied.", "ok");
            setPendingOfflineSync(null);
            wasOfflineRef.current = false;
            rejectedSyncHashRef.current = "";
          }}
          onDecline={() => {
            rejectedSyncHashRef.current = pendingOfflineSync.changeSignature;
            setPendingOfflineSync(null);
            wasOfflineRef.current = false;
            notify(
              "Operating with local workstation state. Remote updates postponed.",
              "ok",
            );
          }}
        />
      )}
      {isPinLocked && pinConfig.enabled && pinConfig.pin && (
        <PinLockScreen
          pinLength={pinConfig.pinLength}
          storedPin={pinConfig.pin}
          onUnlock={() => setIsPinLocked(false)}
          companyName={company.name}
          companyLogo={company.logo}
          userName={
            license?.authenticatedUser ||
            company.superAdminUser ||
            "Client Operator"
          }
          onForgotPin={() => {
            setShowPasswordChange(true);
          }}
        />
      )}
    </div>
  );
}

function DesktopDashboard({
  invoices,
  setShowInvoice,
  setShowPreview,
  onPreviewInvoice,
  onEditInvoice,
}: {
  invoices: Invoice[];
  setShowInvoice: (v: boolean) => void;
  setShowPreview: (v: boolean) => void;
  onPreviewInvoice?: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}) {
  const revenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices
    .filter((i) => i.status !== "Paid" && i.status !== "Overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdue = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const customers = new Set(invoices.map((invoice) => invoice.customer)).size;
  const paidCount = invoices.filter(
    (invoice) => invoice.status === "Paid",
  ).length;
  const sentCount = invoices.filter(
    (invoice) => invoice.status === "Sent",
  ).length;
  const overdueCount = invoices.filter(
    (invoice) => invoice.status === "Overdue",
  ).length;
  const totalInvoices = invoices.length;
  const paidPct = totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;
  const sentPct = totalInvoices > 0 ? (sentCount / totalInvoices) * 100 : 0;

  const donutGradient =
    totalInvoices === 0
      ? "conic-gradient(#cbd5e1 0deg 360deg)"
      : `conic-gradient(#047857 0% ${paidPct}%, #047857 ${paidPct}% ${paidPct + sentPct}%, #f43f5e ${paidPct + sentPct}% 100%)`;

  return (
    <>
      <section className="desktop-stats">
        <div className="desktop-stat">
          <span className="stat-icon emerald">
            <CircleDollarSign />
          </span>
          <div>
            <small>Revenue this month</small>
            <strong>{money(revenue)}</strong>
            <em>From encrypted local invoices</em>
          </div>
        </div>
        <div className="desktop-stat">
          <span className="stat-icon indigo">
            <ReceiptText />
          </span>
          <div>
            <small>Outstanding</small>
            <strong>{money(outstanding)}</strong>
            <em>{sentCount} open invoices</em>
          </div>
        </div>
        <div className="desktop-stat">
          <span className="stat-icon amber">
            <Clock3 />
          </span>
          <div>
            <small>Overdue</small>
            <strong>{money(overdue)}</strong>
            <em>{overdueCount} invoices need action</em>
          </div>
        </div>
        <div className="desktop-stat">
          <span className="stat-icon cyan">
            <Users />
          </span>
          <div>
            <small>Active customers</small>
            <strong>{customers}</strong>
            <em>From local invoice records</em>
          </div>
        </div>
      </section>
      <div className="desktop-grid">
        <section className="desk-panel revenue-chart">
          <div className="panel-head">
            <div>
              <h2>Revenue</h2>
              <p>Paid invoices stored on this device</p>
            </div>
          </div>
          <div className="activity-summary">
            <div className="revenue-icon-badge">
              <Database />
            </div>
            <div>
              <strong>{money(revenue)}</strong>
              <small>
                {paidCount} paid {paidCount === 1 ? "invoice" : "invoices"} in encrypted local storage
              </small>
            </div>
          </div>
        </section>
        <section className="desk-panel invoice-summary">
          <div className="panel-head">
            <div>
              <h2>Invoice status</h2>
              <p>This month</p>
            </div>
          </div>
          <div className="invoice-status-content">
            <div className="donut-wrap">
              <div
                className="donut"
                style={{ background: donutGradient }}
              />
              <div className="donut-center">
                <strong>{totalInvoices}</strong>
                <small>{totalInvoices === 1 ? "invoice" : "invoices"}</small>
              </div>
            </div>
            <div className="status-breakdown-list">
              <div className="status-breakdown-item paid">
                <div className="status-label-group">
                  <span className="status-dot paid" />
                  <span>Paid</span>
                </div>
                <strong className="status-count">{paidCount}</strong>
              </div>
              <div className="status-breakdown-item sent">
                <div className="status-label-group">
                  <span className="status-dot sent" />
                  <span>Sent</span>
                </div>
                <strong className="status-count">{sentCount}</strong>
              </div>
              <div className="status-breakdown-item overdue">
                <div className="status-label-group">
                  <span className="status-dot overdue" />
                  <span>Overdue</span>
                </div>
                <strong className="status-count">{overdueCount}</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="desk-panel span-2">
          <div className="panel-head">
            <div>
              <h2>Recent invoices</h2>
              <p>Latest billing activity</p>
            </div>
            <button className="text-btn" onClick={() => setShowInvoice(true)}>
              Create invoice <ArrowUpRight />
            </button>
          </div>
          <InvoiceMiniTable
            invoices={invoices}
            open={(inv) => {
              if (onPreviewInvoice && inv) {
                onPreviewInvoice(inv);
              } else {
                setShowPreview(true);
              }
            }}
            onEdit={onEditInvoice}
          />
        </section>
      </div>
    </>
  );
}

function exportInvoicesToCsv(invoices: Invoice[]) {
  const headers = [
    "Invoice ID",
    "Customer",
    "Customer Phone",
    "Customer Email",
    "Issued Date",
    "Due Date",
    "Amount (AED)",
    "Status",
    "Template",
    "Notes",
  ];
  const rows = invoices.map((inv) => [
    inv.id,
    inv.customer,
    inv.customerPhone || "",
    inv.customerEmail || "",
    inv.issued,
    inv.due,
    inv.amount,
    inv.status,
    inv.template || "default_invoice",
    inv.notes || "",
  ]);
  const csvBody = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvBody], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportInvoicesToJson(invoices: Invoice[]) {
  const jsonBody = JSON.stringify(invoices, null, 2);
  const blob = new Blob([jsonBody], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        // ignore CR
      } else if (char === "\n") {
        row.push(cell.trim());
        if (row.length > 0 && row.some((c) => c !== "")) {
          lines.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== "")) {
      lines.push(row);
    }
  }
  return lines;
}

function WhatsAppShareModal({
  invoice,
  company,
  close,
  notify,
}: {
  invoice: Invoice;
  company: Company;
  close: () => void;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [phone, setPhone] = useState(invoice.customerPhone || "");
  const [copied, setCopied] = useState(false);

  const invoiceText = useMemo(() => {
    return (
      `*INVOICE FROM ${company.name.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📄 *Invoice No:* ${invoice.id}\n` +
      `👤 *Customer:* ${invoice.customer}\n` +
      `📅 *Issued Date:* ${invoice.issued}\n` +
      `⏰ *Due Date:* ${invoice.due}\n` +
      `💳 *Payment Status:* ${invoice.status.toUpperCase()}\n` +
      `💰 *Total Amount:* AED ${Number(invoice.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      (invoice.notes ? `📝 *Note:* ${invoice.notes}\n\n` : "\n") +
      `Thank you for your business! Please confirm once payment is complete.\n\n` +
      `📞 *Contact:* ${company.phone || company.contactNo || ""}\n` +
      `✉️ *Email:* ${company.email}`
    );
  }, [company, invoice]);

  const handleSend = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(invoiceText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(invoiceText)}`;
    window.open(url, "_blank");
    notify(`WhatsApp chat opened for ${invoice.id}`);
    close();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceText);
      setCopied(true);
      notify("Invoice text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Failed to copy text", "warn");
    }
  };

  return (
    <div className="modal-backdrop invoice-modal-bg">
      <div className="modal" style={{ maxWidth: 540, width: "95%" }}>
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "#25d366",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
              }}
            >
              <MessageSquare size={18} />
            </span>
            <div>
              <span className="eyebrow" style={{ color: "#25d366" }}>
                WHATSAPP SHARING
              </span>
              <h2>Share Invoice {invoice.id}</h2>
            </div>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Customer Phone Number / WhatsApp
            <input
              type="tel"
              placeholder="+971 50 123 4567 or 971501234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13,
              }}
            />
            <small style={{ color: "#64748b", fontWeight: 400 }}>
              Include country code (e.g. 971). If blank, WhatsApp will let you choose any contact.
            </small>
          </label>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
              WhatsApp Message Preview:
            </div>
            <pre
              style={{
                background: "#ECFDF5",
                border: "1px solid #D1FAE5",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 12,
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                color: "#047857",
                fontFamily: "inherit",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {invoiceText}
            </pre>
          </div>
        </div>

        <div className="modal-actions" style={{ justifyContent: "space-between" }}>
          <button className="secondary-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy text"}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="secondary-btn" onClick={close}>
              Cancel
            </button>
            <button className="btn-whatsapp" onClick={handleSend} style={{ padding: "8px 18px", fontSize: 13 }}>
              <Send size={15} /> Send on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceMiniTable({
  invoices,
  open,
  onEdit,
}: {
  invoices: Invoice[];
  open: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Issued</th>
            <th>Due</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {!invoices.length && (
            <tr>
              <td colSpan={7}>
                <EmptyRows text="No invoices in local desktop storage" />
              </td>
            </tr>
          )}
          {invoices.slice(0, 5).map((i) => (
            <tr key={i.id}>
              <td>
                <button className="invoice-link" onClick={() => open(i)}>
                  {i.id}
                </button>
              </td>
              <td>
                <strong>{i.customer}</strong>
              </td>
              <td>{i.issued}</td>
              <td>{i.due}</td>
              <td>
                <strong>{money(i.amount)}</strong>
              </td>
              <td>
                <StatusPill
                  tone={
                    i.status === "Paid"
                      ? "green"
                      : i.status === "Overdue"
                        ? "red"
                        : "blue"
                  }
                >
                  {i.status}
                </StatusPill>
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    className="icon-btn"
                    title="Preview invoice"
                    onClick={() => open(i)}
                  >
                    <Eye size={15} />
                  </button>
                  {onEdit && (
                    <button
                      type="button"
                      className="icon-btn"
                      title="Edit / Update invoice"
                      onClick={() => onEdit(i)}
                      data-testid={`mini-edit-invoice-${i.id}`}
                    >
                      <Pencil size={14} color="#047857" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceList({
  invoices,
  setInvoices,
  company,
  setShowInvoice,
  onPreviewInvoice,
  onEditInvoice,
  notify,
}: {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  company: Company;
  setShowInvoice: (v: boolean) => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareWhatsAppInvoice, setShareWhatsAppInvoice] = useState<Invoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live status counts
  const counts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.status === "Paid").length,
      sent: invoices.filter((i) => i.status === "Sent").length,
      overdue: invoices.filter((i) => i.status === "Overdue").length,
      draft: invoices.filter((i) => i.status === "Draft").length,
      cancelled: invoices.filter((i) => i.status === "Cancelled").length,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (activeTab !== "all") {
      result = result.filter(
        (i) => i.status.toLowerCase() === activeTab.toLowerCase(),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.customer.toLowerCase().includes(q) ||
          (i.customerPhone && i.customerPhone.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          String(i.amount).includes(q) ||
          i.status.toLowerCase().includes(q),
      );
    }
    return result;
  }, [invoices, activeTab, searchQuery]);

  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus } : i)),
    );
    notify(`Invoice ${invoiceId} marked as ${newStatus}`);
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceId}?`)) {
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
      notify(`Invoice ${invoiceId} deleted from local database`);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";
        let newInvoices: Invoice[] = [];

        if (file.name.endsWith(".json") || text.trim().startsWith("[")) {
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            throw new Error("JSON file must contain an array of invoice records");
          }
          newInvoices = parsed.map((item: any, idx: number) => ({
            id: String(
              item.id || `INV-${String(idx + 1).padStart(4, "0")}`,
            ),
            customer: String(item.customer || "Unknown Customer"),
            customerPhone: item.customerPhone ? String(item.customerPhone) : undefined,
            customerEmail: item.customerEmail ? String(item.customerEmail) : undefined,
            issued: String(item.issued || new Date().toLocaleDateString()),
            due: String(item.due || new Date(Date.now() + 14 * 86400000).toLocaleDateString()),
            amount: Number(item.amount) || 0,
            status: String(item.status || "Draft"),
            template: item.template || "default_invoice",
            notes: item.notes ? String(item.notes) : undefined,
            items: Array.isArray(item.items) ? item.items : undefined,
          }));
        } else {
          const rows = parseCsv(text);
          if (rows.length < 2) {
            throw new Error("CSV file is empty or missing data rows");
          }
          const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
          const idCol = header.findIndex((h) => h.includes("id"));
          const custCol = header.findIndex((h) => h.includes("customer") && !h.includes("phone") && !h.includes("email"));
          const phoneCol = header.findIndex((h) => h.includes("phone"));
          const emailCol = header.findIndex((h) => h.includes("email"));
          const issuedCol = header.findIndex((h) => h.includes("issue"));
          const dueCol = header.findIndex((h) => h.includes("due"));
          const amountCol = header.findIndex((h) => h.includes("amount") || h.includes("total"));
          const statusCol = header.findIndex((h) => h.includes("status"));
          const templateCol = header.findIndex((h) => h.includes("template"));
          const notesCol = header.findIndex((h) => h.includes("note"));

          newInvoices = rows.slice(1).map((row, idx) => {
            const id =
              idCol >= 0 && row[idCol]
                ? row[idCol]
                : `INV-${String(idx + 1).padStart(4, "0")}`;
            const customer = custCol >= 0 && row[custCol] ? row[custCol] : row[1] || "Customer";
            const phone = phoneCol >= 0 && row[phoneCol] ? row[phoneCol] : undefined;
            const email = emailCol >= 0 && row[emailCol] ? row[emailCol] : undefined;
            const issued = issuedCol >= 0 && row[issuedCol] ? row[issuedCol] : new Date().toLocaleDateString();
            const due = dueCol >= 0 && row[dueCol] ? row[dueCol] : new Date(Date.now() + 14 * 86400000).toLocaleDateString();
            const rawAmount = amountCol >= 0 ? row[amountCol] : row[6];
            const cleanAmount = typeof rawAmount === "string" ? parseFloat(rawAmount.replace(/[^0-9.-]/g, "")) : Number(rawAmount);
            const amount = isNaN(cleanAmount) ? 0 : cleanAmount;
            const status = statusCol >= 0 && row[statusCol] ? row[statusCol] : "Sent";
            const template = templateCol >= 0 && row[templateCol] ? row[templateCol] : "default_invoice";
            const notes = notesCol >= 0 && row[notesCol] ? row[notesCol] : undefined;

            return {
              id,
              customer,
              customerPhone: phone,
              customerEmail: email,
              issued,
              due,
              amount,
              status,
              template,
              notes,
            };
          });
        }

        if (newInvoices.length === 0) {
          notify("No valid invoices found in file", "warn");
          return;
        }

        setInvoices((prev) => {
          const importedMap = new Map(newInvoices.map((inv) => [inv.id, inv]));
          const retainedOld = prev.filter((existing) => !importedMap.has(existing.id));
          return [...newInvoices, ...retainedOld];
        });

        notify(`Successfully imported ${newInvoices.length} invoices!`);
      } catch (err: any) {
        notify(`Import failed: ${err?.message || "Invalid file format"}`, "warn");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="desk-panel desk-page">
      <div className="panel-head">
        <div>
          <h2>All invoices</h2>
          <p>
            {invoices.length} records stored in the encrypted local database
          </p>
        </div>
        <div className="top-actions">
          <div className="searchbox">
            <Search />
            <input
              placeholder="Search invoices by ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Import File Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.json,text/csv,application/json"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
          <button
            type="button"
            className="secondary-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import invoices from CSV or JSON file"
          >
            <Upload size={14} /> Import
          </button>

          {/* Export Dropdown */}
          <div className="export-menu-container">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              title="Export invoices"
            >
              <FileDown size={14} /> Export <ChevronDown size={12} />
            </button>
            {exportMenuOpen && (
              <div className="export-menu">
                <button
                  type="button"
                  onClick={() => {
                    exportInvoicesToCsv(filteredInvoices);
                    setExportMenuOpen(false);
                    notify(`Exported ${filteredInvoices.length} invoices to CSV`);
                  }}
                >
                  <FileSpreadsheet size={14} color="#047857" /> Export as CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportInvoicesToJson(filteredInvoices);
                    setExportMenuOpen(false);
                    notify(`Exported ${filteredInvoices.length} invoices to JSON`);
                  }}
                >
                  <FileText size={14} color="#047857" /> Export as JSON (.json)
                </button>
              </div>
            )}
          </div>

          <button className="primary-btn" onClick={() => setShowInvoice(true)}>
            <Plus size={15} /> New invoice
          </button>
        </div>
      </div>

      {/* Filter Tabs with Live Badges */}
      <div className="filter-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All <span className="filter-tab-count">{counts.all}</span>
        </button>
        <button
          className={activeTab === "draft" ? "active" : ""}
          onClick={() => setActiveTab("draft")}
        >
          Draft <span className="filter-tab-count">{counts.draft}</span>
        </button>
        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
        >
          Sent <span className="filter-tab-count">{counts.sent}</span>
        </button>
        <button
          className={activeTab === "paid" ? "active" : ""}
          onClick={() => setActiveTab("paid")}
        >
          Paid <span className="filter-tab-count">{counts.paid}</span>
        </button>
        <button
          className={activeTab === "overdue" ? "active" : ""}
          onClick={() => setActiveTab("overdue")}
        >
          Overdue <span className="filter-tab-count">{counts.overdue}</span>
        </button>
        {counts.cancelled > 0 && (
          <button
            className={activeTab === "cancelled" ? "active" : ""}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled <span className="filter-tab-count">{counts.cancelled}</span>
          </button>
        )}
      </div>

      {/* Main Invoices Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Template Layout</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filteredInvoices.length && (
              <tr>
                <td colSpan={8}>
                  <EmptyRows
                    text={
                      searchQuery
                        ? `No invoices matching "${searchQuery}"`
                        : activeTab !== "all"
                          ? `No ${activeTab} invoices in local storage`
                          : "No invoices created yet. Click '+ New invoice' above to get started!"
                    }
                  />
                </td>
              </tr>
            )}
            {filteredInvoices.map((i) => {
              const tmpl =
                INVOICE_TEMPLATES.find((t) => t.id === i.template) ||
                INVOICE_TEMPLATES[0];
              return (
                <tr key={i.id}>
                  <td>
                    <button
                      type="button"
                      className="invoice-link"
                      onClick={() => onPreviewInvoice(i)}
                      title="Click to preview this invoice"
                    >
                      {i.id}
                    </button>
                  </td>
                  <td>
                    <div>
                      <strong>{i.customer}</strong>
                      {i.customerPhone && (
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {i.customerPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="template-badge"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      title={`Preview template: ${tmpl.name}`}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: tmpl.accent,
                          display: "inline-block",
                        }}
                      />
                      {tmpl.name}
                    </span>
                  </td>
                  <td>{i.issued}</td>
                  <td>{i.due}</td>
                  <td>
                    <strong>{money(i.amount)}</strong>
                  </td>
                  <td>
                    {/* Payment status dropdown */}
                    <select
                      className={`invoice-status-select status-${(i.status || "Draft").toLowerCase()}`}
                      value={i.status}
                      onChange={(e) => handleStatusChange(i.id, e.target.value)}
                      title="Change invoice payment status"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 6,
                      }}
                    >
                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        className="btn-whatsapp-icon"
                        title="Send invoice via WhatsApp"
                        onClick={() => setShareWhatsAppInvoice(i)}
                      >
                        <MessageSquare size={13} />
                      </button>

                      {/* Preview Button */}
                      <button
                        type="button"
                        className="icon-btn"
                        title="Preview & Print invoice"
                        onClick={() => onPreviewInvoice(i)}
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit / Update Button */}
                      {onEditInvoice && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit / Update invoice"
                          onClick={() => onEditInvoice(i)}
                          data-testid={`edit-invoice-${i.id}`}
                        >
                          <Pencil size={14} color="#047857" />
                        </button>
                      )}

                      {/* Quick Mark Paid */}
                      {i.status !== "Paid" && (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Quick Mark as Paid"
                          onClick={() => handleStatusChange(i.id, "Paid")}
                        >
                          <Check size={14} color="#16a34a" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="icon-btn"
                        title="Delete invoice"
                        onClick={() => handleDelete(i.id)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Share Modal if active */}
      {shareWhatsAppInvoice && (
        <WhatsAppShareModal
          invoice={shareWhatsAppInvoice}
          company={company}
          close={() => setShareWhatsAppInvoice(null)}
          notify={notify}
        />
      )}
    </section>
  );
}

function PaymentsView({ invoices }: { invoices: typeof emptyInvoices }) {
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const collected = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pending = total - collected;
  const collectionRate = total > 0 ? (collected / total) * 100 : 0;
  return (
    <section className="desk-panel desk-page">
      <div className="panel-head">
        <div>
          <h2>Payments</h2>
          <p>Payment records and reconciliation</p>
        </div>
        <button className="primary-btn">
          <Plus /> Record payment
        </button>
      </div>
      <div className="payments-hero">
        <CircleDollarSign />
        <div>
          <span>Collected this month</span>
          <strong>{money(collected)}</strong>
        </div>
        <div>
          <span>Pending</span>
          <strong>{money(pending)}</strong>
        </div>
        <div>
          <span>Collection rate</span>
          <strong>{collectionRate.toFixed(1)}%</strong>
        </div>
      </div>
      <InvoiceMiniTable
        invoices={invoices.filter((i) => i.status === "Paid")}
        open={() => { }}
      />
    </section>
  );
}

function ReportsView({ invoices }: { invoices: typeof emptyInvoices }) {
  return (
    <section className="desk-panel desk-page">
      <div className="panel-head">
        <div>
          <h2>Reports</h2>
          <p>Local business performance and tax summaries</p>
        </div>
        <button className="secondary-btn">
          <FileDown /> Export report
        </button>
      </div>
      <div className="report-grid">
        <div>
          <BarChart3 />
          <strong>Sales summary</strong>
          <p>Revenue, outstanding and customer movement.</p>
          <button>
            Open report <ArrowUpRight />
          </button>
        </div>
        <div>
          <ReceiptText />
          <strong>VAT / Tax report</strong>
          <p>Taxable sales and 5% UAE VAT output by period.</p>
          <button>
            Open report <ArrowUpRight />
          </button>
        </div>
        <div>
          <Users />
          <strong>Customer balances</strong>
          <p>Outstanding totals and aging by customer.</p>
          <button>
            Open report <ArrowUpRight />
          </button>
        </div>
      </div>
      <div className="tax-strip">
        <div>
          <span>Taxable sales</span>
          <b>{money(invoices.reduce((s, i) => s + i.amount, 0))}</b>
        </div>
        <div>
          <span>Output VAT (5%)</span>
          <b>{money(invoices.reduce((s, i) => s + i.amount, 0) * 0.05)}</b>
        </div>
        <div>
          <span>Reporting period</span>
          <b>
            {new Date().toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </b>
        </div>
      </div>
    </section>
  );
}

function LockedDesktop({
  reason: lockReason,
  requestCode,
  notify,
  verify,
  canVerify,
  disconnect,
  company,
  license,
  onUnlock,
  onRequestRelogin,
}: {
  reason: DesktopLockReason;
  requestCode: string;
  notify: (s: string, t?: Toast["tone"]) => void;
  verify: () => Promise<boolean | unknown> | void | unknown;
  canVerify: boolean;
  disconnect: () => void;
  company?: Company;
  license?: DesktopLicense | null;
  onUnlock?: (approvedDeviceId?: string) => void;
  onRequestRelogin?: (details: {
    id?: string;
    userName: string;
    userEmail: string;
    reason: string;
  }) => Promise<void> | void;
}) {
  const [showReloginForm, setShowReloginForm] = useState(false);
  const [userName, setUserName] = useState(
    license?.authenticatedUser || company?.superAdminUser || "Counter Operator",
  );
  const [userEmail, setUserEmail] = useState(
    company?.email &&
      company.email.includes("@") &&
      !company.email.endsWith("@local")
      ? company.email
      : "",
  );
  const [reloginReason, setReloginReason] = useState(
    "Re-authorize device access for billing operations",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{
    id: string;
    email: string;
    time: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("ledgershield_last_relogin_req");
      if (saved) return JSON.parse(saved);
    } catch { }
    return null;
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const copy: Record<DesktopLockReason, [string, string, string]> = {
    removed: [
      "Device Removed from Website Portal",
      "This device has been unlinked from the portal by an administrator. Active billing sessions have been terminated and the application has logged out automatically for security.",
      "Hardware device unlinked or revoked by admin",
    ],
    expired: [
      "Offline lease expired",
      "This device has been offline beyond its authorized lease period. Connect to the internet to verify the authorized device and active subscription.",
      "Signed offline lease ended",
    ],
    mismatch: [
      "This installation is not authorized",
      "The device fingerprint does not match the signed license. This can happen when an installation is copied or hardware changes.",
      "Device fingerprint mismatch",
    ],
    blocked: [
      "License access blocked",
      "Your software owner blocked this license or device. Invoice data remains encrypted and unchanged on this computer.",
      "License blocked by administrator",
    ],
    clock: [
      "System clock needs verification",
      "A backward clock change was detected against the signed server time. Connect to verify before continuing.",
      "Possible clock rollback detected",
    ],
  };
  const [title, body, reason] = copy[lockReason];

  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      notify(
        "Please provide a valid Gmail/email address to receive the security copy",
        "warn",
      );
      return;
    }
    setIsSubmitting(true);
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      let resData: any = null;
      if (onRequestRelogin) {
        await onRequestRelogin({
          id: reqId,
          userName: userName.trim() || "Operator",
          userEmail: cleanEmail,
          reason: reloginReason.trim(),
        });
      } else {
        resData = await adminApi.createDeviceRequest({
          id: reqId,
          companyId: company?.id || license?.companyId || "comp-default",
          companyName:
            company?.name || license?.companyName || "Commercial Workspace",
          user: userName.trim() || "Operator",
          userEmail: cleanEmail,
          deviceName: license?.deviceName || "Desktop Station",
          fingerprint: license?.fingerprint || "DEV-FP",
          appVersion: "v1.4.2",
          isRelogin: true,
        });
      }

      if (resData?.alreadyApproved) {
        localStorage.removeItem("ledgershield_device_revoked");
        localStorage.removeItem("ledgershield_last_relogin_req");
        notify(
          "Admin has already approved this device! Opening application...",
          "ok",
        );
        onUnlock?.(resData.deviceId);
        await verify();
        return;
      }

      const reqObj = {
        id: reqId,
        email: cleanEmail,
        time: new Date().toLocaleTimeString(),
      };
      setSubmittedRequest(reqObj);
      localStorage.setItem(
        "ledgershield_last_relogin_req",
        JSON.stringify(reqObj),
      );
      notify(
        `Re-login request ${reqId} sent to Admin · Security copy dispatched to ${cleanEmail}`,
      );
    } catch (err) {
      notify(
        "Request dispatch: " + (err instanceof Error ? err.message : "Error"),
        "warn",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-polling: as soon as the admin approves the request in the website or database,
  // automatically unlock and transition the client device forward into the app!
  useEffect(() => {
    let active = true;

    const checkAutoApproval = async () => {
      if (!active) return;

      // 1. Check local storage if admin reactivated this device locally
      try {
        const reactivatedRaw = localStorage.getItem("ledgershield_device_reactivated");
        if (reactivatedRaw) {
          const parsed = JSON.parse(reactivatedRaw);
          if (
            !parsed?.fingerprint ||
            parsed.fingerprint === license?.fingerprint ||
            (parsed.deviceId && parsed.deviceId === license?.deviceId)
          ) {
            localStorage.removeItem("ledgershield_device_revoked");
            localStorage.removeItem("ledgershield_device_reactivated");
            localStorage.removeItem("ledgershield_last_relogin_req");
            notify("Re-login approved by administrator · Desktop app unlocked", "ok");
            onUnlock?.();
            void verify();
            return;
          }
        }
      } catch { }

      // 2. Check submitted request status from server API
      const activeReq =
        submittedRequest ||
        (() => {
          try {
            return JSON.parse(
              localStorage.getItem("ledgershield_last_relogin_req") || "{}",
            );
          } catch {
            return null;
          }
        })();

      if (activeReq?.id) {
        try {
          const check = await adminApi.checkDeviceRequestStatus(activeReq.id);
          if (!active) return;
          if (check?.status === "approved") {
            localStorage.removeItem("ledgershield_device_revoked");
            localStorage.removeItem("ledgershield_last_relogin_req");
            notify("Re-login approved by administrator · Desktop app unlocked", "ok");
            onUnlock?.(check.approved_device_id);
            void verify();
            return;
          } else if (check?.status === "rejected") {
            localStorage.removeItem("ledgershield_last_relogin_req");
            setSubmittedRequest(null);
            notify("The administrator rejected this re-login request.", "warn");
            return;
          }
        } catch { }
      }

      // 3. Check if server lease is active and authorized (or if device was approved/re-linked on server)
      const targetCompanyId =
        license?.companyId ||
        company?.id ||
        localStorage.getItem("ledgershield_desktop_company_id") ||
        "";
      const targetFp =
        license?.fingerprint ||
        localStorage.getItem("ledgershield_device_fingerprint") ||
        "";
      const targetDeviceId =
        license?.deviceId ||
        localStorage.getItem("ledgershield_desktop_device_id") ||
        "";
      const sn =
        license?.serialNumber ||
        (targetFp.startsWith("fp:win-")
          ? targetFp.replace("fp:win-", "")
          : localStorage.getItem("ledgershield_device_serial") || "SN-DEFAULT");

      if (targetCompanyId && targetFp) {
        try {
          const refreshed = await adminApi.refreshDesktopLease({
            companyId: targetCompanyId,
            deviceId: targetDeviceId,
            fingerprint: targetFp,
            serialNumber: sn,
          });
          if (!active) return;
          if (refreshed?.ok && refreshed.deviceId) {
            localStorage.removeItem("ledgershield_device_revoked");
            localStorage.removeItem("ledgershield_last_relogin_req");
            notify("Device re-authorized by administrator · Desktop app unlocked", "ok");
            onUnlock?.(refreshed.deviceId);
            return;
          }
        } catch { }
      }
    };

    void checkAutoApproval();
    const pollInterval = window.setInterval(checkAutoApproval, 2500);

    return () => {
      active = false;
      window.clearInterval(pollInterval);
    };
  }, [submittedRequest, license?.companyId, license?.fingerprint, license?.deviceId]);

  const handleCheckApprovalStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const activeReq =
        submittedRequest ||
        (() => {
          try {
            return JSON.parse(
              localStorage.getItem("ledgershield_last_relogin_req") || "{}",
            );
          } catch {
            return null;
          }
        })();

      // 1. Check local storage if admin reactivated this device
      let reactivatedLocally = false;
      try {
        const reactivatedRaw = localStorage.getItem("ledgershield_device_reactivated");
        if (reactivatedRaw) {
          const parsed = JSON.parse(reactivatedRaw);
          if (
            !parsed?.fingerprint ||
            parsed.fingerprint === license?.fingerprint ||
            (parsed.deviceId && parsed.deviceId === license?.deviceId)
          ) {
            reactivatedLocally = true;
          }
        }
      } catch { }

      // 2. If activeReq?.id is known, check device request status from server API
      let approvedOnServer = false;
      let approvedDeviceId: string | undefined = undefined;

      if (activeReq?.id) {
        const check = await adminApi
          .checkDeviceRequestStatus(activeReq.id)
          .catch(() => null);

        if (check?.status === "approved") {
          approvedOnServer = true;
          approvedDeviceId = check.approved_device_id;
        } else if (check?.status === "rejected") {
          notify("The administrator rejected this re-login request.", "warn");
          return;
        } else if (check?.status === "pending") {
          // If request is still pending on server and not reactivated locally
          if (!reactivatedLocally) {
            notify("Awaiting administrator approval in Admin Section.", "warn");
            return;
          }
        }
      }

      // 3. Clear revocation storage before lease verify
      localStorage.removeItem("ledgershield_device_revoked");

      let leaseOk = false;
      try {
        const res = await verify();
        leaseOk = Boolean(res);
      } catch {
        leaseOk = false;
      }

      if (leaseOk || approvedOnServer || reactivatedLocally) {
        localStorage.removeItem("ledgershield_last_relogin_req");
        onUnlock?.(approvedDeviceId);
        notify("Checked status with server · Device authorized.", "ok");
        return;
      }

      notify("Awaiting administrator approval in Admin Section.", "warn");
    } catch {
      notify("Awaiting administrator approval in Admin Section.", "warn");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="lock-screen">
      <div className="win-titlebar dark">
        <div className="win-titlebar-left">
          <Logo />
          <span className="titlebar-divider" style={{ background: "rgba(255,255,255,0.2)" }} />
          <span className="desktop-product" style={{ color: "#94a3b8" }}>
            Invoice Desktop
          </span>
        </div>
        {window.ledgerShield?.platform === "electron" ? (
          <div className="electron-controls-spacer" />
        ) : (
          <div className="window-controls">
            <button
              type="button"
              className="win-ctrl-btn"
              title="Minimize"
              onClick={() => window.ledgerShield?.windowAction?.("minimize")}
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              className="win-ctrl-btn"
              title="Maximize"
              onClick={() => window.ledgerShield?.windowAction?.("maximize")}
            >
              <Square size={11} />
            </button>
            <button
              type="button"
              className="win-ctrl-btn win-ctrl-close"
              title="Close"
              onClick={() => window.ledgerShield?.windowAction?.("close")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="lock-scroll-body">
        <div className="lock-content">
          <div className="lock-visual">
            <div className="lock-rings">
              <span />
              <span />
              <LockKeyhole />
            </div>
            <div className="security-scan" />
          </div>
          <span className="lock-kicker">
            <ShieldAlert size={14} />{" "}
            {lockReason === "removed" ? "DEVICE UNLINKED" : "ACCESS PAUSED"}
          </span>
        <h1>{title}</h1>
        <p>{body}</p>

        {lockReason === "removed" ? (
          <div className="lock-removed-banner">
            <AlertTriangle />
            <div>
              <strong>Security Lockout Initiated</strong>
              <small>
                This computer was unlinked from the website portal. To regain
                access, send a re-login request to your software owner or choose
                to sign in with an alternative account.
              </small>
            </div>
          </div>
        ) : (
          <div className="lock-reason">
            <AlertTriangle />
            <div>
              <span>Why access is paused</span>
              <strong>{reason}</strong>
            </div>
          </div>
        )}

        {submittedRequest ? (
          <div className="relogin-success-card">
            <div className="relogin-success-head">
              <span className="success-icon-ring">
                <ShieldCheck size={26} />
              </span>
              <div>
                <h3>Re-login Request #{submittedRequest.id} Dispatched</h3>
                <p>Submitted at {submittedRequest.time}</p>
              </div>
            </div>
            <div className="security-notice-box">
              <div className="sec-tag">
                <Mail size={12} /> Security Verification Copy Dispatched
              </div>
              <p>
                A security audit copy of this request has been dispatched to
                your Gmail: <strong>{submittedRequest.email}</strong>.
              </p>
            </div>
            <div className="admin-status-box">
              <span className="pulse-dot" />
              <div>
                <strong>Sent to Admin Section</strong>
                <small>
                  The software owner / admin will review and approve this
                  hardware authorization in the Admin Section.
                </small>
              </div>
            </div>
            <div
              className="lock-actions"
              style={{
                marginTop: 18,
                display: "flex",
                width: "100%",
                gap: 8,
              }}
            >
              <button
                className="primary-btn"
                style={{ flex: 1 }}
                onClick={handleCheckApprovalStatus}
                disabled={isCheckingStatus}
              >
                <RefreshCcw
                  size={14}
                  className={isCheckingStatus ? "spin" : ""}
                />
                {isCheckingStatus
                  ? "Checking status..."
                  : "Check Approval Status"}
              </button>
              <button
                className="secondary-btn"
                style={{ flex: 1 }}
                onClick={disconnect}
                title="Log out and return to sign in options"
              >
                <LogOut size={14} /> Sign in Option
              </button>
            </div>
          </div>
        ) : showReloginForm ? (
          <div className="relogin-form-card">
            <div className="relogin-form-head">
              <ShieldAlert size={22} className="amber-text" />
              <div>
                <h3>Send Re-login Request to Admin</h3>
                <small>
                  Dispatches a verification ticket to the Admin Section and a
                  security audit copy to your Gmail.
                </small>
              </div>
            </div>
            <form onSubmit={handleSendRequest} className="relogin-form-body">
              <div className="form-group">
                <label>Operator / User Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Counter Operator / Manager"
                />
              </div>
              <div className="form-group">
                <label>User Gmail / Email (Security Copy)</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                />
                <small className="field-hint">
                  <Mail size={11} /> A verification audit copy will be
                  dispatched to this Gmail address.
                </small>
              </div>
              <div className="form-group">
                <label>Reason for Re-login</label>
                <input
                  type="text"
                  value={reloginReason}
                  onChange={(e) => setReloginReason(e.target.value)}
                  placeholder="Device re-activated for counter billing"
                />
              </div>
              <div className="device-meta-pills">
                <div className="meta-pill">
                  <span>DEVICE HARDWARE</span>
                  <b>{license?.deviceName || "Windows Desktop PC"}</b>
                </div>
                <div className="meta-pill">
                  <span>FINGERPRINT SIGNATURE</span>
                  <code>{license?.fingerprint || "DEV-FP"}</code>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  className="primary-btn pulse-glow"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "10px 16px",
                    background:
                      "linear-gradient(135deg, #047857 0%, #059669 100%)",
                    border: "1px solid #047857",
                    borderRadius: 9,
                    boxShadow: "0 4px 14px rgba(4, 120, 87, 0.28)",
                    fontWeight: 700,
                    fontSize: 12.5,
                  }}
                  onClick={handleCheckApprovalStatus}
                  disabled={isCheckingStatus || isSubmitting}
                >
                  <CheckCircle2 size={16} />
                  {isCheckingStatus
                    ? "Checking Approval..."
                    : "Already Approved? Check & Unlock Now"}
                </button>
                <div className="form-actions-split">
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ flex: 1, height: 38, fontSize: 12, fontWeight: 700 }}
                    onClick={() => setShowReloginForm(false)}
                    disabled={isSubmitting || isCheckingStatus}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    style={{
                      flex: 1.3,
                      height: 38,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
                      border: "1px solid #047857",
                      borderRadius: 9,
                    }}
                    disabled={isSubmitting || isCheckingStatus}
                  >
                    <Send size={14} />
                    {isSubmitting ? "Dispatching..." : "Send Re-login Request"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="lock-code">
              <div>
                <span>REQUEST CODE</span>
                <strong>{requestCode}</strong>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(requestCode);
                  notify("Request code copied");
                }}
              >
                Copy
              </button>
            </div>
            {lockReason === "removed" ? (
              <div
                className="lock-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  maxWidth: 380,
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  className="primary-btn pulse-glow"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px 18px",
                    fontSize: 13,
                  }}
                  onClick={() => setShowReloginForm(true)}
                >
                  <Send size={15} /> Send Relogin Request
                </button>
                <button
                  className="secondary-btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "11px 18px",
                    fontSize: 13,
                  }}
                  onClick={disconnect}
                >
                  <KeyRound size={15} /> Sign in Option
                </button>
              </div>
            ) : (
              <div className="lock-actions">
                <button
                  className="primary-btn"
                  onClick={canVerify ? verify : disconnect}
                >
                  {canVerify ? <Wifi /> : <KeyRound />}{" "}
                  {canVerify
                    ? "Connect Internet & verify"
                    : "Activate commercial licence"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setShowReloginForm(true)}
                >
                  <Send /> Send relogin request
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => notify("Admin contact: support@billiondue.com")}
                >
                  <Headphones /> Contact admin
                </button>
              </div>
            )}
          </>
        )}

        <small className="lock-foot" style={{ marginTop: 16 }}>
          <ShieldCheck size={14} /> Your local business data remains encrypted. No invoice
          data is compromised during device unlinking or verification.
        </small>
      </div>
      </div>
    </div>
  );
}

function NewInvoiceModal({
  company,
  templates: _templates,
  notify,
  invoices = [],
  products = [],
  customers = [],
  prefilledCustomer,
  editingInvoice,
  close,
  save,
}: {
  company: Company;
  templates?: string[];
  notify?: (s: string, t?: Toast["tone"]) => void;
  invoices?: Invoice[];
  products?: Product[];
  customers?: Customer[];
  prefilledCustomer?: Customer | null;
  editingInvoice?: Invoice | null;
  close: () => void;
  save: (invoice: Invoice) => void;
}) {
  const isGuest =
    company.id === GUEST_COMPANY_ID ||
    String(company.plan || "").toLowerCase().includes("guest");

  const [viewMode, setViewMode] = useState<"sheet" | "split" | "preview">("sheet");
  const [splitZoom, setSplitZoom] = useState<number>(0.72);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const candidate =
      editingInvoice?.template ||
      localStorage.getItem("primary_invoice_template") ||
      "default_invoice";
    return isTemplateAssignedToCompany(company, candidate, isGuest)
      ? candidate
      : "default_invoice";
  });
  const [customer, setCustomer] = useState(
    () => editingInvoice?.customer || prefilledCustomer?.name || "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    () => editingInvoice?.customerPhone || prefilledCustomer?.phone || "",
  );
  const [customerEmail, setCustomerEmail] = useState(
    () => editingInvoice?.customerEmail || prefilledCustomer?.email || "",
  );
  const [notes, setNotes] = useState(() => editingInvoice?.notes || "");
  const [invoiceId, setInvoiceId] = useState(() =>
    editingInvoice?.id || getNextInvoiceNumber(invoices),
  );
  const [issued, setIssued] = useState(
    () => editingInvoice?.issued || new Date().toLocaleDateString(),
  );
  const [due, setDue] = useState(() =>
    editingInvoice?.due ||
    new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
  );

  useEffect(() => {
    if (prefilledCustomer && !editingInvoice) {
      if (prefilledCustomer.name) setCustomer(prefilledCustomer.name);
      if (prefilledCustomer.phone) setCustomerPhone(prefilledCustomer.phone);
      if (prefilledCustomer.email) setCustomerEmail(prefilledCustomer.email);
    }
  }, [prefilledCustomer, editingInvoice]);

  const [isTaxInvoice, setIsTaxInvoice] = useState(() => {
    if (editingInvoice && editingInvoice.isTaxInvoice !== undefined) {
      return editingInvoice.isTaxInvoice;
    }
    return localStorage.getItem("invoice_tax_mode") !== "non_tax_invoice";
  });
  const [discount, setDiscount] = useState<number>(
    () => editingInvoice?.discount || 0,
  );
  const [advancePaid, setAdvancePaid] = useState<number>(
    () => editingInvoice?.advancePaid || 0,
  );

  interface LineItemState {
    id: string;
    description: string;
    qty: number;
    rate: number;
  }

  const [lines, setLines] = useState<LineItemState[]>(() => {
    if (editingInvoice?.items && editingInvoice.items.length > 0) {
      return editingInvoice.items.map((it, idx) => ({
        id: String(idx + 1),
        description: it.description || "",
        qty: it.qty ?? 1,
        rate: it.rate ?? 0,
      }));
    }
    return [
      {
        id: "1",
        description: "",
        qty: 1,
        rate: 0,
      },
    ];
  });

  const updateLine = (id: string, updates: Partial<LineItemState>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        qty: 1,
        rate: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + (l.qty || 0) * (l.rate || 0), 0),
    [lines],
  );

  const discountedSubtotal = Math.max(0, subtotal - (discount || 0));

  const tax = useMemo(
    () => (isTaxInvoice ? Math.round(discountedSubtotal * 0.05 * 100) / 100 : 0),
    [isTaxInvoice, discountedSubtotal],
  );

  const total = discountedSubtotal + tax;

  const balanceDue = Math.max(0, Math.round((total - (advancePaid || 0)) * 100) / 100);

  const currentTemplate = useMemo(
    () =>
      INVOICE_TEMPLATES.find((t) => t.id === selectedTemplate) ||
      INVOICE_TEMPLATES[0],
    [selectedTemplate],
  );

  const invoiceData: InvoiceRenderData = useMemo(
    () => ({
      companyName: company?.name || "",
      companyEmail: company?.email || "",
      companyAddress: company?.address || "",
      companyLogo: company?.logo,
      companyPhone:
        company?.phone || company?.contactNo || "",
      invoiceId,
      customerName: customer.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      issueDate: issued,
      dueDate: due,
      items: lines
        .filter((l) => l.description.trim() || l.rate > 0)
        .map((l) => ({
          description: l.description.trim(),
          qty: l.qty || 1,
          price: l.rate || 0,
          total: (l.qty || 0) * (l.rate || 0),
        })),
      subtotal,
      discount: discount > 0 ? discount : undefined,
      tax,
      total,
      advancePaid: advancePaid > 0 ? advancePaid : undefined,
      balanceDue,
      isTaxInvoice,
      notes: notes.trim() || undefined,
    }),
    [
      company,
      invoiceId,
      customer,
      customerPhone,
      customerEmail,
      issued,
      due,
      lines,
      subtotal,
      discount,
      tax,
      total,
      advancePaid,
      balanceDue,
      isTaxInvoice,
      notes,
    ],
  );

  const liveHtml = useMemo(
    () => populateInvoiceTemplate(selectedTemplate, invoiceData),
    [selectedTemplate, invoiceData],
  );

  const handleBuildInvoice = (targetStatus?: string): Invoice => ({
    id: invoiceId,
    customer: customer.trim() || "Customer",
    customerPhone: customerPhone.trim() || undefined,
    customerEmail: customerEmail.trim() || undefined,
    issued,
    due,
    amount: total,
    status: targetStatus || editingInvoice?.status || "Draft",
    template: selectedTemplate,
    notes: notes.trim() || undefined,
    subtotal,
    discount: discount > 0 ? discount : undefined,
    tax,
    advancePaid: advancePaid > 0 ? advancePaid : undefined,
    balanceDue,
    isTaxInvoice,
    items: lines
      .filter((l) => l.description.trim() || l.rate > 0)
      .map((l) => ({
        description: l.description.trim() || "Item",
        qty: l.qty || 1,
        rate: l.rate || 0,
        tax: isTaxInvoice ? 5 : 0,
        amount: (l.qty || 0) * (l.rate || 0),
      })),
  });

  return (
    <div className="modal-backdrop invoice-modal-bg">
      <div
        className="invoice-modal-wide"
        style={{
          width: viewMode === "split" ? "min(1480px, 98vw)" : 960,
          maxWidth: "98vw",
          maxHeight: "95vh",
        }}
      >
        {/* Top Header Bar */}
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: currentTemplate.accent,
                display: "inline-block",
              }}
            />
            <div>
              <span
                className="eyebrow"
                style={{ color: currentTemplate.accent, fontSize: 10 }}
              >
                {editingInvoice ? "SALES INVOICE EDITOR" : "SALES INVOICE GENERATOR"}
              </span>
              <h2 style={{ fontSize: 17, margin: 0, color: "#0f172a" }}>
                {editingInvoice ? `Edit Invoice ${invoiceId}` : `Invoice ${invoiceId}`}
              </h2>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="invoice-view-toggle">
              <button
                type="button"
                className={viewMode === "sheet" ? "active" : ""}
                onClick={() => setViewMode("sheet")}
                title="Interactive Invoice Sheet"
              >
                <FileText size={13} /> Invoice UI
              </button>
              <button
                type="button"
                className={viewMode === "split" ? "active active-split" : ""}
                onClick={() => setViewMode("split")}
                title="Side-by-side Editor & Live Template"
              >
                <Sparkles size={13} /> Split View
              </button>
              <button
                type="button"
                className={viewMode === "preview" ? "active" : ""}
                onClick={() => setViewMode("preview")}
                title="Full Live Template Preview"
              >
                <Eye size={13} /> Live Preview
              </button>
            </div>
            <button
              type="button"
              onClick={close}
              className="modal-close-btn"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dedicated Template Layout Selector Toolbar */}
        <div className="template-picker-toolbar">
          <span className="template-picker-label">Template:</span>
          {getAccessibleTemplates(company, isGuest).map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                className={`template-pill-btn ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setSelectedTemplate(tmpl.id);
                }}
                title={`Select ${tmpl.name}`}
              >
                <span
                  className="template-pill-color"
                  style={{ background: tmpl.accent }}
                />
                {tmpl.name}
                {tmpl.isDefault && (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background:
                        selectedTemplate === tmpl.id
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(17, 53, 55, 0.12)",
                      color: selectedTemplate === tmpl.id ? "#fff" : "#113537",
                      fontWeight: 800,
                      marginLeft: "2px",
                    }}
                  >
                    ★ Main Default
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Tax Type:</span>
            <button
              type="button"
              onClick={() => setIsTaxInvoice(!isTaxInvoice)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                border: isTaxInvoice ? "1px solid #047857" : "1px solid #cbd5e1",
                background: isTaxInvoice ? "#ECFDF5" : "#f8fafc",
                color: isTaxInvoice ? "#065f46" : "#64748b",
                transition: "all 0.15s ease",
              }}
              title="Toggle UAE Tax Invoice (5% VAT) vs Non-Tax Invoice (0% VAT)"
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isTaxInvoice ? "#047857" : "#94a3b8",
                }}
              />
              {isTaxInvoice ? "Tax Invoice (5% VAT)" : "Non-Tax Invoice (0%)"}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="invoice-sheet-body">
          {viewMode === "preview" ? (
            /* Full Live Preview View */
            <div className="live-preview-container">
              <iframe
                srcDoc={liveHtml}
                title={`Live Preview of ${invoiceId}`}
                style={{
                  width: "100%",
                  height: "760px",
                  border: "0",
                  background: "#fff",
                }}
              />
            </div>
          ) : (
            /* Sheet or Split Layout */
            <div className={viewMode === "split" ? "invoice-split-layout" : ""}>
              {/* Interactive Invoice Paper Sheet */}
              <div className="invoice-paper-sheet">
                {/* 1. Invoice Header with Company Branding */}
                <div className="invoice-paper-header">
                  <div className="invoice-paper-company">
                    {company?.logo ? (
                      <img src={company.logo} alt={company.name} />
                    ) : (
                      <div
                        className="invoice-paper-logo-fallback"
                        style={{ background: currentTemplate.accent }}
                      >
                        {(company?.name || "BD").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {company?.name || "Company"}
                      </h3>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          marginTop: 3,
                          lineHeight: 1.4,
                        }}
                      >
                        {company?.address && <div>{company.address}</div>}
                        {(company?.phone || company?.contactNo || company?.email) && (
                          <div>
                            {[company?.phone || company?.contactNo, company?.email]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="invoice-paper-meta">
                    <span
                      className="invoice-paper-title"
                      style={{ color: currentTemplate.accent }}
                    >
                      {isTaxInvoice ? "TAX INVOICE" : "INVOICE"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        margin: "4px 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        #
                      </span>
                      <input
                        type="text"
                        value={invoiceId}
                        onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
                        placeholder="INV-0001"
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          width: 125,
                          color: "#0f172a",
                          background: "#f8fafc",
                          fontFamily: "monospace",
                          letterSpacing: "0.5px",
                        }}
                        title="Invoice Series Number (INV-XXXX)"
                      />
                    </div>
                    <div className="invoice-dates-row">
                      <DatePickerDropdown
                        label="Issue Date"
                        value={issued}
                        onChange={setIssued}
                      />
                      <DatePickerDropdown
                        label="Due Date"
                        value={due}
                        onChange={setDue}
                        isDueDate
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Customer / Billed To Section */}
                <div className="invoice-billed-to-card">
                  <h4>Billed To / Customer Information</h4>
                  <div className="invoice-customer-inputs">
                    <label>
                      Customer / Client Name *
                      <CustomerAutocomplete
                        required
                        value={customer}
                        onChange={setCustomer}
                        customers={customers}
                        onSelectCustomer={(c) => {
                          setCustomer(c.name);
                          if (c.phone) setCustomerPhone(c.phone);
                          if (c.email) setCustomerEmail(c.email);
                        }}
                        placeholder="Customer name or search saved..."
                      />
                    </label>
                    <label>
                      Phone / WhatsApp
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone number"
                      />
                    </label>
                    <label>
                      Billing Email
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Billing email"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Line Items Table */}
                <div className="invoice-sheet-table-wrap">
                  <table className="invoice-sheet-table">
                    <thead>
                      <tr style={{ background: currentTemplate.accent }}>
                        <th style={{ width: "48%", textAlign: "left" }}>
                          Item / Description
                        </th>
                        <th style={{ width: "14%", textAlign: "center" }}>
                          Qty
                        </th>
                        <th style={{ width: "18%", textAlign: "right" }}>
                          Rate (AED)
                        </th>
                        <th style={{ width: "14%", textAlign: "right" }}>
                          Amount (AED)
                        </th>
                        <th style={{ width: "6%" }} />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr
                          key={line.id}
                          style={{
                            position: "relative",
                            zIndex: lines.length - idx + 10,
                          }}
                        >
                          <td style={{ overflow: "visible", position: "relative" }}>
                            <ProductAutocomplete
                              value={line.description}
                              onChange={(val) =>
                                updateLine(line.id, { description: val })
                              }
                              products={products}
                              onSelectProduct={(p) => {
                                const descParts: string[] = [];
                                if (p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase())) {
                                  descParts.push(`${p.brand} ${p.name}`);
                                } else {
                                  descParts.push(p.name);
                                }
                                if (p.specs) descParts.push(`- ${p.specs}`);
                                if (p.condition && p.condition !== "Brand New") {
                                  descParts.push(`(${p.condition})`);
                                }
                                if (p.serialNumber) descParts.push(`[S/N: ${p.serialNumber}]`);
                                if (p.warranty) descParts.push(`[${p.warranty}]`);

                                updateLine(line.id, {
                                  description: descParts.join(" "),
                                  rate: p.price,
                                });
                              }}
                              placeholder="Item description or search catalog..."
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="number"
                              min="1"
                              value={line.qty === 0 ? "" : line.qty}
                              placeholder="1"
                              onChange={(e) =>
                                updateLine(line.id, {
                                  qty: Math.max(
                                    1,
                                    Number(e.target.value) || 1,
                                  ),
                                })
                              }
                              style={{ textAlign: "center" }}
                            />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={line.rate === 0 ? "" : line.rate}
                              placeholder="0.00"
                              onChange={(e) =>
                                updateLine(line.id, {
                                  rate: Math.max(
                                    0,
                                    Number(e.target.value) || 0,
                                  ),
                                })
                              }
                              style={{ textAlign: "right" }}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            AED{" "}
                            {((line.qty || 0) * (line.rate || 0)).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(line.id)}
                                title="Remove line"
                                style={{
                                  border: 0,
                                  background: "transparent",
                                  cursor: "pointer",
                                  color: "#ef4444",
                                  padding: 2,
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="btn-add-line"
                  onClick={addLine}
                >
                  <Plus size={13} /> Add Line Item
                </button>

                {/* 4. Notes & Financial Calculation Totals */}
                <div className="invoice-sheet-footer-grid">
                  <div className="invoice-notes-card">
                    <label>Notes & Payment Instructions</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Payment terms, bank wire details, or notes..."
                    />
                  </div>

                  <div className="invoice-totals-card">
                    <div className="total-row">
                      <span>Subtotal</span>
                      <strong>
                        AED{" "}
                        {subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>

                    <div className="total-row" style={{ alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        Discount (AED)
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>- AED</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={discount === 0 ? "" : discount}
                          placeholder="0.00"
                          onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                          style={{
                            width: 90,
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "3px 6px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <div className="total-row">
                      <span>{isTaxInvoice ? "VAT (5%)" : "VAT (0% Non-Tax)"}</span>
                      <strong>
                        AED{" "}
                        {tax.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>

                    <div className="total-row" style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 6 }}>
                      <span style={{ fontWeight: 700 }}>Total Amount</span>
                      <strong style={{ fontWeight: 800 }}>
                        AED{" "}
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>

                    <div className="total-row" style={{ alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        Advance Paid (AED)
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>AED</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={advancePaid === 0 ? "" : advancePaid}
                          placeholder="0.00"
                          onChange={(e) => setAdvancePaid(Math.max(0, Number(e.target.value) || 0))}
                          style={{
                            width: 90,
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "3px 6px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <div className="total-row grand-total" style={{ marginTop: 4 }}>
                      <span>Balance Due</span>
                      <strong style={{ color: currentTemplate.accent, fontSize: 15 }}>
                        AED{" "}
                        {balanceDue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Split View: Live Studio Preview Side-by-Side */}
              {viewMode === "split" && (
                <div className="split-preview-desk">
                  {/* Studio Header Toolbar */}
                  <div className="split-preview-toolbar">
                    <div className="split-preview-meta">
                      <span className="live-pulse-dot" />
                      <span className="split-preview-title">Real-Time Template</span>
                      <span
                        className="split-template-tag"
                        style={{ borderColor: currentTemplate.accent }}
                      >
                        <span
                          className="split-template-dot"
                          style={{ background: currentTemplate.accent }}
                        />
                        {currentTemplate.name}
                      </span>
                    </div>

                    <div className="split-preview-controls">
                      <button
                        type="button"
                        className="split-ctrl-btn"
                        onClick={() =>
                          setSplitZoom((z) =>
                            Math.max(0.45, Math.round((z - 0.08) * 100) / 100),
                          )
                        }
                        title="Zoom Out"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="split-zoom-label">
                        {Math.round(splitZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        className="split-ctrl-btn"
                        onClick={() =>
                          setSplitZoom((z) =>
                            Math.min(1.25, Math.round((z + 0.08) * 100) / 100),
                          )
                        }
                        title="Zoom In"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        className={`split-pill-btn ${splitZoom === 0.72 ? "active" : ""}`}
                        onClick={() => setSplitZoom(0.72)}
                        title="Fit Full A4 Page into View"
                      >
                        Fit A4
                      </button>
                      <button
                        type="button"
                        className={`split-pill-btn ${splitZoom === 1.0 ? "active" : ""}`}
                        onClick={() => setSplitZoom(1.0)}
                        title="Actual 100% Size"
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        className="split-ctrl-btn"
                        onClick={() => setViewMode("preview")}
                        title="Expand to Full Live Preview"
                        style={{ marginLeft: 3 }}
                      >
                        <Maximize2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Scaled Studio Document Canvas */}
                  <div className="split-preview-canvas">
                    <div
                      className="split-preview-bounding-box"
                      style={{
                        width: `${Math.round(794 * splitZoom)}px`,
                        height: `${Math.round(1123 * splitZoom)}px`,
                      }}
                    >
                      <div
                        className="split-preview-transform-node"
                        style={{
                          transform: `scale(${splitZoom})`,
                          transformOrigin: "top left",
                          width: "794px",
                          height: "1123px",
                        }}
                      >
                        <iframe
                          srcDoc={liveHtml}
                          title="Live Split Preview Document"
                          className="split-preview-iframe"
                          style={{
                            width: "794px",
                            height: "1123px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div
          className="modal-actions"
          style={{
            padding: "12px 24px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {editingInvoice ? (
              <>
                {editingInvoice.status === "Draft" && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => save(handleBuildInvoice("Sent"))}
                    title="Save invoice changes and mark as sent"
                  >
                    <Send size={15} /> Save & Mark Sent
                  </button>
                )}
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => save(handleBuildInvoice(editingInvoice.status))}
                  title="Save invoice changes"
                  data-testid="save-invoice-changes-btn"
                >
                  <Save size={15} /> Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => save(handleBuildInvoice("Draft"))}
                  title="Save invoice as draft"
                >
                  Save as draft
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => save(handleBuildInvoice("Sent"))}
                  title="Save invoice and mark as sent"
                >
                  <Send size={15} /> Save & mark sent
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({
  company,
  invoice,
  close,
  onStatusChange,
  onTemplateChange,
  onEdit,
  notify,
}: {
  company: Company;
  invoice?: Invoice;
  close: () => void;
  onStatusChange?: (newStatus: string) => void;
  onTemplateChange?: (newTemplate: string) => void;
  onEdit?: (invoice: Invoice) => void;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const isGuest =
    company.id === GUEST_COMPANY_ID ||
    String(company.plan || "").toLowerCase().includes("guest");

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => {
      const init = invoice?.template || "default_invoice";
      return isTemplateAssignedToCompany(company, init, isGuest)
        ? init
        : "default_invoice";
    },
  );
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (invoice?.template) {
      setSelectedTemplateId(invoice.template);
    }
  }, [invoice?.id, invoice?.template]);

  if (!invoice) {
    return (
      <div className="modal-backdrop preview-bg">
        <div className="modal">
          <div className="modal-head">
            <h2>No invoice selected</h2>
            <button onClick={close}>
              <X />
            </button>
          </div>
          <EmptyRows text="Create an invoice before opening print preview" />
        </div>
      </div>
    );
  }

  const isTax = invoice.isTaxInvoice !== false;
  const subtotal = invoice.subtotal !== undefined ? invoice.subtotal : (invoice.amount / 1.05);
  const discount = invoice.discount;
  const tax = invoice.tax !== undefined ? invoice.tax : (isTax ? invoice.amount - subtotal : 0);
  const advancePaid = invoice.advancePaid;
  const balanceDue = invoice.balanceDue !== undefined ? invoice.balanceDue : (invoice.amount - (advancePaid || 0));

  const invoiceData: InvoiceRenderData = {
    companyName: company.name,
    companyEmail: company.email,
    companyAddress: company.address,
    companyLogo: company.logo,
    companyPhone: company.phone || company.contactNo || "+971 4 390 0000",
    invoiceId: invoice.id,
    customerName: invoice.customer,
    customerPhone: invoice.customerPhone,
    customerEmail: invoice.customerEmail,
    issueDate: invoice.issued,
    dueDate: invoice.due,
    items:
      invoice.items && invoice.items.length > 0
        ? invoice.items.map((it) => ({
          description: it.description,
          qty: it.qty,
          price: it.rate,
          total: it.amount,
        }))
        : undefined,
    subtotal,
    discount,
    tax,
    total: invoice.amount,
    advancePaid,
    balanceDue,
    isTaxInvoice: isTax,
    notes: invoice.notes,
  };

  const renderedHtml = populateInvoiceTemplate(selectedTemplateId, invoiceData);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      const oldTitle = document.title;
      document.title = `${invoice.id}_${company.name.replace(/\s+/g, "_")}`;
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
      setTimeout(() => {
        document.title = oldTitle;
      }, 1000);
      notify("Print dialog opened");
    } else {
      notify("Print dialog prepared");
    }
  };

  const handleDownloadPdf = () => {
    // 1. Trigger print (which allows 'Save as PDF')
    handlePrint();
    // 2. Also download standalone printable HTML document for client delivery
    const blob = new Blob([renderedHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.id}_${company.name.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`PDF export opened & printable document saved for ${invoice.id}`);
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    onTemplateChange?.(id);
    const tmpl = INVOICE_TEMPLATES.find((t) => t.id === id);
    notify(`Template switched to ${tmpl?.name || id}`);
  };

  return (
    <div className="modal-backdrop preview-bg">
      <div className="preview-shell" style={{ width: 920, maxWidth: "96vw" }}>
        <div className="preview-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={close} title="Close preview">
              <X size={16} />
            </button>
            <span>
              <b>{invoice.id}</b>
              <small>{company.name} · Preview & Print</small>
            </span>

            {/* Payment Status Dropdown inside Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Status:</span>
              <select
                className={`invoice-status-select status-${(invoice.status || "Draft").toLowerCase()}`}
                value={invoice.status}
                onChange={(e) => onStatusChange?.(e.target.value)}
                title="Update payment status"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Edit Invoice Button */}
            {onEdit && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  close();
                  onEdit(invoice);
                }}
                title="Edit / Update invoice details"
                data-testid="preview-edit-invoice-btn"
              >
                <Pencil size={14} color="#047857" /> Edit Invoice
              </button>
            )}

            {/* WhatsApp Button */}
            <button
              type="button"
              className="btn-whatsapp"
              onClick={() => setShowWhatsApp(true)}
              title="Share invoice via WhatsApp"
            >
              <MessageSquare size={14} /> Send WhatsApp
            </button>

            {/* Print Button */}
            <button
              type="button"
              className="secondary-btn"
              onClick={handlePrint}
              title="Print invoice"
            >
              <Printer size={14} /> Print
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              className="primary-btn"
              onClick={handleDownloadPdf}
              title="Download invoice as PDF or printable document"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Template Layout Selector Bar */}
        <div className="template-picker-toolbar">
          <span className="template-picker-label">Layout:</span>
          {getAccessibleTemplates(company, isGuest).map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                className={`template-pill-btn ${isSelected ? "active" : ""}`}
                onClick={() => {
                  handleSelectTemplate(tmpl.id);
                }}
                title={`Switch layout to ${tmpl.name}`}
              >
                <span
                  className="template-pill-color"
                  style={{ background: tmpl.accent }}
                />
                {tmpl.name}
                {tmpl.isDefault && (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background:
                        selectedTemplateId === tmpl.id
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(17, 53, 55, 0.12)",
                      color: selectedTemplateId === tmpl.id ? "#fff" : "#113537",
                      fontWeight: 800,
                      marginLeft: "2px",
                    }}
                  >
                    ★ Main Default
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <iframe
          ref={iframeRef}
          srcDoc={renderedHtml}
          title={`Invoice ${invoice.id}`}
          style={{
            width: "100%",
            height: "780px",
            border: "0",
            background: "#fff",
          }}
        />

        {/* WhatsApp Share Modal */}
        {showWhatsApp && (
          <WhatsAppShareModal
            invoice={invoice}
            company={company}
            close={() => setShowWhatsApp(false)}
            notify={notify}
          />
        )}
      </div>
    </div>
  );
}

function BackupModal({
  close,
  invoices,
  company,
  notify,
}: {
  close: () => void;
  invoices: typeof emptyInvoices;
  company: Company;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const exportData = async () => {
    try {
      setBusy(true);
      const envelope = await encryptBackup(
        {
          company: company.name,
          invoices,
          products: emptyProducts,
          exportedAt: new Date().toISOString(),
        },
        pass,
      );
      downloadEncryptedBackup(envelope);
      notify("Encrypted AES-256-GCM backup downloaded");
    } catch (e) {
      notify((e as Error).message, "warn");
    } finally {
      setBusy(false);
    }
  };
  const restore = async (file: File) => {
    try {
      setBusy(true);
      const envelope = JSON.parse(await file.text()) as EncryptedEnvelope;
      const data = await decryptBackup<{ invoices: unknown[] }>(envelope, pass);
      notify(
        `Backup decrypted · ${data.invoices.length} invoices ready to restore`,
      );
    } catch {
      notify("Could not decrypt backup. Check the passphrase.", "warn");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <div className="modal wide">
        <div className="modal-head">
          <div>
            <span className="eyebrow">PORTABLE OFFLINE DATA</span>
            <h2>Encrypted backup & restore</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <div className="backup-shield">
          <Database />
          <div>
            <b>Client data stays encrypted</b>
            <p>
              Backups use AES-256-GCM with a key derived from your passphrase
              (PBKDF2-SHA256, 210,000 iterations).
            </p>
          </div>
        </div>
        <label>
          Backup passphrase
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </label>
        <div className="backup-actions">
          <button onClick={exportData} disabled={busy}>
            <ArrowDownToLine />
            <span>
              <b>Export backup</b>
              <small>Download .lsbak file</small>
            </span>
          </button>
          <button onClick={() => input.current?.click()} disabled={busy}>
            <ArrowUpRight />
            <span>
              <b>Restore backup</b>
              <small>Open encrypted file</small>
            </span>
          </button>
          <input
            ref={input}
            hidden
            type="file"
            accept=".lsbak,application/json"
            onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])}
          />
        </div>
        <div className="approval-note">
          <ShieldAlert />
          <p>
            A backup can carry old local invoice data, but it does not authorize
            a new computer. The replacement device still needs owner approval
            and its own fresh signed lease.
          </p>
        </div>
        <small className="secure-note">
          {secureStorage.productionProtected
            ? "Desktop secrets are protected by Windows DPAPI through Electron safeStorage."
            : "Browser preview uses a demonstration fallback. Run the Electron client for Windows OS-protected secret storage."}
        </small>
      </div>
    </div>
  );
}
