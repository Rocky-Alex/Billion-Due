import React, { useState } from "react";
import { windowsInstallerUrl } from "@billiondue/shared";

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenPortalLogin: (role?: "admin" | "client") => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

type TabType = "services" | "products" | "about" | "contact";

export function LandingPage({
  onLaunchApp,
  onOpenPortalLogin,
  notify,
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("services");

  // Keep in Touch form state (Services page)
  const [servicesFormData, setServicesFormData] = useState({
    name: "",
    email: "",
    solution: "Billion Due Invoicing & Accounting",
    goal: "",
  });

  // Architectural Consultation form state (Contact page)
  const [contactFullName, setContactFullName] = useState("");
  const [contactWorkEmail, setContactWorkEmail] = useState("");
  const [contactCountryCode, setContactCountryCode] = useState("+971");
  const [contactPhone, setContactPhone] = useState("");
  const [contactIndustry, setContactIndustry] = useState("retail");
  const [contactBottlenecks, setContactBottlenecks] = useState("");
  const [selectedPills, setSelectedPills] = useState<string[]>([
    "billiondue",
  ]);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePill = (val: string) => {
    setSelectedPills((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const handleServicesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicesFormData.name || !servicesFormData.email) {
      if (notify) notify("Please provide your name and email.", "warn");
      return;
    }
    if (notify) {
      notify(
        "Thank you! Team BC Dev has received your request and will contact you shortly.",
        "ok"
      );
    }
    setServicesFormData({
      name: "",
      email: "",
      solution: "Billion Due Invoicing & Accounting",
      goal: "",
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFullName || !contactWorkEmail) {
      if (notify) notify("Please enter your name and work email.", "warn");
      return;
    }
    setIsContactSubmitting(true);
    setTimeout(() => {
      setIsContactSubmitting(false);
      setIsContactSubmitted(true);
      if (notify) {
        notify("Inquiry Transmitted Directly to Engineering", "ok");
      }
    }, 850);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#3D4A42] font-sans antialiased selection:bg-[#85F8C4] selection:text-[#002114]">
      {/* ====================================================================
          GLOBAL NAVIGATION HEADER (Exact Stitch Design)
          ==================================================================== */}
      <header className="sticky top-0 z-50 w-full h-[80px] bg-[#F8F9FF]/90 backdrop-blur-[24px] shadow-[0px_1px_8px_rgba(0,0,0,0.04)] border-b border-[#EFF4FF]">
        <div className="max-w-[1280px] h-full mx-auto px-6 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div
            onClick={() => switchTab("services")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-[33px] h-[32px] rounded-lg bg-[#006948] flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
                <line x1="22" y1="11" x2="22" y2="13"></line>
                <line x1="6" y1="12" x2="10" y2="12"></line>
              </svg>
            </div>
            <span className="font-display font-extrabold text-[15px] leading-[22px] tracking-[-0.375px] text-[#0B1C30] group-hover:text-[#006948] transition-colors">
              Team BC Dev
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => switchTab("services")}
              className={`px-3 py-1.5 rounded-lg font-display font-semibold text-[15px] leading-[22px] transition-all ${
                activeTab === "services"
                  ? "bg-[#00855D] text-[#F5FFF7] shadow-sm"
                  : "text-[#3D4A42] hover:bg-[#EFF4FF]"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => switchTab("products")}
              className={`px-3 py-1.5 rounded-lg font-display font-semibold text-[15px] leading-[22px] transition-all ${
                activeTab === "products"
                  ? "bg-[#00855D] text-[#F5FFF7] shadow-sm"
                  : "text-[#3D4A42] hover:bg-[#EFF4FF]"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => switchTab("about")}
              className={`px-3 py-1.5 rounded-lg font-display font-semibold text-[15px] leading-[22px] transition-all ${
                activeTab === "about"
                  ? "bg-[#00855D] text-[#F5FFF7] shadow-sm"
                  : "text-[#3D4A42] hover:bg-[#EFF4FF]"
              }`}
            >
              About Us
            </button>
          </nav>

          {/* Contact CTA & Client Portal Login */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchTab("contact")}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-display font-semibold text-[15px] leading-[22px] transition-all shadow-[0px_1px_2px_rgba(0,0,0,0.05)] ${
                activeTab === "contact"
                  ? "bg-[#005238] text-white"
                  : "bg-[#006948] hover:bg-[#005238] text-white"
              }`}
            >
              Contact US
            </button>
            <button
              onClick={() => onOpenPortalLogin()}
              title="Client & Admin Portal Sign-In"
              className="w-8 h-8 rounded-full bg-[#006948] hover:bg-[#005238] flex items-center justify-center shadow-sm text-white transition-all transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          TAB 1: SERVICES (team_bc_dev_landing_page)
          ==================================================================== */}
      {activeTab === "services" && (
        <main className="relative pt-[40px] pb-16 flex flex-col items-center">
          {/* Top Ambient Glow */}
          <div className="hero-glow"></div>

          {/* HERO SECTION */}
          <section className="relative z-10 max-w-[896px] mx-auto flex flex-col items-center text-center px-4">
            {/* Monospaced / Pill Category Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#E5EEFF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full h-[32px]">
              <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
              <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#006948]">
                BESPOKE SOFTWARE AGENCY
              </span>
              <span className="text-[#BCCAC0] text-[15px] px-1 font-normal">•</span>
              <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#565E74]">
                ZERO LOCK-IN &amp; RECURRING FEES
              </span>
            </div>

            {/* Hero Headline */}
            <h1 className="font-display font-extrabold text-[56px] leading-[64px] tracking-[-1.4px] text-[#0B1C30] max-w-[1049px] mb-4">
              Custom Business Software Designed for Growth, Efficiency, and Ease of Use.
            </h1>

            {/* Subheadline */}
            <p className="font-sans font-normal text-[18px] leading-[28px] text-[#3D4A42] max-w-[624px] mb-8">
              From automated invoicing and accounting tools to custom inventory apps and modern web platforms, Team BC Dev helps small businesses and solo entrepreneurs streamline daily operations.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
              <a
                href="#services-grid"
                className="relative group flex items-center justify-center gap-2 px-6 py-2.5 bg-[#006948] hover:bg-[#005238] text-white font-display font-semibold text-[15px] leading-[22px] rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all"
              >
                <span>Explore Our Solutions</span>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <button
                onClick={() => switchTab("products")}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#0B1C30] border border-[#EFF4FF] font-display font-semibold text-[15px] leading-[22px] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all"
              >
                <svg
                  className="w-4 h-4 text-[#006948]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>View Live Demos &amp; Work</span>
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
                <svg
                  className="w-4 h-4 text-[#006948]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
                  50+ Deployments Done
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
                <svg
                  className="w-4 h-4 text-[#006948]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
                  Zero Vendor Lock-in
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
                <svg
                  className="w-4 h-4 text-[#006948]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
                  Local-First Encryption
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
                <svg
                  className="w-4 h-4 text-[#006948]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
                  100% Tailored Codebase
                </span>
              </div>
            </div>
          </section>

          {/* CORE AGENCY SERVICES GRID */}
          <section
            id="services-grid"
            className="relative z-10 w-full max-w-[1232px] mx-auto mt-20 pt-9 px-6 pb-12 flex flex-col items-center"
          >
            {/* Section Header */}
            <div className="max-w-[672px] mx-auto text-center mb-10 flex flex-col items-center">
              <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#006948] mb-1">
                ENGINEERED SOLUTIONS
              </span>
              <h2 className="font-display font-bold text-[36px] leading-[44px] tracking-[-0.9px] text-[#0B1C30] mb-2">
                Software Designed to Suit Your Revenue System
              </h2>
              <p className="font-sans font-normal text-[15px] leading-[24px] text-[#3D4A42]">
                We don't sell bloated monthly subscriptions. We architect purpose-built software stacks that belong exclusively to your enterprise.
              </p>
            </div>

            {/* Bento Grid (5 Core Pillars) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1: Accounting & Invoicing */}
              <div className="h-[434px] p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                    Accounting &amp; Invoicing Engines
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                    Custom multi-currency billing, automated recurring subscription charging, reconciliation registers, and VAT-compliant fiscal receipt engines.
                  </p>
                  <div className="space-y-1 text-[13px] text-[#0B1C30]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Zero recurring per-invoice SaaS tax</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>High-speed client PDF generators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Audit-proof double-entry schemas</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Electron</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">PostgreSQL</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Node.js</span>
                  </div>
                  <button
                    onClick={() => switchTab("products")}
                    className="inline-flex items-center gap-1.5 text-[#006948] font-display font-semibold text-[15px] hover:underline"
                  >
                    <span>View Architecture Specs</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>

              {/* Service 2: Inventory & Stock Systems */}
              <div className="h-[434px] p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                    Inventory &amp; Stock Systems
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                    Multi-warehouse synchronization, instant hardware barcode scanner hookups, automated low-stock warnings, and vendor purchase requisition flows.
                  </p>
                  <div className="space-y-1 text-[13px] text-[#0B1C30]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Handheld scanner &amp; POS integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>FIFO / LIFO inventory valuation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Automatic supplier purchase triggers</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">React</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Go</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Redis</span>
                  </div>
                  <button
                    onClick={() => switchTab("contact")}
                    className="inline-flex items-center gap-1.5 text-[#006948] font-display font-semibold text-[15px] hover:underline"
                  >
                    <span>View Architecture Specs</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>

              {/* Service 3: Bespoke Web Applications */}
              <div className="h-[434px] p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                    Bespoke Web Applications
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                    B2B customer self-service portals, administrative control cockpits, bespoke dispatch panels, and scalable private cloud business backbones.
                  </p>
                  <div className="space-y-1 text-[13px] text-[#0B1C30]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Role-based access permissions (RBAC)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>REST &amp; GraphQL internal APIs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Bank-grade TLS and secret vaults</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Next.js 14</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">TypeScript</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Prisma</span>
                  </div>
                  <button
                    onClick={() => switchTab("contact")}
                    className="inline-flex items-center gap-1.5 text-[#006948] font-display font-semibold text-[15px] hover:underline"
                  >
                    <span>View Architecture Specs</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>

              {/* Service 4: High-Converting Web Platforms */}
              <div className="h-[434px] p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                    High-Converting Web Platforms
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                    Corporate websites built for blistering Lighthouse 99+ speed, technical enterprise SEO, and custom headless CMS publishing workflows.
                  </p>
                  <div className="space-y-1 text-[13px] text-[#0B1C30]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Sub-second page rendering speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Schema structured data pre-configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Integrated CRM conversion funnels</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Tailwind CSS</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Astro</span>
                    <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Cloudflare</span>
                  </div>
                  <button
                    onClick={() => switchTab("contact")}
                    className="inline-flex items-center gap-1.5 text-[#006948] font-display font-semibold text-[15px] hover:underline"
                  >
                    <span>View Architecture Specs</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>

              {/* Service 5: Portfolios & Brand Identity (Spans 2 cols on desktop) */}
              <div className="col-span-1 md:col-span-2 h-auto lg:h-[434px] p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col lg:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1 flex flex-col justify-between h-full w-full">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                        <path d="M2 2l7.586 7.586"></path>
                        <circle cx="11" cy="11" r="2"></circle>
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                      Executive Portfolios &amp; Digital Identity
                    </h3>
                    <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                      Ultra-polished digital showcases for boutique agencies, consultancies, architectural firms, and executives demanding uncompromising visual authority and bespoke craft.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[#0B1C30]">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Award-level micro-interactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Fluid responsive layout choreography</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Interactive case studies &amp; media galleries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#006948]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Fast CDN global delivery edge</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0">
                    <div className="flex gap-1.5 mb-3">
                      <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Framer Motion</span>
                      <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">WebGL / Three.js</span>
                      <span className="px-2 py-0.5 bg-[#EFF4FF] rounded text-[11px] font-medium text-[#565E74]">Tailwind</span>
                    </div>
                    <button
                      onClick={() => switchTab("contact")}
                      className="inline-flex items-center gap-1.5 text-[#006948] font-display font-semibold text-[15px] hover:underline"
                    >
                      <span>View Architecture Specs</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>

                {/* Decorative Code Visualizer snippet */}
                <div className="w-full lg:w-[288px] h-[386px] bg-[#213145] rounded-lg p-4 flex flex-col justify-between text-left font-mono shadow-md">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#6D7A72]/20 mb-3 text-[11px]">
                      <span className="text-[#6FFBBE] font-medium">Bespoke_Build.config</span>
                      <span className="text-[#BCCAC0]">prod</span>
                    </div>
                    <div className="text-[12px] leading-[20px] text-[#BEC6E0]">
                      <div className="text-[#85F8C4]">export const AgencyStack = &#123;</div>
                      <div className="pl-4">ownership: <span className="text-[#6FFBBE]">"100%_Client"</span>,</div>
                      <div className="pl-4">subscriptions: <span className="text-[#85F8C4]">0</span>,</div>
                      <div className="pl-4">deployTime: <span className="text-[#6FFBBE]">"14_Days"</span>,</div>
                      <div className="pl-4">encryption: <span className="text-[#6FFBBE]">"AES-GCM"</span>,</div>
                      <div>&#125;;</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#6D7A72]/20 flex items-center justify-between text-[11px] text-[#6FFBBE]">
                    <span>Ready for release</span>
                    <svg className="w-3 h-3 text-[#6FFBBE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS & CLIENT PROOF */}
          <section className="w-full bg-[#EFF4FF] py-6 my-12 border-y border-[#E5EEFF]">
            <div className="max-w-[1232px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#3D4A42]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#006948]"></div>
                <span className="font-display font-semibold text-[15px] text-[#0B1C30]">
                  Trusted by GCC Traders, Freight Handlers, and Design Boutiques
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[13px] font-medium text-[#565E74]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#006948]">✓</span> 100% Local SQLite Ownership
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#006948]">✓</span> WhatsApp Direct Dev Hotline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#006948]">✓</span> Fixed Quotes, Zero Surprise SaaS Fees
                </span>
              </div>
            </div>
          </section>

          {/* FINAL HIGH-CONVERSION CTA & CONSULTATION INQUIRY */}
          <section
            id="contact-section"
            className="w-full max-w-[1232px] mx-auto my-8 bg-gradient-to-r from-[#006948] to-[#00CF8E] rounded-2xl p-6 lg:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Column: Copy & Highlights */}
              <div className="w-full lg:w-[564px] flex flex-col items-start text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00855D]/40 rounded-full mb-3 text-[12px] font-semibold tracking-[0.48px] text-[#6FFBBE]">
                  <svg className="w-3.5 h-3.5 text-[#6FFBBE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  <span>DIRECT SENIOR ARCHITECT ACCESS</span>
                </div>

                <h2 className="font-display font-bold text-[36px] leading-[44px] tracking-[-0.9px] text-[#EAF1FF] mb-3">
                  Ready to Build Your Company's Software Unfair Advantage?
                </h2>

                <p className="font-sans text-[18px] leading-[28px] text-[#BEC6E0] mb-6">
                  Stop settling for generic off-the-shelf software compromises. Let's blueprint an application engineered exactly for how your business collects revenue.
                </p>

                <div className="space-y-2 text-[13px] text-[#EAF1FF]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6FFBBE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>WhatsApp, Discord, Google Meet direct engineering channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6FFBBE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Firm timeline &amp; transparent fixed-cost deliverables</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Booking Form Card */}
              <div className="w-full lg:w-[564px] bg-white rounded-xl p-6 shadow-xl border border-white/20 flex flex-col justify-between">
                <div className="mb-2">
                  <h3 className="font-display font-semibold text-[18px] leading-[26px] tracking-[-0.18px] text-[#0B1C30]">
                    Keep in Touch
                  </h3>
                  <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                    Speak directly with an engineering lead — no sales pitch.
                  </p>
                </div>

                <form className="space-y-2" onSubmit={handleServicesSubmit}>
                  <div>
                    <label className="block font-sans font-medium text-[11px] leading-[14px] tracking-[0.22px] text-[#3D4A42] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alexander Vance"
                      value={servicesFormData.name}
                      onChange={(e) =>
                        setServicesFormData({ ...servicesFormData, name: e.target.value })
                      }
                      className="w-full h-9 px-3 bg-[#EFF4FF] border-0 rounded-lg text-[13px] text-[#0B1C30] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#006948] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-medium text-[11px] leading-[14px] tracking-[0.22px] text-[#3D4A42] mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={servicesFormData.email}
                      onChange={(e) =>
                        setServicesFormData({ ...servicesFormData, email: e.target.value })
                      }
                      className="w-full h-9 px-3 bg-[#EFF4FF] border-0 rounded-lg text-[13px] text-[#0B1C30] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#006948] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-medium text-[11px] leading-[14px] tracking-[0.22px] text-[#3D4A42] mb-1">
                      Target Software Solution
                    </label>
                    <select
                      value={servicesFormData.solution}
                      onChange={(e) =>
                        setServicesFormData({ ...servicesFormData, solution: e.target.value })
                      }
                      className="w-full h-9 px-3 bg-[#EFF4FF] border-0 rounded-lg text-[13px] text-[#0B1C30] focus:ring-2 focus:ring-[#006948] outline-none cursor-pointer"
                    >
                      <option>e.g. Billion Due Invoicing &amp; Accounting</option>
                      <option>Custom Inventory &amp; Stock Scanners</option>
                      <option>Bespoke B2B Customer Portal</option>
                      <option>Executive Corporate Web Platform</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans font-medium text-[11px] leading-[14px] tracking-[0.22px] text-[#3D4A42] mb-1">
                      Brief Workflow Challenge or Goal
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tell us about your current bottlenecks..."
                      value={servicesFormData.goal}
                      onChange={(e) =>
                        setServicesFormData({ ...servicesFormData, goal: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#EFF4FF] border-0 rounded-lg text-[13px] text-[#0B1C30] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#006948] outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[38px] bg-[#006948] hover:bg-[#005238] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] rounded-lg text-white font-display font-extrabold text-[15px] leading-[22px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Submit</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ====================================================================
          TAB 2: PRODUCTS (team_bc_dev_billiondue_showcase)
          ==================================================================== */}
      {activeTab === "products" && (
        <main className="w-full bg-[#F8F9FF] min-h-screen">
          <div className="flex flex-col w-full">
            {/* Subtle Ambient Glows */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-[#85F8C4]/20 via-[#00855D]/10 to-[#D3E4FE]/40 blur-3xl pointer-events-none -z-10 rounded-full"></div>

              {/* Top Introduction Banner */}
              <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-6 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5EEFF]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00855D] text-[#F5FFF7] font-sans text-[11px] uppercase tracking-widest font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#85F8C4] animate-ping"></span>
                      Software Catalog · Q2 2025
                    </span>
                    <span className="font-sans text-[13px] text-[#3D4A42]">
                      4 Production-Ready Systems · Zero Subscription SaaS Traps
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[#3D4A42] font-sans text-[12px] font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#006948]">verified_user</span> Air-Gapped Capable
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#006948]">bolt</span> Sub-15ms Latency
                    </span>
                  </div>
                </div>

                {/* Headline & Subtitle */}
                <div className="mt-6 max-w-3xl">
                  <h1 className="font-display font-extrabold text-[56px] leading-[64px] tracking-tight text-[#0B1C30] mb-4">
                    Perpetual Software. <br />
                    <span className="text-[#006948]">Zero Monthly Hostage.</span>
                  </h1>
                  <p className="font-sans text-[18px] leading-[28px] text-[#3D4A42]">
                    We engineer standalone, lightning-fast commercial software tools that run directly on your hardware. No vendor lock-in, zero cloud subscription bloat, and ironclad local privacy built for ambitious GCC &amp; global operators.
                  </p>
                </div>
              </div>

              {/* Flagship Product Feature: BillionDue */}
              <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-4 pb-10">
                <div className="bg-white rounded-xl p-6 lg:p-10 shadow-[0_10px_30px_-5px_rgba(11,28,48,0.06)] relative">
                  {/* Header Badge & Title Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-0.5 rounded bg-[#00855D] text-[#F5FFF7] font-sans text-[11px] uppercase tracking-wider font-semibold">
                          Flagship Product
                        </span>
                        <span className="font-sans text-[11px] text-[#565E74] font-medium">
                          v2.4 LTS Build
                        </span>
                        <span className="inline-flex items-center gap-1 font-sans text-[11px] text-[#006948] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span> UAE FTA Certified Ready
                        </span>
                      </div>
                      <h2 className="font-display font-bold text-[36px] leading-[44px] tracking-tight text-[#0B1C30]">
                        BillionDue Desktop
                      </h2>
                      <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mt-0.5">
                        High-throughput offline-first billing, tax ledgering, and instant POS engine for GCC merchants and global agencies.
                      </p>
                    </div>

                    {/* Quick Actions / Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={windowsInstallerUrl}
                        download="BillionDue Setup 0.1.0.exe"
                        className="inline-flex items-center gap-2 bg-[#006948] text-white font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg hover:bg-[#00855D] transition-all shadow-[0_2px_8px_rgba(0,105,72,0.2)]"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Download Standalone v2.4</span>
                      </a>
                      <a
                        href="https://wa.me/971567064457?text=Hi%20Team%20BC%20Dev,%20I'd%20like%20a%20live%20walkthrough%20of%20BillionDue"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#E5EEFF] text-[#0B1C30] font-display font-semibold text-[15px] px-4 py-2.5 rounded-lg hover:bg-[#D3E4FE] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#006948]">video_call</span>
                        <span>Request Live Walkthrough</span>
                      </a>
                    </div>
                  </div>

                  {/* Desktop Mock Window Frame with Real Screenshot */}
                  <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(11,28,48,0.18)] bg-[#213145]">
                    {/* OS Window Titlebar Chrome */}
                    <div className="bg-[#1b2636] px-4 py-2 flex items-center justify-between text-[#F8F9FF] select-none">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                        </div>
                        <div className="h-4 w-px bg-white/20 ml-1"></div>
                        <div className="flex items-center gap-1 text-[#E5EEFF] font-sans text-[12px] font-semibold">
                          <span className="material-symbols-outlined text-[15px] text-[#85F8C4]">receipt_long</span>
                          <span className="font-semibold text-white">BillionDue Desktop</span>
                          <span className="text-[#D3E4FE]/70 text-[11px]">v2.4 · Bizz Co</span>
                        </div>
                      </div>

                      {/* Central Active SQLite Path Badge */}
                      <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1 rounded text-white text-[11px] font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#85F8C4]"></span>
                        <span>~/Documents/invoices.sqlite</span>
                        <span className="text-[#85F8C4] font-semibold">· 100% Offline Operational</span>
                      </div>

                      {/* Window Right Controls */}
                      <div className="flex items-center gap-3 text-[#D3E4FE] text-[11px]">
                        <span className="hidden sm:inline font-mono text-[11px] bg-white/15 px-2 py-0.5 rounded text-white">
                          SQL Query: 4.2ms
                        </span>
                        <span className="material-symbols-outlined text-[16px] hover:text-white cursor-pointer">remove</span>
                        <span className="material-symbols-outlined text-[16px] hover:text-white cursor-pointer">crop_square</span>
                        <span className="material-symbols-outlined text-[16px] hover:text-white cursor-pointer">close</span>
                      </div>
                    </div>

                    {/* Embedded Real UI Screenshot Frame */}
                    <div className="relative bg-[#F8F9FF] overflow-hidden group">
                      <img
                        alt="BillionDue Desktop Invoice and Financial Management Interface"
                        className="w-full h-auto object-cover object-top block transition-transform duration-500 ease-out group-hover:scale-[1.008]"
                        src="/stitch/billiondue_screen.png"
                        onError={(e) => {
                          // Fallback to high-res remote screenshot if needed
                          const target = e.currentTarget;
                          if (!target.src.includes("googleusercontent")) {
                            target.src =
                              "https://lh3.googleusercontent.com/aida-public/AB6AXuCpXvjEJXuQujxSJ7XSyGqfxnUa2ztlxixaKrN_0DZbzouGah48DJhZJi9Zy_rZsl8N7d1DHonVjWAWKtcEXv3-Cd86w2e1CIO_JBZ9TBslLvfL4qmoHWOMNzImzhLYB1F_GtcWPy_lxpwimEHSqHjI8wHCgOK57Omre4Y-edmsvSZcXhZFkR2bnTdW75QCMwbb1rwq-bwK0C180XEVAXbAG_FKcsSadLcipbb6cmtC-5gMe2a9jPWS";
                          }
                        }}
                      />
                      {/* Floating Overlay Pill for Visual Depth */}
                      <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[#F8F9FF]/95 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg flex items-center justify-between sm:justify-start gap-4 text-[#0B1C30]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse"></span>
                          <span className="font-sans font-semibold text-[12px] text-[#0B1C30]">
                            AES-256 Encrypted SQLite
                          </span>
                        </div>
                        <div className="h-3 w-px bg-[#BCCAC0]"></div>
                        <div className="font-sans text-[13px] text-[#3D4A42]">
                          Zero telemetry · Stored only on your device
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Card Deep Dive Grid for BillionDue */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {/* Pillar 1 */}
                    <div className="bg-[#EFF4FF] p-4 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-2">
                          <span className="material-symbols-outlined text-[24px]">database</span>
                        </div>
                        <h3 className="font-display font-semibold text-[18px] text-[#0B1C30] mb-1">
                          Zero Cloud Hostage
                        </h3>
                        <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                          Your customer accounts and invoices stay securely on your hardware in an encrypted SQLite database. Zero monthly software rent, zero surprise server outages, and instant sub-12ms queries.
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#D3E4FE] flex items-center justify-between text-[11px] font-sans font-semibold text-[#006948]">
                        <span>$0.00 / Mo Forever</span>
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-[#EFF4FF] p-4 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-2">
                          <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                        </div>
                        <h3 className="font-display font-semibold text-[18px] text-[#0B1C30] mb-1">
                          UAE FTA &amp; GCC Tax Ready
                        </h3>
                        <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                          Engineered for Dubai, Abu Dhabi, Riyadh, and Doha merchant standards. Pre-configured 5% UAE VAT calculations, TLV/ZATCA/FTA validated QR generator, and dual English &amp; Arabic layouts.
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#D3E4FE] flex items-center justify-between text-[11px] font-sans font-semibold text-[#006948]">
                        <span>1-Click WhatsApp PDF</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-[#EFF4FF] p-4 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-2">
                          <span className="material-symbols-outlined text-[24px]">print</span>
                        </div>
                        <h3 className="font-display font-semibold text-[18px] text-[#0B1C30] mb-1">
                          Direct Thermal POS Engine
                        </h3>
                        <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                          Designed for retail checkout desks, repair shops, and trade counters. Direct ESC/POS printing over USB &amp; Network to 80mm roll printers in 180ms without clunky browser print prompts.
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#D3E4FE] flex items-center justify-between text-[11px] font-sans font-semibold text-[#006948]">
                        <span>USB / LAN ESC-POS</span>
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                      </div>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-[#EFF4FF] p-4 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-2">
                          <span className="material-symbols-outlined text-[24px]">currency_exchange</span>
                        </div>
                        <h3 className="font-display font-semibold text-[18px] text-[#0B1C30] mb-1">
                          Multi-Currency Ledger
                        </h3>
                        <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                          Real-time tracking across AED, USD, EUR, CAD, and GBP. Maintain customer accounts balance sheets, generate statement PDFs, and review periodic revenue summaries with clean financial precision.
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#D3E4FE] flex items-center justify-between text-[11px] font-sans font-semibold text-[#006948]">
                        <span>Instant Statement PDF</span>
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                      </div>
                    </div>
                  </div>

                  {/* Download & Distribution CTAs Bar */}
                  <div
                    className="mt-6 p-4 bg-[#E5EEFF] rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4"
                    id="downloads"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#006948] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[28px]">deployed_code</span>
                      </div>
                      <div>
                        <div className="font-display font-semibold text-[18px] text-[#0B1C30]">
                          Ready to operate BillionDue in your business?
                        </div>
                        <div className="font-sans text-[13px] text-[#3D4A42]">
                          Release 2.4.1 Build 892 · SHA-256 Verified · Signed Windows Binary
                        </div>
                      </div>
                    </div>

                    {/* Platform Downloads Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          notify?.("macOS build available upon enterprise consultation request.", "ok")
                        }
                        className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[15px] shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">laptop_mac</span> macOS (Apple Silicon / Intel)
                      </button>
                      <a
                        href={windowsInstallerUrl}
                        download="BillionDue Setup 0.1.0.exe"
                        className="px-4 py-2 rounded-lg bg-[#006948] text-white hover:bg-[#005238] font-display font-semibold text-[15px] shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">window</span> Windows 10/11 x64
                      </a>
                      <button
                        onClick={() =>
                          notify?.("Linux AppImage available upon enterprise request.", "ok")
                        }
                        className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[15px] shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">terminal</span> Linux AppImage
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Additional In-House Products Grid */}
              <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
                  <div>
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#006948] font-semibold">
                      Proprietary Software Suite
                    </span>
                    <h2 className="font-display font-bold text-[36px] leading-[44px] tracking-tight text-[#0B1C30] mt-0.5">
                      More In-House Enterprise Tools
                    </h2>
                  </div>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] max-w-md">
                    Field-tested software micro-systems engineered by Team BC Dev. Each product is available for standalone deployment or bespoke internal integration.
                  </p>
                </div>

                {/* Bento-style 4 Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product 1: StockNode POS & Inventory Matrix */}
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-[#EFF4FF]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948]">
                          <span className="material-symbols-outlined text-[26px]">inventory_2</span>
                        </div>
                        <span className="px-3 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] font-sans text-[11px]">
                          Hardware Ready
                        </span>
                      </div>
                      <div className="font-sans text-[11px] uppercase tracking-wider text-[#565E74] font-medium">
                        Retail &amp; Warehouse Hardware
                      </div>
                      <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mt-1 mb-2">
                        StockNode Matrix
                      </h3>
                      <p className="font-sans text-[15px] text-[#3D4A42] mb-4">
                        High-velocity stock and barcode synchronization engine. Communicates directly with wireless 1D/2D hand scanners and multiple retail floor terminals without relying on continuous internet connectivity.
                      </p>
                      <ul className="space-y-2 font-sans text-[13px] text-[#0B1C30] mb-6">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Offline buffer cache automatically syncs on network heartbeat</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Auto supplier requisition trigger when safety threshold is reached</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Zebra, Honeywell &amp; Datalogic hardware driver compatibility</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#565E74]">STACK: RUST / SQLITE / SERIAL-IO</span>
                      <a
                        className="font-display font-semibold text-[15px] text-[#006948] hover:text-[#005238] inline-flex items-center gap-1"
                        href="https://wa.me/971567064457?text=Interested%20in%20StockNode%20Matrix"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Request Spec Sheet <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>

                  {/* Product 2: Bespoke Portal OS */}
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-[#EFF4FF]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948]">
                          <span className="material-symbols-outlined text-[26px]">devices_fold</span>
                        </div>
                        <span className="px-3 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] font-sans text-[11px]">
                          Self-Hosted SaaS
                        </span>
                      </div>
                      <div className="font-sans text-[11px] uppercase tracking-wider text-[#565E74] font-medium">
                        Client Collaboration &amp; Sign-off
                      </div>
                      <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mt-1 mb-2">
                        Bespoke Portal OS
                      </h3>
                      <p className="font-sans text-[15px] text-[#3D4A42] mb-4">
                        A private, white-labeled client cockpit for enterprise agencies and construction firms. Streamline architectural milestone sign-offs, deliver high-res CAD &amp; asset packets, and maintain transparent audit trails.
                      </p>
                      <ul className="space-y-2 font-sans text-[13px] text-[#0B1C30] mb-6">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Passwordless magic links with tamper-proof token expiration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Milestone approval logs with biometric/canvas e-signature</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Deployable via single Docker container on your internal VPS</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#565E74]">STACK: NEXT.JS / GO / POSTGRES</span>
                      <a
                        className="font-display font-semibold text-[15px] text-[#006948] hover:text-[#005238] inline-flex items-center gap-1"
                        href="https://wa.me/971567064457?text=Interested%20in%20Bespoke%20Portal%20OS"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore Architecture <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>

                  {/* Product 3: SpeedEdge Headless CMS */}
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-[#EFF4FF]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948]">
                          <span className="material-symbols-outlined text-[26px]">speed</span>
                        </div>
                        <span className="px-3 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] font-sans text-[11px]">
                          High Performance
                        </span>
                      </div>
                      <div className="font-sans text-[11px] uppercase tracking-wider text-[#565E74] font-medium">
                        Content Infrastructure
                      </div>
                      <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mt-1 mb-2">
                        SpeedEdge Headless CMS
                      </h3>
                      <p className="font-sans text-[15px] text-[#3D4A42] mb-4">
                        Designed for luxury brands and fintech marketing desks that demand flawless 100/100 Google Lighthouse speed scores. Static pre-rendering combined with instant edge content invalidation.
                      </p>
                      <ul className="space-y-2 font-sans text-[13px] text-[#0B1C30] mb-6">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Zero client-side JS runtime overhead for pure editorial content</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Git-backed Markdown &amp; JSON schema version control</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Native AVIF/WebP image pipeline with automatic responsive srcsets</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#565E74]">STACK: ASTRO / TAILWIND / EDGE WORKERS</span>
                      <a
                        className="font-display font-semibold text-[15px] text-[#006948] hover:text-[#005238] inline-flex items-center gap-1"
                        href="https://wa.me/971567064457?text=Interested%20in%20SpeedEdge%20CMS"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Benchmarks <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>

                  {/* Product 4: LedgerSync Microservice */}
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-[#EFF4FF]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948]">
                          <span className="material-symbols-outlined text-[26px]">account_balance</span>
                        </div>
                        <span className="px-3 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] font-sans text-[11px]">
                          Fintech Core
                        </span>
                      </div>
                      <div className="font-sans text-[11px] uppercase tracking-wider text-[#565E74] font-medium">
                        Reconciliation &amp; Banking API
                      </div>
                      <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mt-1 mb-2">
                        LedgerSync Microservice
                      </h3>
                      <p className="font-sans text-[15px] text-[#3D4A42] mb-4">
                        Self-hosted financial reconciliation engine connecting Stripe, Checkout.com, Tap Payments, and standard MT940 bank feeds into double-entry accounting ledgers with webhook idempotency.
                      </p>
                      <ul className="space-y-2 font-sans text-[13px] text-[#0B1C30] mb-6">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Guaranteed exactly-once execution for cross-currency payouts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Automatic settlement variance detection and FX fee audits</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                          <span>Air-gapped transaction signing and encrypted vault storage</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#565E74]">STACK: GOLANG / POSTGRESQL / NATS</span>
                      <a
                        className="font-display font-semibold text-[15px] text-[#006948] hover:text-[#005238] inline-flex items-center gap-1"
                        href="https://wa.me/971567064457?text=Interested%20in%20LedgerSync"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read API Docs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bottom Customization & Contact Call-to-Action */}
              <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-4 pb-12">
                <div className="bg-gradient-to-br from-[#006948] via-[#006948] to-[#004e35] rounded-2xl p-6 lg:p-12 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-sans text-[11px] uppercase tracking-widest font-semibold mb-4 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-[#85F8C4]"></span>
                      Tailored Engineering · White-Label Releases
                    </div>
                    <h2 className="font-display font-extrabold text-[42px] lg:text-[56px] leading-[48px] lg:leading-[64px] tracking-tight mb-4">
                      Need BillionDue Customized for Your Workflow?
                    </h2>
                    <p className="font-sans text-[18px] leading-[28px] text-white/80 mb-8">
                      Every business is unique. We build tailored ERP connectors, branded enterprise releases, custom thermal invoice schemas, and proprietary hardware integrations with our team in Dubai and London.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        className="inline-flex items-center gap-2 bg-white text-[#006948] font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg hover:bg-slate-50 transition-all shadow-md"
                        href="https://wa.me/971567064457?text=Hello%20Team%20BC%20Dev,%20I%20would%20like%20to%20discuss%20customizing%20BillionDue%20or%20building%20a%20new%20product"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#006948]">chat</span>
                        <span>WhatsApp Direct: +971 567064457</span>
                      </a>
                      <button
                        onClick={() => switchTab("contact")}
                        className="inline-flex items-center gap-2 bg-white/15 text-white hover:bg-white/25 font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        <span>Schedule Architecture Audit</span>
                      </button>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center gap-6 text-white/70 font-sans text-[12px] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#85F8C4]">check_circle</span> Fixed Scope Pricing
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#85F8C4]">check_circle</span> Full IP &amp; Source Delivery Options
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#85F8C4]">check_circle</span> Ongoing Engineering SLAs
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          TAB 3 & 4: CONTACT US & ABOUT US (team_bc_dev_contact_page)
          ==================================================================== */}
      {(activeTab === "contact" || activeTab === "about") && (
        <main className="w-full bg-[#F8F9FF] min-h-[calc(100vh-80px)]">
          <div className="flex flex-col w-full">
            {/* Subtle Ambient Glow Canvas Decor */}
            <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-12 overflow-hidden">
              <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#85F8C4]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#DAE2FD]/25 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header & Hero Block */}
              <section className="relative z-10 max-w-4xl space-y-4">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DCE9FF]/80 backdrop-blur-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
                  <span className="font-sans text-[12px] text-[#006948] font-semibold tracking-wider uppercase">
                    Direct Builder Access • Zero Sales Reps
                  </span>
                </div>

                {/* Hero Headline & Subtitle */}
                <h1 className="font-display font-extrabold text-[42px] lg:text-[56px] leading-[48px] lg:leading-[64px] text-[#0B1C30] tracking-tight">
                  Speak Directly With The Engineers
                </h1>
                <p className="font-sans text-[18px] leading-[28px] text-[#3D4A42] max-w-3xl leading-relaxed">
                  No account managers, no 40-slide sales pitches. Reach out with your current software bottlenecks or project specs, and receive an honest architectural breakdown within 24 hours.
                </p>

                {/* Key Engineering Metrics Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-6 text-[#3D4A42]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006948] text-[20px]">timer</span>
                    <span className="font-sans text-[13px] font-medium">
                      Avg Response: <strong className="text-[#0B1C30] font-semibold">1h 48m</strong>
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#BCCAC0]"></div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006948] text-[20px]">terminal</span>
                    <span className="font-sans text-[13px] font-medium">
                      Sprint Intake: <strong className="text-[#0B1C30] font-semibold">2 Build Slots Left (Q2)</strong>
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#BCCAC0]"></div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006948] text-[20px]">verified_user</span>
                    <span className="font-sans text-[13px] font-medium">Strict NDA by Default</span>
                  </div>
                </div>
              </section>

              {/* Main Consultation Hub Grid (2 Columns) */}
              <section className="relative z-10 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Direct Communication Channels & Regional Hubs (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Priority Channels Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm space-y-5 border border-[#EFF4FF]">
                    <div className="flex items-center justify-between pb-3">
                      <span className="font-sans text-[12px] text-[#006948] uppercase font-bold tracking-wider">
                        Fast-Lane Dispatch
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#85F8C4]/40 text-[#005137] font-sans text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span> Online Now
                      </span>
                    </div>

                    {/* WhatsApp Channel */}
                    <a
                      className="group flex items-start gap-4 p-3.5 rounded-lg bg-[#F8F9FF] hover:bg-[#EFF4FF] transition-all"
                      href="https://wa.me/971567064457"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-11 h-11 rounded-lg bg-[#85F8C4] flex items-center justify-center text-[#006948] group-hover:scale-105 transition-transform flex-shrink-0">
                        <span className="material-symbols-outlined text-[24px]">chat</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-[18px] text-[#0B1C30] truncate">
                            WhatsApp&nbsp;
                          </span>
                          <span className="material-symbols-outlined text-[#006948] text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_outward
                          </span>
                        </div>
                        <p className="font-display font-semibold text-[15px] text-[#006948] mt-0.5">
                          +971 567064457
                        </p>
                        <p className="font-sans text-[13px] text-[#3D4A42] mt-1">
                          English &amp; Arabic Developer Hotline
                        </p>
                      </div>
                    </a>

                    {/* Founder Email Channel */}
                    <a
                      className="group flex items-start gap-4 p-3.5 rounded-lg bg-[#F8F9FF] hover:bg-[#EFF4FF] transition-all"
                      href="mailto:teambcdev@gmail.com"
                    >
                      <div className="w-11 h-11 rounded-lg bg-[#DAE2FD] flex items-center justify-center text-[#131B2E] flex-shrink-0">
                        <span className="material-symbols-outlined text-[24px]">mail</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-[18px] text-[#0B1C30] truncate">
                            Lead Architect Desk
                          </span>
                          <span className="material-symbols-outlined text-[#006948] text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_outward
                          </span>
                        </div>
                        <p className="font-display font-semibold text-[15px] text-[#0B1C30] mt-0.5 truncate">
                          teambcdev@gmail.com
                        </p>
                        <p className="font-sans text-[13px] text-[#3D4A42] mt-1">
                          Send PRDs, ERDs, schema diagrams, or RFP docs. PGP key available.
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Regional Delivery Hubs & Map Cards */}
                  <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 border border-[#EFF4FF]">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[12px] text-[#565E74] uppercase font-bold tracking-wider">
                        Engineering Presence
                      </span>
                    </div>

                    {/* Location: Sharjah Hub */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-md bg-[#E5EEFF] flex items-center justify-center text-[#006948] flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h2 className="font-display font-bold text-[15px] text-[#0B1C30]">
                              Sharjah, UAE
                            </h2>
                          </div>
                          <p className="font-sans text-[13px] text-[#3D4A42]">
                            Industrial Area 5, Sharjah, UAE
                          </p>
                        </div>
                      </div>

                      {/* Interactive Map Viewport */}
                      <div
                        className="w-full h-28 bg-[#EFF4FF] rounded-lg bg-cover bg-center overflow-hidden relative shadow-inner"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-EEXpvmwyQhld1kY8DjVYr0fwSqxyWFVApvtUkQB73k4u6ZjnYFSCf_BJa3jYFk6hCAvFxOITFSVS1CJb0yRSPKK_iMmj-xGY6_kNoasNf6uALUxZAzQG0TQvKP9-icO1givaaSN97-LLKLVacWhIjFO9cD3G6dftJyIjFAdqJ6KBF8XamWdjUoZktvPoACu0H02XFjkWuYG5OYukphiWHX_pfxei8qT9MJHy8FM")',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C30]/50 to-transparent flex items-end p-2.5">
                          <span className="font-sans text-[11px] text-white font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#85F8C4]"></span> GCC Regional Hub
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engineering Pledges Card */}
                  <div className="bg-[#EFF4FF] rounded-xl p-6 shadow-sm space-y-4 border border-[#E5EEFF]">
                    <span className="font-sans text-[12px] text-[#006948] font-bold uppercase tracking-wider block">
                      Our Builder Code of Honor
                    </span>
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5">check_circle</span>
                        <div>
                          <p className="font-display font-semibold text-[15px] text-[#0B1C30]">Zero Sales Pressure</p>
                          <p className="font-sans text-[13px] text-[#3D4A42]">
                            If an existing off-the-shelf SaaS or $20/month tool solves your bottleneck better, we will explicitly advise you to use that instead.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5">check_circle</span>
                        <div>
                          <p className="font-display font-semibold text-[15px] text-[#0B1C30]">Fixed-Scope Architecture &amp; Milestones</p>
                          <p className="font-sans text-[13px] text-[#3D4A42]">
                            Clear functional specs. No surprise line items. 100% of the repository, documentation, and database belong to you unconditionally.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5">check_circle</span>
                        <div>
                          <p className="font-display font-semibold text-[15px] text-[#0B1C30]">Strict Mutual NDA By Default</p>
                          <p className="font-sans text-[13px] text-[#3D4A42]">
                            Your proprietary inventory logic, accounting flows, and margins stay protected under bilateral Canadian, US &amp; UAE confidentiality frameworks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Consultation & Blueprint Request Form (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 lg:p-10 shadow-md relative border border-[#EFF4FF]">
                  <div className="space-y-2 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#85F8C4]/30 text-[#005137] font-sans text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">developer_mode</span>
                      Architectural Intake Form
                    </div>
                    <h2 className="font-display font-extrabold text-[36px] leading-[44px] text-[#0B1C30] tracking-tight">
                      Start an Architectural Dialogue
                    </h2>
                    <p className="font-sans text-[15px] text-[#3D4A42]">
                      Tell us what your business runs on and what needs fixing. A senior engineer will review your inputs and draft an initial system schema.
                    </p>
                  </div>

                  <form className="space-y-5" onSubmit={handleContactSubmit}>
                    {/* Row 1: Name and Work Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                          Full Name <span className="text-[#006948]">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[15px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm transition-all"
                          placeholder="e.g. Alexander Vance"
                          required
                          type="text"
                          value={contactFullName}
                          onChange={(e) => setContactFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                          Work Email <span className="text-[#006948]">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[15px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm transition-all"
                          placeholder="alex@company.com"
                          required
                          type="email"
                          value={contactWorkEmail}
                          onChange={(e) => setContactWorkEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 2: Direct Phone/WhatsApp & Industry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                          Phone / WhatsApp
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            className="px-3 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[13px] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm cursor-pointer"
                            value={contactCountryCode}
                            onChange={(e) => setContactCountryCode(e.target.value)}
                          >
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+1">🇨🇦 / 🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+65">🇸🇬 +65</option>
                          </select>
                          <input
                            className="flex-1 px-4 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[15px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm transition-all"
                            placeholder="50 123 4567"
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                          Industry Sector
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm cursor-pointer"
                          value={contactIndustry}
                          onChange={(e) => setContactIndustry(e.target.value)}
                        >
                          <option value="retail">Retail / Multi-Store Commerce</option>
                          <option value="logistics">Freight, Fleet &amp; Logistics</option>
                          <option value="fintech">Fintech, VAT &amp; Accounting</option>
                          <option value="professional">Professional B2B Services</option>
                          <option value="manufacturing">Manufacturing &amp; Warehousing</option>
                          <option value="other">Other High-Growth Operation</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Solution Selection (Interactive Multi-Select Pills) */}
                    <div className="space-y-2.5">
                      <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                        Primary Objective / Target Solution{" "}
                        <span className="text-[#565E74] font-normal text-[13px]">
                          (Select all that apply)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => togglePill("billiondue")}
                          className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedPills.includes("billiondue")
                              ? "bg-[#006948] text-white shadow-sm"
                              : "bg-[#F8F9FF] text-[#3D4A42] hover:bg-[#EFF4FF]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">receipt_long</span> BillionDue Invoicing &amp; VAT
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePill("inventory")}
                          className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedPills.includes("inventory")
                              ? "bg-[#006948] text-white shadow-sm"
                              : "bg-[#F8F9FF] text-[#3D4A42] hover:bg-[#EFF4FF]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span> Inventory &amp; Barcode Scanners
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePill("portal")}
                          className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedPills.includes("portal")
                              ? "bg-[#006948] text-white shadow-sm"
                              : "bg-[#F8F9FF] text-[#3D4A42] hover:bg-[#EFF4FF]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">groups</span> Bespoke Client Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePill("webplatform")}
                          className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedPills.includes("webplatform")
                              ? "bg-[#006948] text-white shadow-sm"
                              : "bg-[#F8F9FF] text-[#3D4A42] hover:bg-[#EFF4FF]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">speed</span> High-Speed Web Platform
                        </button>
                      </div>
                    </div>

                    {/* Current Stack / Bottleneck Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-display font-medium text-[15px] text-[#0B1C30]">
                          Current Stack &amp; Bottlenecks <span className="text-[#006948]">*</span>
                        </label>
                        <span className="font-sans text-[11px] text-[#565E74]">
                          The more specific, the faster we scope
                        </span>
                      </div>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg bg-[#F8F9FF] text-[#0B1C30] font-sans text-[15px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#006948] shadow-sm transition-all"
                        placeholder="Describe the clunky workflows, recurring SaaS costs, or offline requirements. (e.g., 'We have 4 warehouses manually keying receipts into spreadsheets, costing us 20 hours a week and causing stock errors...')"
                        required
                        rows={4}
                        value={contactBottlenecks}
                        onChange={(e) => setContactBottlenecks(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Submit Button & Success Flash */}
                    <div className="pt-2 space-y-4">
                      {!isContactSubmitted ? (
                        <button
                          type="submit"
                          disabled={isContactSubmitting}
                          className="w-full py-4 px-6 rounded-lg bg-[#006948] hover:bg-[#005238] text-white font-display font-bold text-[18px] flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                        >
                          {isContactSubmitting ? (
                            <>
                              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                              Encrypting &amp; Dispatching...
                            </>
                          ) : (
                            "Submit Architectural Inquiry"
                          )}
                        </button>
                      ) : (
                        <div className="p-4 rounded-lg bg-[#85F8C4]/40 text-[#005137] flex items-center gap-3 border border-[#85F8C4]">
                          <span className="material-symbols-outlined text-[#006948] text-[28px]">verified</span>
                          <div>
                            <p className="font-display font-bold text-[15px]">
                              Inquiry Transmitted Directly to Engineering
                            </p>
                            <p className="font-sans text-[13px]">
                              Thank you. An architectural analysis will be prepared and emailed within 24 hours.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </section>

              {/* Bottom Reassurance Strip */}
              <section className="relative z-10 mt-16 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-xl p-6 shadow-sm border border-[#EFF4FF]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#85F8C4] flex items-center justify-center text-[#006948] font-bold font-display text-[20px]">
                    BC
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[15px] text-[#0B1C30]">
                      Have an urgent production fire or offline crisis?
                    </h3>
                    <p className="font-sans text-[13px] text-[#3D4A42]">
                      Our senior on-call team responds via our direct line{" "}
                      <span className="font-semibold text-[#006948]">
                        (Available UAE 1:00 PM – 10:00 PM GST)
                      </span>
                      .
                    </p>
                  </div>
                </div>
                <a
                  className="px-5 py-2.5 rounded-lg bg-[#E5EEFF] text-[#0B1C30] hover:bg-[#DCE9FF] font-display font-semibold text-[15px] transition-colors flex items-center gap-2"
                  href="https://wa.me/971567064457"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[#006948] text-[20px]">chat</span>
                  Ping Emergency Line (+971 567064457)
                </a>
              </section>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          GLOBAL FOOTER (Matches Stitch Design)
          ==================================================================== */}
      <footer className="w-full bg-[#EFF4FF] border-t border-[#E5EEFF] pt-12 pb-8 mt-12">
        <div className="max-w-[1232px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#D6E3F8]">
            {/* Brand & Global Presence */}
            <div className="col-span-1">
              <div
                onClick={() => switchTab("services")}
                className="flex items-center gap-2 mb-2 cursor-pointer"
              >
                <div className="w-[33px] h-[32px] rounded-lg bg-[#006948] flex items-center justify-center text-white font-bold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
                    <line x1="22" y1="11" x2="22" y2="13"></line>
                  </svg>
                </div>
                <span className="font-display font-extrabold text-[15px] leading-[22px] tracking-[-0.375px] text-[#0B1C30]">
                  Team BC Dev
                </span>
              </div>
              <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42] mb-4">
                Engineered for precision and uptime.
              </p>
              <div className="text-[12px] font-semibold text-[#0B1C30] uppercase tracking-[0.6px] mb-1">
                REGIONAL &amp; GLOBAL HUBS
              </div>
              <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                Sharjah Regional Studio: Industrial Area 5, Sharjah, UAE<br />
                Vancouver Innovation Hub: 742 Granville St, Suite 600
              </p>
            </div>

            {/* Services */}
            <div className="col-span-1">
              <div className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#0B1C30] mb-3">
                SERVICES
              </div>
              <ul className="space-y-2 text-[13px] text-[#3D4A42]">
                <li>
                  <button
                    onClick={() => switchTab("services")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    Accounting &amp; Invoicing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("services")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    Web Apps &amp; Client Portals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("services")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    Inventory &amp; Barcode Management
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("services")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    Custom Enterprise Websites
                  </button>
                </li>
              </ul>
            </div>

            {/* Developer Blog & Products */}
            <div className="col-span-1">
              <div className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#0B1C30] mb-3">
                PRODUCTS
              </div>
              <ul className="space-y-2 text-[13px] text-[#3D4A42]">
                <li>
                  <button
                    onClick={() => switchTab("products")}
                    className="hover:text-[#006948] text-left font-medium text-[#006948] cursor-pointer"
                  >
                    BillionDue Desktop v2.4
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("products")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    StockNode Matrix
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("products")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    Bespoke Portal OS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("products")}
                    className="hover:text-[#006948] text-left cursor-pointer"
                  >
                    SpeedEdge Headless CMS
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Inquiries */}
            <div className="col-span-1">
              <div className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#0B1C30] mb-3">
                CONTACT &amp; INQUIRIES
              </div>
              <ul className="space-y-2 text-[13px] text-[#3D4A42]">
                <li>
                  <a href="mailto:teambcdev@gmail.com" className="hover:text-[#006948]">
                    teambcdev@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+971567064457" className="hover:text-[#006948]">
                    +971 567064457 (WhatsApp)
                  </a>
                </li>
                <li className="pt-2">
                  <button
                    onClick={() => onOpenPortalLogin()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#006948] font-semibold text-[12px] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Client / Admin Portal Login
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-[13px] text-[#3D4A42] gap-4">
            <div>© 2025 Team BC Dev. All rights reserved. Precision bespoke engineering.</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => switchTab("about")}
                className="hover:text-[#006948] cursor-pointer"
              >
                About Us
              </button>
              <button
                onClick={() => switchTab("contact")}
                className="hover:text-[#006948] cursor-pointer"
              >
                Consultation Hub
              </button>
              <a
                href="https://wa.me/971567064457"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#006948]"
              >
                Direct Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
