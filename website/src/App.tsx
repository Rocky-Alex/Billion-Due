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
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Clock,
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
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
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
  type Company,
  type Customer,
  type Device,
  type DeviceRequest,
  type Invoice,
  type Product,
  type SecurityEvent,
  generateInstallationKey,
  generateRecoveryKey,
  getInitials,
  type SoftwareOwnerProfile,
  initialOwnerProfile,
  adminApi,
  windowsInstallerUrl,
  INVOICE_TEMPLATES,
  populateInvoiceTemplate,
  isTemplateAssignedToCompany,
  getAccessibleTemplates,
  type InvoiceTemplateItem,
  type InvoiceRenderData,
  broadcastDeviceRevoked,
  Logo,
  StatusPill,
  Toasts,
  Metric,
  EmptyRows,
  money,
  type PortalRole,
  type PortalTemplate,
  type Toast,
} from "@billiondue/shared";
import { LandingPage } from "./components/LandingPage";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";

export function App() {
  const [role, setRole] = useState<PortalRole | null>(
    () => sessionStorage.getItem("ledgershield_role") as PortalRole | null,
  );
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    () => sessionStorage.getItem("ledgershield_company_id") || "",
  );
  const [path, setPath] = useState(window.location.pathname);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [requests, setRequests] = useState<DeviceRequest[]>(initialDeviceRequests);
  const [templates, setTemplates] = useState<PortalTemplate[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<SoftwareOwnerProfile>(() => {
    try {
      const raw = localStorage.getItem("billiondue_software_owner_profile");
      if (raw) return JSON.parse(raw);
    } catch { }
    return initialOwnerProfile;
  });
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

  const navigate = (nextPath: string, replace = false) => {
    if (replace) window.history.replaceState({}, "", nextPath);
    else window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!role) {
      const currentRoute = path.split("#")[0].split("?")[0];
      const publicPaths = [
        "/",
        "/home",
        "/products",
        "/about",
        "/about-us",
        "/contact",
        "/contact-us",
        "/login",
      ];
      if (!publicPaths.includes(currentRoute)) {
        navigate("/", true);
      }
      return;
    }
    const expected = `/${role}/`;
    if (!path.startsWith(expected)) navigate(`${expected}overview`, true);
  }, [role, path]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!role) return;
        const clientTargetCompanyId =
          activeCompanyId ||
          sessionStorage.getItem("ledgershield_company_id") ||
          "";
        if (role === "client" && !clientTargetCompanyId) return;
        const payload: any =
          role === "client"
            ? await adminApi.clientBootstrap(clientTargetCompanyId)
            : await adminApi.bootstrap();
        const rawCompanies: any[] =
          role === "client"
            ? payload.company
              ? [payload.company]
              : []
            : payload.companies || [];
        const rawLicenses: any[] =
          role === "client"
            ? payload.license
              ? [payload.license]
              : []
            : payload.licenses || [];
        const rawDevices: any[] = payload.devices || [];
        const rawTemplates: any[] = payload.templates || [];
        const templateAssignments: any[] = payload.templateAssignments || [];
        const templateList: PortalTemplate[] = INVOICE_TEMPLATES.map((tmpl) => {
          const dbMatch = rawTemplates.find(
            (r: any) =>
              r.name?.toLowerCase() === tmpl.name.toLowerCase() ||
              r.definition?.id === tmpl.id,
          );
          const assignedCount = dbMatch
            ? templateAssignments.filter(
              (a: any) => a.template_id === dbMatch.id,
            ).length
            : rawCompanies.length;
          return {
            id: tmpl.id,
            name: tmpl.name,
            accent: tmpl.accent,
            category: tmpl.category,
            description: tmpl.description,
            previewImage: tmpl.previewImage,
            badge: tmpl.badge,
            assigned: tmpl.isDefault
              ? rawCompanies.length || 1
              : assignedCount || rawCompanies.length,
            isDefault: tmpl.isDefault,
          };
        });
        setTemplates(templateList);
        setSecurityEvents(
          (payload.securityEvents || []).map((e: any) => ({
            id: e.id,
            company:
              rawCompanies.find((c: any) => c.id === e.company_id)?.name ||
              "Company",
            device: e.device_name || "Unknown device",
            fingerprint: e.fingerprint || "—",
            reason: e.details?.reason || e.event_type,
            time: new Date(e.created_at).toLocaleString(),
            severity: String(e.severity).replace(/^./, (m: string) =>
              m.toUpperCase(),
            ) as SecurityEvent["severity"],
          })),
        );
        if (rawCompanies.length) {
          const mapped: Company[] = rawCompanies.map((c: any) => {
            const lic =
              rawLicenses.find((l: any) => l.company_id === c.id) || {};
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
              offlineLeaseOverride: c.offline_lease_override || c.offlineLeaseOverride || undefined,
              license: lic.id || "Not issued",
              expires: lic.expires_at
                ? new Date(lic.expires_at).toLocaleDateString()
                : "—",
              seatsUsed: c.seats_used,
              seatsAllowed: c.seats_allowed,
              devicesAllowed: c.devices_allowed,
              templates: (() => {
                const cAssigns = templateAssignments.filter(
                  (a: any) => a.company_id === c.id,
                );
                if (cAssigns.length > 0) {
                  const names = cAssigns
                    .map((a: any) => {
                      const t = rawTemplates.find(
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
                return c.templates && c.templates.length > 0
                  ? c.templates
                  : ["Default Invoice"];
              })(),
              devices,
            };
          });
          setCompanies(mapped);
        }
        const rawRequests: any[] = payload.requests || [];
        setRequests(
          rawRequests.map((r: any) => ({
            id: r.id,
            companyId: r.company_id,
            company:
              rawCompanies.find((c: any) => c.id === r.company_id)?.name ||
              "Company",
            user: r.requested_by,
            license:
              rawLicenses.find((l: any) => l.company_id === r.company_id)?.id ||
              "",
            deviceName: r.device_name,
            fingerprint: r.fingerprint,
            appVersion: r.app_version,
            attemptTime: new Date(r.attempted_at).toLocaleString(),
            replaceDeviceId: r.replace_device_id,
            status: r.status,
            isRelogin: Boolean(r.is_relogin ?? r.isRelogin),
            userEmail: r.user_email || r.userEmail || undefined,
          })),
        );
        if (payload.adminProfile) {
          setOwnerProfile((prev) => {
            const merged = {
              name: payload.adminProfile.name || prev.name || "",
              email: payload.adminProfile.email || prev.email || "",
              contactNo: payload.adminProfile.contactNo || prev.contactNo || "",
              address: payload.adminProfile.address || prev.address || "",
              roleTitle: payload.adminProfile.roleTitle || prev.roleTitle || "",
              recoveryKey:
                payload.adminProfile.recoveryKey || prev.recoveryKey || "",
            };
            try {
              localStorage.setItem(
                "billiondue_software_owner_profile",
                JSON.stringify(merged),
              );
            } catch { }
            return merged;
          });
        }
      } catch {
        notify(
          "Could not refresh from Neon; existing data was left unchanged",
          "warn",
        );
      }
    };
    void load();
  }, [role, activeCompanyId]);

  const login = (nextRole: PortalRole, companyId?: string) => {
    sessionStorage.setItem("ledgershield_role", nextRole);
    if (companyId) {
      sessionStorage.setItem("ledgershield_company_id", companyId);
      setActiveCompanyId(companyId);
    }
    setRole(nextRole);
    navigate(`/${nextRole}/overview`);
  };

  const logout = () => {
    sessionStorage.removeItem("ledgershield_role");
    sessionStorage.removeItem("ledgershield_company_id");
    setActiveCompanyId("");
    setRole(null);
    navigate("/login", true);
  };

  if (!role) {
    if (path === "/login") {
      return (
        <PortalLogin
          login={login}
          companies={companies}
          setCompanies={setCompanies}
          notify={notify}
          onBackToHome={() => navigate("/")}
        />
      );
    }
    const currentRoute = path.split("#")[0].split("?")[0];
    return (
      <div className="w-full min-h-screen flex flex-col bg-[#F8F9FF] text-[#3D4A42] font-sans antialiased">
        <SiteHeader currentPath={currentRoute} navigate={navigate} />
        <div className="flex-1">
          {(currentRoute === "/" || currentRoute === "/home") && (
            <HomePage navigate={navigate} notify={notify} />
          )}
          {currentRoute === "/products" && (
            <ProductsPage navigate={navigate} notify={notify} />
          )}
          {(currentRoute === "/about" || currentRoute === "/about-us") && (
            <AboutPage navigate={navigate} notify={notify} />
          )}
          {(currentRoute === "/contact" || currentRoute === "/contact-us") && (
            <ContactPage navigate={navigate} notify={notify} />
          )}
          {currentRoute !== "/" &&
            currentRoute !== "/home" &&
            currentRoute !== "/products" &&
            currentRoute !== "/about" &&
            currentRoute !== "/about-us" &&
            currentRoute !== "/contact" &&
            currentRoute !== "/contact-us" && (
              <HomePage navigate={navigate} notify={notify} />
            )}
        </div>
        <SiteFooter navigate={navigate} />
      </div>
    );
  }

  const page = path.split("/")[2] || "overview";
  return (
    <div className={`app surface-${role}`}>
      {role === "admin" && (
        <AdminPortal
          page={page}
          setPage={(next) => navigate(`/admin/${next}`)}
          companies={companies}
          setCompanies={setCompanies}
          requests={requests}
          templates={templates}
          securityEvents={securityEvents}
          setRequests={setRequests}
          notify={notify}
          logout={logout}
          ownerProfile={ownerProfile}
          setOwnerProfile={setOwnerProfile}
        />
      )}
      {role === "client" &&
        (() => {
          const clientCompany =
            companies.find((c) => c.id === activeCompanyId) || companies[0];
          return clientCompany ? (
            <ClientPortal
              page={page}
              setPage={(next) => navigate(`/client/${next}`)}
              company={clientCompany}
              setCompanies={setCompanies}
              requests={requests}
              securityEvents={securityEvents}
              setRequests={setRequests}
              notify={notify}
              logout={logout}
            />
          ) : (
            <PortalEmpty
              title="No company data"
              detail="No company is assigned to this account in Neon."
              logout={logout}
            />
          );
        })()}
      <Toasts items={toasts} />
    </div>
  );
}

