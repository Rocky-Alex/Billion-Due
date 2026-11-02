import React, { useState } from "react";
import { windowsInstallerUrl } from "@billiondue/shared";

interface ProductsPageProps {
  navigate: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function ProductsPage({ navigate, notify }: ProductsPageProps) {
  const [pricingCurrency, setPricingCurrency] = useState<"AED" | "USD">("AED");

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="w-full bg-[#F8F9FF] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glows */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-[#85F8C4]/20 via-[#00855D]/10 to-[#D3E4FE]/40 blur-3xl pointer-events-none -z-10 rounded-full"></div>

          {/* Top Introduction Banner */}
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-8 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5EEFF]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00855D] text-[#F5FFF7] font-sans text-[11px] uppercase tracking-widest font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#85F8C4] animate-ping"></span>
                  Software Catalog · Q2 2025
                </span>
                <span className="font-sans text-[13px] text-[#3D4A42]">
                  4 Production-Ready Systems · Zero Subscription SaaS Traps
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#3D4A42] font-sans text-[12px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">verified_user</span>
                  Air-Gapped Capable
                </span>
                <span className="hidden sm:inline text-[#BCCAC0]">·</span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006948]">bolt</span>
                  Sub-15ms Latency
                </span>
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div className="mt-8 max-w-3xl">
              <h1 className="font-display font-extrabold text-[44px] md:text-[56px] leading-[48px] md:leading-[64px] tracking-[-1.4px] text-[#0B1C30] mb-3">
                Perpetual Software. <br />
                <span className="text-[#006948]">Zero Monthly Hostage.</span>
              </h1>
              <p className="font-sans text-[18px] leading-[28px] text-[#3D4A42]">
                We engineer standalone, lightning-fast commercial software tools that run directly on your hardware. No vendor lock-in, zero cloud subscription bloat, and ironclad local privacy built for ambitious GCC &amp; global operators.
              </p>
            </div>
          </div>

          {/* Flagship Product Feature: BillionDue */}
          <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-4 pb-12">
            <div className="bg-white rounded-xl p-6 lg:p-10 shadow-[0_10px_30px_-5px_rgba(11,28,48,0.06)] relative">
              {/* Header Badge & Title Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#00855D] text-[#F5FFF7] font-sans text-[11px] uppercase tracking-wider font-semibold">
                      FLAGSHIP
                    </span>
                    <span className="font-sans text-[11px] text-[#565E74] font-medium">
                      v2.4 LTS Build
                    </span>
                    <span className="inline-flex items-center gap-1 font-sans text-[11px] text-[#006948] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span> UAE FTA Certified Ready
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] tracking-tight text-[#0B1C30]">
                    BillionDue Desktop
                  </h2>
                  <p className="font-sans text-[15px] text-[#3D4A42] mt-1">
                    High-throughput offline-first billing, tax ledgering, and instant POS engine for GCC merchants and global agencies.
                  </p>
                </div>

                {/* Quick Actions / Meta */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={windowsInstallerUrl}
                    download="BillionDue Setup 0.1.0.exe"
                    className="inline-flex items-center gap-2 bg-[#006948] text-white font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg hover:bg-[#00855D] transition-all shadow-[0_2px_8px_rgba(0,105,72,0.2)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Standalone v2.4</span>
                  </a>
                  <a
                    href="https://wa.me/971567064457?text=Hi%20Team%20BC%20Dev,%20I%20would%20like%20a%20live%20walkthrough%20of%20BillionDue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#E5EEFF] text-[#0B1C30] font-display font-semibold text-[15px] px-5 py-2.5 rounded-lg hover:bg-[#D3E4FE] transition-colors"
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

              {/* 4-Card Deep Dive Grid for BillionDue (Matches Image 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {/* Pillar 1: Zero Cloud Hostage */}
                <div className="bg-[#EFF4FF] p-5 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors border border-[#D3E4FE]/50 shadow-sm">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-4">
                      <span className="material-symbols-outlined text-[24px]">database</span>
                    </div>
                    <h3 className="font-display font-semibold text-[18px] leading-[26px] text-[#0B1C30] mb-1">
                      Zero Cloud Hostage
                    </h3>
                    <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                      Your customer accounts and invoices stay securely on your hardware in an encrypted SQLite database. Zero monthly software rent, zero surprise server outages, and instant sub-12ms queries.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#D3E4FE]/60 flex items-center justify-between font-sans text-[12px] text-[#006948] font-semibold">
                    <span>$0.00 / Mo Forever</span>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                </div>

                {/* Pillar 2: UAE FTA & GCC Tax Ready */}
                <div className="bg-[#EFF4FF] p-5 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors border border-[#D3E4FE]/50 shadow-sm">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-4">
                      <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                    </div>
                    <h3 className="font-display font-semibold text-[18px] leading-[26px] text-[#0B1C30] mb-1">
                      UAE FTA &amp; GCC Tax Ready
                    </h3>
                    <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                      Engineered for Dubai, Abu Dhabi, Riyadh, and Doha merchant standards. Pre-configured 5% UAE VAT calculations, TLV/ZATCA/FTA validated QR generator, and dual English &amp; Arabic layouts.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#D3E4FE]/60 flex items-center justify-between font-sans text-[12px] text-[#006948] font-semibold">
                    <span>1-Click WhatsApp PDF</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </div>
                </div>

                {/* Pillar 3: Direct Thermal POS Engine */}
                <div className="bg-[#EFF4FF] p-5 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors border border-[#D3E4FE]/50 shadow-sm">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-4">
                      <span className="material-symbols-outlined text-[24px]">print</span>
                    </div>
                    <h3 className="font-display font-semibold text-[18px] leading-[26px] text-[#0B1C30] mb-1">
                      Direct Thermal POS Engine
                    </h3>
                    <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                      Designed for retail checkout desks, repair shops, and trade counters. Direct ESC/POS printing over USB &amp; Network to 80mm roll printers in 180ms without clunky browser print prompts.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#D3E4FE]/60 flex items-center justify-between font-sans text-[12px] text-[#006948] font-semibold">
                    <span>USB / LAN ESC-POS</span>
                    <span className="material-symbols-outlined text-[16px]">receipt</span>
                  </div>
                </div>

                {/* Pillar 4: Multi-Currency Ledger */}
                <div className="bg-[#EFF4FF] p-5 rounded-xl flex flex-col justify-between hover:bg-[#E5EEFF] transition-colors border border-[#D3E4FE]/50 shadow-sm">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006948] shadow-sm mb-4">
                      <span className="material-symbols-outlined text-[24px]">currency_exchange</span>
                    </div>
                    <h3 className="font-display font-semibold text-[18px] leading-[26px] text-[#0B1C30] mb-1">
                      Multi-Currency Ledger
                    </h3>
                    <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42]">
                      Real-time tracking across AED, USD, EUR, CAD, and GBP. Maintain customer accounts balance sheets, generate statement PDFs, and review periodic revenue summaries with clean financial precision.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#D3E4FE]/60 flex items-center justify-between font-sans text-[12px] text-[#006948] font-semibold">
                    <span>Instant Statement PDF</span>
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                  </div>
                </div>
              </div>

              {/* Download & Distribution CTAs Bar */}
              <div
                className="mt-8 p-5 bg-[#E5EEFF] rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4"
                id="downloads"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#006948] flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[28px]">deployed_code</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[17px] text-[#0B1C30]">
                      Ready to operate BillionDue in your business?
                    </div>
                    <div className="font-sans text-[13px] text-[#3D4A42]">
                      Release 2.4.1 Build 892 · SHA-256 Verified · Native Arm64 &amp; x64 Binaries
                    </div>
                  </div>
                </div>

                {/* Platform Downloads Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      notify?.("macOS build available upon enterprise consultation request.", "ok")
                    }
                    className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[14px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">laptop_mac</span> macOS (Apple Silicon / Intel)
                  </button>
                  <a
                    href={windowsInstallerUrl}
                    download="BillionDue Setup 0.1.0.exe"
                    className="px-4 py-2 rounded-lg bg-[#006948] text-white hover:bg-[#005238] font-display font-semibold text-[14px] shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">window</span> Windows 10/11 x64
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      notify?.("Linux AppImage available upon enterprise request.", "ok")
                    }
                    className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[14px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">terminal</span> Linux AppImage
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section for Perpetual Licences with Currency Toggle */}
          <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#006948] font-semibold">
                  Transparent Ownership
                </span>
                <h2 className="font-display font-bold text-[36px] leading-[44px] tracking-[-0.9px] text-[#0B1C30] mt-1">
                  Subscription.
                </h2>
              </div>

              {/* Currency Toggle Switcher */}
              <div className="inline-flex items-center p-1 bg-[#E5EEFF] border border-[#D3E4FE] rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setPricingCurrency("AED")}
                  className={`px-4 py-1.5 rounded-lg font-sans text-[14px] leading-[20px] transition-all cursor-pointer ${
                    pricingCurrency === "AED"
                      ? "bg-[#006948] text-white font-semibold shadow-sm"
                      : "text-[#3D4A42] font-medium hover:text-[#0B1C30]"
                  }`}
                >
                  AED (د.إ)
                </button>
                <button
                  type="button"
                  onClick={() => setPricingCurrency("USD")}
                  className={`px-4 py-1.5 rounded-lg font-sans text-[14px] leading-[20px] transition-all cursor-pointer ${
                    pricingCurrency === "USD"
                      ? "bg-[#006948] text-white font-semibold shadow-sm"
                      : "text-[#3D4A42] font-medium hover:text-[#0B1C30]"
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* 3 Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Tier 1: Starter */}
              <div className="bg-white rounded-xl border border-[#BCCAC0]/30 p-6 flex flex-col justify-between shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#3D4A42]">
                      SINGLE DESK
                    </span>
                    <span className="bg-[#E5EEFF] text-[#3D4A42] font-sans font-semibold text-[11px] px-2 py-0.5 rounded">
                      STARTER
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30]">
                    Basic
                  </h3>
                  <p className="font-sans font-normal text-[13px] leading-[20px] text-[#3D4A42] mt-1 mb-4 min-h-[40px]">
                    Perfect for boutique consultancies, single service desks, or freelance contractors.
                  </p>
                  <div className="flex items-baseline gap-1.5 pb-5 border-b border-[#E5EEFF]">
                    <span className="font-display font-extrabold text-[30px] leading-[36px] text-[#0B1C30]">
                      {pricingCurrency === "AED" ? "AED 999" : "$270"}
                    </span>
                    <span className="font-sans font-medium text-[13px] text-[#3D4A42]">
                      / perpetual licence
                    </span>
                  </div>
                  <ul className="space-y-3 pt-5 font-sans text-[13px] leading-[20px] text-[#0B1C30]">
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>1 Physical Workstation Activation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Invoices, Quotes &amp; Receipts Generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>AES-256 Encrypted SQLite Local Database</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Thermal &amp; A4 PDF Layouts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Motherboard-Locked Hardware Security</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 mt-6 border-t border-[#EFF4FF]">
                  <a
                    href="https://wa.me/971567064457?text=Hi%20Team%20BC%20Dev,%20I'd%20like%20to%20order%20the%20BillionDue%20Basic%20Tier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] font-display font-semibold text-[14px] transition-colors"
                  >
                    Acquire Basic Licence
                  </a>
                </div>
              </div>

              {/* Tier 2: Plus (Most Popular) */}
              <div className="bg-white rounded-xl border-2 border-[#006948] p-6 flex flex-col justify-between shadow-[0px_10px_30px_-5px_rgba(0,105,72,0.15)] relative transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#006948] text-white text-[11px] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  MOST POPULAR FOR AGENCIES
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#006948]">
                      COMMERCIAL DESK
                    </span>
                    <span className="bg-[#00855D] text-[#F5FFF7] font-sans font-semibold text-[11px] px-2 py-0.5 rounded">
                      PLUS
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30]">
                    Plus
                  </h3>
                  <p className="font-sans font-normal text-[13px] leading-[20px] text-[#3D4A42] mt-1 mb-4 min-h-[40px]">
                    Ideal for growing commercial businesses, trade outlets, and multi-currency operations.
                  </p>
                  <div className="flex items-baseline gap-1.5 pb-5 border-b border-[#E5EEFF]">
                    <span className="font-display font-extrabold text-[30px] leading-[36px] text-[#0B1C30]">
                      {pricingCurrency === "AED" ? "AED 1,899" : "$515"}
                    </span>
                    <span className="font-sans font-medium text-[13px] text-[#3D4A42]">
                      / perpetual licence
                    </span>
                  </div>
                  <ul className="space-y-3 pt-5 font-sans text-[13px] leading-[20px] text-[#0B1C30]">
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="font-semibold">3 Multi-Seat Workstation Licences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Invoices, Performa Invoices, Receipts &amp; Payments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Multi-Currency (AED, USD, EUR, GBP, CAD)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Direct 80mm ESC/POS Thermal Printing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>UAE FTA 5% VAT &amp; ZATCA QR Compliant</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 mt-6 border-t border-[#EFF4FF]">
                  <a
                    href="https://wa.me/971567064457?text=Hi%20Team%20BC%20Dev,%20I'd%20like%20to%20order%20the%20BillionDue%20Plus%20Tier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#006948] hover:bg-[#005238] text-white font-display font-semibold text-[14px] shadow-sm transition-all"
                  >
                    Acquire Plus Licence
                  </a>
                </div>
              </div>

              {/* Tier 3: Premium */}
              <div className="bg-white rounded-xl border border-[#BCCAC0]/30 p-6 flex flex-col justify-between shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#3D4A42]">
                      ENTERPRISE FLEET
                    </span>
                    <span className="bg-[#E5EEFF] text-[#3D4A42] font-sans font-semibold text-[11px] px-2 py-0.5 rounded">
                      PREMIUM
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] leading-[32px] tracking-[-0.36px] text-[#0B1C30]">
                    Premium
                  </h3>
                  <p className="font-sans font-normal text-[13px] leading-[20px] text-[#3D4A42] mt-1 mb-4 min-h-[40px]">
                    Tailored for retail chains, corporate multi-branch warehouses, and specialized ERP setups.
                  </p>
                  <div className="flex items-baseline gap-1.5 pb-5 border-b border-[#E5EEFF]">
                    <span className="font-display font-extrabold text-[30px] leading-[36px] text-[#0B1C30]">
                      {pricingCurrency === "AED" ? "AED 3,499" : "$950"}
                    </span>
                    <span className="font-sans font-medium text-[13px] text-[#3D4A42]">
                      / perpetual licence
                    </span>
                  </div>
                  <ul className="space-y-3 pt-5 font-sans text-[13px] leading-[20px] text-[#0B1C30]">
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="font-semibold">Unlimited Local Terminal Activations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Full Custom Thermal Schema &amp; Brand Colors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Client Portal Access &amp; Device Manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Priority Direct WhatsApp SLA Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#006948] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span>Dedicated In-House Integration Engineer</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 mt-6 border-t border-[#EFF4FF]">
                  <a
                    href="https://wa.me/971567064457?text=Hi%20Team%20BC%20Dev,%20I'd%20like%20to%20order%20the%20BillionDue%20Premium%20Tier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] font-display font-semibold text-[14px] transition-colors"
                  >
                    Acquire Premium Licence
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Customization & Contact Call-to-Action */}
          <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-4 pb-16">
            <div className="bg-gradient-to-br from-[#006948] via-[#006948] to-[#004e35] rounded-2xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
              {/* Decorative Ambient Rings */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#68dba9]/10 pointer-events-none"></div>
              <div className="absolute right-40 -top-20 w-64 h-64 rounded-full bg-[#85f8c4]/10 pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-sans text-[11px] uppercase tracking-widest font-semibold mb-4 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#85f8c4]"></span>
                  Tailored Engineering · White-Label Releases
                </div>
                <h2 className="font-display font-extrabold text-[36px] sm:text-[44px] leading-tight mb-4">
                  Need BillionDue Customized for Your Workflow?
                </h2>
                <p className="font-sans text-[16px] text-white/80 mb-8">
                  Every business is unique. We build tailored ERP connectors, branded enterprise releases, custom thermal invoice schemas, and proprietary hardware integrations with our team in Dubai and London.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Primary WhatsApp Hotline */}
                  <a
                    className="inline-flex items-center gap-2 bg-white text-[#006948] font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg hover:bg-slate-100 transition-all shadow-md"
                    href="https://wa.me/971567064457?text=Hello%20Team%20BC%20Dev,%20I%20would%20like%20to%20discuss%20customizing%20BillionDue"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#006948]">chat</span>
                    <span>WhatsApp Direct: +971 567064457</span>
                  </a>
                  {/* Consultation Desk Link */}
                  <button
                    onClick={() => goTo("/contact")}
                    className="inline-flex items-center gap-2 bg-white/15 text-white hover:bg-white/25 font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg transition-colors backdrop-blur-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    <span>Schedule Architecture Audit</span>
                  </button>
                </div>
                <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center gap-6 text-white/70 font-sans text-[13px]">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">check_circle</span> Fixed Scope Pricing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">check_circle</span> Full IP &amp; Source Delivery Options
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">check_circle</span> Ongoing Engineering SLAs
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
