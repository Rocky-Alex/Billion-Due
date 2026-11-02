import React, { useState } from "react";

interface HomePageProps {
  navigate: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function HomePage({ navigate, notify }: HomePageProps) {
  // Keep in Touch / Discovery form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    solution: "Billion Due Invoicing & Accounting",
    goal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      if (notify) notify("Please provide your name and email.", "warn");
      return;
    }
    if (notify) {
      notify(
        "Thank you! Team BC Dev has received your discovery request and will contact you shortly.",
        "ok"
      );
    }
    setFormData({
      name: "",
      email: "",
      solution: "Billion Due Invoicing & Accounting",
      goal: "",
    });
  };

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative pt-[40px] pb-16 flex flex-col items-center w-full">
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
        <h1 className="font-display font-extrabold text-[42px] md:text-[56px] leading-[48px] md:leading-[64px] tracking-[-1.4px] text-[#0B1C30] max-w-[1049px] mb-4">
          Custom Business Software Designed for Growth, Efficiency, and Ease of Use.
        </h1>

        {/* Subheadline */}
        <p className="font-sans font-normal text-[18px] leading-[28px] text-[#3D4A42] max-w-[624px] mb-8">
          From automated invoicing and accounting tools to custom inventory apps and modern web platforms, Team BC Dev helps small businesses and solo entrepreneurs streamline daily operations.
        </p>

        {/* CTA Buttons Row */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
          <button
            onClick={() => goTo("/products")}
            className="relative group flex items-center justify-center gap-2 px-6 py-2.5 bg-[#006948] hover:bg-[#005238] text-white font-display font-semibold text-[15px] leading-[22px] rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all cursor-pointer"
          >
            <span>Explore Flagship Products</span>
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
          </button>
          <button
            onClick={() => goTo("/contact")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#0B1C30] border border-[#EFF4FF] font-display font-semibold text-[15px] leading-[22px] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006948]">chat</span>
            <span>Consult With Engineers</span>
          </button>
        </div>

        {/* Trust Badges Strip */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
          <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">verified</span>
            <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
              50+ Deployments Done
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">lock_open</span>
            <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
              Zero Vendor Lock-in
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">shield</span>
            <span className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.48px] text-[#0B1C30]">
              Local-First Encryption
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 bg-[#EFF4FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg h-[33.5px]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">code</span>
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
          <div className="p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
              </div>
              <div className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#006948] mb-1">
                COMMERCIAL INVOICING
              </div>
              <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                Accounting &amp; Invoicing
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                Custom multi-currency billing, automated recurring subscription charging, reconciliation registers, and VAT-compliant fiscal receipt engines.
              </p>
              <div className="space-y-1 text-[13px] text-[#0B1C30]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  UAE FTA &amp; ZATCA Compliance
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Automated PDF Dispatch &amp; WhatsApp
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Custom Fiscal Tax Templates
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between mt-6">
              <span className="font-sans text-[12px] font-semibold text-[#006948]">
                FLAGSHIP ENGINE
              </span>
              <button
                onClick={() => goTo("/products")}
                className="font-display font-semibold text-[14px] text-[#006948] hover:text-[#005238] flex items-center gap-1 cursor-pointer"
              >
                <span>View BillionDue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Service 2: Web Apps & Client Portals */}
          <div className="p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                <span className="material-symbols-outlined text-[26px]">devices</span>
              </div>
              <div className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#006948] mb-1">
                PORTALS &amp; DASHBOARDS
              </div>
              <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                Web Apps &amp; Client Portals
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                White-labeled client login experiences. Give clients instant self-serve statements, invoice downloads, receipt archives, and license key status.
              </p>
              <div className="space-y-1 text-[13px] text-[#0B1C30]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Instant Magic Link / OTP Logins
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Real-time PostgreSQL Neon Sync
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Granular Role-Based Permissions
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between mt-6">
              <span className="font-sans text-[12px] font-semibold text-[#006948]">
                SECURE ACCESS
              </span>
              <button
                onClick={() => goTo("/contact")}
                className="font-display font-semibold text-[14px] text-[#006948] hover:text-[#005238] flex items-center gap-1 cursor-pointer"
              >
                <span>Request Scope</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Service 3: Inventory & Barcode Systems */}
          <div className="p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#EFF4FF] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-3">
                <span className="material-symbols-outlined text-[26px]">barcode_scanner</span>
              </div>
              <div className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#006948] mb-1">
                POINT OF SALE
              </div>
              <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30] mb-2">
                Inventory &amp; Barcode Systems
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mb-4">
                Hardware-accelerated inventory trackers, 1D/2D thermal roll barcode generators, multi-location stock replenishment registers, and point-of-sale registers.
              </p>
              <div className="space-y-1 text-[13px] text-[#0B1C30]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  USB Scanner Raw Hooking
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  80mm ESC/POS Printer Compatibility
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>
                  Sub-10ms Local SQLite Searches
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFF4FF] flex items-center justify-between mt-6">
              <span className="font-sans text-[12px] font-semibold text-[#006948]">
                RETAIL &amp; WAREHOUSE
              </span>
              <button
                onClick={() => goTo("/contact")}
                className="font-display font-semibold text-[14px] text-[#006948] hover:text-[#005238] flex items-center gap-1 cursor-pointer"
              >
                <span>Request Scope</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY & LOCAL-FIRST CODE ARCHITECTURE SHOWCASE */}
      <section className="relative z-10 w-full max-w-[1232px] mx-auto mt-16 px-6">
        <div className="bg-[#213145] rounded-2xl p-8 lg:p-12 text-[#E5EEFF] shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#85F8C4] mb-2 block">
                SYSTEM PHILOSOPHY
              </span>
              <h2 className="font-display font-extrabold text-[36px] lg:text-[44px] leading-[44px] lg:leading-[52px] text-white tracking-tight mb-4">
                Perpetual Software Ownership Over Cloud Subscription Traps.
              </h2>
              <p className="font-sans text-[16px] leading-[26px] text-[#D3E4FE]/90 mb-6">
                Most enterprise platforms charge you hundreds of dollars every month just to access your own invoices and client data. If you stop paying, your entire company is held hostage.
              </p>
              <div className="space-y-3 font-sans text-[14px] text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#85F8C4] text-[20px]">check_circle</span>
                  <span>100% Data Sovereignty: All records stored in local AES-256 SQLite vaults on your PC.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#85F8C4] text-[20px]">check_circle</span>
                  <span>True Offline Operations: Keep running sales and billing even when the internet is cut.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#85F8C4] text-[20px]">check_circle</span>
                  <span>Perpetual One-Time Licenses: Pay once, deploy, and own your tools forever.</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => goTo("/products")}
                  className="px-6 py-2.5 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-[15px] transition-all cursor-pointer shadow-md"
                >
                  View BillionDue Pricing &amp; Demos
                </button>
                <button
                  onClick={() => goTo("/about")}
                  className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-[15px] transition-all cursor-pointer backdrop-blur-sm"
                >
                  Read Our Full Manifesto
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 font-mono text-[12px] bg-[#121B27] p-6 rounded-xl border border-white/10 text-[#85F8C4] shadow-inner overflow-x-auto">
              <div className="text-white/40 mb-3">// Team BC Dev Architecture Stack</div>
              <div className="text-[#85F8C4]">export const AgencyStack = &#123;</div>
              <div className="pl-4">ownership: <span className="text-[#6FFBBE]">"100%_Client"</span>,</div>
              <div className="pl-4">subscriptions: <span className="text-[#85F8C4]">0</span>,</div>
              <div className="pl-4">deployTime: <span className="text-[#6FFBBE]">"14_Days"</span>,</div>
              <div className="pl-4">encryption: <span className="text-[#6FFBBE]">"AES-GCM"</span>,</div>
              <div className="pl-4">database: <span className="text-[#6FFBBE]">"SQLite_Embedded"</span>,</div>
              <div className="pl-4">latency: <span className="text-[#6FFBBE]">"&lt;15ms"</span>,</div>
              <div className="pl-4">offlineFirst: <span className="text-[#68DBA9]">true</span>,</div>
              <div className="pl-4">regionalHubs: [</div>
              <div className="pl-8 text-white/80">"Dubai (DIFC / Business Bay)",</div>
              <div className="pl-8 text-white/80">"London (Silicon Roundabout, EC2A)"</div>
              <div className="pl-4">]</div>
              <div className="text-[#85F8C4]">&#125;;</div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOVERY INTAKE FORM */}
      <section className="relative z-10 w-full max-w-[800px] mx-auto mt-20 px-6">
        <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-[#EFF4FF]">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#006948] mb-1 block">
              QUICK DISCOVERY
            </span>
            <h2 className="font-display font-bold text-[30px] text-[#0B1C30]">
              Start a Conversation With Our Engineers
            </h2>
            <p className="font-sans text-[14px] text-[#3D4A42] mt-1">
              Tell us what operational bottlenecks you're facing. We will reply within 24 business hours with an honest scope.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>
              <div>
                <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                Solution of Interest
              </label>
              <select
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
              >
                <option value="Billion Due Invoicing & Accounting">Billion Due Invoicing &amp; Accounting</option>
                <option value="Custom Desktop Point of Sale & Inventory">Custom Desktop POS &amp; Inventory</option>
                <option value="White-Labeled Client Account Portal">White-Labeled Client Account Portal</option>
                <option value="Proprietary Hardware / Thermal Driver Engine">Proprietary Hardware / Thermal Driver Engine</option>
                <option value="Complete Bespoke ERP Architecture">Complete Bespoke ERP Architecture</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                Brief Description of Current System or Bottleneck
              </label>
              <textarea
                rows={3}
                placeholder="Describe your current setup, expected workstation volume, or desired features..."
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#006948] hover:bg-[#005238] text-white font-display font-semibold text-[15px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Transmit Project Specification</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
