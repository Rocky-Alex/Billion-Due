import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Laptop,
  Globe,
  Palette,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Lock,
  Workflow,
  Zap,
  Award,
  Users,
  Monitor,
  Check,
  ChevronRight,
  Download,
  Star,
  Terminal,
  Cpu,
  Building2,
  X,
  Send,
  ReceiptText,
  FileCheck,
  Server,
  Smartphone,
} from "lucide-react";
import { windowsInstallerUrl } from "@billiondue/shared";

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenPortalLogin: (role?: "admin" | "client") => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

type CategoryType = "webapp" | "software" | "website" | "uiux";

export function LandingPage({
  onLaunchApp,
  onOpenPortalLogin,
  notify,
}: LandingPageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("webapp");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    service: "Web App Development",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.email) {
      if (notify) notify("Please provide your name and email.", "warn");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsInquiryOpen(false);
      setInquiryData({
        name: "",
        email: "",
        service: "Web App Development",
        message: "",
      });
      if (notify) {
        notify(
          "Thank you! Team BC Dev has received your request and will contact you shortly.",
          "ok"
        );
      }
    }, 800);
  };

  const categories = [
    {
      id: "webapp" as CategoryType,
      title: "This Web App",
      badge: "Flagship Product",
      tagline: "BillionDue Invoicing & Licensing Platform",
      desc: "An enterprise-grade multi-tenant fintech suite featuring cryptographic offline lease issuance, machine hardware fingerprinting, client self-service portals, and four automated invoice engines.",
      icon: <Laptop size={22} />,
      highlights: [
        "Cryptographic dual-layer offline leases (HMAC-SHA256)",
        "Hardware-locked Windows desktop workstation client",
        "Live Neon PostgreSQL cloud sync with client portals",
        "4 automated luxury PDF & print invoice templates",
      ],
      tech: ["React 19", "TypeScript", "Neon Postgres", "Electron", "Vite"],
      stats: { primary: "100%", label: "Offline Invoicing Uptime" },
      actionText: "Launch Web App",
      action: onLaunchApp,
    },
    {
      id: "software" as CategoryType,
      title: "Software Development",
      badge: "Core Capability",
      tagline: "Mission-Critical Systems & Desktop Engineering",
      desc: "Robust, high-performance standalone and distributed software systems engineered for desktop, servers, and embedded enterprise environments with zero latency bottlenecks.",
      icon: <Code2 size={22} />,
      highlights: [
        "Electron & native Windows desktop application development",
        "Zero-trust local DPAPI and hardware-backed storage encryption",
        "Distributed offline-first data sync engines with conflict resolution",
        "Microservices, background workers, and RESTful/RPC APIs",
      ],
      tech: ["Electron", "Node.js", "C++ Addons", "SQLite", "Rust/Go"],
      stats: { primary: "<20ms", label: "Local Cryptographic Verification" },
      actionText: "Explore Software Stack",
      action: () => setIsInquiryOpen(true),
    },
    {
      id: "website" as CategoryType,
      title: "Website Developing",
      badge: "Full-Stack Excellence",
      tagline: "Modern High-Performance Web Applications",
      desc: "Bespoke, responsive, and blazing-fast web platforms engineered with modern frameworks, serverless architectures, and bulletproof database designs tailored to your business.",
      icon: <Globe size={22} />,
      highlights: [
        "Modern component-driven single page applications (SPA) & SSR",
        "Serverless database architecture (Neon, PostgreSQL, Redis)",
        "Role-based access control (RBAC) with secure auth cookies",
        "Optimized Web Vitals, sub-second TTFB, and fluid accessibility",
      ],
      tech: ["React", "TypeScript", "Next.js", "PostgreSQL", "Tailwind CSS"],
      stats: { primary: "99.9%", label: "Production Cloud Availability" },
      actionText: "Build Your Website",
      action: () => setIsInquiryOpen(true),
    },
    {
      id: "uiux" as CategoryType,
      title: "UI/UX Design",
      badge: "Fintech Grade",
      tagline: "Radiant Light Themes & Intuitive Ergonomics",
      desc: "Human-centric, accessible, and radiant user interfaces built around strict design token systems, fluid micro-interactions, and cognitive ease for high-stakes business environments.",
      icon: <Palette size={22} />,
      highlights: [
        "Harmonious light color systems with pristine contrast ratios",
        "Design systems, interactive component libraries, and style tokens",
        "Interactive wireframing, clickable prototypes, and UX testing",
        "Fintech-grade data visualization, tables, and financial charts",
      ],
      tech: ["Figma", "Design Tokens", "Radix UI", "Micro-animations"],
      stats: { primary: "100%", label: "WCAG AAA Color Contrast Compliance" },
      actionText: "Design With Us",
      action: () => setIsInquiryOpen(true),
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory)!;

  return (
    <div className="landing-container">
      {/* --------------------------------------------------------------------
          NAVBAR
          -------------------------------------------------------------------- */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div
            className="landing-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="landing-brand-badge">BC</div>
            <div className="landing-brand-text">
              <span className="landing-brand-title">
                Team BC <span>Dev</span>
              </span>
              <span className="landing-brand-sub">Engineering Studio</span>
            </div>
          </div>

          <nav className="landing-links">
            <button
              className={`landing-link ${activeCategory === "webapp" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("webapp");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Laptop size={14} /> This Web App
            </button>
            <button
              className={`landing-link ${activeCategory === "software" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("software");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Code2 size={14} /> Software Development
            </button>
            <button
              className={`landing-link ${activeCategory === "website" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("website");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Globe size={14} /> Website Developing
            </button>
            <button
              className={`landing-link ${activeCategory === "uiux" ? "active" : ""}`}
              onClick={() => {
                setActiveCategory("uiux");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Palette size={14} /> UI/UX Design
            </button>
          </nav>

          <div className="landing-nav-actions">
            <button
              className="landing-btn-ghost"
              onClick={() => onOpenPortalLogin("client")}
            >
              <Building2 size={14} /> Client Portal
            </button>
            <button
              className="landing-btn-primary"
              onClick={onLaunchApp}
            >
              Launch Web App <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          HERO SECTION
          -------------------------------------------------------------------- */}
      <section className="landing-hero">
        <div className="landing-hero-decor-1"></div>
        <div className="landing-hero-decor-2"></div>

        <div className="landing-hero-content">
          <div className="landing-pill">
            <Sparkles size={14} />
            <span>WELCOME TO TEAM BC DEV • DIGITAL CRAFTSMANSHIP</span>
          </div>

          <h1>
            Engineering Next-Generation <em>Digital Experiences</em> &amp; Enterprise Software.
          </h1>

          <p>
            From high-assurance offline desktop architectures and full-stack web applications to
            bespoke fintech user experiences, <strong>Team BC Dev</strong> turns complex engineering into
            streamlined, beautiful digital products.
          </p>

          <div className="landing-hero-cta">
            <button
              className="landing-btn-primary landing-btn-lg"
              onClick={onLaunchApp}
            >
              <Laptop size={17} /> Explore This Web App (BillionDue)
            </button>
            <button
              className="landing-btn-ghost landing-btn-lg"
              onClick={() => setIsInquiryOpen(true)}
            >
              <Send size={15} /> Start a Project With Us
            </button>
          </div>

          {/* Key Stat Badges */}
          <div className="landing-stats-row">
            <div className="landing-stat-item">
              <span className="landing-stat-num">100%</span>
              <span className="landing-stat-label">Offline-First Invoicing</span>
            </div>
            <div className="landing-stat-item">
              <span className="landing-stat-num">256-Bit</span>
              <span className="landing-stat-label">Cryptographic Leases</span>
            </div>
            <div className="landing-stat-item">
              <span className="landing-stat-num">4 Themes</span>
              <span className="landing-stat-label">Bespoke Invoicing Engines</span>
            </div>
            <div className="landing-stat-item">
              <span className="landing-stat-num">Sub-50ms</span>
              <span className="landing-stat-label">Serverless Cloud Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          INTERACTIVE CATEGORY SHOWCASE SECTION
          -------------------------------------------------------------------- */}
      <section id="categories-section" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-tagline">OUR CORE DISCIPLINES</div>
          <h2 className="landing-section-title">What We Build &amp; Design</h2>
          <p className="landing-section-sub">
            Explore our specialized categories across full-lifecycle software delivery, modern web engineering,
            and executive fintech UI/UX design.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="landing-category-tabs">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`landing-category-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="landing-tab-icon">{cat.icon}</div>
              <div className="landing-tab-meta">
                <strong>{cat.title}</strong>
                <small>{cat.badge}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Active Category Stage */}
        <div className="landing-feature-stage">
          <div className="landing-stage-info">
            <span className="landing-badge-category">{currentCategory.badge}</span>
            <h2>{currentCategory.tagline}</h2>
            <p className="landing-stage-desc">{currentCategory.desc}</p>

            <div className="landing-stage-points">
              {currentCategory.highlights.map((item, idx) => (
                <div key={idx} className="landing-stage-point">
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                TECHNOLOGIES EMPLOYED
              </div>
              <div className="landing-stage-tech-tags">
                {currentCategory.tech.map((t, idx) => (
                  <span key={idx} className="landing-tech-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                className="landing-btn-primary"
                onClick={currentCategory.action}
              >
                {currentCategory.actionText} <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="landing-stage-preview">
            <div className="landing-preview-header">
              <span>
                <Zap size={14} /> LIVE CAPABILITY PROFILE
              </span>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Team BC Dev Verified</span>
            </div>

            <div className="landing-preview-card-body">
              <div className="landing-preview-metric-box">
                <div>
                  <strong>{currentCategory.stats.primary}</strong>
                  <br />
                  <small>{currentCategory.stats.label}</small>
                </div>
                <div style={{ color: "#047857" }}>
                  <Award size={26} />
                </div>
              </div>

              {activeCategory === "webapp" && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #A7F3D0",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b style={{ fontSize: 12, color: "#0f172a" }}>BillionDue Suite Status</b>
                    <span
                      style={{
                        background: "#ECFDF5",
                        color: "#047857",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}
                    >
                      ONLINE &bull; v0.1.0
                    </span>
                  </div>
                  <small style={{ fontSize: 11, color: "#64748b" }}>
                    Dual web portal active with Neon serverless database authentication.
                  </small>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      className="landing-btn-ghost"
                      style={{ padding: "6px 12px", fontSize: 11, flex: 1 }}
                      onClick={() => onOpenPortalLogin("admin")}
                    >
                      Admin Sign In
                    </button>
                    <button
                      className="landing-btn-primary"
                      style={{ padding: "6px 12px", fontSize: 11, flex: 1 }}
                      onClick={() => onOpenPortalLogin("client")}
                    >
                      Client Sign In
                    </button>
                  </div>
                </div>
              )}

              {activeCategory === "software" && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #A7F3D0",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <b style={{ fontSize: 12, color: "#0f172a" }}>Hardware Lock Architecture</b>
                  <small style={{ fontSize: 11, color: "#64748b" }}>
                    CPU, BIOS, and Motherboard MAC binding prevents unlicensed workstation cloning.
                  </small>
                  <a
                    href={windowsInstallerUrl}
                    className="landing-btn-ghost"
                    style={{ textAlign: "center", justifyContent: "center", fontSize: 11, padding: "7px 10px" }}
                  >
                    <Download size={13} /> Download Windows Workstation
                  </a>
                </div>
              )}

              {activeCategory === "website" && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #A7F3D0",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <b style={{ fontSize: 12, color: "#0f172a" }}>Serverless Postgres Backbone</b>
                  <small style={{ fontSize: 11, color: "#64748b" }}>
                    Automated pooling, sub-second cold starts, and encrypted credential storage.
                  </small>
                  <div style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>
                    &bull; High-concurrency ready &bull; Zero maintenance
                  </div>
                </div>
              )}

              {activeCategory === "uiux" && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #A7F3D0",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <b style={{ fontSize: 12, color: "#0f172a" }}>Imperial Emerald &amp; Warm Gold Luxury Mode</b>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, height: 24, borderRadius: 6, background: "#047857" }} title="Forest Emerald #047857" />
                    <div style={{ flex: 1, height: 24, borderRadius: 6, background: "#064E3B " }} title="Warm Gold #064E3B " />
                    <div style={{ flex: 1, height: 24, borderRadius: 6, background: "#A7F3D0" }} title="Soft Jade #A7F3D0" />
                    <div style={{ flex: 1, height: 24, borderRadius: 6, background: "#ECFDF5" }} title="Mint Cream #ECFDF5" />
                  </div>
                  <small style={{ fontSize: 10, color: "#64748b" }}>
                    Harmonized Swiss private wealth palette designed for classic prestige, eye comfort, and executive clarity.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4 CORE CATEGORIES OVERVIEW GRID
          -------------------------------------------------------------------- */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-header">
          <div className="landing-tagline">COMPLETE SOLUTIONS MATRIX</div>
          <h2 className="landing-section-title">Specialized Engineering Services</h2>
          <p className="landing-section-sub">
            Whether launching enterprise SaaS, building custom desktop systems, or redesigning customer interfaces.
          </p>
        </div>

        <div className="landing-grid-4">
          {/* Card 1: This Web App */}
          <div className="landing-cat-card landing-cat-card-featured">
            <div className="landing-cat-icon">
              <Laptop size={24} />
            </div>
            <h3>This Web App</h3>
            <p>
              BillionDue fintech platform: complete license leasing, workstation authorization, and multi-template
              invoicing engine.
            </p>
            <ul className="landing-cat-list">
              <li>
                <Check size={14} /> Software owner admin portal
              </li>
              <li>
                <Check size={14} /> Client company self-service
              </li>
              <li>
                <Check size={14} /> Workstation hardware binding
              </li>
              <li>
                <Check size={14} /> 4 Executive invoice templates
              </li>
            </ul>
            <div className="landing-cat-footer">
              <span style={{ fontSize: 10, fontWeight: 800, color: "#047857" }}>READY TO USE</span>
              <button className="landing-cat-btn" onClick={onLaunchApp}>
                Open App <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: Software Development */}
          <div className="landing-cat-card">
            <div className="landing-cat-icon">
              <Code2 size={24} />
            </div>
            <h3>Software Development</h3>
            <p>
              Desktop &amp; distributed system development with offline-first data engines, native security, and
              high reliability.
            </p>
            <ul className="landing-cat-list">
              <li>
                <Check size={14} /> Windows Electron architectures
              </li>
              <li>
                <Check size={14} /> Local DPAPI secure storage
              </li>
              <li>
                <Check size={14} /> Machine hardware fingerprinting
              </li>
              <li>
                <Check size={14} /> High-throughput Node.js microservices
              </li>
            </ul>
            <div className="landing-cat-footer">
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>ENGINEERING</span>
              <button
                className="landing-cat-btn"
                onClick={() => {
                  setActiveCategory("software");
                  document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 3: Website Developing */}
          <div className="landing-cat-card">
            <div className="landing-cat-icon">
              <Globe size={24} />
            </div>
            <h3>Website Developing</h3>
            <p>
              Modern full-stack web platforms engineered with React, TypeScript, and serverless Postgres databases.
            </p>
            <ul className="landing-cat-list">
              <li>
                <Check size={14} /> Single Page &amp; Multi-Tenant Apps
              </li>
              <li>
                <Check size={14} /> Neon Serverless PostgreSQL
              </li>
              <li>
                <Check size={14} /> Responsive across all screens
              </li>
              <li>
                <Check size={14} /> Robust REST &amp; GraphQL APIs
              </li>
            </ul>
            <div className="landing-cat-footer">
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>FULL-STACK</span>
              <button
                className="landing-cat-btn"
                onClick={() => {
                  setActiveCategory("website");
                  document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 4: UI/UX Design */}
          <div className="landing-cat-card">
            <div className="landing-cat-icon">
              <Palette size={24} />
            </div>
            <h3>UI/UX Design</h3>
            <p>
              Fintech-grade visual design systems with harmonious light color ergonomics, accessibility, and high
              productivity.
            </p>
            <ul className="landing-cat-list">
              <li>
                <Check size={14} /> Radiant Light Theme palettes
              </li>
              <li>
                <Check size={14} /> Component &amp; Token design systems
              </li>
              <li>
                <Check size={14} /> Financial dashboard ergonomics
              </li>
              <li>
                <Check size={14} /> Interactive prototypes &amp; wireframes
              </li>
            </ul>
            <div className="landing-cat-footer">
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>DESIGN SYSTEM</span>
              <button
                className="landing-cat-btn"
                onClick={() => {
                  setActiveCategory("uiux");
                  document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          THIS WEB APP SPOTLIGHT (BILLIONDUE)
          -------------------------------------------------------------------- */}
      <section className="landing-section">
        <div className="landing-spotlight">
          <div className="landing-spotlight-left">
            <span className="landing-pill">
              <Award size={13} /> CASE STUDY &bull; BUILT BY TEAM BC DEV
            </span>
            <h3>BillionDue — Turn Invoices Into Income. Securely.</h3>
            <p>
              BillionDue represents Team BC Dev&apos;s full-spectrum engineering capabilities: combining an Electron
              desktop client with offline cryptographic validation, a high-concurrency Neon Postgres backend, and
              dual web portals for owners and clients.
            </p>

            <div className="landing-spotlight-features">
              <div className="landing-spotlight-feat">
                <strong>Offline Cryptographic Leases</strong>
                <span>Workstations continue creating invoices even when internet connectivity drops.</span>
              </div>
              <div className="landing-spotlight-feat">
                <strong>Hardware Fingerprinting</strong>
                <span>Licenses are cryptographically bound to specific CPU and motherboard UUIDs.</span>
              </div>
              <div className="landing-spotlight-feat">
                <strong>Multi-Tenant Portals</strong>
                <span>Software owners administer global companies while clients access only their workspace.</span>
              </div>
              <div className="landing-spotlight-feat">
                <strong>4 Invoicing Templates</strong>
                <span>Generate executive, editorial, serif, and minimal sage invoices in a single click.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="landing-btn-primary"
                onClick={onLaunchApp}
              >
                Sign In to BillionDue <ArrowUpRight size={15} />
              </button>
              <a
                href={windowsInstallerUrl}
                className="landing-btn-ghost"
              >
                <Download size={14} /> Download Desktop App
              </a>
            </div>
          </div>

          <div className="landing-spotlight-right">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #047857, #064E3B )",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  BD
                </div>
                <div>
                  <b style={{ fontSize: 13, color: "#0f172a" }}>BillionDue Live Architecture</b>
                  <div style={{ fontSize: 10, color: "#64748b" }}>Engineered by Team BC Dev</div>
                </div>
              </div>
              <span
                style={{
                  background: "#ECFDF5",
                  color: "#047857",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                Production Ready
              </span>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Admin Portal:</span>
                <strong style={{ color: "#0f172a" }}>Full Fleet &amp; License Control</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Client Portal:</span>
                <strong style={{ color: "#0f172a" }}>Company Device Self-Service</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Windows Desktop:</span>
                <strong style={{ color: "#0f172a" }}>High-Speed Offline Billing</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Cloud Database:</span>
                <strong style={{ color: "#047857" }}>Neon Serverless PostgreSQL</strong>
              </div>
            </div>

            <div
              style={{
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 10,
                padding: 12,
                fontSize: 11,
                color: "#0f172a",
                lineHeight: 1.5,
              }}
            >
              ✨ <strong>Light Theme Ergonomics:</strong> Built strictly according to the Imperial Emerald &amp; Warm Gold
              classic luxury palette for zero logo clash and effortless readability.
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          CALL TO ACTION / INQUIRY BANNER
          -------------------------------------------------------------------- */}
      <section className="landing-section">
        <div className="landing-cta-banner">
          <h2>Ready to Build Something Extraordinary?</h2>
          <p>
            Whether you need a custom software suite, a scalable cloud website, or a bespoke fintech user experience,
            <strong> Team BC Dev</strong> is ready to bring your vision to life.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              className="landing-btn-primary landing-btn-lg"
              onClick={() => setIsInquiryOpen(true)}
            >
              <Send size={16} /> Request Free Consultation
            </button>
            <button
              className="landing-btn-ghost landing-btn-lg"
              onClick={onLaunchApp}
            >
              <Laptop size={16} /> Try BillionDue Web App
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          PROJECT INQUIRY MODAL
          -------------------------------------------------------------------- */}
      {isInquiryOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsInquiryOpen(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#047857", letterSpacing: 1 }}>
                  TEAM BC DEV &bull; INQUIRY
                </span>
                <h2 style={{ margin: "4px 0" }}>Start Your Project</h2>
                <small style={{ color: "#64748b", fontSize: 11 }}>
                  Tell us about your requirements and we will respond within 24 hours.
                </small>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                style={{
                  border: 0,
                  background: "#f1f5f9",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} style={{ display: "grid", gap: 14 }}>
              <label>
                Your Name
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={inquiryData.name}
                  onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@company.com"
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                />
              </label>

              <label>
                Primary Category
                <select
                  value={inquiryData.service}
                  onChange={(e) => setInquiryData({ ...inquiryData, service: e.target.value })}
                >
                  <option value="This Web App">This Web App (BillionDue Platform)</option>
                  <option value="Software Development">Software Development (Desktop/Native)</option>
                  <option value="Website Developing">Website Developing (Full-Stack/Cloud)</option>
                  <option value="UI/UX Design">UI/UX Design (Fintech/Design Systems)</option>
                </select>
              </label>

              <label>
                Project Details or Goals
                <textarea
                  rows={3}
                  placeholder="Tell us what you want to achieve..."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsInquiryOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"} <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          FOOTER
          -------------------------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand">
            <div className="landing-brand-badge">BC</div>
            <div className="landing-brand-text">
              <span className="landing-brand-title">
                Team BC <span>Dev</span>
              </span>
              <span className="landing-brand-sub">Engineering Studio &bull; Light Theme Edition</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 }}>
            <button
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontWeight: 600 }}
              onClick={() => {
                setActiveCategory("webapp");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              This Web App
            </button>
            <button
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontWeight: 600 }}
              onClick={() => {
                setActiveCategory("software");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Software Development
            </button>
            <button
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontWeight: 600 }}
              onClick={() => {
                setActiveCategory("website");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Website Developing
            </button>
            <button
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontWeight: 600 }}
              onClick={() => {
                setActiveCategory("uiux");
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              UI/UX Design
            </button>
          </div>
        </div>

        <div className="landing-footer-copy">
          <div>
            &copy; {new Date().getFullYear()} <strong>Team BC Dev</strong>. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span>Theme: Imperial Emerald &amp; Warm Gold</span>
            <span>&bull;</span>
            <span>Palette: #047857 / #064E3B  / #A7F3D0 / #ECFDF5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