function PortalEmpty({
  title,
  detail,
  logout,
}: {
  title: string;
  detail: string;
  logout: () => void;
}) {
  return (
    <main className="portal-empty">
      <Database />
      <h2>{title}</h2>
      <p>{detail}</p>
      <button className="secondary-btn" onClick={logout}>
        <LogOut /> Sign out
      </button>
    </main>
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
function PortalLogin({
  login,
  companies,
  setCompanies,
  notify,
  onBackToHome,
}: {
  login: (role: PortalRole, companyId?: string) => void;
  companies: Company[];
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  notify?: (s: string, t?: Toast["tone"]) => void;
  onBackToHome?: () => void;
}) {
  const [portal, setPortal] = useState<PortalRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const choose = (next: PortalRole) => {
    setPortal(next);
    setError("");
    setEmail("");
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const res = await adminApi.authLogin({ portal, email, password });
      if (res.ok) {
        if (res.role === "admin") {
          login("admin");
        } else {
          if (!res.companyId)
            throw new Error("No company is assigned to this account");
          login("client", res.companyId);
        }
        return;
      }
    } catch (apiErr: unknown) {
      setError(
        apiErr instanceof Error
          ? apiErr.message
          : "The authentication service is unavailable",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={`portal-login ${portal}`}>
      <section className="portal-login-brand">
        {onBackToHome && (
          <button
            type="button"
            className="landing-btn-ghost"
            style={{
              alignSelf: "flex-start",
              marginBottom: 20,
              padding: "7px 14px",
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid #A7F3D0",
              background: "#ffffff",
              color: "#047857",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(4, 120, 87,  0.1)",
              zIndex: 10,
            }}
            onClick={onBackToHome}
          >
            ← Back to Team BC Dev
          </button>
        )}
        <Logo />
        <div>
          <span className="eyebrow">BILLIONDUE</span>
          <h1>
            Turn invoices into income.
            <br />
            Securely.
          </h1>
          <p>
            Software owners control licenses and devices. Client companies see
            only their own authorized workspace.
          </p>
        </div>
        <div className="download-note">
          <Laptop />
          <span>
            <b>Invoice Desktop is a separate Windows app</b>
            <small>
              It is not available inside either web portal. Download and install
              it on an approved device.
            </small>
          </span>
          <a className="secondary-btn" href={windowsInstallerUrl}>
            <ArrowDownToLine size={14} /> Download for Windows
          </a>
        </div>
      </section>
      <form className="portal-login-card" onSubmit={submit}>
        <div className="portal-choice">
          <button
            type="button"
            className={portal === "admin" ? "active" : ""}
            onClick={() => choose("admin")}
          >
            <Shield />
            <span>
              <b>Admin login</b>
              <small>Software owner only</small>
            </span>
          </button>
          <button
            type="button"
            className={portal === "client" ? "active" : ""}
            onClick={() => choose("client")}
          >
            <Building2 />
            <span>
              <b>Client login</b>
              <small>Company users only</small>
            </span>
          </button>
        </div>
        <span className="client-kicker">
          {portal === "admin"
            ? "SOFTWARE OWNER PORTAL"
            : "CLIENT COMPANY PORTAL"}
        </span>
        <h2>{portal === "admin" ? "Admin sign in" : "Client sign in"}</h2>
        <p>
          {portal === "admin"
            ? "Manage companies, licenses, devices and security."
            : "Access your company license, devices and requests using your Super Admin credentials."}
        </p>
        <label>
          {portal === "admin"
            ? "Email address"
            : "Super Admin username or email"}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder={
              portal === "admin"
                ? "Enter your gmail..."
                : "e.g. companyname@gmail.com or username"
            }
          />
        </label>
        <label>
          Password
          <div className="input-with-actions">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="input-addon-btns">
              <button
                type="button"
                className="input-addon-btn"
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
        </label>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: -4,
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#047857",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            onClick={() => setShowResetPassword(true)}
          >
            <KeyRound size={12} />
            Forgot or reset {portal === "admin" ? "admin" : "client"} password?
          </button>
        </div>
        {error && (
          <div className="login-error">
            <AlertTriangle />
            {error}
          </div>
        )}
        <button
          className="primary-btn full"
          type="submit"
          disabled={isLoggingIn}
        >
          {isLoggingIn
            ? "Verifying credentials..."
            : `Sign in to ${portal === "admin" ? "Admin" : "Client"} Portal`}{" "}
          <ArrowUpRight />
        </button>
        <small className="demo-cred">
          Credentials are verified against the Neon database.
        </small>
      </form>

      {showResetPassword && (
        <ResetPasswordModal
          initialRole={portal}
          companies={companies}
          setCompanies={setCompanies}
          notify={notify}
          close={() => setShowResetPassword(false)}
          onSuccess={(newCreds) => {
            if (newCreds.email) setEmail(newCreds.email);
            if (newCreds.password) setPassword(newCreds.password);
          }}
        />
      )}
    </div>
  );
}

function AdminSidebar({
  page,
  setPage,
  logout,
  pendingCount = 0,
  ownerProfile,
}: {
  page: string;
  setPage: (page: string) => void;
  logout: () => void;
  pendingCount?: number;
  ownerProfile?: SoftwareOwnerProfile;
}) {
  const displayName = ownerProfile?.name?.trim() || "Software Owner";
  const displayRole = ownerProfile?.roleTitle?.trim() || "Master Admin";
  const initials = getInitials(displayName, "SO");
  const items = [
    ["overview", <LayoutDashboard size={18} />, "Overview"],
    ["companies", <Building2 size={18} />, "Companies"],
    ["requests", <MonitorCog size={18} />, "Device requests"],
    ["templates", <ReceiptText size={18} />, "Invoice templates"],
    ["security", <ShieldAlert size={18} />, "Security events"],
    ["settings", <Settings size={18} />, "Settings"],
  ];
  return (
    <aside className="admin-sidebar">
      <Logo />
      <nav>
        {items.map(([id, icon, label]) => (
          <button
            key={String(id)}
            className={page === id ? "active" : ""}
            onClick={() => setPage(String(id))}
          >
            {icon}
            {label}
            {id === "requests" && pendingCount > 0 && <b>{pendingCount}</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="system-health">
          <span>
            <i /> Systems operational
          </span>
          <small>API · Signing · Audit</small>
        </div>
        <button
          className={page === "settings" ? "active" : ""}
          onClick={() => setPage("settings")}
        >
          <Settings size={17} /> Settings
        </button>
        <button onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
        <div
          className="admin-user"
          onClick={() => setPage("settings")}
          style={{ cursor: "pointer" }}
          title="Software Owner Settings"
        >
          <span>{initials}</span>
          <div>
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
          </div>
          <ChevronRight size={15} />
        </div>
      </div>
    </aside>
  );
}

function AdminSettingsPage({
  notify,
  ownerProfile,
  onUpdateOwnerProfile,
}: {
  notify: (s: string, t?: Toast["tone"]) => void;
  ownerProfile?: SoftwareOwnerProfile;
  onUpdateOwnerProfile?: (updated: SoftwareOwnerProfile) => void;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLElement>(null);
  const passwordSectionRef = useRef<HTMLElement>(null);
  const recoverySectionRef = useRef<HTMLElement>(null);
  const saveBarRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (
    ref: React.RefObject<HTMLElement | HTMLDivElement | null>,
  ) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [name, setName] = useState(ownerProfile?.name || "");
  const [email, setEmail] = useState(ownerProfile?.email || "");
  const [contactNo, setContactNo] = useState(ownerProfile?.contactNo || "");
  const [address, setAddress] = useState(ownerProfile?.address || "");
  const [roleTitle, setRoleTitle] = useState(ownerProfile?.roleTitle || "");
  const [recoveryKey, setRecoveryKey] = useState(
    ownerProfile?.recoveryKey || "",
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ownerProfile) {
      if (ownerProfile.name !== undefined) setName(ownerProfile.name);
      if (ownerProfile.email !== undefined) setEmail(ownerProfile.email);
      if (ownerProfile.contactNo !== undefined)
        setContactNo(ownerProfile.contactNo);
      if (ownerProfile.address !== undefined) setAddress(ownerProfile.address);
      if (ownerProfile.roleTitle !== undefined)
        setRoleTitle(ownerProfile.roleTitle);
      if (ownerProfile.recoveryKey !== undefined)
        setRecoveryKey(ownerProfile.recoveryKey);
    }
  }, [ownerProfile]);

  // Master Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const generatePass = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p = "";
    for (let i = 0; i < 8; i++)
      p += chars[Math.floor(Math.random() * chars.length)];
    const pass = `Owner!${p}`;
    setNewPassword(pass);
    setConfirmPassword(pass);
  };

  const handlePasswordSubmit = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current master password is required.");
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return false;
    }

    setIsChangingPassword(true);
    try {
      const res = await adminApi.changePassword({
        role: "admin",
        currentPassword,
        newPassword,
      });

      const successMsg =
        res.message || "Master admin password updated successfully!";
      setPasswordSuccess(successMsg);
      notify(successMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      return true;
    } catch (apiErr: unknown) {
      const errorMsg =
        apiErr instanceof Error
          ? apiErr.message
          : "Failed to change master password";
      setPasswordError(errorMsg);
      notify(errorMsg, "warn");
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError("");

    // If any password fields are filled, update password first
    if (currentPassword || newPassword || confirmPassword) {
      const passwordOk = await handlePasswordSubmit();
      if (!passwordOk) return;
    }

    setIsSaving(true);
    const updated: SoftwareOwnerProfile = {
      name: name.trim(),
      email: email.trim(),
      contactNo: contactNo.trim(),
      address: address.trim(),
      roleTitle: roleTitle.trim(),
      recoveryKey: recoveryKey.trim(),
    };

    try {
      localStorage.setItem(
        "billiondue_software_owner_profile",
        JSON.stringify(updated),
      );
      onUpdateOwnerProfile?.(updated);
      try {
        await adminApi.updateOwnerProfile(updated);
      } catch (err) {
        console.warn("Neon API profile sync fallback:", err);
      }
      notify("Software Owner settings saved successfully!");
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Failed to save settings",
        "warn",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page-wrapper" ref={topRef}>
      {/* Super Administrator Authority Banner */}
      <div className="settings-header-card">
        <div className="settings-header-left">
          <div className="settings-header-avatar">
            <span>{getInitials(name, "SO")}</span>
          </div>
          <div className="settings-header-text">
            <span
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                fontWeight: 800,
                color: "#047857",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <ShieldCheck size={13} />
              Super Administrator Account
            </span>
            <h1>{name || "Software Owner"}</h1>
            <p>
              {roleTitle || "Master Administrator"} • Root Authority & Fleet Control
            </p>
          </div>
        </div>
        <div>
          <span
            style={{
              background: "#ECFDF5",
              color: "#064E3B",
              border: "1px solid #A7F3D0",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(4, 120, 87,  0.1)",
            }}
          >
            <ShieldCheck size={14} style={{ color: "#047857" }} />
            Master Authority Active
          </span>
        </div>
      </div>

      {/* Sticky Scroll Option Navigation Bar */}
      <div className="settings-scroll-nav">
        <div className="settings-scroll-nav-left">
          <span className="settings-scroll-nav-label">
            <ArrowDownToLine size={13} />
            Scroll to:
          </span>
          <button
            type="button"
            className="settings-scroll-pill"
            onClick={() => scrollToSection(profileSectionRef)}
            title="Scroll to Software Owner Profile"
          >
            <UserRound size={12} style={{ color: "#047857" }} />
            Owner Profile
          </button>
          <button
            type="button"
            className="settings-scroll-pill"
            onClick={() => scrollToSection(passwordSectionRef)}
            title="Scroll to Master Admin Password"
          >
            <KeyRound size={12} style={{ color: "#047857" }} />
            Master Password
          </button>
          <button
            type="button"
            className="settings-scroll-pill"
            onClick={() => scrollToSection(recoverySectionRef)}
            title="Scroll to Master Recovery Secret"
          >
            <ShieldAlert size={12} style={{ color: "#047857" }} />
            Recovery Secret
          </button>
          <button
            type="button"
            className="settings-scroll-pill primary"
            onClick={() => scrollToSection(saveBarRef)}
            title="Scroll to Save Settings"
          >
            <Save size={12} style={{ color: "#064E3B" }} />
            Save Bar
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            className="settings-scroll-pill"
            style={{ padding: "5px 10px", fontSize: 11 }}
            onClick={() => scrollToSection(saveBarRef)}
            title="Scroll down to bottom"
          >
            <ChevronDown size={12} /> Down
          </button>
        </div>
      </div>

      {/* Owner Profile Card */}
      <section className="settings-card" ref={profileSectionRef}>
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon emerald">
              <UserRound size={18} />
            </div>
            <div className="settings-card-title">
              <strong>Software Owner Profile</strong>
              <small>Master administrator identity and legal business details</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label htmlFor="owner-name">
                <UserRound size={13} style={{ color: "#047857" }} />
                Full Legal Name
              </label>
              <div className="settings-input-wrap">
                <input
                  id="owner-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter software owner full legal name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="owner-role">
                <Shield size={13} style={{ color: "#047857" }} />
                Designation & Role
              </label>
              <div className="settings-input-wrap">
                <input
                  id="owner-role"
                  name="roleTitle"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="Enter designation / role (e.g. Master Administrator)"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="owner-email">
                <Mail size={13} style={{ color: "#047857" }} />
                Master Email Address
              </label>
              <div className="settings-input-wrap">
                <input
                  id="owner-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter master admin Gmail or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="owner-contact">
                <Phone size={13} style={{ color: "#047857" }} />
                Contact Phone Number
              </label>
              <div className="settings-input-wrap">
                <input
                  id="owner-contact"
                  name="contactNo"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter official contact phone number"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-form-group full-width">
              <label htmlFor="owner-address">
                <MapPin size={13} style={{ color: "#047857" }} />
                Registered Business Address
              </label>
              <div className="settings-input-wrap">
                <input
                  id="owner-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Enter official registered business address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Master Password Card */}
      <section className="settings-card" ref={passwordSectionRef}>
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon violet">
              <KeyRound size={18} />
            </div>
            <div className="settings-card-title">
              <strong>Master Admin Password</strong>
              <small>Change the root password used to access the Software Owner Control Plane</small>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="settings-form-grid">
            <div className="settings-form-group full-width">
              <label htmlFor="current-password">
                <KeyRound size={13} style={{ color: "#047857" }} />
                Current Master Password
              </label>
              <div className="input-with-actions">
                <input
                  id="current-password"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current master password"
                />
                <div className="input-addon-btns">
                  <button
                    type="button"
                    className="input-addon-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                    title={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="new-password">
                <LockKeyhole size={13} style={{ color: "#047857" }} />
                New Password (min. 6 characters)
              </label>
              <div className="input-with-actions has-generate">
                <input
                  id="new-password"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new master password"
                />
                <div className="input-addon-btns">
                  <button
                    type="button"
                    className="input-addon-btn"
                    onClick={() => setShowNew(!showNew)}
                    title={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    className="input-addon-btn"
                    onClick={generatePass}
                    title="Generate random password"
                  >
                    <RefreshCcw size={12} /> Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="confirm-password">
                <CheckCircle2 size={13} style={{ color: "#047857" }} />
                Confirm New Password
              </label>
              <div className="input-with-actions">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new master password"
                />
                <div className="input-addon-btns">
                  <button
                    type="button"
                    className="input-addon-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              {confirmPassword && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: newPassword === confirmPassword ? "#047857" : "#ef4444",
                    marginTop: 4,
                  }}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle2 size={13} /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} /> Passwords do not match
                    </>
                  )}
                </div>
              )}
            </div>

            {passwordError && (
              <div
                className="login-error full-width"
                style={{ gridColumn: "1 / -1" }}
              >
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#ECFDF5",
                  color: "#064E3B",
                  border: "1px solid #A7F3D0",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Check size={14} style={{ color: "#047857" }} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 6,
              }}
            >
              <button
                type="submit"
                className="secondary-btn"
                disabled={isChangingPassword || !currentPassword || !newPassword}
              >
                <KeyRound size={13} />
                {isChangingPassword
                  ? "Updating Master Password..."
                  : "Update Master Password"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Master Recovery Key Card */}
      <section className="settings-card" ref={recoverySectionRef}>
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon amber">
              <ShieldAlert size={18} />
            </div>
            <div className="settings-card-title">
              <strong>Master Emergency Recovery Key</strong>
              <small>Use this key if you lose your password to reset root admin access</small>
            </div>
          </div>
        </div>

        <div className="settings-key-display">
          <div>
            <span
              style={{
                fontSize: 10,
                color: "#64748b",
                display: "block",
                marginBottom: 2,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              EMERGENCY RECOVERY SECRET
            </span>
            <span
              className="settings-key-text"
              style={{
                color: recoveryKey ? undefined : "#94a3b8",
                fontStyle: recoveryKey ? "normal" : "italic",
              }}
            >
              {recoveryKey || "No emergency recovery key generated yet"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {recoveryKey ? (
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(recoveryKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
              >
                {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey ? "Secret Copied!" : "Copy Key"}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="secondary-btn btn-sm"
              onClick={() => {
                const newKey = generateRecoveryKey();
                setRecoveryKey(newKey);
                notify(
                  "New emergency recovery key generated! Click 'Save Settings' to commit.",
                );
              }}
              title="Generate new emergency recovery key"
            >
              <RefreshCcw size={12} />
              <span>{recoveryKey ? "Regenerate" : "Generate Key"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Save bar */}
      <div className="settings-actions-bar" ref={saveBarRef}>
        <div className="settings-status-note">
          <Check size={14} style={{ color: "#047857" }} />
          <span>Global software owner identity active across all portals</span>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => handleSaveProfile()}
          disabled={isSaving || isChangingPassword}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minWidth: 150,
            justifyContent: "center",
          }}
        >
          <Save size={14} />
          {isSaving || isChangingPassword ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Floating Scroll Controls */}
      <div className="floating-scroll-actions">
        <button
          type="button"
          className="floating-scroll-btn"
          onClick={() => scrollToSection(topRef)}
          title="Scroll to Top"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          className="floating-scroll-btn"
          onClick={() => scrollToSection(saveBarRef)}
          title="Scroll to Save Settings / Bottom"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}

function AdminChangePasswordModal({
  notify,
  close,
}: {
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
    const pass = `Owner!${p}`;
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
        role: "admin",
        currentPassword,
        newPassword,
      });

      notify(res.message || "Master admin password updated successfully!");
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
            <span className="eyebrow" style={{ color: "#ef4444" }}>
              MASTER CONTROL SECURITY
            </span>
            <h2>Change Software Owner Password</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              Authenticated Software Owner account
            </p>
          </div>
          <button onClick={close} type="button">
            <X />
          </button>
        </div>

        <div className="notice-banner" style={{ marginBottom: 14 }}>
          <Shield size={16} />
          <div>
            <strong>Software Owner Master Authentication</strong>
            <div style={{ fontSize: 11, marginTop: 2 }}>
              Changing this password will update your credentials for the
              Software Owner Admin Dashboard.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Current Master Admin Password
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
            New Master Admin Password (min 6 characters)
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
              {isSubmitting ? "Updating..." : "Update Master Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPortal({
  page,
  setPage,
  companies,
  setCompanies,
  requests,
  templates,
  securityEvents,
  setRequests,
  notify,
  logout,
  ownerProfile,
  setOwnerProfile,
}: {
  page: string;
  setPage: (page: string) => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  requests: DeviceRequest[];
  templates: PortalTemplate[];
  securityEvents: SecurityEvent[];
  setRequests: React.Dispatch<React.SetStateAction<DeviceRequest[]>>;
  notify: (s: string, t?: Toast["tone"]) => void;
  logout: () => void;
  ownerProfile?: SoftwareOwnerProfile;
  setOwnerProfile?: React.Dispatch<React.SetStateAction<SoftwareOwnerProfile>>;
}) {
  const [internalProfile, setInternalProfile] = useState<SoftwareOwnerProfile>(() => {
    try {
      const raw = localStorage.getItem("billiondue_software_owner_profile");
      if (raw) return JSON.parse(raw);
    } catch { }
    return initialOwnerProfile;
  });
  const currentProfile = ownerProfile || internalProfile;
  const updateProfile = setOwnerProfile || setInternalProfile;

  const [showCompany, setShowCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingCredentialsCompany, setEditingCredentialsCompany] =
    useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [showAdminChangePassword, setShowAdminChangePassword] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const pending = requests.filter((r) => r.status === "pending");

  // Redirect legacy /admin/licenses navigation seamlessly to /admin/companies
  useEffect(() => {
    if (page === "licenses") {
      setPage("companies");
    }
  }, [page, setPage]);

  // Live Track & Auto-Fetch Device Requests
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false);
  const [lastTrackedTime, setLastTrackedTime] = useState<string>("");
  const knownReqIdsRef = useRef<Set<string>>(new Set(requests.map((r) => r.id)));

  useEffect(() => {
    requests.forEach((r) => knownReqIdsRef.current.add(r.id));
  }, [requests]);

  // Listen to cross-app device events (e.g., client workstation unlinking or disconnecting)
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel("ledgershield_device_channel");
    ch.onmessage = (event) => {
      if (event.data?.type === "device_disconnected") {
        const { companyId, deviceId, fingerprint } = event.data;
        setCompanies((prev) =>
          prev.map((c) => {
            if (companyId && c.id !== companyId) return c;
            return {
              ...c,
              devices: (c.devices || []).filter(
                (d) =>
                  (!deviceId || d.id !== deviceId) &&
                  (!fingerprint || d.fingerprint !== fingerprint),
              ),
            };
          }),
        );
      }
    };
    return () => {
      ch.close();
    };
  }, []);

  const fetchLiveRequests = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshingRequests(true);
      try {
        const [res, bootPayload] = await Promise.all([
          adminApi.listDeviceRequests().catch(() => null),
          (adminApi.bootstrap().catch(() => null) as Promise<any>),
        ]);

        if (bootPayload) {
          const rawCompanies: any[] = bootPayload.companies || [];
          const rawLicenses: any[] = bootPayload.licenses || [];
          const rawDevices: any[] = bootPayload.devices || [];
          const rawTemplates: any[] = bootPayload.templates || [];
          const templateAssignments: any[] = bootPayload.templateAssignments || [];

          if (rawCompanies.length > 0) {
            setCompanies((prevCompanies) => {
              return rawCompanies.map((c: any) => {
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
                          (new Date(d.lease_expires_at).getTime() - Date.now()) / 3600000,
                        )
                      : 0,
                    status: d.status === "replaced" ? "expired" : d.status,
                    live: d.last_verified_at
                      ? Date.now() - new Date(d.last_verified_at).getTime() < 300000
                      : false,
                  }));

                const prev = prevCompanies.find((pc) => pc.id === c.id);
                return {
                  id: c.id,
                  name: c.name,
                  code: c.code,
                  email: c.email,
                  contactNo: c.contact_no || c.contactNo || c.phone || prev?.contactNo || undefined,
                  phone: c.phone || c.contact_no || c.contactNo || prev?.phone || undefined,
                  logo: c.logo || prev?.logo || undefined,
                  address: c.address || prev?.address || undefined,
                  superAdminUser: c.super_admin_user || c.superAdminUser || c.email,
                  superAdminPassword:
                    c.super_admin_password || c.superAdminPassword || prev?.superAdminPassword || undefined,
                  installationKey: c.installation_key || c.installationKey || prev?.installationKey || "",
                  status: c.status,
                  plan: c.plan,
                  offlineLeaseOverride: c.offline_lease_override || c.offlineLeaseOverride || prev?.offlineLeaseOverride || undefined,
                  license: lic.id || prev?.license || "Not issued",
                  expires: lic.expires_at
                    ? new Date(lic.expires_at).toLocaleDateString()
                    : prev?.expires || "—",
                  seatsUsed: c.seats_used,
                  seatsAllowed: c.seats_allowed,
                  devicesAllowed: c.devices_allowed,
                  templates: (() => {
                    const cAssigns = templateAssignments.filter(
                      (a: any) => a.company_id === c.id,
                    );
                    if (cAssigns.length > 0) {
                      const names = cAssigns
                        .map((a: any) => {
                          const t = rawTemplates.find(
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
                    return c.templates && c.templates.length > 0
                      ? c.templates
                      : prev?.templates || ["Default Invoice"];
                  })(),
                  devices,
                };
              });
            });
          }
        }

        if (res && Array.isArray(res.requests)) {
          const mapped: DeviceRequest[] = res.requests.map((r: any) => {
            const comp = companies.find((c) => c.id === (r.company_id || r.companyId));
            return {
              id: r.id,
              companyId: r.company_id || r.companyId || "",
              company: r.company_name || r.company || comp?.name || "Company",
              user: r.requested_by || r.user || "Client",
              license: comp?.license || "",
              deviceName: r.device_name || r.deviceName || "Desktop Client",
              fingerprint: r.fingerprint || "",
              appVersion: r.app_version || r.appVersion || "1.0.0",
              attemptTime: r.attempted_at
                ? new Date(r.attempted_at).toLocaleString()
                : r.attemptTime || new Date().toLocaleString(),
              replaceDeviceId: r.replace_device_id || r.replaceDeviceId || undefined,
              status: (r.status as DeviceRequest["status"]) || "pending",
              isRelogin: Boolean(r.is_relogin ?? r.isRelogin),
              userEmail: r.user_email || r.userEmail || undefined,
            };
          });

          // Detect newly arrived pending requests
          const newlyArrived = mapped.filter(
            (r) => r.status === "pending" && !knownReqIdsRef.current.has(r.id),
          );
          if (newlyArrived.length > 0) {
            newlyArrived.forEach((nr) => {
              notify(
                `🔔 New device request #${nr.id}: "${nr.deviceName}" (${nr.company})`,
                "ok",
              );
              knownReqIdsRef.current.add(nr.id);
            });
          }

          setRequests(mapped);
          setLastTrackedTime(new Date().toLocaleTimeString());
        }
      } catch {
        // Offline fallback
      } finally {
        if (isManual) setIsRefreshingRequests(false);
      }
    },
    [companies, notify, setCompanies, setRequests],
  );

  // Background Auto-Fetch Poll (2.5s interval)
  useEffect(() => {
    if (!isLiveTracking) return;
    void fetchLiveRequests();
    const interval = setInterval(() => {
      void fetchLiveRequests();
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveTracking, fetchLiveRequests]);

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.installationKey && c.installationKey.toLowerCase().includes(q)) ||
        (c.superAdminUser && c.superAdminUser.toLowerCase().includes(q)) ||
        (c.contactNo && c.contactNo.toLowerCase().includes(q)) ||
        (c.license && c.license.toLowerCase().includes(q)),
    );
  }, [companies, companySearch]);
  const toggleCompany = (id: string, status: Company["status"]) => {
    setCompanies((all) => all.map((c) => (c.id === id ? { ...c, status } : c)));
    void adminApi
      .setCompanyStatus(id, status)
      .then(() =>
        notify(
          `Company ${status === "active" ? "activated" : status} · saved to Neon`,
        ),
      )
      .catch(() => notify("Changed locally, but Neon API is offline", "warn"));
  };
  const handleDeleteCompany = (company: Company) => {
    setCompanies((all) => all.filter((c) => c.id !== company.id));
    setDeletingCompany(null);
    void adminApi
      .deleteCompany(company.id)
      .then(() =>
        notify(
          `Company "${company.name}" permanently deleted · removed from Neon`,
        ),
      )
      .catch((err) =>
        notify(
          `Deleted locally, but Neon error: ${err?.message || "offline"}`,
          "warn",
        ),
      );
  };
  const decide = (id: string, approve: boolean) => {
    const req = requests.find((r) => r.id === id)!;
    setRequests((all) =>
      all.map((r) =>
        r.id === id ? { ...r, status: approve ? "approved" : "rejected" } : r,
      ),
    );
    if (approve) {
      setCompanies((all) =>
        all.map((c) =>
          c.id !== req.companyId
            ? c
            : {
              ...c,
              devices: c.devices
                .filter((d) =>
                  req.replaceDeviceId
                    ? d.id !== req.replaceDeviceId
                    : d.fingerprint !== req.fingerprint,
                )
                .concat({
                  id: `device-${Date.now()}`,
                  name: req.deviceName,
                  os: "Windows 11 Pro",
                  user: req.user,
                  fingerprint: req.fingerprint,
                  activated: new Date().toLocaleDateString(),
                  lastSeen: "Just now",
                  leaseHours: 72,
                  status: "active",
                  live: true,
                }),
            },
        ),
      );
      localStorage.removeItem("ledgershield_device_revoked");
      localStorage.setItem(
        "ledgershield_device_reactivated",
        JSON.stringify({ fingerprint: req.fingerprint, timestamp: Date.now() }),
      );
      window.dispatchEvent(
        new CustomEvent("ledgershield_device_reactivated", {
          detail: { fingerprint: req.fingerprint },
        }),
      );
      notify(
        req.isRelogin
          ? `Re-login approved for "${req.deviceName}" · Device re-activated & active`
          : "Replacement approved · old device deactivated · fresh token issued",
      );
    } else notify("Device request rejected", "warn");
    void adminApi
      .decideDeviceRequest(id, approve)
      .catch(() =>
        notify("Decision is local only because Neon API is offline", "warn"),
      );
  };
  return (
    <div className="admin-shell">
      <AdminSidebar
        page={page}
        setPage={setPage}
        logout={logout}
        pendingCount={pending.length}
        ownerProfile={currentProfile}
      />
      <main className="admin-main">
        <div className="portal-top">
          <div>
            <span className="eyebrow">ADMIN CONTROL PLANE</span>
            <h1>
              {page === "overview"
                ? `Welcome${currentProfile.name?.trim() ? `, ${currentProfile.name.trim().split(" ")[0]}` : ""}.`
                : page === "settings"
                  ? "Software Owner Settings"
                  : page.replace(/^./, (m) => m.toUpperCase())}
            </h1>
            <p>
              {page === "overview"
                ? "Here’s what needs your attention across the network."
                : page === "settings"
                  ? "Manage master credentials, owner contact details, and emergency recovery keys."
                  : "Manage the commercial licensing network from one place."}
            </p>
          </div>
          <div className="top-actions">
            <button className="icon-btn">
              <Search size={18} />
            </button>
            <button className="icon-btn has-alert">
              <Bell size={18} />
            </button>
            <button
              className="secondary-btn"
              onClick={() => setShowAdminChangePassword(true)}
              title="Change Software Owner Master Password"
            >
              <KeyRound size={16} /> Change Admin Password
            </button>
            <button
              className="primary-btn"
              onClick={() => setShowCompany(true)}
            >
              <Plus size={17} /> Add company
            </button>
          </div>
        </div>
        {page === "overview" && (
          <>
            <section className="metrics-grid">
              <Metric
                label="Active companies"
                value={String(
                  companies.filter((c) => c.status === "active").length,
                )}
                detail={`${companies.length} total`}
                icon={<Building2 />}
              />
              <Metric
                label="Active licenses"
                value={String(
                  companies.filter(
                    (c) => c.status === "active" && c.license !== "Not issued",
                  ).length,
                )}
                detail="From Neon"
                tone="violet"
                icon={<KeyRound />}
              />
              <Metric
                label="Authorized devices"
                value={String(
                  companies.reduce(
                    (n, c) =>
                      n + c.devices.filter((d) => d.status === "active").length,
                    0,
                  ),
                )}
                detail={`of ${companies.reduce((n, c) => n + c.devicesAllowed, 0)} allowed`}
                tone="cyan"
                icon={<Laptop />}
              />
              <Metric
                label="Pending requests"
                value={String(pending.length)}
                detail="Requires review"
                tone="coral"
                icon={<ShieldAlert />}
              />
            </section>
            <div className="admin-grid">
              <section className="panel span-2">
                <div className="panel-head">
                  <div>
                    <h2>Companies</h2>
                    <p>License health and current utilization</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setPage("companies")}
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>
                <CompanyTable
                  companies={companies}
                  toggle={toggleCompany}
                  onEditCompany={(c) => setEditingCompany(c)}
                  onEditCredentials={(c) => setEditingCredentialsCompany(c)}
                  onDeleteCompany={(c) => setDeletingCompany(c)}
                />
              </section>
              <section className="panel attention-panel">
                <div className="panel-head">
                  <div>
                    <h2>Needs attention</h2>
                    <p>Pending database records</p>
                  </div>
                  <span className="count-pill">{pending.length}</span>
                </div>
                <div className="attention-list">
                  {pending.map((r) => (
                    <button key={r.id} onClick={() => setPage("requests")}>
                      <span className="attention-icon amber">
                        <Laptop />
                      </span>
                      <div>
                        <strong>New device request</strong>
                        <small>
                          {r.company} · {r.attemptTime}
                        </small>
                      </div>
                      <ChevronRight />
                    </button>
                  ))}
                  {!pending.length && <EmptyRows text="No pending requests" />}
                </div>
              </section>
              <section className="panel span-2">
                <div className="panel-head">
                  <div>
                    <h2>Device activity</h2>
                    <p>Calculated from Neon device records</p>
                  </div>
                </div>
                <div className="activity-summary">
                  <strong>
                    {companies.reduce((n, c) => n + c.devices.length, 0)}
                  </strong>
                  <span>Total registered devices</span>
                  <strong>
                    {companies.reduce(
                      (n, c) => n + c.devices.filter((d) => d.live).length,
                      0,
                    )}
                  </strong>
                  <span>Verified in the last 5 minutes</span>
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>License guard</h2>
                    <p>Signing authority status</p>
                  </div>
                  <StatusPill>Healthy</StatusPill>
                </div>
                <div className="guard-card">
                  <span className="guard-ring">
                    <ShieldCheck />
                  </span>
                  <strong>Ed25519 authority online</strong>
                  <p>
                    Private key isolated on the admin service. Desktop apps hold
                    only the public verification key.
                  </p>
                  <div>
                    <span>Last rotation</span>
                    <b>28 days ago</b>
                  </div>
                  <div>
                    <span>Tokens issued today</span>
                    <b>42</b>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {page === "companies" && (
          <section className="panel page-panel">
            <div className="panel-head">
              <div>
                <h2>Client companies</h2>
                <p>Click on any company to view, inspect, and edit all details, devices, and commercial license.</p>
              </div>
              <div className="searchbox">
                <Search />
                <input
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Search by name, code, email, key..."
                />
              </div>
            </div>
            <CompanyTable
              companies={filteredCompanies}
              toggle={toggleCompany}
              onEditCompany={(c) => setEditingCompany(c)}
              onEditCredentials={(c) => setEditingCredentialsCompany(c)}
              onDeleteCompany={(c) => setDeletingCompany(c)}
              detailed
            />
          </section>
        )}
        {page === "requests" && (
          <DeviceRequests
            requests={requests}
            companies={companies}
            decide={decide}
            isLiveTracking={isLiveTracking}
            onToggleLiveTracking={() => setIsLiveTracking(!isLiveTracking)}
            onManualRefresh={() => fetchLiveRequests(true)}
            isRefreshing={isRefreshingRequests}
            lastTrackedTime={lastTrackedTime}
          />
        )}
        {page === "templates" && (
          <TemplateManager
            templates={templates}
            companies={companies}
            setCompanies={setCompanies}
            notify={notify}
          />
        )}
        {page === "security" && (
          <SecurityCenter
            companies={companies}
            setCompanies={setCompanies}
            securityEvents={securityEvents}
            notify={notify}
          />
        )}
        {page === "settings" && (
          <AdminSettingsPage
            notify={notify}
            ownerProfile={currentProfile}
            onUpdateOwnerProfile={(updated) => updateProfile(updated)}
          />
        )}
      </main>
      {showCompany && (
        <CompanyModal
          close={() => setShowCompany(false)}
          save={(company) => {
            setCompanies((c) => [...c, company]);
            setShowCompany(false);
            void adminApi
              .createCompany(company)
              .then(() => notify("Client company created · saved to Neon"))
              .catch(() =>
                notify(
                  "Company created locally, but Neon API is offline",
                  "warn",
                ),
              );
          }}
        />
      )}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          close={() => setEditingCompany(null)}
          onDelete={(c) => {
            setEditingCompany(null);
            setDeletingCompany(c);
          }}
          save={(updates) => {
            const companyId = editingCompany.id;
            const companyName = updates.name || editingCompany.name;
            setCompanies((all) =>
              all.map((c) =>
                c.id === companyId
                  ? {
                    ...c,
                    ...updates,
                  }
                  : c,
              ),
            );
            setEditingCompany(null);
            void adminApi
              .updateCompany(companyId, updates)
              .then(() =>
                notify(`Company "${companyName}" updated · saved to Neon`),
              )
              .catch(() =>
                notify("Updated locally, but Neon API is offline", "warn"),
              );
          }}
        />
      )}
      {editingCredentialsCompany && (
        <CompanyCredentialsModal
          company={editingCredentialsCompany}
          close={() => setEditingCredentialsCompany(null)}
          save={(creds) => {
            const companyId = editingCredentialsCompany.id;
            const companyName = editingCredentialsCompany.name;
            setCompanies((all) =>
              all.map((c) =>
                c.id === companyId
                  ? {
                    ...c,
                    superAdminUser: creds.superAdminUser,
                    superAdminPassword: creds.superAdminPassword,
                  }
                  : c,
              ),
            );
            setEditingCredentialsCompany(null);
            void adminApi
              .updateCompanyCredentials(companyId, creds)
              .then(() =>
                notify(
                  `Super Admin credentials updated for ${companyName} · saved to Neon`,
                ),
              )
              .catch(() =>
                notify("Updated locally, but Neon API is offline", "warn"),
              );
          }}
        />
      )}
      {deletingCompany && (
        <DeleteCompanyModal
          company={deletingCompany}
          close={() => setDeletingCompany(null)}
          confirm={() => handleDeleteCompany(deletingCompany)}
        />
      )}
      {showAdminChangePassword && (
        <AdminChangePasswordModal
          notify={notify}
          close={() => setShowAdminChangePassword(false)}
        />
      )}
    </div>
  );
}

function CompanyTable({
  companies,
  toggle,
  onEditCompany,
  onEditCredentials,
  onDeleteCompany,
  detailed = false,
}: {
  companies: Company[];
  toggle?: (id: string, s: Company["status"]) => void;
  onEditCompany?: (company: Company) => void;
  onEditCredentials?: (company: Company) => void;
  onDeleteCompany?: (company: Company) => void;
  detailed?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Plan</th>
            <th>Devices</th>
            <th>Expires</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Control Plane</th>
          </tr>
        </thead>
        <tbody>
          {!companies.length && (
            <tr>
              <td colSpan={6}>
                <EmptyRows text="No companies found in Neon" />
              </td>
            </tr>
          )}
          {companies.map((c) => (
            <tr
              key={c.id}
              className="clickable-company-row"
              onClick={() => onEditCompany?.(c)}
              title={`Click on ${c.name} to open Tenant Details & Control Plane`}
            >
              <td>
                <div className="company-cell">
                  {c.logo ? (
                    <img
                      src={c.logo}
                      alt={c.name}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        objectFit: "contain",
                        background: "#ffffff",
                        border: "1px solid #A7F3D0",
                        padding: 2,
                      }}
                    />
                  ) : (
                    <span style={{ background: "#ECFDF5", color: "#064E3B", border: "1px solid #A7F3D0" }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <strong style={{ color: "#0f172a" }}>{c.name}</strong>
                    <small>
                      {c.code} · {c.email}
                    </small>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        gap: 5,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="cred-badge"
                        title="Client Super Admin username"
                      >
                        <UserRound size={10} /> {c.superAdminUser || c.email}
                      </span>
                      {c.installationKey && (
                        <span
                          className="cred-badge"
                          title="10-Character Desktop Installation Key (Click to copy)"
                          style={{
                            cursor: "pointer",
                            fontFamily: "monospace",
                            letterSpacing: "0.5px",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard?.writeText(
                              c.installationKey || "",
                            );
                          }}
                        >
                          <KeyRound size={10} /> {c.installationKey}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <strong className="soft-strong">{c.plan}</strong>
              </td>
              <td
                title={onEditCompany ? "Click to view devices" : undefined}
              >
                <b>{c.devices.length}</b>
                <span className="muted"> / {c.devicesAllowed}</span>
              </td>
              <td>{c.expires}</td>
              <td>
                <StatusPill
                  tone={
                    c.status === "active"
                      ? "green"
                      : c.status === "suspended"
                        ? "amber"
                        : "red"
                  }
                >
                  {c.status}
                </StatusPill>
              </td>
              <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                <button
                  className="primary-btn btn-sm"
                  title="Open Tenant Details & Control Plane"
                  onClick={() => onEditCompany?.(c)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <SlidersHorizontal size={12} /> Control Plane
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeviceRequests({
  requests,
  companies,
  decide,
  isLiveTracking = true,
  onToggleLiveTracking,
  onManualRefresh,
  isRefreshing = false,
  lastTrackedTime,
}: {
  requests: DeviceRequest[];
  companies: Company[];
  decide: (id: string, a: boolean) => void;
  isLiveTracking?: boolean;
  onToggleLiveTracking?: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
  lastTrackedTime?: string;
}) {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const activeRequests = requests.filter((r) => r.status === "pending");
  const displayedRequests = filter === "active" ? activeRequests : requests;

  return (
    <div className="request-layout">
      <section className="panel request-list">
        <div className="panel-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0 }}>New-device verification</h2>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 9px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 800,
                  background: isLiveTracking ? "#ECFDF5" : "#f1f5f9",
                  color: isLiveTracking ? "#047857" : "#64748b",
                  border: `1px solid ${isLiveTracking ? "#A7F3D0" : "#e2e8f0"}`,
                  cursor: onToggleLiveTracking ? "pointer" : "default",
                  userSelect: "none",
                }}
                onClick={onToggleLiveTracking}
                title={
                  isLiveTracking
                    ? "Live auto-fetch active · synchronizing device requests every 2.5s (Click to pause)"
                    : "Live tracking paused (Click to resume)"
                }
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isLiveTracking ? "#10b981" : "#94a3b8",
                    display: "inline-block",
                    boxShadow: isLiveTracking ? "0 0 6px #10b981" : "none",
                    animation: isLiveTracking ? "pulseDot 1.6s infinite" : "none",
                  }}
                />
                <span>{isLiveTracking ? "Live Track Active" : "Tracking Paused"}</span>
              </div>
            </div>
            <p style={{ margin: "4px 0 0" }}>
              Approve only after confirming the user and replacement. Device requests auto-fetch live from server.
              {lastTrackedTime && (
                <span style={{ marginLeft: 6, opacity: 0.75 }}>
                  · Synced {lastTrackedTime}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onManualRefresh && (
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={onManualRefresh}
                disabled={isRefreshing}
                title="Fetch latest requests from Neon server immediately"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  padding: "5px 11px",
                  height: 30,
                }}
              >
                <RefreshCw
                  size={12}
                  style={{
                    animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
                  }}
                />
                <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
              </button>
            )}
            <div className="filter-tabs">
              <button
                type="button"
                className={filter === "active" ? "active" : ""}
                onClick={() => setFilter("active")}
              >
                Active requests{" "}
                <span className="filter-tab-count">
                  {activeRequests.length}
                </span>
              </button>
              <button
                type="button"
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All history{" "}
                <span className="filter-tab-count">{requests.length}</span>
              </button>
            </div>
            <StatusPill tone={activeRequests.length > 0 ? "amber" : "green"}>
              {activeRequests.length} pending
            </StatusPill>
          </div>
        </div>
        {displayedRequests.length === 0 ? (
          <EmptyRows
            text={
              filter === "active"
                ? "No active device requests pending verification"
                : "No device requests found"
            }
          />
        ) : (
          displayedRequests.map((r) => (
            <div className={`request-card ${r.status}`} key={r.id}>
              <div className="request-top">
                <span className="device-avatar">
                  <Laptop />
                </span>
                <div>
                  <strong>{r.deviceName}</strong>
                  <small>
                    {r.company} · {r.user}
                  </small>
                </div>
                <StatusPill
                  tone={
                    r.status === "pending"
                      ? "amber"
                      : r.status === "approved"
                        ? "green"
                        : "red"
                  }
                >
                  {r.status}
                </StatusPill>
              </div>
              <div className="request-info">
                <div>
                  <span>Fingerprint</span>
                  <code>{r.fingerprint}</code>
                </div>
                <div>
                  <span>App version</span>
                  <b>{r.appVersion}</b>
                </div>
                <div>
                  <span>Attempt</span>
                  <b>{r.attemptTime}</b>
                </div>
                <div>
                  <span>License</span>
                  <b>{r.license}</b>
                </div>
              </div>
              {r.isRelogin && (
                <div className="relogin-banner">
                  <ShieldAlert />
                  <span>
                    <b>Re-login authorization requested</b>
                    <small>
                      This device was previously removed from the portal. A security audit copy of this request was dispatched to user Gmail:{" "}
                      <strong>{r.userEmail || r.user}</strong>.
                    </small>
                  </span>
                </div>
              )}
              {r.status === "pending" && !r.isRelogin && r.replaceDeviceId && (
                <div className="replacement-banner">
                  <RefreshCcw />
                  <span>
                    <b>Replacement requested</b>
                    <small>
                      Deactivate{" "}
                      {companies
                        .find((c) => c.id === r.companyId)
                        ?.devices.find((d) => d.id === r.replaceDeviceId)
                        ?.name ?? "selected old device"}{" "}
                      when approved. The three-device limit remains enforced.
                    </small>
                  </span>
                </div>
              )}
              {r.status === "pending" && (
                <div className="action-row">
                  <button
                    className="primary-btn"
                    onClick={() => decide(r.id, true)}
                  >
                    <Check />{" "}
                    {r.isRelogin
                      ? "Approve & Re-authorize Device"
                      : "Approve & replace"}
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => decide(r.id, false)}
                  >
                    <X /> Reject request
                  </button>
                </div>
              )}
            </div>
          )))}
      </section>
      <aside className="panel flow-panel">
        <h2>Approval flow</h2>
        <div className="flow-step done">
          <span>1</span>
          <div>
            <b>Request captured</b>
            <small>Full signed context and fingerprint</small>
          </div>
        </div>
        <div className="flow-line" />
        <div className="flow-step current">
          <span>2</span>
          <div>
            <b>Admin decision</b>
            <small>Identity and device review</small>
          </div>
        </div>
        <div className="flow-line" />
        <div className="flow-step">
          <span>3</span>
          <div>
            <b>Atomic replacement</b>
            <small>Old token revoked first</small>
          </div>
        </div>
        <div className="flow-line" />
        <div className="flow-step">
          <span>4</span>
          <div>
            <b>Fresh lease issued</b>
            <small>Bound to the new fingerprint</small>
          </div>
        </div>
        <div className="limit-note">
          <ShieldAlert />
          <p>
            A fourth device never receives a valid lease while all three slots
            are occupied.
          </p>
        </div>
      </aside>
    </div>
  );
}

function TemplateManager({
  templates,
  companies = [],
  setCompanies,
  notify,
}: {
  templates: PortalTemplate[];
  companies?: Company[];
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"assigned" | "gallery">("assigned");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    () => companies[0]?.id || "",
  );
  const [previewTemplate, setPreviewTemplate] = useState<PortalTemplate | null>(null);

  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const selectedCompany =
    companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // --- Staged Template Assignments (Only persists on Confirm / Save) ---
  const [stagedTemplates, setStagedTemplates] = useState<string[]>(() => {
    const initial = companies.find((c) => c.id === (companies[0]?.id || "")) || companies[0];
    return Array.isArray(initial?.templates) && initial.templates.length > 0
      ? [...initial.templates]
      : ["Default Invoice"];
  });
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  // Sync staged templates when switching companies
  useEffect(() => {
    if (selectedCompany) {
      const current = Array.isArray(selectedCompany.templates) && selectedCompany.templates.length > 0
        ? [...selectedCompany.templates]
        : ["Default Invoice"];
      setStagedTemplates(current);
    }
  }, [selectedCompany?.id]);

  const committedTemplates = useMemo(() => {
    return Array.isArray(selectedCompany?.templates) && selectedCompany.templates.length > 0
      ? [...selectedCompany.templates]
      : ["Default Invoice"];
  }, [selectedCompany?.templates]);

  // Check if staged assignments differ from committed state
  const hasUnsavedAssignments = useMemo(() => {
    const normStaged = Array.from(new Set(stagedTemplates.map((t) => t.trim().toLowerCase()))).sort();
    const normCommitted = Array.from(new Set(committedTemplates.map((t) => t.trim().toLowerCase()))).sort();
    if (normStaged.length !== normCommitted.length) return true;
    return normStaged.some((val, idx) => val !== normCommitted[idx]);
  }, [stagedTemplates, committedTemplates]);

  const displayTemplates: PortalTemplate[] =
    templates.length > 0
      ? templates
      : INVOICE_TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          accent: t.accent,
          category: t.category,
          description: t.description,
          previewImage: t.previewImage,
          badge: t.badge,
          assigned: 1,
          isDefault: t.isDefault,
        }));

  const sampleRenderData: InvoiceRenderData = {
    companyName: selectedCompany?.name || "Company Name",
    companyEmail: selectedCompany?.email || "abccompany@gmail.com",
    companyPhone: selectedCompany?.phone || selectedCompany?.contactNo || "+971 00 000 0000",
    companyAddress: selectedCompany?.address || "Company Location, Country",
    invoiceId: "INV-0001",
    customerName: "Global Logistics FZE",
    customerEmail: "procurement@globallogistics.ae",
    customerPhone: "+971 50 123 4567",
    issueDate: "25 Oct 2026",
    dueDate: "08 Nov 2026",
    items: [
      {
        description: "POS Retail Invoicing Software License",
        qty: 1,
        price: 8500,
        total: 8500,
      },
      {
        description: "Hardware Terminal Activation & Setup",
        qty: 2,
        price: 2000,
        total: 4000,
      },
    ],
    subtotal: 12500,
    tax: 625,
    total: 13125,
  };

  const broadcastTemplatesUpdated = (companyId: string, templates: string[]) => {
    try {
      localStorage.setItem(
        `ledgershield_templates_${companyId}`,
        JSON.stringify({ templates, timestamp: Date.now() }),
      );
      window.dispatchEvent(
        new CustomEvent("ledgershield_templates_updated", {
          detail: { companyId, templates },
        }),
      );
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("ledgershield_templates_channel");
        bc.postMessage({
          type: "templates_updated",
          companyId,
          templates,
          timestamp: Date.now(),
        });
        bc.close();
      }
    } catch {}
  };

  const toggleTemplateAssignment = (tmpl: InvoiceTemplateItem) => {
    if (!selectedCompany) return;
    if (tmpl.id === "default_invoice" || tmpl.isDefault) {
      notify(
        `"Default Invoice" is the permanent universal default template and cannot be removed.`,
        "warn",
      );
      return;
    }

    const isCurrentlyAssigned = stagedTemplates.some(
      (t) =>
        t.toLowerCase() === tmpl.name.toLowerCase() ||
        t.toLowerCase() === tmpl.id.toLowerCase(),
    );

    let updatedList: string[];
    if (isCurrentlyAssigned) {
      updatedList = stagedTemplates.filter(
        (t) =>
          t.toLowerCase() !== tmpl.name.toLowerCase() &&
          t.toLowerCase() !== tmpl.id.toLowerCase(),
      );
      if (!updatedList.includes("Default Invoice")) {
        updatedList.unshift("Default Invoice");
      }
    } else {
      updatedList = [...stagedTemplates, tmpl.name];
    }

    setStagedTemplates(updatedList);
  };

  const handleAssignAll = () => {
    if (!selectedCompany) return;
    const allNames = INVOICE_TEMPLATES.map((t) => t.name);
    setStagedTemplates(allNames);
  };

  const handleResetDefaultOnly = () => {
    if (!selectedCompany) return;
    setStagedTemplates(["Default Invoice"]);
  };

  const handleDiscardAssignments = () => {
    setStagedTemplates(committedTemplates);
    notify("Staged template assignment changes discarded", "ok");
  };

  const handleConfirmAndSaveAssignments = async () => {
    if (!selectedCompany) return;
    setIsSavingAssignments(true);
    try {
      if (setCompanies) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === selectedCompany.id ? { ...c, templates: stagedTemplates } : c,
          ),
        );
      }
      broadcastTemplatesUpdated(selectedCompany.id, stagedTemplates);
      await adminApi.assignCompanyTemplates(selectedCompany.id, stagedTemplates);
      notify(
        `Template assignments confirmed and saved successfully for ${selectedCompany.name}!`,
        "ok",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save template assignments";
      notify(msg, "warn");
    } finally {
      setIsSavingAssignments(false);
    }
  };

  return (
    <section className="panel page-panel">
      {/* Header and Sub-Navigation Bar */}
      <div className="panel-head" style={{ marginBottom: 16 }}>
        <div>
          <h2>Invoice Templates & Access Control</h2>
          <p>
            Curated, print-ready invoice layouts with real preview thumbnails and per-company assignment.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              background: "#f1f5f9",
              padding: 4,
              borderRadius: 10,
              gap: 4,
              border: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("assigned")}
              style={{
                border: 0,
                background: activeTab === "assigned" ? "#047857" : "transparent",
                color: activeTab === "assigned" ? "#ffffff" : "#475569",
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <SlidersHorizontal size={13} />
              <span>Template Assigned</span>
              <span
                style={{
                  background: activeTab === "assigned" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: activeTab === "assigned" ? "#fff" : "#334155",
                  padding: "1px 6px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {companies.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              style={{
                border: 0,
                background: activeTab === "gallery" ? "#047857" : "transparent",
                color: activeTab === "gallery" ? "#ffffff" : "#475569",
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <ReceiptText size={13} />
              <span>All Templates</span>
              <span
                style={{
                  background: activeTab === "gallery" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: activeTab === "gallery" ? "#fff" : "#334155",
                  padding: "1px 6px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {displayTemplates.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== TAB 1: TEMPLATE ASSIGNED (PER COMPANY ACCESS) ===================== */}
      {activeTab === "assigned" && (
        <div className="template-assigned-container">
          {/* Guest Mode Restriction Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              boxShadow: "0 2px 8px rgba(4, 120, 87, 0.05)",
            }}
          >
            <div
              style={{
                background: "#047857",
                color: "#ffffff",
                width: 34,
                height: 34,
                borderRadius: "8px",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <strong style={{ color: "#064e3b", fontSize: 13 }}>
                  GUEST MODE SECURITY ACCESS POLICY
                </strong>
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#047857",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    border: "1px solid #86efac",
                  }}
                >
                  Main Default Only
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#166534",
                  lineHeight: 1.5,
                }}
              >
                Unauthenticated desktop terminals and 72-hour Guest Mode workspaces can only access the{" "}
                <strong>Main Default Template</strong> (<em>Default Invoice</em>). Full library access and assigned custom layouts (Editorial Serif, Executive Charcoal &amp; Gold, Nordic Minimal Sage) require an active registered company license.
              </p>
            </div>
          </div>

          {/* Company Selector & Dossier Card ("Choose Company") */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "18px 20px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: selectedCompany ? 16 : 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  minWidth: 280,
                }}
              >
                <label
                  htmlFor="company-assign-select"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Building2 size={16} style={{ color: "#047857" }} /> Choose Company:
                </label>
                <select
                  id="company-assign-select"
                  value={selectedCompany?.id || ""}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  style={{
                    flex: 1,
                    maxWidth: 420,
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#0f172a",
                    background: "#f8fafc",
                    outline: "none",
                  }}
                >
                  {companies.map((c) => {
                    const assignedCount = (c.templates || ["Default Invoice"]).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) — {assignedCount} of {INVOICE_TEMPLATES.length} Templates ({c.plan.toUpperCase()})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedCompany && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    className="primary-btn btn-sm"
                    onClick={handleAssignAll}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      padding: "7px 12px",
                    }}
                    title="Assign all available invoice layouts to this company"
                  >
                    <CheckCircle2 size={13} /> Assign All Templates
                  </button>
                  <button
                    type="button"
                    className="secondary-btn btn-sm"
                    onClick={handleResetDefaultOnly}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      padding: "7px 12px",
                    }}
                    title="Reset to only the Main Default template"
                  >
                    <RotateCcw size={13} /> Default Only
                  </button>
                </div>
              )}
            </div>

            {selectedCompany && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  paddingTop: 14,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        objectFit: "contain",
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        padding: 2,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: "#047857",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {selectedCompany.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>
                        {selectedCompany.name}
                      </strong>
                      <span className="code-pill" style={{ fontFamily: "monospace", fontSize: 11 }}>
                        {selectedCompany.code}
                      </span>
                      <StatusPill tone={selectedCompany.status === "active" ? "green" : "amber"}>
                        {selectedCompany.status}
                      </StatusPill>
                    </div>
                    <small style={{ color: "#64748b", fontSize: 11 }}>
                      Contact: {selectedCompany.email} · Commercial Plan:{" "}
                      <strong style={{ color: "#047857" }}>{selectedCompany.plan.toUpperCase()}</strong>
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      background: hasUnsavedAssignments ? "#FFFBEB" : "#ECFDF5",
                      color: hasUnsavedAssignments ? "#B45309" : "#047857",
                      border: hasUnsavedAssignments ? "1px solid #FDE68A" : "1px solid #A7F3D0",
                      borderRadius: "20px",
                      padding: "5px 12px",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {hasUnsavedAssignments && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                    )}
                    {stagedTemplates.length} of {INVOICE_TEMPLATES.length} Templates Active
                    {hasUnsavedAssignments && " (Unsaved Staged)"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Staged Changes Confirmation Action Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              padding: "14px 18px",
              background: hasUnsavedAssignments ? "#FFFBEB" : "#F8FAFC",
              border: hasUnsavedAssignments ? "1px solid #F59E0B" : "1px solid #E2E8F0",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: hasUnsavedAssignments ? "0 4px 14px rgba(245, 158, 11, 0.15)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hasUnsavedAssignments ? (
                <AlertTriangle size={18} color="#D97706" />
              ) : (
                <CheckCircle2 size={18} color="#059669" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: hasUnsavedAssignments ? "#92400E" : "#1E293B" }}>
                  {hasUnsavedAssignments
                    ? `Pending Unsaved Template Assignments for ${selectedCompany?.name || "Company"}`
                    : `Template Assignments Saved for ${selectedCompany?.name || "Company"}`}
                </div>
                <div style={{ fontSize: 11.5, color: hasUnsavedAssignments ? "#B45309" : "#64748B" }}>
                  {hasUnsavedAssignments
                    ? `${stagedTemplates.length} templates staged. Click "Confirm & Save Assignments" to apply changes.`
                    : "Assign or remove templates below, then click Confirm & Save to apply to client devices."}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hasUnsavedAssignments && (
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={handleDiscardAssignments}
                  disabled={isSavingAssignments}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <RotateCcw size={13} /> Discard Changes
                </button>
              )}

              <button
                type="button"
                className="primary-btn btn-sm"
                disabled={!hasUnsavedAssignments || isSavingAssignments}
                onClick={handleConfirmAndSaveAssignments}
                data-testid="confirm-save-templates-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  fontSize: 12,
                  fontWeight: 700,
                  opacity: hasUnsavedAssignments ? 1 : 0.5,
                  cursor: hasUnsavedAssignments ? "pointer" : "not-allowed",
                  boxShadow: hasUnsavedAssignments ? "0 4px 12px rgba(4, 120, 87, 0.3)" : "none",
                }}
              >
                <Save size={14} /> {isSavingAssignments ? "Saving Changes..." : "Confirm & Save Assignments"}
              </button>
            </div>
          </div>

          {/* Template Assignment Cards Grid */}
          <div className="template-grid" style={{ marginBottom: 30 }}>
            {INVOICE_TEMPLATES.map((tmpl) => {
              const isDefault = tmpl.id === "default_invoice" || tmpl.isDefault;
              const isAssigned =
                isDefault ||
                stagedTemplates.some(
                  (t) =>
                    t.toLowerCase() === tmpl.name.toLowerCase() ||
                    t.toLowerCase() === tmpl.id.toLowerCase(),
                );
              const isCommittedAssigned =
                isDefault ||
                committedTemplates.some(
                  (t) =>
                    t.toLowerCase() === tmpl.name.toLowerCase() ||
                    t.toLowerCase() === tmpl.id.toLowerCase(),
                );
              const isStagedChange = !isDefault && isAssigned !== isCommittedAssigned;

              return (
                <div
                  key={tmpl.id}
                  className="template-card"
                  style={{
                    borderColor: isAssigned ? (isDefault ? "#047857" : isStagedChange ? "#f59e0b" : "#10b981") : (isStagedChange ? "#f59e0b" : "#e2e8f0"),
                    boxShadow: isAssigned ? "0 4px 14px rgba(4, 120, 87, 0.08)" : undefined,
                  }}
                >
                  <div
                    className="template-card-preview"
                    onClick={() => {
                      const pt = displayTemplates.find((d) => d.id === tmpl.id) || {
                        id: tmpl.id,
                        name: tmpl.name,
                        category: tmpl.category,
                        description: tmpl.description,
                        previewImage: tmpl.previewImage,
                        accent: tmpl.accent,
                        badge: tmpl.badge,
                        assigned: 1,
                        isDefault: tmpl.isDefault,
                      };
                      setPreviewTemplate(pt);
                    }}
                    style={{ cursor: "pointer" }}
                    title="Click to view full preview"
                  >
                    <img src={tmpl.previewImage} alt={tmpl.name} className="template-card-img" />
                    <span className={`template-card-badge ${isDefault ? "default-badge" : ""}`}>
                      {isDefault && <Star size={10} fill="#064E3B " color="#064E3B " />}
                      {tmpl.badge || tmpl.category}
                    </span>
                    <div className="template-preview-overlay-btn">
                      <span>
                        <Eye size={13} /> View Full Template
                      </span>
                    </div>
                  </div>

                  <div className="template-meta" style={{ padding: 14 }}>
                    <div
                      className="template-meta-top"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>{tmpl.name}</strong>
                        <div style={{ fontSize: 10, color: tmpl.accent, fontWeight: 700, marginTop: 2 }}>
                          {tmpl.category}
                        </div>
                      </div>
                      {isDefault ? (
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: "3px 7px",
                            borderRadius: 6,
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Lock size={9} /> Main Default
                        </span>
                      ) : isAssigned ? (
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: "3px 7px",
                            borderRadius: 6,
                            background: isStagedChange ? "#FFFBEB" : "#ecfdf5",
                            color: isStagedChange ? "#B45309" : "#047857",
                            border: isStagedChange ? "1px solid #FDE68A" : "1px solid #86efac",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Check size={9} /> {isStagedChange ? "Assigned (Unsaved)" : "Assigned"}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: "3px 7px",
                            borderRadius: 6,
                            background: isStagedChange ? "#FFFBEB" : "#f1f5f9",
                            color: isStagedChange ? "#B45309" : "#64748b",
                            border: isStagedChange ? "1px solid #FDE68A" : "1px solid #e2e8f0",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Lock size={9} /> {isStagedChange ? "Removed (Unsaved)" : "Locked"}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: 11, color: "#64748b", margin: "6px 0 12px", lineHeight: 1.4 }}>
                      {tmpl.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 10,
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          color: isAssigned ? (isStagedChange ? "#B45309" : "#047857") : (isStagedChange ? "#B45309" : "#64748b"),
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {isDefault ? (
                          <>
                            <Lock size={11} style={{ color: "#047857" }} /> Universal (All Users &amp; Guest)
                          </>
                        ) : isAssigned ? (
                          <>
                            <CheckCircle2 size={12} style={{ color: isStagedChange ? "#B45309" : "#047857" }} />{" "}
                            {isStagedChange ? "Staged for Assignment (Unsaved)" : `Active for ${selectedCompany?.name || "Company"}`}
                          </>
                        ) : (
                          <>
                            <Lock size={11} style={{ color: isStagedChange ? "#B45309" : "#94a3b8" }} />{" "}
                            {isStagedChange ? "Staged for Removal (Unsaved)" : "Access Restricted"}
                          </>
                        )}
                      </span>

                      <div style={{ display: "flex", gap: 6 }}>
                        {isDefault ? (
                          <button
                            type="button"
                            disabled
                            className="primary-btn"
                            style={{
                              padding: "5px 10px",
                              fontSize: 10.5,
                              opacity: 0.85,
                              cursor: "default",
                              background: "#047857",
                            }}
                            title="Main default template is always unlocked for all users"
                          >
                            <Lock size={10} /> Universal Core
                          </button>
                        ) : isAssigned ? (
                          <button
                            type="button"
                            className="secondary-btn"
                            style={{
                              padding: "5px 10px",
                              fontSize: 10.5,
                              color: "#dc2626",
                              borderColor: "#fca5a5",
                              background: "#fff",
                            }}
                            onClick={() => toggleTemplateAssignment(tmpl)}
                            title={`Revoke access to ${tmpl.name}`}
                          >
                            <X size={11} /> Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-btn"
                            style={{ padding: "5px 10px", fontSize: 10.5 }}
                            onClick={() => toggleTemplateAssignment(tmpl)}
                            title={`Assign ${tmpl.name} to ${selectedCompany?.name}`}
                          >
                            <Plus size={11} /> Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Company Template Assignment Matrix Table */}
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head" style={{ marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  All Companies Template Assignment Matrix
                </h3>
                <p style={{ fontSize: 10.5, color: "#64748b", margin: "2px 0 0" }}>
                  Real-time layout permissions assigned to each registered client organization.
                </p>
              </div>
              <span className="count-pill">
                {companies.length} Registered Companies
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Tenant Code</th>
                    <th>Plan</th>
                    <th>Assigned Templates</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => {
                    const isCurrent = comp.id === selectedCompany?.id;
                    return (
                      <tr
                        key={comp.id}
                        style={{
                          background: isCurrent ? "rgba(4, 120, 87, 0.04)" : undefined,
                        }}
                      >
                        <td>
                          <div className="company-cell">
                            {comp.logo ? (
                              <img
                                src={comp.logo}
                                alt={comp.name}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  objectFit: "contain",
                                  border: "1px solid #e2e8f0",
                                  background: "#fff",
                                  padding: 2,
                                }}
                              />
                            ) : (
                              <span className="company-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                                {comp.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                            <div>
                              <strong>{comp.name}</strong>
                              <small>{comp.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: 10.5, color: "#047857", fontWeight: 700 }}>
                            {comp.code}
                          </code>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "#f1f5f9",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {comp.plan}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {INVOICE_TEMPLATES.map((tmpl) => {
                              const hasAccess = isTemplateAssignedToCompany(comp, tmpl.id);
                              return (
                                <span
                                  key={tmpl.id}
                                  style={{
                                    fontSize: 9.5,
                                    padding: "2px 7px",
                                    borderRadius: 4,
                                    background: hasAccess ? `${tmpl.accent}14` : "#f1f5f9",
                                    color: hasAccess ? tmpl.accent : "#94a3b8",
                                    border: `1px solid ${hasAccess ? `${tmpl.accent}30` : "#e2e8f0"}`,
                                    fontWeight: hasAccess ? 700 : 500,
                                    textDecoration: hasAccess ? "none" : "line-through",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: hasAccess ? tmpl.accent : "#cbd5e1",
                                    }}
                                  />
                                  {tmpl.name}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="primary-btn btn-sm"
                            style={{ fontSize: 10.5, padding: "4px 9px" }}
                            onClick={() => {
                              setSelectedCompanyId(comp.id);
                              setActiveTab("assigned");
                            }}
                          >
                            <SlidersHorizontal size={11} /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ALL TEMPLATES GALLERY ===================== */}
      {activeTab === "gallery" && (
        <div className="template-grid">
          {displayTemplates.map((t) => {
            const isDefault = t.id === "default_invoice" || t.isDefault;
            return (
              <div className="template-card" key={t.id || t.name}>
                <div
                  className="template-card-preview"
                  onClick={() => setPreviewTemplate(t)}
                  title="Click to view full template preview"
                >
                  <img
                    src={t.previewImage}
                    alt={t.name}
                    className="template-card-img"
                  />
                  <span className={`template-card-badge ${isDefault ? "default-badge" : ""}`}>
                    {isDefault && <Star size={10} fill="#064E3B " color="#064E3B " />}
                    {t.badge || t.category}
                  </span>
                  <div className="template-preview-overlay-btn">
                    <span>
                      <Eye size={13} /> View Full Template
                    </span>
                  </div>
                </div>
                <div className="template-meta">
                  <div className="template-meta-top">
                    <div>
                      <strong>{t.name}</strong>
                      <div
                        style={{
                          fontSize: 10,
                          color: t.accent,
                          fontWeight: 700,
                          marginTop: 2,
                        }}
                      >
                        {t.category}
                      </div>
                    </div>
                    {isDefault && (
                      <span className="template-default-pill">
                        <Check size={11} /> Universal • All Users
                      </span>
                    )}
                  </div>
                  <p>{t.description}</p>
                  <div className="template-meta-actions">
                    <span className="template-assigned-count">
                      <Check size={11} style={{ color: "#047857" }} />{" "}
                      {isDefault ? "Universal (Available to all users & Guest)" : "Assign access per company"}
                    </span>
                    <div className="template-action-btn-group">
                      <button
                        className="secondary-btn"
                        style={{ padding: "5px 9px", fontSize: 10 }}
                        onClick={() => setPreviewTemplate(t)}
                      >
                        <Eye size={11} /> Preview
                      </button>
                      <button
                        className="primary-btn"
                        style={{ padding: "5px 9px", fontSize: 10 }}
                        onClick={() => {
                          setActiveTab("assigned");
                          notify(
                            isDefault
                              ? `"${t.name}" is universal and active for all companies & Guest mode`
                              : `Select a company below to manage access to "${t.name}"`,
                          );
                        }}
                      >
                        <SlidersHorizontal size={10} /> Assign Company
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="modal-backdrop">
          <div className="template-modal-shell">
            <div className="preview-toolbar">
              <div>
                <button onClick={() => setPreviewTemplate(null)}>
                  <X />
                </button>
                <span>
                  <b>{previewTemplate.name}</b>
                  <small>
                    {previewTemplate.category} · High-Resolution HTML Preview
                  </small>
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {displayTemplates.map((sw) => (
                  <button
                    key={sw.id}
                    className={`template-pill-btn ${previewTemplate.id === sw.id ? "active" : ""}`}
                    onClick={() => setPreviewTemplate(sw)}
                  >
                    <span
                      className="template-pill-color"
                      style={{ background: sw.accent }}
                    />
                    {sw.name}
                  </button>
                ))}
                <button
                  className="secondary-btn"
                  onClick={() => {
                    const iframe = document.getElementById(
                      "template-preview-frame",
                    ) as HTMLIFrameElement;
                    iframe?.contentWindow?.print();
                  }}
                >
                  <Printer size={13} /> Print Test
                </button>
              </div>
            </div>
            <iframe
              id="template-preview-frame"
              className="template-iframe-container"
              srcDoc={populateInvoiceTemplate(previewTemplate.id, sampleRenderData)}
              title={previewTemplate.name}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function SecurityCenter({
  companies,
  setCompanies,
  securityEvents,
  notify,
}: {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  securityEvents: SecurityEvent[];
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [reverify, setReverify] = useState(true);
  const first = companies[0];
  return (
    <div className="security-layout">
      <section className="panel span-2">
        <div className="panel-head">
          <div>
            <h2>Security events</h2>
            <p>Unauthorized device and tamper signals across all clients.</p>
          </div>
          <button className="secondary-btn">
            <FileDown /> Export audit
          </button>
        </div>
        <div className="event-list">
          {!securityEvents.length && (
            <EmptyRows text="No security events found in Neon" />
          )}
          {securityEvents.map((e) => (
            <div className="event-row" key={e.id}>
              <span className={`event-severity ${e.severity.toLowerCase()}`}>
                <ShieldAlert />
              </span>
              <div>
                <strong>{e.reason}</strong>
                <small>
                  {e.company} · {e.device} · {e.fingerprint}
                </small>
              </div>
              <b>{e.time}</b>
              <StatusPill tone={e.severity === "High" ? "red" : "amber"}>
                {e.severity}
              </StatusPill>
              <button onClick={() => notify("Security event acknowledged")}>
                <ChevronRight />
              </button>
            </div>
          ))}
        </div>
      </section>
      <aside className="panel security-policy">
        <div className="policy-icon">
          <ShieldCheck />
        </div>
        <h2>Reverification policy</h2>
        <p>
          When a suspicious device appears, require all existing company users
          and devices to verify again at next login.
        </p>
        <label className="switch-row">
          <span>
            <b>Force company reverify</b>
            <small>Recommended for high-risk events</small>
          </span>
          <input
            type="checkbox"
            checked={reverify}
            onChange={(e) => setReverify(e.target.checked)}
          />
          <i />
        </label>
        <button
          className="primary-btn full"
          disabled={!first}
          onClick={() =>
            notify("Reverify epoch advanced · active sessions flagged")
          }
        >
          <RefreshCcw /> Apply policy
        </button>
      </aside>
      <section className="panel span-2">
        <div className="panel-head">
          <div>
            <h2>Device administration</h2>
            <p>Blocked devices and support resets.</p>
          </div>
        </div>
        {!first?.devices.length && (
          <EmptyRows text="No devices found in Neon" />
        )}
        {(first?.devices ?? []).map((d) => (
          <div className="device-admin-row" key={d.id}>
            <span className="device-avatar">
              <Laptop />
            </span>
            <div>
              <strong>{d.name}</strong>
              <small>
                {d.user} · {d.fingerprint}
              </small>
            </div>
            <span>{d.lastSeen}</span>
            <StatusPill tone={d.status === "active" ? "green" : "red"}>
              {d.status}
            </StatusPill>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className="secondary-btn"
                onClick={() => {
                  if (!first) return;
                  setCompanies((all) =>
                    all.map((c) =>
                      c.id !== first.id
                        ? c
                        : {
                          ...c,
                          devices: c.devices.map((x) =>
                            x.id === d.id ? { ...x, status: "active" } : x,
                          ),
                        },
                    ),
                  );
                  notify(`${d.name} reactivated`);
                }}
              >
                Reactivate
              </button>
              <button
                className="secondary-btn"
                style={{ color: "#ef4444", borderColor: "#fecaca" }}
                onClick={() => {
                  if (!first) return;
                  setCompanies((all) =>
                    all.map((c) =>
                      c.id !== first.id
                        ? c
                        : {
                          ...c,
                          devices: c.devices.filter((x) => x.id !== d.id),
                        },
                    ),
                  );
                  // Broadcast device removal so connected app logs out automatically
                  broadcastDeviceRevoked({
                    companyId: first.id,
                    deviceId: d.id,
                    fingerprint: d.fingerprint,
                  });
                  void adminApi
                    .deleteClientDevice(first.id, d.id)
                    .then(() => {
                      notify(
                        `Device "${d.name}" removed by Admin · Hardware binding revoked`,
                      );
                    })
                    .catch((err) => {
                      notify(
                        `Removed locally, Neon error: ${err?.message || "offline"}`,
                        "warn",
                      );
                    });
                }}
                title="Remove device & revoke authorization"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

const SUBSCRIPTION_TIERS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Single counter & boutique POS",
    monthlyPrice: 25,
    annualPrice: 250,
    defaultSeats: 1,
    defaultDevices: 1,
    offlineLease: "48 hours",
    specs: [
      "1 Device slot",
      "48h Offline lease",
      "3 Templates (1 Default + 2 Assigned)",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    badge: "MOST POPULAR",
    tagline: "Growth retail & multi-counter",
    monthlyPrice: 49,
    annualPrice: 490,
    defaultSeats: 1,
    defaultDevices: 3,
    offlineLease: "7 days",
    specs: [
      "3 Device slots",
      "7 Days (1 Week) Offline lease",
      "5 Templates (1 Default + 4 Assigned)",
      "1 time Cloud sync",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    badge: "CUSTOM TEMPLATES",
    tagline: "Multi-branch retail & enterprise branding",
    monthlyPrice: 99,
    annualPrice: 990,
    defaultSeats: 1,
    defaultDevices: 5,
    offlineLease: "15 days",
    specs: [
      "5 Device slots",
      "15 Days Offline access",
      "1 Custom template",
      "Daily Cloud Sync",
    ],
  },
] as const;

function CompanyModal({
  close,
  save,
}: {
  close: () => void;
  save: (c: Company) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [logo, setLogo] = useState("");
  const [showLogoUrl, setShowLogoUrl] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo image size should be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  const [address, setAddress] = useState("");
  const [superAdminUser, setSuperAdminUser] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState(() => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 6; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];
    return `Client!${pass}`;
  });
  const [installationKey, setInstallationKey] = useState(() =>
    generateInstallationKey(),
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userOverridden, setUserOverridden] = useState(false);

  // Advanced Subscription & Licensing State: 1 User, 1 or more Devices
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [selectedTierId, setSelectedTierId] = useState<"basic" | "plus" | "premium">("basic");
  const seatsAllowed = 1; // Exactly one user per company
  const [devicesAllowed, setDevicesAllowed] = useState(1); // 1 or more devices
  const [offlineLease, setOfflineLease] = useState("48 hours");
  const [useCustomOfflineLease, setUseCustomOfflineLease] = useState(false);
  const [customOfflineValue, setCustomOfflineValue] = useState<number>(15);
  const [customOfflineUnit, setCustomOfflineUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [hardwareBinding, setHardwareBinding] = useState("strict");
  const [showAdvancedPolicy, setShowAdvancedPolicy] = useState(false);
  const [customPlanOverride] = useState("");
  const [entitlements, setEntitlements] = useState({
    cloudSync: true,
    auditLog: true,
    autoBackup: true,
    apiAccess: false,
  });

  const activeTier =
    SUBSCRIPTION_TIERS.find((t) => t.id === selectedTierId) ||
    SUBSCRIPTION_TIERS[0];

  const handleSelectTier = (t: (typeof SUBSCRIPTION_TIERS)[number]) => {
    setSelectedTierId(t.id);
    setDevicesAllowed(t.defaultDevices);
    setOfflineLease(t.offlineLease);
    if (t.id === "premium") {
      setEntitlements((prev) => ({ ...prev, apiAccess: true }));
    }
  };

  const handleCycleChange = (cycle: "annual" | "monthly") => {
    setBillingCycle(cycle);
  };

  // Pricing calculations: 1 User included; scalable by device count
  const basePrice =
    billingCycle === "annual" ? activeTier.annualPrice : activeTier.monthlyPrice;
  const extraDevices = Math.max(0, devicesAllowed - activeTier.defaultDevices);
  const deviceUnitCost = billingCycle === "annual" ? 100 : 10; // AED
  const extraDevicesCost = extraDevices * deviceUnitCost;
  const totalCostAed = basePrice + extraDevicesCost;
  const totalCostUsd = Math.round(totalCostAed / 3.6725);

  const effectivePlanName =
    customPlanOverride.trim() ||
    `${activeTier.name} ${billingCycle === "annual" ? "Annual" : "Monthly"}`;

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 6; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];
    setSuperAdminPassword(`Client!${pass}`);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!userOverridden) {
      setSuperAdminUser(val);
    }
  };

  const effectiveUser = superAdminUser.trim() || email.trim() || "admin";

  return (
    <div className="modal-backdrop">
      <div className="modal subscription-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">NEW CLIENT TENANT</span>
            <h2>Create company</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        {/* Company Brand Logo Upload & Preview */}
        <div className="company-logo-uploader">
          <div className={`logo-preview-box ${logo ? "has-logo" : ""}`}>
            {logo ? (
              <img
                src={logo}
                alt="Company logo preview"
                className="logo-preview-img"
              />
            ) : (
              <div className="logo-preview-placeholder">
                {name.trim() ? (
                  <span className="logo-initials">
                    {name.trim().slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <ImageIcon size={22} />
                )}
              </div>
            )}
          </div>
          <div className="logo-uploader-content">
            <div className="logo-uploader-title">
              <strong>Company Brand Logo</strong>
              <small>
                Upload PNG, JPG, WebP, or SVG. Printed on tax invoices & visible
                in client portal.
              </small>
            </div>
            <div className="logo-action-buttons">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                style={{ display: "none" }}
                onChange={handleLogoFile}
              />
              <button
                type="button"
                className="secondary-btn logo-upload-btn"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={12} />
                {logo ? "Change logo" : "Upload image"}
              </button>
              {logo && (
                <button
                  type="button"
                  className="ghost-btn logo-remove-btn"
                  onClick={() => setLogo("")}
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              )}
              <button
                type="button"
                className="ghost-btn"
                style={{ fontSize: 10, padding: "4px 8px" }}
                onClick={() => setShowLogoUrl(!showLogoUrl)}
              >
                {showLogoUrl ? "Hide URL" : "Or paste URL"}
              </button>
            </div>
            {showLogoUrl && (
              <div className="logo-url-input-wrap">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            )}
          </div>
        </div>

        <label>
          Legal company name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Company Name"
          />
        </label>
        <div className="split">
          <label>
            Legal Contact No.
            <input
              type="tel"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder="e.g. +971 50 123 4567"
            />
          </label>
          <label>
            Legal Gmail
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="companyname@gmail.com"
            />
          </label>
        </div>
        <label>
          Legal Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Registered business address"
            rows={2}
          />
        </label>

        <div className="notice-banner">
          <ShieldAlert size={16} />
          <div>
            <strong>Super Admin Credentials Configuration</strong>
            <div>
              Configure the initial username/email, password, and 10-character
              Installation Key. The client requires both during high-security
              desktop app installation and hardware registration.
            </div>
          </div>
        </div>

        <label>
          Super Admin Username / Email
          <div className="input-with-actions">
            <input
              value={superAdminUser}
              onChange={(e) => {
                setUserOverridden(true);
                setSuperAdminUser(e.target.value);
              }}
              placeholder={email || "e.g. companyname@gmail.com or username"}
            />
            <div className="input-addon-btns">
              <button
                type="button"
                className="input-addon-btn"
                title="Copy username"
                onClick={() => navigator.clipboard?.writeText(effectiveUser)}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </label>

        <label>
          Super Admin Password
          <div className="input-with-actions">
            <input
              type={showPassword ? "text" : "password"}
              value={superAdminPassword}
              onChange={(e) => setSuperAdminPassword(e.target.value)}
              placeholder="Enter or generate password"
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
                title="Generate new password"
                onClick={generatePassword}
              >
                <RefreshCcw size={12} /> Generate
              </button>
            </div>
          </div>
        </label>

        <label>
          10-Character Installation Key (Format: XXX-XXX-XXXX)
          <div className="input-with-actions">
            <input
              value={installationKey}
              onChange={(e) => setInstallationKey(e.target.value.toUpperCase())}
              placeholder="XXX-XXX-XXXX"
              style={{
                fontFamily: "monospace",
                letterSpacing: "1.5px",
                fontWeight: "bold",
              }}
            />
            <div className="input-addon-btns">
              <button
                type="button"
                className="input-addon-btn"
                title="Copy Installation Key"
                onClick={() => {
                  navigator.clipboard?.writeText(installationKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
              >
                {copiedKey ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <button
                type="button"
                className="input-addon-btn"
                title="Generate new 10-character key"
                onClick={() => setInstallationKey(generateInstallationKey())}
              >
                <RefreshCcw size={12} /> Generate
              </button>
            </div>
          </div>
          <small
            className="muted"
            style={{ fontSize: 10, marginTop: 4, display: "block" }}
          >
            Unique 10-character alphanumeric key (split 3-3-4). Provide to
            client for desktop app setup.
          </small>
        </label>

        {/* Advanced Subscription & Licensing Section */}
        <div className="sub-config-wrap">
          <div className="sub-header">
            <div className="sub-header-title">
              <strong>
                <CreditCard size={15} style={{ color: "#047857" }} />
                Commercial Subscription & License Tier
              </strong>
              <small>Configure plan tier, seat concurrency, hardware slots & offline lease policy</small>
            </div>
            <span className="sub-badge">
              <ShieldCheck size={12} /> Commercial v8
            </span>
          </div>

          {/* Billing Cadence Toggle */}
          <div className="sub-cadence-toggle">
            <button
              type="button"
              className={`sub-cadence-btn ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => handleCycleChange("monthly")}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`sub-cadence-btn ${billingCycle === "annual" ? "active" : ""}`}
              onClick={() => handleCycleChange("annual")}
            >
              Annual Billing
              <span className="sub-discount-pill">Save 18% · 2 Mo Free</span>
            </button>
          </div>

          {/* Plan Tier Selection Cards */}
          <div className="sub-tiers-grid">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const price =
                billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;
              return (
                <div
                  key={tier.id}
                  className={`sub-tier-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectTier(tier)}
                  role="button"
                  tabIndex={0}
                >
                  {"badge" in tier && tier.badge && (
                    <span className="sub-tier-card-badge">{tier.badge}</span>
                  )}
                  <div className="sub-tier-card-head">
                    <span className="sub-tier-name">{tier.name}</span>
                    <span className="sub-tier-price">
                      AED {price.toLocaleString()}
                      <small>/{billingCycle === "annual" ? "yr" : "mo"}</small>
                    </span>
                  </div>
                  <div className="sub-tier-desc">{tier.tagline}</div>
                  <div className="sub-tier-specs">
                    {tier.specs.map((spec, i) => (
                      <div key={i} className="sub-tier-spec-item">
                        <Check size={11} />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capacity Allocation (Device Slots / Terminals) */}
          <div className="sub-quota-grid">
            {/* Device Count Card (1 or more devices) */}
            <div className="sub-quota-card">
              <div className="sub-quota-meta">
                <strong>
                  <Laptop size={14} style={{ color: "#7c3aed" }} /> Device Slots (Hardware Terminals)
                </strong>
                <small>1 or more authorized POS / desktop hardware devices</small>
              </div>
              <div className="sub-stepper-wrap">
                <button
                  type="button"
                  className="sub-stepper-btn"
                  onClick={() =>
                    setDevicesAllowed(Math.max(1, devicesAllowed - 1))
                  }
                  disabled={devicesAllowed <= 1}
                  title="Decrease devices (min: 1)"
                >
                  -
                </button>
                <input
                  type="number"
                  className="sub-stepper-input"
                  min="1"
                  value={devicesAllowed}
                  onChange={(e) =>
                    setDevicesAllowed(Math.max(1, parseInt(e.target.value) || 1))
                  }
                />
                <button
                  type="button"
                  className="sub-stepper-btn"
                  onClick={() => setDevicesAllowed(devicesAllowed + 1)}
                  title="Increase devices"
                >
                  +
                </button>
              </div>
              <div className="sub-quota-foot">
                <span className="included">
                  Tier base: {activeTier.defaultDevices} device{activeTier.defaultDevices > 1 ? "s" : ""}
                </span>
                {devicesAllowed > activeTier.defaultDevices ? (
                  <span className="addon">
                    +{devicesAllowed - activeTier.defaultDevices} add-on (+AED {deviceUnitCost}/{billingCycle === "annual" ? "yr" : "mo"} each)
                  </span>
                ) : (
                  <span>Hardware verified</span>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Policy & Feature Entitlements Accordion */}
          <div className="sub-advanced-section">
            <div
              className="sub-adv-toggle-row"
              onClick={() => setShowAdvancedPolicy(!showAdvancedPolicy)}
            >
              <strong>
                <LockKeyhole size={13} style={{ color: "#475569" }} />
                Advanced License Policy & Entitlements
              </strong>
              <span>
                {showAdvancedPolicy
                  ? "Hide policy controls"
                  : "Configure offline lease & security policy"}
                {showAdvancedPolicy ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </span>
            </div>

            {showAdvancedPolicy && (
              <>
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <label style={{ margin: 0, fontWeight: 700, fontSize: 12, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} style={{ color: "#047857" }} />
                      Offline Operation Lease Policy
                    </label>
                    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
                      <button
                        type="button"
                        onClick={() => setUseCustomOfflineLease(false)}
                        style={{
                          border: "none",
                          background: !useCustomOfflineLease ? "#ffffff" : "transparent",
                          color: !useCustomOfflineLease ? "#047857" : "#64748b",
                          fontWeight: !useCustomOfflineLease ? 700 : 500,
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 5,
                          cursor: "pointer",
                          boxShadow: !useCustomOfflineLease ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        }}
                      >
                        Plan Default ({activeTier.offlineLease})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseCustomOfflineLease(true)}
                        style={{
                          border: "none",
                          background: useCustomOfflineLease ? "#047857" : "transparent",
                          color: useCustomOfflineLease ? "#ffffff" : "#64748b",
                          fontWeight: useCustomOfflineLease ? 700 : 500,
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 5,
                          cursor: "pointer",
                          boxShadow: useCustomOfflineLease ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        }}
                      >
                        Special Custom Override
                      </button>
                    </div>
                  </div>

                  {!useCustomOfflineLease ? (
                    <div style={{ fontSize: 12, color: "#475569", background: "#f8fafc", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                      Applying standard <strong>{activeTier.name} Tier</strong> preset duration: <span style={{ color: "#047857", fontWeight: 700 }}>{activeTier.offlineLease}</span>. Hardware POS terminal may work disconnected from cloud up to this period before requiring a cryptographic heartbeat sync.
                    </div>
                  ) : (
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: "0 0 100px" }}>
                          <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Duration</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={customOfflineValue}
                            onChange={(e) => setCustomOfflineValue(Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ width: "100%", padding: "6px 10px", fontSize: 13, fontWeight: 700, borderRadius: 6, border: "1px solid #cbd5e1" }}
                          />
                        </div>
                        <div style={{ flex: "0 0 130px" }}>
                          <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Unit</span>
                          <select
                            value={customOfflineUnit}
                            onChange={(e) => setCustomOfflineUnit(e.target.value as "minutes" | "hours" | "days")}
                            style={{ width: "100%", padding: "6px 10px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "1px solid #cbd5e1" }}
                          >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Active Override</span>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: 6, border: "1px solid #fde68a" }}>
                            {customOfflineValue} {customOfflineUnit} (Takes precedence over {activeTier.name} default)
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Quick Presets:</span>
                        {[
                          { val: 15, unit: "minutes" as const, label: "15 Minutes" },
                          { val: 30, unit: "minutes" as const, label: "30 Minutes" },
                          { val: 2, unit: "hours" as const, label: "2 Hours" },
                          { val: 48, unit: "hours" as const, label: "48 Hours" },
                          { val: 7, unit: "days" as const, label: "7 Days" },
                          { val: 15, unit: "days" as const, label: "15 Days" },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => {
                              setCustomOfflineValue(chip.val);
                              setCustomOfflineUnit(chip.unit);
                            }}
                            style={{
                              border: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "1px solid #047857" : "1px solid #e2e8f0",
                              background: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "#ecfdf5" : "#ffffff",
                              color: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "#047857" : "#475569",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 12,
                              cursor: "pointer",
                            }}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sub-policy-grid">
                  <label style={{ margin: 0 }}>
                    Hardware Binding Strictness
                    <select
                      className="sub-policy-select"
                      value={hardwareBinding}
                      onChange={(e) => setHardwareBinding(e.target.value)}
                    >
                      <option value="strict">
                        Strict Enclave (Motherboard + CPU UUID)
                      </option>
                      <option value="flexible">
                        Standard Machine Fingerprint (Portal Float)
                      </option>
                    </select>
                  </label>
                </div>

                <div className="sub-entitlement-grid">
                  <label className="sub-entitlement-item">
                    <input
                      type="checkbox"
                      checked={entitlements.cloudSync}
                      onChange={(e) =>
                        setEntitlements((prev) => ({
                          ...prev,
                          cloudSync: e.target.checked,
                        }))
                      }
                    />
                    <span>Real-time Multi-Device Cloud Sync</span>
                  </label>
                  <label className="sub-entitlement-item">
                    <input
                      type="checkbox"
                      checked={entitlements.auditLog}
                      onChange={(e) =>
                        setEntitlements((prev) => ({
                          ...prev,
                          auditLog: e.target.checked,
                        }))
                      }
                    />
                    <span>Cryptographic Audit Trail & Tax Export</span>
                  </label>
                  <label className="sub-entitlement-item">
                    <input
                      type="checkbox"
                      checked={entitlements.autoBackup}
                      onChange={(e) =>
                        setEntitlements((prev) => ({
                          ...prev,
                          autoBackup: e.target.checked,
                        }))
                      }
                    />
                    <span>Automated Hourly Neon DB Backups</span>
                  </label>
                  <label className="sub-entitlement-item">
                    <input
                      type="checkbox"
                      checked={entitlements.apiAccess}
                      onChange={(e) =>
                        setEntitlements((prev) => ({
                          ...prev,
                          apiAccess: e.target.checked,
                        }))
                      }
                    />
                    <span>REST API & Webhooks Dispatch Access</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Pricing & Guarantee Summary */}
          <div className="sub-pricing-summary">
            <div className="sub-pricing-left">
              <span>Selected Plan & Calculated Total</span>
              <strong>
                {effectivePlanName} · AED {totalCostAed.toLocaleString()}
                <small
                  style={{
                    color: "#94a3b8",
                    fontWeight: "normal",
                    marginLeft: 4,
                  }}
                >
                  /{billingCycle === "annual" ? "year" : "month"}
                </small>
              </strong>
              <small>
                Includes {devicesAllowed} Hardware Device Slot
                {devicesAllowed > 1 ? "s" : ""} ·{" "}
                {selectedTierId === "basic" && "3 Templates (1 Default + 2 Assigned)"}
                {selectedTierId === "plus" && "5 Templates (1 Default + 4 Assigned)"}
                {selectedTierId === "premium" &&
                  (billingCycle === "annual"
                    ? "Unlimited Custom Templates (Full Year)"
                    : "Unlimited Custom Templates (1 Month)")}
                {" "}(~${totalCostUsd} USD)
              </small>
            </div>
            <div className="sub-pricing-right">
              <span className="sub-pricing-crypto-pill">
                <ShieldCheck size={11} /> Ed25519 Token v8
              </span>
              <small style={{ color: useCustomOfflineLease ? "#b45309" : "#94a3b8", fontSize: "9px", fontWeight: useCustomOfflineLease ? 700 : 400 }}>
                Offline lease: {useCustomOfflineLease ? `${customOfflineValue} ${customOfflineUnit} (Custom Override)` : `${activeTier.offlineLease} (Default)`}
              </small>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            disabled={
              !name.trim() ||
              !email.trim() ||
              !address.trim() ||
              !superAdminPassword.trim()
            }
            onClick={() =>
              save({
                id: `c_${Date.now()}`,
                name: name.trim(),
                code: `NEW-${Math.floor(Math.random() * 9000 + 1000)}`,
                email: email.trim(),
                contactNo: contactNo.trim() || undefined,
                phone: contactNo.trim() || undefined,
                logo: logo.trim() || undefined,
                address: address.trim(),
                superAdminUser: effectiveUser,
                superAdminPassword: superAdminPassword.trim(),
                installationKey:
                  installationKey.trim().toUpperCase() ||
                  generateInstallationKey(),
                status: "active",
                plan: effectivePlanName,
                offlineLeaseOverride: useCustomOfflineLease
                  ? `${customOfflineValue} ${customOfflineUnit}`
                  : undefined,
                license: "Not issued",
                expires: "—",
                seatsUsed: 0,
                seatsAllowed,
                devicesAllowed,
                templates:
                  selectedTierId === "basic"
                    ? ["Default Invoice", "Editorial Serif", "Executive Charcoal & Gold"]
                    : selectedTierId === "plus"
                      ? [
                        "Default Invoice",
                        "Editorial Serif",
                        "Executive Charcoal & Gold",
                        "Nordic Minimal Sage",
                        "Classic Clean Layout",
                      ]
                      : [
                        "Default Invoice",
                        "Editorial Serif",
                        "Executive Charcoal & Gold",
                        "Nordic Minimal Sage",
                        "Unlimited Custom Branded Layouts",
                      ],
                devices: [],
              })
            }
          >
            Create company
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCompanyModal({
  company,
  close,
  save,
  onDelete,
}: {
  company: Company;
  close: () => void;
  save: (updated: Partial<Company>) => void;
  onDelete?: (company: Company) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "all" | "general" | "credentials" | "subscription" | "devices" | "license"
  >("all");

  // 1. Brand Logo & Legal Identity
  const [name, setName] = useState(company.name || "");
  const [email, setEmail] = useState(company.email || "");
  const [contactNo, setContactNo] = useState(
    company.contactNo || company.phone || "",
  );
  const [logo, setLogo] = useState(company.logo || "");
  const [showLogoUrl, setShowLogoUrl] = useState(false);
  const editLogoInputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState(company.address || "");

  const handleEditLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo image size should be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Super Admin Credentials & 10-Character Installation Key
  const [superAdminUser, setSuperAdminUser] = useState(
    company.superAdminUser || company.email || "",
  );
  const [superAdminPassword, setSuperAdminPassword] = useState(
    company.superAdminPassword || "",
  );
  const [installationKey, setInstallationKey] = useState(
    company.installationKey || generateInstallationKey(),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedLic, setCopiedLic] = useState(false);

  const copyClientHandoverCreds = () => {
    const text = [
      `========================================`,
      `LEDGERSHIELD / BILLIONDUE TENANT ACCESS`,
      `========================================`,
      `Company:          ${name}`,
      `Company Code:     ${company.code}`,
      `Super Admin User: ${superAdminUser}`,
      `Password:         ${superAdminPassword || "(Unchanged / Existing)"}`,
      `Installation Key: ${installationKey}`,
      `Portal Access:    Client Portal & Desktop Setup`,
      `========================================`,
    ].join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedHandover(true);
    setTimeout(() => setCopiedHandover(false), 2000);
  };

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 7; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];
    setSuperAdminPassword(`Client!${pass}`);
  };

  // 3. Commercial Subscription & License Tier
  const initialTierId: "basic" | "plus" | "premium" =
    company.plan?.toLowerCase().includes("premium")
      ? "premium"
      : company.plan?.toLowerCase().includes("plus")
        ? "plus"
        : "basic";
  const initialBillingCycle: "annual" | "monthly" =
    company.plan?.toLowerCase().includes("monthly") ? "monthly" : "annual";

  const [selectedTierId, setSelectedTierId] =
    useState<"basic" | "plus" | "premium">(initialTierId);
  const [billingCycle, setBillingCycle] =
    useState<"annual" | "monthly">(initialBillingCycle);
  const [plan, setPlan] = useState(
    company.plan ||
    `${SUBSCRIPTION_TIERS.find((t) => t.id === initialTierId)?.name || "Plus"} ${initialBillingCycle === "annual" ? "Annual" : "Monthly"}`,
  );
  const [seatsAllowed] = useState(company.seatsAllowed || 1);
  const [devicesAllowed, setDevicesAllowed] = useState(
    company.devicesAllowed || 3,
  );

  const activeTier =
    SUBSCRIPTION_TIERS.find((t) => t.id === selectedTierId) ||
    SUBSCRIPTION_TIERS[0];

  const parseCompanyOverride = (overrideStr?: string) => {
    if (!overrideStr) return null;
    const match = overrideStr.trim().match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/i);
    if (!match) return null;
    const val = parseFloat(match[1]);
    const u = match[2].toLowerCase();
    let unit: "minutes" | "hours" | "days" = "minutes";
    if (u.startsWith("h")) unit = "hours";
    else if (u.startsWith("d")) unit = "days";
    return { value: val, unit };
  };
  const parsedCompanyOverride = parseCompanyOverride(company.offlineLeaseOverride);
  const [useCustomOfflineLease, setUseCustomOfflineLease] = useState(!!parsedCompanyOverride);
  const [customOfflineValue, setCustomOfflineValue] = useState<number>(parsedCompanyOverride?.value || 15);
  const [customOfflineUnit, setCustomOfflineUnit] = useState<"minutes" | "hours" | "days">(parsedCompanyOverride?.unit || "minutes");

  const handleSelectTier = (t: (typeof SUBSCRIPTION_TIERS)[number]) => {
    setSelectedTierId(t.id);
    setDevicesAllowed(t.defaultDevices);
    setPlan(`${t.name} ${billingCycle === "annual" ? "Annual" : "Monthly"}`);
  };

  const handleCycleChange = (cycle: "annual" | "monthly") => {
    setBillingCycle(cycle);
    setPlan(`${activeTier.name} ${cycle === "annual" ? "Annual" : "Monthly"}`);
  };

  const basePrice =
    billingCycle === "annual" ? activeTier.annualPrice : activeTier.monthlyPrice;
  const extraDevices = Math.max(0, devicesAllowed - activeTier.defaultDevices);
  const deviceUnitCost = billingCycle === "annual" ? 100 : 10;
  const extraDevicesCost = extraDevices * deviceUnitCost;
  const totalCostAed = basePrice + extraDevicesCost;

  // 4. Tenant Account Status
  const [status, setStatus] = useState<Company["status"]>(
    company.status || "active",
  );

  // 5. Logged Devices
  const [devices, setDevices] = useState<Device[]>(company.devices || []);
  const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null);

  const handleRevokeDevice = async (device: Device) => {
    if (
      !confirm(
        `Are you sure you want to revoke "${device.name}"? This machine will immediately lose authorization and its license lease will terminate.`,
      )
    ) {
      return;
    }

    setRevokingDeviceId(device.id);
    const updatedDevices = devices.filter((d) => d.id !== device.id);
    setDevices(updatedDevices);

    broadcastDeviceRevoked({
      companyId: company.id,
      deviceId: device.id,
      fingerprint: device.fingerprint,
    });

    try {
      await adminApi.deleteClientDevice(company.id, device.id);
    } catch (err) {
      console.warn("Device revoked locally, Neon offline:", err);
    } finally {
      setRevokingDeviceId(null);
    }
  };

  // 6. License Details
  const [license, setLicense] = useState(
    company.license || `lic_c_${Date.now()}`,
  );
  const [expires, setExpires] = useState(company.expires || "2027-10-26");

  const copyCompleteSummary = () => {
    const text = [
      `========================================`,
      `COMPANY DETAILS: ${name}`,
      `========================================`,
      `Company Code:       ${company.code}`,
      `Legal Name:         ${name}`,
      `Brand Logo:         ${logo ? "Active / Uploaded" : "Default Initials"}`,
      `Legal Contact:      ${contactNo || "N/A"}`,
      `Legal Gmail:        ${email}`,
      `Legal Address:      ${address || "N/A"}`,
      `Tenant Status:      ${status.toUpperCase()}`,
      ``,
      `SUPER ADMINISTRATOR ACCESS`,
      `----------------------------------------`,
      `Super Admin User:   ${superAdminUser}`,
      `Super Admin Pass:   ${superAdminPassword || "(Unchanged / Existing)"}`,
      `Installation Key:   ${installationKey}`,
      ``,
      `COMMERCIAL SUBSCRIPTION & LICENSE`,
      `----------------------------------------`,
      `Subscription Tier:  ${plan}`,
      `Device Quota:       ${devicesAllowed} Terminal(s)`,
      `Registered Devices: ${devices.length}`,
      `License Key:        ${license}`,
      `Valid Until:        ${expires}`,
      `Signing Authority:  Ed25519 Cryptographic Verification Key`,
      `========================================`,
    ].join("\n");

    navigator.clipboard?.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const showSection = (
    tab: "general" | "credentials" | "subscription" | "devices" | "license",
  ) => activeTab === "all" || activeTab === tab;

  const devicesWarning = devicesAllowed < devices.length;

  const handleSave = () => {
    save({
      name: name.trim(),
      email: email.trim(),
      contactNo: contactNo.trim() || undefined,
      phone: contactNo.trim() || undefined,
      logo: logo.trim() || undefined,
      address: address.trim(),
      superAdminUser: superAdminUser.trim() || email.trim(),
      superAdminPassword: superAdminPassword.trim() || undefined,
      installationKey: installationKey.trim().toUpperCase(),
      status,
      plan,
      offlineLeaseOverride: useCustomOfflineLease
        ? `${customOfflineValue} ${customOfflineUnit}`
        : null,
      seatsAllowed,
      devicesAllowed,
      devices,
      license: license.trim(),
      expires: expires.trim(),
      templates:
        company.templates && company.templates.length > 0
          ? company.templates
          : selectedTierId === "basic"
            ? ["Default Invoice", "Editorial Serif", "Executive Charcoal & Gold"]
            : selectedTierId === "plus"
              ? [
                "Default Invoice",
                "Editorial Serif",
                "Executive Charcoal & Gold",
                "Nordic Minimal Sage",
                "Classic Clean Layout",
              ]
              : [
                "Default Invoice",
                "Editorial Serif",
                "Executive Charcoal & Gold",
                "Nordic Minimal Sage",
                "Unlimited Custom Branded Layouts",
              ],
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal company-detail-modal">
        {/* Modal Head */}
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }}
                />
              ) : (
                <span style={{ fontWeight: 800, fontSize: 16, color: "#047857" }}>
                  {(name || "CO").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                TENANT DETAILS & CONTROL PLANE
                <span
                  style={{
                    background: "#ECFDF5",
                    color: "#064E3B",
                    border: "1px solid #A7F3D0",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {company.code}
                </span>
              </span>
              <h2 style={{ margin: "2px 0 0", color: "#0f172a", fontSize: 20 }}>
                {name || company.name}
              </h2>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              className="secondary-btn btn-sm"
              onClick={copyCompleteSummary}
              title="Copy complete company and credential dossier"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                height: 32,
                padding: "0 12px",
                fontSize: 11,
              }}
            >
              {copiedCreds ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCreds ? "Dossier Copied!" : "Copy Summary Dossier"}</span>
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={close}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tab-bar">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Building2 size={12} /> All Details
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Building2 size={12} /> Brand & Legal
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "credentials" ? "active" : ""}`}
            onClick={() => setActiveTab("credentials")}
          >
            <KeyRound size={12} /> Super Admin & Key
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "subscription" ? "active" : ""}`}
            onClick={() => setActiveTab("subscription")}
          >
            <CreditCard size={12} /> Subscription & Quota
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "devices" ? "active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <Laptop size={12} /> Logged Devices
            <span className="modal-tab-count">{devices.length}</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === "license" ? "active" : ""}`}
            onClick={() => setActiveTab("license")}
          >
            <ShieldCheck size={12} /> Commercial License
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="company-detail-modal-body">
          {/* Section 1: Company Brand Logo & Legal Identity */}
          {showSection("general") && (
            <div className="detail-section-card">
              <div className="detail-section-head">
                <div className="detail-section-title">
                  <Building2 size={15} />
                  <span>Company Brand Logo & Legal Identity</span>
                </div>
                <div className="status-pill-group">
                  <button
                    type="button"
                    className={`status-pill-btn ${status === "active" ? "active status-btn-active" : ""}`}
                    onClick={() => setStatus("active")}
                    title="Activate tenant account (Full Operation)"
                  >
                    <CheckCircle2 size={11} /> Active
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn ${status === "suspended" ? "active status-btn-suspended" : ""}`}
                    onClick={() => setStatus("suspended")}
                    title="Suspend tenant account (Access Paused)"
                  >
                    <PauseCircle size={11} /> Suspend
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn ${status === "blocked" ? "active status-btn-blocked" : ""}`}
                    onClick={() => setStatus("blocked")}
                    title="Block tenant account (Login Denied)"
                  >
                    <Ban size={11} /> Block
                  </button>
                </div>
              </div>

              {/* Brand Logo Uploader */}
              <div className="company-logo-uploader" style={{ marginBottom: 16 }}>
                <div className={`logo-preview-box ${logo ? "has-logo" : ""}`}>
                  {logo ? (
                    <img
                      src={logo}
                      alt="Company logo preview"
                      className="logo-preview-img"
                    />
                  ) : (
                    <div className="logo-preview-placeholder">
                      {name.trim() ? (
                        <span className="logo-initials">
                          {name.trim().slice(0, 2).toUpperCase()}
                        </span>
                      ) : (
                        <ImageIcon size={22} />
                      )}
                    </div>
                  )}
                </div>
                <div className="logo-uploader-content">
                  <div className="logo-uploader-title">
                    <strong>Company Brand Logo</strong>
                    <small>
                      Update logo image or URL. Reflects immediately across invoices, customer portal & desktop app.
                    </small>
                  </div>
                  <div className="logo-action-buttons">
                    <input
                      type="file"
                      ref={editLogoInputRef}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={handleEditLogoFile}
                    />
                    <button
                      type="button"
                      className="secondary-btn logo-upload-btn"
                      onClick={() => editLogoInputRef.current?.click()}
                    >
                      <Upload size={12} />
                      {logo ? "Change logo" : "Upload image"}
                    </button>
                    {logo && (
                      <button
                        type="button"
                        className="ghost-btn logo-remove-btn"
                        onClick={() => setLogo("")}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ fontSize: 10, padding: "4px 8px" }}
                      onClick={() => setShowLogoUrl(!showLogoUrl)}
                    >
                      {showLogoUrl ? "Hide URL" : "Or paste URL"}
                    </button>
                  </div>
                  {showLogoUrl && (
                    <div className="logo-url-input-wrap">
                      <input
                        type="text"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="split">
                <label>
                  Legal Company Name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Legal company name"
                  />
                </label>
                <label>
                  Legal Contact No.
                  <input
                    type="tel"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                  />
                </label>
              </div>

              <div className="split">
                <label>
                  Legal Gmail / Email Address
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="companyname@gmail.com"
                  />
                </label>
                <label>
                  Tenant Account Status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Company["status"])}
                  >
                    <option value="active">Active (Full Operation)</option>
                    <option value="suspended">Suspended (Access Paused)</option>
                    <option value="blocked">Blocked (Login Denied)</option>
                  </select>
                </label>
              </div>

              <label>
                Legal Registered Address
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Registered legal business address"
                />
              </label>
            </div>
          )}

          {/* Section 2: Super Admin Access & 10-Character Installation Key */}
          {showSection("credentials") && (
            <div className="detail-section-card">
              <div className="detail-section-head">
                <div className="detail-section-title">
                  <KeyRound size={15} />
                  <span>Super Admin Credentials & 10-Character Desktop Key</span>
                </div>
              </div>

              <div className="split">
                <label>
                  Super Admin Username / Email
                  <div className="input-with-actions">
                    <input
                      value={superAdminUser}
                      onChange={(e) => setSuperAdminUser(e.target.value)}
                      placeholder="Super Admin user / email"
                    />
                    <div className="input-addon-btns">
                      <button
                        type="button"
                        className="input-addon-btn"
                        title="Copy username"
                        onClick={() => {
                          navigator.clipboard?.writeText(superAdminUser);
                          setCopiedUser(true);
                          setTimeout(() => setCopiedUser(false), 2000);
                        }}
                      >
                        {copiedUser ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </label>

                <label>
                  Super Admin Password
                  <div className="input-with-actions">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={superAdminPassword}
                      onChange={(e) => setSuperAdminPassword(e.target.value)}
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
                        title="Generate new password"
                        onClick={generatePassword}
                      >
                        <RefreshCcw size={12} /> Generate
                      </button>
                    </div>
                  </div>
                </label>
              </div>

              <label style={{ marginTop: 6 }}>
                10-Character Desktop Installation Key (Format: XXX-XXX-XXXX)
                <div className="input-with-actions">
                  <input
                    value={installationKey}
                    onChange={(e) => setInstallationKey(e.target.value.toUpperCase())}
                    placeholder="XXX-XXX-XXXX"
                    style={{
                      fontFamily: "monospace",
                      letterSpacing: "1.5px",
                      fontWeight: "bold",
                    }}
                  />
                  <div className="input-addon-btns">
                    <button
                      type="button"
                      className="input-addon-btn"
                      title="Copy Key"
                      onClick={() => {
                        navigator.clipboard?.writeText(installationKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                    >
                      {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      type="button"
                      className="input-addon-btn"
                      title="Generate new key"
                      onClick={() => setInstallationKey(generateInstallationKey())}
                    >
                      <RefreshCcw size={12} /> Generate
                    </button>
                  </div>
                </div>
              </label>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={copyClientHandoverCreds}
                  title="Copy client handover credentials formatted card"
                >
                  <KeyRound size={12} />
                  <span>{copiedHandover ? "Handover Card Copied!" : "Copy Handover Credentials"}</span>
                </button>
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={generatePassword}
                  title="Reset and generate strong password"
                >
                  <RefreshCcw size={12} /> Reset Password
                </button>
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={() => setInstallationKey(generateInstallationKey())}
                  title="Regenerate 10-character Desktop Installation Key"
                >
                  <RefreshCcw size={12} /> Regenerate Key
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Commercial Subscription & License Tier */}
          {showSection("subscription") && (
            <div className="detail-section-card">
              <div className="detail-section-head">
                <div className="detail-section-title">
                  <CreditCard size={15} />
                  <span>Commercial Subscription & License Tier</span>
                </div>
                <div className="sub-cadence-toggle" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`sub-cadence-btn ${billingCycle === "monthly" ? "active" : ""}`}
                    onClick={() => handleCycleChange("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={`sub-cadence-btn ${billingCycle === "annual" ? "active" : ""}`}
                    onClick={() => handleCycleChange("annual")}
                  >
                    Annual
                    <span className="sub-discount-pill">Save 18%</span>
                  </button>
                </div>
              </div>

              {/* Plan Tier Selection Cards */}
              <div className="sub-tiers-grid" style={{ marginBottom: 14 }}>
                {SUBSCRIPTION_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const price =
                    billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;
                  return (
                    <div
                      key={tier.id}
                      className={`sub-tier-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectTier(tier)}
                      role="button"
                      tabIndex={0}
                    >
                      {"badge" in tier && tier.badge && (
                        <span className="sub-tier-card-badge">{tier.badge}</span>
                      )}
                      <div className="sub-tier-card-head">
                        <span className="sub-tier-name">{tier.name}</span>
                        <span className="sub-tier-price">
                          AED {price.toLocaleString()}
                          <small>/{billingCycle === "annual" ? "yr" : "mo"}</small>
                        </span>
                      </div>
                      <div className="sub-tier-desc">{tier.tagline}</div>
                      <div className="sub-tier-specs">
                        {tier.specs.map((spec, i) => (
                          <div key={i} className="sub-tier-spec-item">
                            <Check size={11} />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hardware Device Slots Allocation */}
              <div className="sub-quota-card" style={{ marginBottom: 12 }}>
                <div className="sub-quota-meta">
                  <strong>
                    <Laptop size={14} style={{ color: "#047857" }} /> Hardware Terminal Slots
                  </strong>
                  <small>Authorized POS / desktop hardware terminal devices</small>
                </div>

                <div className="sub-stepper-wrap">
                  <button
                    type="button"
                    className="sub-stepper-btn"
                    onClick={() =>
                      setDevicesAllowed(Math.max(1, devicesAllowed - 1))
                    }
                    disabled={devicesAllowed <= 1}
                    title="Decrease devices (min: 1)"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="sub-stepper-input"
                    min="1"
                    value={devicesAllowed}
                    onChange={(e) =>
                      setDevicesAllowed(
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="sub-stepper-btn"
                    onClick={() => setDevicesAllowed(devicesAllowed + 1)}
                    title="Increase devices"
                  >
                    +
                  </button>
                </div>

                <div style={{ marginTop: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      marginBottom: 2,
                    }}
                  >
                    <span className="muted">Registered devices:</span>
                    <b>
                      {devices.length} / {devicesAllowed} terminal slots
                    </b>
                  </div>
                  <progress
                    max={devicesAllowed}
                    value={devices.length}
                    style={{ width: "100%", height: 6, borderRadius: 3 }}
                  />
                </div>

                {devicesWarning && (
                  <small style={{ color: "#dc2626", fontWeight: "bold" }}>
                    ⚠️ Warning: Allocated slots ({devicesAllowed}) is less than
                    registered devices ({devices.length})!
                  </small>
                )}
              </div>

              {/* Pricing & Policy Summary */}
              <div className="sub-pricing-summary">
                <div>
                  <span style={{ fontSize: 10, color: "#64748b" }}>Calculated Commercial Subscription</span>
                  <strong>
                    {plan} · AED {totalCostAed.toLocaleString()}
                    <small>/{billingCycle === "annual" ? "year" : "month"}</small>
                  </strong>
                  <small style={{ color: "#475569" }}>
                    Includes {devicesAllowed} Hardware Terminal Slot{devicesAllowed > 1 ? "s" : ""} · Offline lease: {useCustomOfflineLease ? `${customOfflineValue} ${customOfflineUnit} (Custom Override)` : activeTier.offlineLease}
                  </small>
                </div>
                <div className="sub-pricing-right">
                  <span className="sub-pricing-crypto-pill">
                    <ShieldCheck size={11} /> Ed25519 Token v8
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Logged Devices */}
          {showSection("devices") && (
            <div className="detail-section-card">
              <div className="detail-section-head">
                <div className="detail-section-title">
                  <Laptop size={15} />
                  <span>Logged Devices ({devices.length} / {devicesAllowed})</span>
                </div>
                <span className="modal-tab-count">
                  {devices.length} Active / {devicesAllowed} Max
                </span>
              </div>

              {!devices.length ? (
                <EmptyRows text="No active hardware devices logged yet. Devices bind automatically when client inputs the 10-character Desktop Installation Key." />
              ) : (
                <div>
                  {devices.map((d) => (
                    <div key={d.id} className="logged-device-card">
                      <div className="logged-device-info">
                        <div className="logged-device-icon">
                          <Laptop size={18} />
                        </div>
                        <div className="logged-device-meta">
                          <strong>
                            {d.name}
                            <span style={{ fontSize: 10, color: "#64748b", fontWeight: "normal" }}>
                              ({d.os})
                            </span>
                            <StatusPill tone={d.live ? "green" : "amber"}>
                              {d.live ? "Online" : "Verified"}
                            </StatusPill>
                          </strong>
                          <small>
                            <span>Fingerprint:</span>
                            <span className="logged-device-fp">{d.fingerprint}</span>
                            <button
                              type="button"
                              className="input-addon-btn"
                              style={{ padding: "2px 5px", fontSize: 9 }}
                              title="Copy hardware fingerprint"
                              onClick={() => navigator.clipboard?.writeText(d.fingerprint)}
                            >
                              <Copy size={10} />
                            </button>
                            {d.activated && <span>· Activated: {d.activated}</span>}
                          </small>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="secondary-btn btn-sm danger-btn-sm"
                          onClick={() => handleRevokeDevice(d)}
                          disabled={revokingDeviceId === d.id}
                          title="Revoke device hardware authorization immediately"
                        >
                          <Trash2 size={12} />
                          <span>{revokingDeviceId === d.id ? "Revoking..." : "Revoke Device"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 5: Commercial License */}
          {showSection("license") && (
            <div className="detail-section-card">
              <div className="detail-section-head">
                <div className="detail-section-title">
                  <ShieldCheck size={15} />
                  <span>Commercial License & Cryptographic Authority</span>
                </div>
                <StatusPill tone="green">Valid & Active</StatusPill>
              </div>

              <div className="license-display-card">
                <div>
                  <span style={{ fontSize: 10, color: "#064E3B", fontWeight: 800, letterSpacing: 0.5 }}>
                    COMMERCIAL LICENSE KEY
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#ffffff",
                      border: "1px solid #A7F3D0",
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 800,
                        fontSize: 13,
                        color: "#0f172a",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {license}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="input-addon-btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(license);
                          setCopiedLic(true);
                          setTimeout(() => setCopiedLic(false), 2000);
                        }}
                      >
                        {copiedLic ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedLic ? "Copied!" : "Copy Key"}</span>
                      </button>
                      <button
                        type="button"
                        className="input-addon-btn"
                        title="Regenerate license key"
                        onClick={() => setLicense(`lic_c_${Date.now()}`)}
                      >
                        <RefreshCcw size={12} /> Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="license-row-grid">
                  <label>
                    License Valid Until / Expiration
                    <div className="input-with-actions">
                      <input
                        type="text"
                        value={expires}
                        onChange={(e) => setExpires(e.target.value)}
                        placeholder="YYYY-MM-DD"
                      />
                      <div className="input-addon-btns">
                        <button
                          type="button"
                          className="input-addon-btn"
                          title="Add 1 Year"
                          onClick={() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() + 1);
                            setExpires(d.toISOString().split("T")[0]);
                          }}
                        >
                          <Calendar size={12} /> +1 Year
                        </button>
                      </div>
                    </div>
                  </label>

                  <div style={{ gridColumn: "1 / -1", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                      <label style={{ margin: 0, fontWeight: 700, fontSize: 12, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} style={{ color: "#047857" }} />
                        Offline Operation Lease Policy
                      </label>
                      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
                        <button
                          type="button"
                          onClick={() => setUseCustomOfflineLease(false)}
                          style={{
                            border: "none",
                            background: !useCustomOfflineLease ? "#ffffff" : "transparent",
                            color: !useCustomOfflineLease ? "#047857" : "#64748b",
                            fontWeight: !useCustomOfflineLease ? 700 : 500,
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 5,
                            cursor: "pointer",
                            boxShadow: !useCustomOfflineLease ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                          }}
                        >
                          Plan Default ({activeTier.offlineLease})
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseCustomOfflineLease(true)}
                          style={{
                            border: "none",
                            background: useCustomOfflineLease ? "#047857" : "transparent",
                            color: useCustomOfflineLease ? "#ffffff" : "#64748b",
                            fontWeight: useCustomOfflineLease ? 700 : 500,
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 5,
                            cursor: "pointer",
                            boxShadow: useCustomOfflineLease ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                          }}
                        >
                          Special Custom Override
                        </button>
                      </div>
                    </div>

                    {!useCustomOfflineLease ? (
                      <div style={{ fontSize: 12, color: "#475569", background: "#f8fafc", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        Applying standard <strong>{activeTier.name} Tier</strong> preset duration: <span style={{ color: "#047857", fontWeight: 700 }}>{activeTier.offlineLease}</span>. Hardware POS terminal may work disconnected from cloud up to this period before requiring a cryptographic heartbeat sync.
                      </div>
                    ) : (
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                          <div style={{ flex: "0 0 100px" }}>
                            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Duration</span>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={customOfflineValue}
                              onChange={(e) => setCustomOfflineValue(Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: "100%", padding: "6px 10px", fontSize: 13, fontWeight: 700, borderRadius: 6, border: "1px solid #cbd5e1" }}
                            />
                          </div>
                          <div style={{ flex: "0 0 130px" }}>
                            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Unit</span>
                            <select
                              value={customOfflineUnit}
                              onChange={(e) => setCustomOfflineUnit(e.target.value as "minutes" | "hours" | "days")}
                              style={{ width: "100%", padding: "6px 10px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "1px solid #cbd5e1" }}
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Active Override</span>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: 6, border: "1px solid #fde68a" }}>
                              {customOfflineValue} {customOfflineUnit} (Takes precedence over {activeTier.name} default)
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Quick Presets:</span>
                          {[
                            { val: 15, unit: "minutes" as const, label: "15 Minutes" },
                            { val: 30, unit: "minutes" as const, label: "30 Minutes" },
                            { val: 2, unit: "hours" as const, label: "2 Hours" },
                            { val: 48, unit: "hours" as const, label: "48 Hours" },
                            { val: 7, unit: "days" as const, label: "7 Days" },
                            { val: 15, unit: "days" as const, label: "15 Days" },
                          ].map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => {
                                setCustomOfflineValue(chip.val);
                                setCustomOfflineUnit(chip.unit);
                              }}
                              style={{
                                border: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "1px solid #047857" : "1px solid #e2e8f0",
                                background: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "#ecfdf5" : "#ffffff",
                                color: customOfflineValue === chip.val && customOfflineUnit === chip.unit ? "#047857" : "#475569",
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 12,
                                cursor: "pointer",
                              }}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 11,
                    color: "#475569",
                  }}
                >
                  <ShieldCheck size={16} style={{ color: "#047857", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>
                      Ed25519 Cryptographic Authority
                    </strong>
                    <span>
                      Hardware fingerprint bindings and offline leases are signed with the root Ed25519 private key.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Tenant Control & Danger Zone */}
          {onDelete && (
            <div className="danger-zone-card">
              <div className="danger-zone-info">
                <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
                <div>
                  <strong>Danger Zone: Permanent Tenant Deletion</strong>
                  <p>Permanently remove {name || company.name}, terminate all active desktop device leases, and purge tenant data.</p>
                </div>
              </div>
              <button
                type="button"
                className="secondary-btn btn-sm danger-btn-sm"
                onClick={() => onDelete(company)}
                title="Permanently delete this company"
                style={{ flexShrink: 0 }}
              >
                <Trash2 size={12} /> Delete Company
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="modal-actions" style={{ marginTop: 14 }}>
          <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="secondary-btn btn-sm"
              onClick={copyCompleteSummary}
              title="Copy complete company and credential summary"
            >
              <Copy size={12} />
              <span>{copiedCreds ? "Dossier Copied!" : "Copy Summary Dossier"}</span>
            </button>
            {onDelete && (
              <button
                type="button"
                className="secondary-btn btn-sm danger-btn-sm"
                onClick={() => onDelete(company)}
                title="Permanently delete this company and all its data"
              >
                <Trash2 size={12} /> Delete Company
              </button>
            )}
          </div>
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            disabled={
              !name.trim() ||
              !email.trim() ||
              seatsAllowed < 1 ||
              devicesAllowed < 1
            }
            onClick={handleSave}
          >
            <Save size={13} /> Save Company Details
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyCredentialsModal({
  company,
  close,
  save,
}: {
  company: Company;
  close: () => void;
  save: (creds: {
    superAdminUser: string;
    superAdminPassword: string;
    installationKey?: string;
  }) => void;
}) {
  const [user, setUser] = useState(company.superAdminUser || company.email);
  const [password, setPassword] = useState("");
  const [installationKey, setInstallationKey] = useState(
    company.installationKey || generateInstallationKey(),
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateNew = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 7; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];
    setPassword(`Shield!${pass}`);
  };

  const copyCreds = () => {
    const text = `Company: ${company.name}\nSuper Admin User: ${user}\nPassword: ${password}\nInstallation Key: ${installationKey}\nPortal: Client Portal & Desktop Setup`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">CLIENT AUTHENTICATION</span>
            <h2>Super Admin Credentials</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              {company.name} ({company.code})
            </p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <div className="notice-banner">
          <ShieldAlert size={16} />
          <div>
            <strong>Client Recovery & Desktop Installation Key</strong>
            <div>
              You can view, edit, or reset the Super Admin credentials and the
              10-character desktop Installation Key for this client. The client
              needs these to set up their desktop app and bind hardware.
            </div>
          </div>
        </div>

        <label>
          Super Admin Username / Email
          <div className="input-with-actions">
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="e.g. companyname@gmail.com or username"
            />
            <div className="input-addon-btns">
              <button
                type="button"
                className="input-addon-btn"
                title="Copy username"
                onClick={() => navigator.clipboard?.writeText(user)}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </label>

        <label>
          Super Admin Password
          <div className="input-with-actions">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or generate password"
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
                title="Generate new secure password"
                onClick={generateNew}
              >
                <RefreshCcw size={12} /> Generate
              </button>
            </div>
          </div>
        </label>

        <label>
          10-Character Installation Key (Format: XXX-XXX-XXXX)
          <div className="input-with-actions">
            <input
              value={installationKey}
              onChange={(e) => setInstallationKey(e.target.value.toUpperCase())}
              placeholder="XXX-XXX-XXXX"
              style={{
                fontFamily: "monospace",
                letterSpacing: "1.5px",
                fontWeight: "bold",
              }}
            />
            <div className="input-addon-btns">
              <button
                type="button"
                className="input-addon-btn"
                title="Copy Installation Key"
                onClick={() => {
                  navigator.clipboard?.writeText(installationKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
              >
                {copiedKey ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <button
                type="button"
                className="input-addon-btn"
                title="Generate new 10-character key"
                onClick={() => setInstallationKey(generateInstallationKey())}
              >
                <RefreshCcw size={12} /> Generate
              </button>
            </div>
          </div>
          <small
            className="muted"
            style={{ fontSize: 10, marginTop: 4, display: "block" }}
          >
            Required by user during desktop app setup to bind their device
            hardware to the license.
          </small>
        </label>

        <div className="cred-box">
          <div className="cred-row">
            <span className="muted" style={{ fontSize: 11 }}>
              Quick Share All
            </span>
            <button
              type="button"
              className="secondary-btn btn-sm"
              onClick={copyCreds}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied to Clipboard" : "Copy All Credentials & Key"}
            </button>
          </div>
          <small className="muted" style={{ fontSize: 10 }}>
            Share these credentials securely with the client's business owner.
          </small>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            disabled={!user.trim() || !password.trim()}
            onClick={() =>
              save({
                superAdminUser: user.trim(),
                superAdminPassword: password.trim(),
                installationKey: installationKey.trim().toUpperCase(),
              })
            }
          >
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteCompanyModal({
  company,
  close,
  confirm,
}: {
  company: Company;
  close: () => void;
  confirm: () => void;
}) {
  const [confirmCode, setConfirmCode] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed =
    (confirmCode.trim().toUpperCase() === company.code.toUpperCase() ||
      confirmCode.trim().toUpperCase() === "DELETE") &&
    acknowledged;

  const handleConfirm = () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    confirm();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{ color: "#ef4444" }}>
              PERMANENT DELETION
            </span>
            <h2 style={{ color: "#991b1b" }}>Delete Client Company</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              {company.name} ({company.code})
            </p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <div className="danger-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>
              Warning: This action is permanent and cannot be undone!
            </strong>
            <div style={{ marginTop: 2 }}>
              Deleting this tenant will completely erase all associated data
              from the Neon database:
            </div>
            <ul className="delete-impact-list">
              <li>Company account, licensing authority tokens, and policies</li>
              <li>
                <strong>
                  {company.devices.length} registered hardware device(s)
                </strong>{" "}
                and motherboard/BIOS bindings
              </li>
              <li>
                Super Admin credentials (
                <code>{company.superAdminUser || company.email}</code>)
              </li>
              {company.installationKey && (
                <li>
                  Installation Key (<code>{company.installationKey}</code>)
                </li>
              )}
              <li>All pending device authorization requests & OTPs</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            marginBottom: 14,
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Company:</span>
            <strong>{company.name}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Company Code:</span>
            <code style={{ fontWeight: 700, color: "#047857" }}>
              {company.code}
            </code>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Plan / Devices:</span>
            <span>
              {company.plan} ({company.devicesAllowed} device slots)
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Bound Devices:</span>
            <span
              style={{
                color: company.devices.length ? "#ef4444" : "#047857",
                fontWeight: 700,
              }}
            >
              {company.devices.length} physical machines
            </span>
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={{ width: "auto", margin: 0 }}
          />
          <span>
            I understand that this company and all its device activations will
            be destroyed immediately.
          </span>
        </label>

        <label>
          Type <strong>{company.code}</strong> or <strong>DELETE</strong> to
          confirm:
          <input
            type="text"
            placeholder={company.code}
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            style={{
              textTransform: "uppercase",
              fontFamily: "monospace",
              fontWeight: 700,
              borderColor: isConfirmed ? "#ef4444" : undefined,
              marginTop: 4,
            }}
          />
        </label>

        <div className="modal-actions" style={{ marginTop: 18 }}>
          <button
            className="secondary-btn"
            onClick={close}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="danger-solid-btn"
            disabled={!isConfirmed || isDeleting}
            onClick={handleConfirm}
          >
            <Trash2 size={13} />{" "}
            {isDeleting ? "Deleting..." : "Permanently Delete Company"}
          </button>
        </div>
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

function UserSettingsPage({
  company,
  onSaveCompany,
  notify,
}: {
  company: Company;
  onSaveCompany?: (updated: Partial<Company>) => void;
  notify: (s: string, t?: Toast["tone"]) => void;
}) {
  const [name, setName] = useState(company.name || "");
  const [email, setEmail] = useState(company.email || "");
  const [contactNo, setContactNo] = useState(
    company.contactNo || company.phone || "",
  );
  const [address, setAddress] = useState(company.address || "");
  const [superAdminUser, setSuperAdminUser] = useState(
    company.superAdminUser || company.email || "",
  );
  const [logo, setLogo] = useState(company.logo || "");
  const [showLogoUrl, setShowLogoUrl] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Keep state in sync if parent company object updates
  useEffect(() => {
    setName(company.name || "");
    setEmail(company.email || "");
    setContactNo(company.contactNo || company.phone || "");
    setAddress(company.address || "");
    setSuperAdminUser(company.superAdminUser || company.email || "");
    setLogo(company.logo || "");
  }, [
    company.id,
    company.name,
    company.email,
    company.contactNo,
    company.phone,
    company.address,
    company.superAdminUser,
    company.logo,
  ]);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify("Logo image size should be under 2MB", "warn");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
        notify("Logo uploaded. Click 'Save All Changes' to apply.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) return;
    setLogo(logoUrlInput.trim());
    setLogoUrlInput("");
    setShowLogoUrl(false);
    notify("Logo URL updated. Click 'Save All Changes' to apply.");
  };

  const generatePass = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p = "";
    for (let i = 0; i < 8; i++)
      p += chars[Math.floor(Math.random() * chars.length)];
    const pass = `Shield!${p}`;
    setNewPassword(pass);
    setConfirmPassword(pass);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await adminApi.changePassword({
        role: "client",
        companyId: company.id,
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(
        res.message || "Super Admin password updated successfully!",
      );
      notify(res.message || "Super Admin password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSaveCompany?.({ superAdminPassword: newPassword });
    } catch (apiErr: unknown) {
      setPasswordError(
        apiErr instanceof Error ? apiErr.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      notify("Legal company name is required", "warn");
      return;
    }
    if (!email.trim()) {
      notify("Legal Gmail / Email is required", "warn");
      return;
    }

    setIsSaving(true);
    const updates: Partial<Company> = {
      name: name.trim(),
      email: email.trim(),
      contactNo: contactNo.trim() || undefined,
      phone: contactNo.trim() || undefined,
      address: address.trim() || undefined,
      superAdminUser: superAdminUser.trim() || email.trim(),
      logo: logo.trim() || undefined,
    };

    try {
      await adminApi.updateCompany(company.id, updates);
      if (
        typeof window !== "undefined" &&
        window.ledgerShield?.writeLocalData
      ) {
        void window.ledgerShield.writeLocalData({
          version: 1,
          companyId: company.id,
          invoices: [],
          customers: [],
          products: [],
          updatedAt: new Date().toISOString(),
        });
      }
      onSaveCompany?.(updates);
      notify("All user & company details saved successfully!");
    } catch {
      onSaveCompany?.(updates);
      notify("Details updated locally (Neon API offline)", "warn");
    } finally {
      setIsSaving(false);
    }
  };

  const offlineLeaseHours = company.plan?.toLowerCase().includes("premium")
    ? "15 days"
    : company.plan?.toLowerCase().includes("plus")
      ? "7 days"
      : "48 hours";

  return (
    <div className="settings-page-wrapper">
      {/* Settings Header Banner */}
      <div className="settings-header-card">
        <div className="settings-header-left">
          <div className="settings-header-avatar">
            {logo ? (
              <img src={logo} alt={name} />
            ) : (
              <span>{(name || "CO").slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="settings-header-text">
            <span
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                fontWeight: 800,
                color: "#D1FAE5",
                textTransform: "uppercase",
              }}
            >
              TENANT PROFILE & USER SETTINGS
            </span>
            <h1>{name || "Your Company"}</h1>
            <p>
              Manage all details of your user profile, legal company identity,
              brand logo, and Super Admin security credentials.
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <span
            style={{
              background: "rgba(4, 120, 87,  0.2)",
              color: "#D1FAE5",
              border: "1px solid rgba(147, 197, 253, 0.3)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {company.plan || "Plus Monthly"}
          </span>
          <small style={{ color: "#94a3b8", fontSize: 10 }}>
            Tenant Code:{" "}
            <strong style={{ color: "#fff" }}>{company.code}</strong>
          </small>
        </div>
      </div>

      {/* 1. Company Brand Logo Card */}
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon">
              <ImageIcon size={20} />
            </div>
            <div className="settings-card-title">
              <strong>Company Brand Logo</strong>
              <small>
                Upload your official company brand logo for invoices and portal
                identity
              </small>
            </div>
          </div>
        </div>

        <div className="company-logo-uploader" style={{ margin: 0 }}>
          <div
            className={`logo-preview-box ${logo ? "has-logo" : ""}`}
            style={{ width: 72, height: 72, minWidth: 72 }}
          >
            {logo ? (
              <img
                src={logo}
                alt="Company logo preview"
                className="logo-preview-img"
              />
            ) : (
              <div className="logo-preview-placeholder">
                {name.trim() ? (
                  <span className="logo-initials" style={{ fontSize: 18 }}>
                    {name.trim().slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <ImageIcon size={26} />
                )}
              </div>
            )}
          </div>

          <div className="logo-uploader-content">
            <div className="logo-uploader-title">
              <strong>
                {logo ? "Active Brand Logo" : "No Brand Logo Uploaded"}
              </strong>
              <small>
                Recommended: Square PNG, SVG, or JPG under 2MB. Displayed on
                invoices and receipts.
              </small>
            </div>

            <div
              className="logo-uploader-actions"
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                style={{ display: "none" }}
                onChange={handleLogoFile}
              />
              <button
                type="button"
                className="logo-upload-btn"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={12} />{" "}
                {logo ? "Replace Logo" : "Upload Brand Logo"}
              </button>

              <button
                type="button"
                className="logo-url-btn"
                onClick={() => setShowLogoUrl(!showLogoUrl)}
              >
                {showLogoUrl ? "Hide URL Option" : "Paste Logo URL"}
              </button>

              {logo && (
                <button
                  type="button"
                  className="logo-remove-btn"
                  onClick={() => {
                    setLogo("");
                    notify(
                      "Logo removed. Click 'Save All Changes' to apply.",
                    );
                  }}
                >
                  <Trash2 size={12} /> Remove Logo
                </button>
              )}
            </div>

            {showLogoUrl && (
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    fontSize: 12,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                  }}
                />
                <button
                  type="button"
                  className="primary-btn btn-sm"
                  onClick={handleApplyLogoUrl}
                >
                  Apply URL
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Legal Business Information & User Details */}
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon emerald">
              <Building2 size={20} />
            </div>
            <div className="settings-card-title">
              <strong>Legal Business Details & User Profile</strong>
              <small>
                Official registered contact information and billing profile
              </small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="settings-form-grid">
            {/* Legal Company Name */}
            <div className="settings-form-group">
              <label>
                <Building2 size={13} style={{ color: "#047857" }} />
                Legal Company Name *
              </label>
              <div className="settings-input-wrap">
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Gulf Technologies LLC"
                />
              </div>
            </div>

            {/* Super Admin Username */}
            <div className="settings-form-group">
              <label>
                <UserRound size={13} style={{ color: "#047857" }} />
                Super Admin Username / Login ID *
              </label>
              <div className="settings-input-wrap">
                <input
                  required
                  type="text"
                  value={superAdminUser}
                  onChange={(e) => setSuperAdminUser(e.target.value)}
                  placeholder="e.g. admin or billing@company.com"
                />
              </div>
            </div>

            {/* Legal Contact No */}
            <div className="settings-form-group">
              <label>
                <Phone size={13} style={{ color: "#047857" }} />
                Legal Contact No.
              </label>
              <div className="settings-input-wrap">
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder="e.g. +971 4 234 5678 / +971 50 123 4567"
                />
              </div>
            </div>

            {/* Legal Gmail / Email */}
            <div className="settings-form-group">
              <label>
                <Mail size={13} style={{ color: "#ef4444" }} />
                Legal Gmail / Email *
              </label>
              <div className="settings-input-wrap">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. official@company.com or yourgmail@gmail.com"
                />
              </div>
            </div>

            {/* Legal Address */}
            <div className="settings-form-group full-width">
              <label>
                <MapPin size={13} style={{ color: "#f59e0b" }} />
                Legal Address
              </label>
              <div className="settings-input-wrap">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Office 504, Al Moosa Tower 1, Sheikh Zayed Road, Dubai, UAE"
                />
              </div>
            </div>

            {/* Tenant Code */}
            <div className="settings-form-group full-width">
              <label>
                <KeyRound size={13} style={{ color: "#64748b" }} />
                System Tenant Identifier (Read-only)
              </label>
              <div className="settings-key-display">
                <span className="settings-key-text">{company.code}</span>
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(company.code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* 3. Account Security & Password Change */}
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon violet">
              <KeyRound size={20} />
            </div>
            <div className="settings-card-title">
              <strong>Super Admin Security & Password</strong>
              <small>
                Change your Super Admin account password for client portal &
                desktop sync
              </small>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="settings-form-grid">
            <div className="settings-form-group full-width">
              <label>Current Super Admin Password</label>
              <div className="input-with-actions">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to verify"
                />
                <div className="input-addon-btns">
                  <button
                    type="button"
                    className="input-addon-btn"
                    title={showCurrent ? "Hide" : "Show"}
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-form-group">
              <label>New Password (min. 6 characters)</label>
              <div className="input-with-actions">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                />
                <div className="input-addon-btns">
                  <button
                    type="button"
                    className="input-addon-btn"
                    title={showNew ? "Hide" : "Show"}
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    className="input-addon-btn"
                    title="Generate secure password"
                    onClick={generatePass}
                  >
                    <RefreshCcw size={13} /> Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-form-group">
              <label>Confirm New Password</label>
              <div className="settings-input-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {passwordError && (
              <div
                className="login-error full-width"
                style={{ gridColumn: "1 / -1", marginTop: 4 }}
              >
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#ECFDF5",
                  color: "#065f46",
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                <Check size={14} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 6,
              }}
            >
              <button
                type="submit"
                className="secondary-btn"
                disabled={
                  isChangingPassword || !currentPassword || !newPassword
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <KeyRound size={13} />
                {isChangingPassword
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 4. Desktop Installation Key Card */}
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-head-left">
            <div className="settings-card-icon amber">
              <Laptop size={20} />
            </div>
            <div className="settings-card-title">
              <strong>
                Desktop Installation & Machine Authorization Key
              </strong>
              <small>
                Use this 10-character key to authorize new Windows computers
                running Invoice Desktop
              </small>
            </div>
          </div>
        </div>

        <div className="settings-key-display">
          <div>
            <span
              style={{
                fontSize: 10,
                color: "#64748b",
                display: "block",
                marginBottom: 2,
              }}
            >
              INSTALLATION KEY (FORMAT: XXX-XXX-XXXX)
            </span>
            <span className="settings-key-text">
              {company.installationKey || "NOT-ISSUED"}
            </span>
          </div>
          <button
            type="button"
            className="secondary-btn btn-sm"
            onClick={() => {
              if (company.installationKey) {
                navigator.clipboard?.writeText(company.installationKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }
            }}
          >
            {copiedKey ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedKey ? "Key Copied!" : "Copy Installation Key"}</span>
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <small style={{ color: "#64748b", fontSize: 10 }}>
              Active Subscription Plan
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 13,
                marginTop: 2,
                color: "#0f172a",
              }}
            >
              {company.plan}
            </strong>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <small style={{ color: "#64748b", fontSize: 10 }}>
              Authorized Hardware Devices
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 13,
                marginTop: 2,
                color: "#0f172a",
              }}
            >
              {company.devices?.length || 0} / {company.devicesAllowed || 1}{" "}
              devices
            </strong>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <small style={{ color: "#64748b", fontSize: 10 }}>
              Offline Lease Window
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 13,
                marginTop: 2,
                color: "#0f172a",
              }}
            >
              Up to {offlineLeaseHours} offline
            </strong>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Actions Bar */}
      <div className="settings-actions-bar">
        <div className="settings-status-note">
          <Check size={14} style={{ color: "#047857" }} />
          <span>
            Edits update your <b>Legal Invoices</b>, <b>Client Portal</b>, and{" "}
            <b>Desktop App</b>.
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setName(company.name || "");
              setEmail(company.email || "");
              setContactNo(company.contactNo || company.phone || "");
              setAddress(company.address || "");
              setSuperAdminUser(company.superAdminUser || company.email || "");
              setLogo(company.logo || "");
              notify("Settings reverted to saved state");
            }}
            disabled={isSaving}
          >
            Discard Edits
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => handleSaveProfile()}
            disabled={isSaving || !name.trim() || !email.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minWidth: 150,
              justifyContent: "center",
            }}
          >
            <Save size={14} />
            {isSaving ? "Saving All Details..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientPortal({
  page,
  setPage,
  company,
  setCompanies,
  requests: _requests,
  securityEvents: _securityEvents = [],
  setRequests,
  notify,
  logout,
}: {
  page: string;
  setPage: (page: string) => void;
  company: Company;
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  requests?: DeviceRequest[];
  securityEvents?: SecurityEvent[];
  setRequests: React.Dispatch<React.SetStateAction<DeviceRequest[]>>;
  notify: (s: string, t?: Toast["tone"]) => void;
  logout: () => void;
}) {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const nav = [
    ["overview", <LayoutDashboard />, "Overview"],
    ["devices", <Laptop />, "Devices"],
    ["sessions", <Activity />, "Sessions"],
    ["templates", <ReceiptText />, "Templates"],
    ["security", <ShieldAlert />, "Security"],
    ["settings", <Settings />, "Settings"],
  ];
  const latestDevice =
    company.devices.find((d) => d.live) ?? company.devices[0];

  const handleAddDevice = (deviceData: {
    name: string;
    assignedUser: string;
    os: string;
    serialNumber: string;
    fingerprint: string;
  }) => {
    if (company.devices.length >= company.devicesAllowed) {
      notify(
        `Device limit reached (${company.devicesAllowed} allowed)`,
        "warn",
      );
      return;
    }
    const tempId = `d_${Date.now()}`;
    const newDev: Device = {
      id: tempId,
      name: deviceData.name,
      os: deviceData.os || "Windows 11 Pro 64-bit",
      user: deviceData.assignedUser,
      fingerprint: deviceData.fingerprint,
      serialNumber: deviceData.serialNumber,
      activated: new Date().toLocaleDateString(),
      lastSeen: "Just added",
      leaseHours: 72,
      status: "active",
      live: true,
    };
    setCompanies?.((all) =>
      all.map((c) =>
        c.id === company.id ? { ...c, devices: [...c.devices, newDev] } : c,
      ),
    );
    setShowAddDevice(false);
    void adminApi
      .addClientDevice(company.id, deviceData)
      .then((res) => {
        if (res.device?.id && res.device.id !== tempId) {
          setCompanies?.((all) =>
            all.map((c) =>
              c.id === company.id
                ? {
                  ...c,
                  devices: c.devices.map((d) =>
                    d.id === tempId ? { ...d, id: String(res.device.id) } : d,
                  ),
                }
                : c,
            ),
          );
        }
        notify(
          `Device "${deviceData.name}" authorized & added · saved to Neon`,
        );
      })
      .catch((err) => {
        notify(
          `Device added locally, Neon error: ${err?.message || "offline"}`,
          "warn",
        );
      });
  };

  const handleDeleteDevice = (device: Device) => {
    setCompanies?.((all) =>
      all.map((c) =>
        c.id === company.id
          ? { ...c, devices: c.devices.filter((d) => d.id !== device.id) }
          : c,
      ),
    );
    setDeletingDevice(null);
    // Broadcast device removal so connected desktop app logs out automatically
    broadcastDeviceRevoked({
      companyId: company.id,
      deviceId: device.id,
      fingerprint: device.fingerprint,
    });
    void adminApi
      .deleteClientDevice(company.id, device.id)
      .then(() => {
        notify(
          `Device "${device.name}" removed · hardware binding revoked in Neon`,
        );
      })
      .catch((err) => {
        notify(
          `Removed locally, Neon error: ${err?.message || "offline"}`,
          "warn",
        );
      });
  };

  return (
    <div className="client-shell">
      <aside className="client-sidebar">
        <Logo />
        <div className="tenant-card">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              style={{
                width: 30,
                height: 30,
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
            <strong>{company.name}</strong>
            <small>{company.plan}</small>
          </div>
          <ChevronDown />
        </div>
        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              className={page === id ? "active" : ""}
              onClick={() => setPage(String(id))}
              key={String(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
        <div className="client-help">
          <LifeBuoy />
          <strong>Need a hand?</strong>
          <p>Contact your software administrator.</p>
          <button onClick={() => setShowSupport(true)}>Get support</button>
        </div>
        <button className="logout" onClick={logout}>
          <LogOut /> Sign out
        </button>
      </aside>
      <main className="client-main">
        <header className="client-top">
          <div>
            <span className="eyebrow">CLIENT PORTAL</span>
            <h1>
              {page === "overview"
                ? "License overview"
                : page === "settings"
                  ? "User & Company Settings"
                  : page.replace(/^./, (m) => m.toUpperCase())}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="icon-btn">
              <Bell />
            </button>
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "contain",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: 2,
                  cursor: "pointer",
                }}
                onClick={() => setPage("settings")}
                title="Manage User & Company Settings"
              />
            ) : (
              <span
                className="user-avatar"
                onClick={() => setPage("settings")}
                style={{ cursor: "pointer" }}
                title="Manage User & Company Settings"
              >
                {company.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div
              className="user-copy"
              onClick={() => setPage("settings")}
              style={{ cursor: "pointer" }}
              title="Manage User & Company Settings"
            >
              <b>{company.superAdminUser || company.email}</b>
              <small>Super Admin account</small>
            </div>
            <button
              className={`secondary-btn btn-sm ${page === "settings" ? "active" : ""}`}
              onClick={() => setPage("settings")}
              title="Manage User & Company Settings"
              style={{
                marginLeft: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Settings size={13} /> Settings
            </button>
          </div>
        </header>
        {page === "overview" && (
          <>
            <div className="license-banner">
              <div className="shield-orb">
                <ShieldCheck />
              </div>
              <div>
                <span className="eyebrow">LICENSE STATUS</span>
                <h2>
                  {company.status === "active"
                    ? "Active and verified"
                    : company.status}
                </h2>
                <p>
                  Your company is cleared to use BillionDue on authorized
                  devices.
                </p>
              </div>
              <div className="lease-stat">
                <span>Subscription valid until</span>
                <strong>{company.expires}</strong>
              </div>
              <div className="lease-stat">
                <span>Offline access</span>
                <strong>
                  Up to{" "}
                  {company.plan?.toLowerCase().includes("premium")
                    ? "15 days"
                    : company.plan?.toLowerCase().includes("plus")
                      ? "7 days"
                      : "48 hours"}
                </strong>
                <small>Refreshes while online</small>
              </div>
            </div>
            <div className="client-metrics">
              <div>
                <Laptop />
                <span>
                  <small>Authorized devices</small>
                  <strong>
                    {company.devices.length} <em>/ {company.devicesAllowed}</em>
                  </strong>
                  <progress
                    max={company.devicesAllowed}
                    value={company.devices.length}
                  />
                </span>
              </div>
              <div>
                <Clock3 />
                <span>
                  <small>Latest desktop seen</small>
                  <strong>
                    {latestDevice?.lastSeen ?? "No device verification"}
                  </strong>
                  {latestDevice?.live && (
                    <em className="online-label">
                      <i /> online now
                    </em>
                  )}
                </span>
              </div>
            </div>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Authorized devices</h2>
                  <p>Only these computers can run your desktop app.</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="primary-btn"
                    onClick={() => setShowAddDevice(true)}
                    disabled={company.devices.length >= company.devicesAllowed}
                    title={
                      company.devices.length >= company.devicesAllowed
                        ? "Device slot limit reached"
                        : "Authorize a new computer"
                    }
                  >
                    <Plus size={14} /> Add device
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => setShowRequest(true)}
                  >
                    Request replacement
                  </button>
                </div>
              </div>
              <DeviceTable
                company={company}
                onDeleteDevice={(d) => setDeletingDevice(d)}
              />
            </section>
            <div className="client-bottom-grid">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>
                      What “
                      {company.plan?.toLowerCase().includes("premium")
                        ? "15 days"
                        : company.plan?.toLowerCase().includes("plus")
                          ? "7 days"
                          : "48 hours"}
                      ” means
                    </h2>
                    <p>Your offline access window</p>
                  </div>
                  <CloudOff />
                </div>
                <div className="timeline">
                  <div className="timeline-line">
                    <i
                      style={{
                        width: latestDevice
                          ? `${Math.min(
                            100,
                            (latestDevice.leaseHours /
                              (company.plan?.toLowerCase().includes("premium")
                                ? 360
                                : company.plan?.toLowerCase().includes("plus")
                                  ? 168
                                  : 48)) *
                            100,
                          )}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="timeline-labels">
                    <span>
                      <b>Verified</b>
                      <small>
                        {latestDevice?.lastSeen ?? "Not yet verified"}
                      </small>
                    </span>
                    <span>
                      <b>Offline use</b>
                      <small>Works normally</small>
                    </span>
                    <span>
                      <b>Hard lock</b>
                      <small>After the signed lease expires</small>
                    </span>
                  </div>
                </div>
                <p className="info-copy">
                  Each online check refreshes a signed{" "}
                  {company.plan?.toLowerCase().includes("premium")
                    ? "15-day"
                    : company.plan?.toLowerCase().includes("plus")
                      ? "7-day"
                      : "48-hour"}{" "}
                  lease. If a computer stays offline beyond it, invoicing locks
                  until that same authorized device reconnects.
                </p>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Recent security</h2>
                    <p>Access attempts for your company</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setPage("security")}
                  >
                    View all
                  </button>
                </div>
                <EmptyRows text="No security events returned for this company" />
              </section>
            </div>
          </>
        )}
        {page === "devices" && (
          <section className="panel page-panel">
            <div className="panel-head">
              <div>
                <h2>Your devices</h2>
                <p>
                  {company.devices.length} of {company.devicesAllowed} slots are
                  currently in use.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="primary-btn"
                  onClick={() => setShowAddDevice(true)}
                  disabled={company.devices.length >= company.devicesAllowed}
                  title={
                    company.devices.length >= company.devicesAllowed
                      ? "Device slot limit reached"
                      : "Authorize a new computer"
                  }
                >
                  <Plus size={14} /> Add device
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setShowRequest(true)}
                >
                  Request replacement
                </button>
              </div>
            </div>
            <DeviceTable
              company={company}
              onDeleteDevice={(d) => setDeletingDevice(d)}
              detailed
            />
            {company.devices.length >= company.devicesAllowed && (
              <div className="device-full-note">
                <ShieldAlert />
                <div>
                  <b>Your device limit is full.</b>
                  <p>
                    You can delete an unused machine above or request a
                    replacement.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
        {page === "sessions" && <SessionsView company={company} />}{" "}
        {page === "templates" && (
          <ClientTemplates templates={company.templates} notify={notify} />
        )}{" "}
        {page === "security" && <ClientSecurity companyName={company.name} />}
        {page === "settings" && (
          <UserSettingsPage
            company={company}
            onSaveCompany={(updated) => {
              setCompanies?.((all) =>
                all.map((c) => (c.id === company.id ? { ...c, ...updated } : c)),
              );
            }}
            notify={notify}
          />
        )}
      </main>
      {showAddDevice && (
        <AddDeviceModal
          company={company}
          close={() => setShowAddDevice(false)}
          save={handleAddDevice}
        />
      )}
      {deletingDevice && (
        <DeleteDeviceModal
          device={deletingDevice}
          company={company}
          close={() => setDeletingDevice(null)}
          confirm={() => handleDeleteDevice(deletingDevice)}
        />
      )}
      {showRequest && (
        <DeviceRequestModal
          company={company}
          close={() => setShowRequest(false)}
          save={(r) => {
            setRequests((all) => [...all, r]);
            setShowRequest(false);
            void adminApi
              .createDeviceRequest(r)
              .then(() =>
                notify("Device replacement request saved to Neon for approval"),
              )
              .catch(() =>
                notify(
                  "Request kept locally because Neon API is offline",
                  "warn",
                ),
              );
          }}
        />
      )}
      {showSupport && (
        <SupportModal
          close={() => setShowSupport(false)}
          submit={() => {
            setShowSupport(false);
            notify("Support request sent to software admin");
          }}
        />
      )}
      {showChangePassword && (
        <ClientChangePasswordModal
          company={company}
          setCompanies={setCompanies}
          notify={notify}
          close={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}

function AddDeviceModal({
  company,
  close,
  save,
}: {
  company: Company;
  close: () => void;
  save: (data: {
    name: string;
    assignedUser: string;
    os: string;
    serialNumber: string;
    fingerprint: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [assignedUser, setAssignedUser] = useState(
    company.superAdminUser || company.email || "",
  );
  const [os, setOs] = useState("Windows 11 Pro 64-bit");
  const [serialNumber, setSerialNumber] = useState(() => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const pick = (n: number) =>
      Array.from(
        { length: n },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    return `SN-WIN-${pick(4)}-${pick(4)}`;
  });
  const [fingerprint, setFingerprint] = useState(() => {
    const hex = "0123456789abcdef";
    const pick = (n: number) =>
      Array.from(
        { length: n },
        () => hex[Math.floor(Math.random() * hex.length)],
      ).join("");
    return `fp:win-${pick(12)}`;
  });

  const generateNewHardwareId = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const pick = (n: number) =>
      Array.from(
        { length: n },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    setSerialNumber(`SN-WIN-${pick(4)}-${pick(4)}`);
    const hex = "0123456789abcdef";
    setFingerprint(
      `fp:win-${Array.from({ length: 12 }, () => hex[Math.floor(Math.random() * hex.length)]).join("")}`,
    );
  };

  const isFull = company.devices.length >= company.devicesAllowed;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">HARDWARE REGISTRATION</span>
            <h2>Authorize New Device</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              {company.name} · {company.devices.length} of{" "}
              {company.devicesAllowed} slots in use
            </p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        {isFull ? (
          <div className="danger-banner">
            <AlertTriangle size={18} />
            <div>
              <strong>
                Device limit reached ({company.devicesAllowed}/
                {company.devicesAllowed})
              </strong>
              <div>
                Your plan allows up to {company.devicesAllowed} authorized
                machines. Please delete an inactive device first or contact
                software administration to expand your license.
              </div>
            </div>
          </div>
        ) : (
          <div className="notice-banner">
            <Laptop size={16} />
            <div>
              <strong>Pre-Authorize Computer Access</strong>
              <div>
                Authorize an active physical machine for {company.name}. The
                computer will be immediately authorized in your license pool and
                can activate using your company's Installation Key (
                <code>{company.installationKey || company.code}</code>).
              </div>
            </div>
          </div>
        )}

        <label>
          Device Friendly Name
          <input
            type="text"
            placeholder="e.g. Accounting-PC-01, Billing-Desk-2, FrontDesk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isFull}
          />
        </label>

        <label>
          Assigned User / Operator
          <input
            type="text"
            placeholder="e.g. Sarah Jenkins, Chief Accountant"
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
            disabled={isFull}
          />
        </label>

        <label>
          Operating System
          <select
            value={os}
            onChange={(e) => setOs(e.target.value)}
            disabled={isFull}
          >
            <option value="Windows 11 Pro 64-bit">Windows 11 Pro 64-bit</option>
            <option value="Windows 11 Home 64-bit">
              Windows 11 Home 64-bit
            </option>
            <option value="Windows 10 Pro 64-bit">Windows 10 Pro 64-bit</option>
            <option value="Windows 10 Home 64-bit">
              Windows 10 Home 64-bit
            </option>
            <option value="macOS Sequoia / Sonoma">
              macOS Sequoia / Sonoma
            </option>
            <option value="Ubuntu Linux 24.04 LTS">
              Ubuntu Linux 24.04 LTS
            </option>
          </select>
        </label>

        <label>
          Hardware Serial / Machine Identifier
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              disabled={isFull}
            />
            <button
              type="button"
              className="secondary-btn btn-sm"
              title="Generate new hardware identifier"
              onClick={generateNewHardwareId}
              disabled={isFull}
            >
              <RefreshCcw size={12} />
            </button>
          </div>
          <small className="muted" style={{ fontSize: 10, marginTop: 3 }}>
            Motherboard / BIOS serial or unique hardware token to bind.
          </small>
        </label>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            disabled={isFull || !name.trim() || !assignedUser.trim()}
            onClick={() =>
              save({
                name: name.trim(),
                assignedUser: assignedUser.trim(),
                os,
                serialNumber: serialNumber.trim(),
                fingerprint: fingerprint.trim(),
              })
            }
          >
            <Plus size={14} /> Authorize & Add Device
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteDeviceModal({
  device,
  company,
  close,
  confirm,
}: {
  device: Device;
  company: Company;
  close: () => void;
  confirm: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{ color: "#ef4444" }}>
              REVOKE ACCESS
            </span>
            <h2 style={{ color: "#991b1b" }}>Delete Active Device</h2>
            <p className="muted" style={{ fontSize: 11, margin: "2px 0 0" }}>
              {device.name} · {company.name}
            </p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <div className="danger-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Are you sure you want to delete this device?</strong>
            <div style={{ marginTop: 2 }}>
              Deleting this device will immediately revoke its active license
              lease. Any desktop app running on this machine will lose
              authorization.
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            marginBottom: 14,
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Device Name:</span>
            <strong>{device.name}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Assigned User:</span>
            <span>{device.user}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Operating System:</span>
            <span>{device.os}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Hardware ID / Serial:</span>
            <code style={{ fontWeight: 700, color: "#047857" }}>
              {device.serialNumber || device.fingerprint}
            </code>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Status:</span>
            <StatusPill tone={device.status === "active" ? "green" : "red"}>
              {device.status}
            </StatusPill>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 16px" }}>
          This will free up 1 device slot (now {company.devices.length - 1} of{" "}
          {company.devicesAllowed} slots in use).
        </p>

        <div className="modal-actions">
          <button
            className="secondary-btn"
            onClick={close}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="danger-solid-btn"
            disabled={isDeleting}
            onClick={() => {
              setIsDeleting(true);
              confirm();
            }}
          >
            <Trash2 size={13} />{" "}
            {isDeleting ? "Revoking..." : "Revoke & Delete Device"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeviceTable({
  company,
  onDeleteDevice,
  detailed = false,
}: {
  company: Company;
  onDeleteDevice?: (device: Device) => void;
  detailed?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Assigned user</th>
            <th>Activated</th>
            <th>Last verification</th>
            {detailed && <th>Lease</th>}
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!company.devices.length && (
            <tr>
              <td colSpan={detailed ? 7 : 6}>
                <EmptyRows text="No active devices registered for this company" />
              </td>
            </tr>
          )}
          {company.devices.map((d) => (
            <tr key={d.id}>
              <td>
                <div className="device-cell">
                  <span>
                    <Laptop />
                  </span>
                  <div>
                    <strong>{d.name}</strong>
                    <small>
                      {d.os} · {d.serialNumber || d.fingerprint}
                    </small>
                  </div>
                </div>
              </td>
              <td>{d.user}</td>
              <td>{d.activated}</td>
              <td>
                <span className={d.live ? "live-time" : ""}>
                  {d.live && <i />}
                  {d.lastSeen}
                </span>
              </td>
              {detailed && (
                <td>
                  <div className="mini-lease">
                    <span>{d.leaseHours.toFixed(1)}h</span>
                    <progress max="72" value={d.leaseHours} />
                  </div>
                </td>
              )}
              <td>
                <StatusPill tone={d.status === "active" ? "green" : "red"}>
                  {d.status}
                </StatusPill>
              </td>
              <td style={{ textAlign: "right" }}>
                {onDeleteDevice && (
                  <button
                    className="secondary-btn btn-sm danger-btn-sm"
                    title={`Delete and revoke device ${d.name}`}
                    onClick={() => onDeleteDevice(d)}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionsView({ company }: { company: Company }) {
  return (
    <div className="session-grid">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Web sessions</h2>
            <p>Active client portal sessions</p>
          </div>
        </div>
        <EmptyRows text="No web session records returned by Neon" />
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Desktop last seen</h2>
            <p>Connectivity, not inferred presence</p>
          </div>
        </div>
        {!company.devices.length && (
          <EmptyRows text="No desktop devices found in Neon" />
        )}
        {company.devices.map((d) => (
          <div className="session-row" key={d.id}>
            <span className={`session-icon ${d.live ? "online" : "offline"}`}>
              {d.live ? <Wifi /> : <WifiOff />}
            </span>
            <div>
              <strong>{d.name}</strong>
              <small>
                {d.live ? "Online now" : `Last connected ${d.lastSeen}`}
              </small>
            </div>
            <StatusPill tone={d.live ? "green" : "slate"}>
              {d.live ? "Live" : "Offline"}
            </StatusPill>
          </div>
        ))}
        <div className="honesty-note">
          <Activity />
          <p>
            Offline desktop devices are never labeled live. “Last seen” is the
            last successful server contact.
          </p>
        </div>
      </section>
    </div>
  );
}

function ClientTemplates({
  templates: _templates,
  notify: _notify,
}: {
  templates?: string[];
  notify?: (s: string) => void;
}) {
  const [selectedPreview, setSelectedPreview] = useState<InvoiceTemplateItem | null>(null);

  const assignedList = _templates || ["Default Invoice"];
  const displayList = INVOICE_TEMPLATES.filter((t) => {
    if (t.isDefault || t.id === "default_invoice" || t.name === "Default Invoice") {
      return true;
    }
    return assignedList.some(
      (a) =>
        a.toLowerCase() === t.name.toLowerCase() ||
        a.toLowerCase() === t.id.toLowerCase(),
    );
  });

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <div>
          <h2>Assigned invoice templates</h2>
          <p>
            Approved layouts available inside your desktop POS and client portal.
          </p>
        </div>
        <span className="count-pill">
          {displayList.length} Layouts Available
        </span>
      </div>
      <div className="template-grid">
        {displayList.map((t) => {
          const isDefault = t.id === "default_invoice" || t.isDefault;
          return (
            <div className="template-card" key={t.id}>
              <div
                className="template-card-preview"
                onClick={() => setSelectedPreview(t)}
              >
                <img
                  src={t.previewImage}
                  alt={t.name}
                  className="template-card-img"
                />
                <span className={`template-card-badge ${isDefault ? "default-badge" : ""}`}>
                  {isDefault && <Star size={10} fill="#064E3B " color="#064E3B " />}
                  {t.badge}
                </span>
                <div className="template-preview-overlay-btn">
                  <span>
                    <Eye size={13} /> View Layout
                  </span>
                </div>
              </div>
              <div className="template-meta">
                <div className="template-meta-top">
                  <strong>{t.name}</strong>
                  {isDefault ? (
                    <StatusPill tone="blue">Main Default</StatusPill>
                  ) : (
                    <StatusPill tone="green">Ready</StatusPill>
                  )}
                </div>
                <p>{t.description}</p>
                <div className="template-meta-actions">
                  <span
                    className={isDefault ? "template-default-pill" : "template-assigned-count"}
                    style={isDefault ? {} : { color: "#047857", fontWeight: 700 }}
                  >
                    <Check size={12} /> {isDefault ? "Universal • Available to All Users" : "Active in Desktop App"}
                  </span>
                  <button
                    className={isDefault ? "primary-btn" : "secondary-btn"}
                    style={{ padding: "5px 10px", fontSize: 10 }}
                    onClick={() => setSelectedPreview(t)}
                  >
                    <Eye size={11} /> {isDefault ? "Default View" : "Sample View"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPreview && (
        <div className="modal-backdrop">
          <div className="template-modal-shell">
            <div className="preview-toolbar">
              <div>
                <button onClick={() => setSelectedPreview(null)}>
                  <X />
                </button>
                <span>
                  <b>{selectedPreview.name}</b>
                  <small>
                    {selectedPreview.category} · Client Print Preview
                  </small>
                </span>
              </div>
              <button
                className="primary-btn"
                onClick={() => {
                  const iframe = document.getElementById(
                    "client-template-frame",
                  ) as HTMLIFrameElement;
                  iframe?.contentWindow?.print();
                }}
              >
                <Printer size={13} /> Print
              </button>
            </div>
            <iframe
              id="client-template-frame"
              className="template-iframe-container"
              srcDoc={populateInvoiceTemplate(selectedPreview.id, {
                companyName: "Your Company",
                companyEmail: "info@company.com",
                companyPhone: "+971 00 000 0000",
                companyAddress: "Downtown Business Tower, Dubai, UAE",
                invoiceId: "INV-0001",
                customerName: "Sample Client Co.",
                customerEmail: "accounts@sampleclient.com",
                issueDate: new Date().toLocaleDateString(),
                dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
                subtotal: 4200,
                tax: 210,
                total: 4410,
              })}
              title={selectedPreview.name}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ClientSecurity({ companyName }: { companyName: string }) {
  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <div>
          <h2>Unauthorized-device attempts</h2>
          <p>Security events visible only for {companyName}.</p>
        </div>
      </div>
      <EmptyRows text="No security events returned by Neon" />
      <div className="client-security-explain">
        <ShieldCheck />
        <div>
          <h3>Your invoice data remained local</h3>
          <p>
            The unrecognized installation received no signed lease. If an
            unauthorized copy never connects, the server cannot see it; the
            desktop queues a tamper-evident event and uploads it on the next
            successful connection.
          </p>
        </div>
      </div>
    </section>
  );
}

function DeviceRequestModal({
  company,
  close,
  save,
}: {
  company: Company;
  close: () => void;
  save: (r: DeviceRequest) => void;
}) {
  const [replace, setReplace] = useState(
    company.devices[2]?.id ?? company.devices[0]?.id,
  );
  const [deviceName, setDeviceName] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [userName, setUserName] = useState("");
  return (
    <div className="modal-backdrop">
      <div className="modal wide">
        <div className="modal-head">
          <div>
            <span className="eyebrow">NEW DEVICE VERIFICATION</span>
            <h2>Request a replacement</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <div className="limit-summary">
          <Laptop />
          <div>
            <b>
              {company.devices.length} of {company.devicesAllowed} device slots
              in use
            </b>
            <p>
              Choose the computer to deactivate if your request is approved.
            </p>
          </div>
        </div>
        <label>
          New device name
          <input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </label>
        <label>
          Detected fingerprint
          <input
            value={fingerprint}
            onChange={(e) => setFingerprint(e.target.value)}
          />
        </label>
        <label>
          Requesting user
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <label>
          Replace this device
          <select value={replace} onChange={(e) => setReplace(e.target.value)}>
            {company.devices.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name} — {d.user}
              </option>
            ))}
          </select>
        </label>
        <div className="request-payload">
          <b>Request includes</b>
          <span>
            Company · user · license · fingerprint · existing devices · app
            version · attempt time
          </span>
        </div>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={() =>
              save({
                id: `REQ-${Math.floor(Math.random() * 9000 + 1000)}`,
                companyId: company.id,
                company: company.name,
                user: userName,
                license: company.license,
                deviceName,
                fingerprint,
                appVersion: "",
                attemptTime: new Date().toLocaleString(),
                replaceDeviceId: replace,
                status: "pending",
              })
            }
          >
            <Send /> Send request
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportModal({
  close,
  submit,
}: {
  close: () => void;
  submit: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">CONTACT ADMIN</span>
            <h2>How can we help?</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <label>
          Topic
          <select>
            <option>Device reset or replacement</option>
            <option>License access</option>
            <option>Invoice template</option>
          </select>
        </label>
        <label>
          Message
          <textarea rows={4} defaultValue="" />
        </label>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          <button className="primary-btn" onClick={submit}>
            <Send /> Send support request
          </button>
        </div>
      </div>
    </div>
  );
}