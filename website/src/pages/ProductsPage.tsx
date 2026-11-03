import React, { useState, useEffect } from "react";
import { windowsInstallerUrl } from "@billiondue/shared";

interface ProductsPageProps {
  navigate?: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function ProductsPage({ }: ProductsPageProps) {
  const [currency, setCurrency] = useState<"AED" | "USD">("AED");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [statusIcon, setStatusIcon] = useState<string>("check_circle");

  const pricingData = {
    AED: {
      solo: "AED 390",
      plus: "AED 690",
      premium: "AED 1,650",
    },
    USD: {
      solo: "$105",
      plus: "$189",
      premium: "$449",
    },
  };

  const openDownloadModal = (_platform?: string) => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDownloadModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
    setStatusText(null);
    setDownloadingFile(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeDownloadModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const triggerDownloadFile = (fileName: string, isWindows = false) => {
    setDownloadingFile(fileName);
    setStatusIcon("downloading");
    setStatusText(`Connecting to verified distribution CDN for ${fileName}...`);

    if (isWindows) {
      const link = document.createElement("a");
      link.href = windowsInstallerUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      setStatusIcon("check_circle");
      setStatusText(`Download started! ${fileName} is saving to your downloads.`);
      setTimeout(() => {
        setDownloadingFile(null);
      }, 3000);
    }, 900);
  };

  return (
    <main className="w-full pt-10 sm:pt-14 bg-[#F8F9FF] min-h-screen text-[#0B1C30] font-sans antialiased selection:bg-[#85F8C4] selection:text-[#002114]">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glows */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-[#85F8C4]/20 via-[#00855D]/10 to-[#D3E4FE]/40 blur-3xl pointer-events-none -z-10 rounded-full"></div>

          {/* Top Introduction Banner */}
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-6">
            {/* Headline & Subtitle */}
            <div className="mt-4 max-w-3xl">
              <h1 className="font-display font-extrabold text-[42px] sm:text-[56px] leading-[48px] sm:leading-[64px] text-[#0B1C30] tracking-[-0.03em] mb-4">
                Billion Due. <br />
                <span className="text-[#006948]">Turn Invoice to Income.</span>
              </h1>
              <p className="font-sans text-[16px] sm:text-[18px] leading-[26px] sm:leading-[28px] text-[#3D4A42]">
                We engineer standalone, lightning-fast commercial software tools that run directly on your hardware. No vendor lock-in, zero cloud subscription bloat, and ironclad local privacy built for ambitious GCC &amp; global operators.
              </p>
            </div>
          </div>

          {/* Flagship Product Feature: BillionDue */}
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pt-2 pb-12">
            <div className="bg-white rounded-xl p-6 lg:p-10 shadow-[0_10px_30px_-5px_rgba(11,28,48,0.06)] relative border border-[#EFF4FF]">
              {/* Header Badge & Title Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1"></div>
                  <h2 className="font-display font-bold text-[30px] sm:text-[36px] leading-[38px] sm:leading-[44px] text-[#0B1C30] tracking-[-0.02em]">
                    BillionDue Desktop
                  </h2>
                  <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42] mt-0.5">
                    High-throughput offline-first billing, tax ledgering, and instant POS engine for GCC merchants and global agencies.
                  </p>
                </div>

                {/* Quick Actions / Meta */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openDownloadModal()}
                    className="inline-flex items-center gap-2 bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg transition-all shadow-[0_2px_8px_rgba(0,105,72,0.2)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Standalone v2.4</span>
                  </button>
                </div>
              </div>

              {/* Desktop Mock Window Frame with Real Screenshot */}
              <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(11,28,48,0.18)] bg-[#213145]">
                {/* Embedded Real UI Screenshot Frame */}
                <div className="relative bg-[#F8F9FF] overflow-hidden group">
                  <img
                    alt="BillionDue Desktop Invoice and Financial Management Interface"
                    className="w-full h-auto object-cover object-top block transition-transform duration-500 ease-out group-hover:scale-[1.008]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuALkf3vEbjWFNSsjte-8cJZdA2omJqeuuwDql62920a-1dAEVv3SGuw22cSulj4mjsySTvrdb5loPPbawsCuhKtaEfK0osmqSTaigOKEsErAV_LNvKsM21EPrJ_8dJYK6dqgLAE6BXxttXYEIFj-1s8hxlROnr3ZciKPwLY7w1wriG5P9aauuUJbXhpGEOVR8G017vdzvM2Mp86-Zg5PaYjnSYFgFl1XXHZ6unZ8o-fnTAvpZF1bTw-"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/stitch/")) {
                        target.src = "/stitch/billiondue_screen.png";
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

              {/* Download & Distribution CTAs Bar */}
              <div
                className="mt-6 p-4 sm:p-5 bg-[#E5EEFF] rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4"
                id="downloads"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#006948] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">deployed_code</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[17px] text-[#0B1C30]">
                      Ready to operate BillionDue in your business?
                    </div>
                  </div>
                </div>

                {/* Platform Downloads Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDownloadModal("macos")}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[14px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">laptop_mac</span>
                    <span>macOS (Apple Silicon / Intel)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDownloadModal("windows")}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-[#00855D] hover:text-white text-[#0B1C30] font-display font-semibold text-[14px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">window</span>
                    <span>Windows 10/11 x64</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section for Perpetual Licences with Currency Toggle */}
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-12" id="pricing">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="font-display font-bold text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] text-[#0B1C30] tracking-[-0.02em]">
                  Subscription.
                </h2>
              </div>

              {/* Currency Toggle Switcher */}
              <div className="flex items-center self-start md:self-auto bg-[#E5EEFF] p-1 rounded-xl shadow-inner border border-[#D3E4FE]">
                <button
                  type="button"
                  onClick={() => setCurrency("AED")}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${currency === "AED"
                    ? "font-semibold shadow-sm bg-[#006948] text-white"
                    : "font-medium text-[#3D4A42] hover:text-[#0B1C30]"
                    }`}
                >
                  AED (UAE Dirham)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${currency === "USD"
                    ? "font-semibold shadow-sm bg-[#006948] text-white"
                    : "font-medium text-[#3D4A42] hover:text-[#0B1C30]"
                    }`}
                >
                  USD (US Dollar)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Tier 1: Starter */}
              <div className="bg-white rounded-xl p-6 border border-[#BCCAC0]/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#3D4A42] font-semibold">
                      Single Counter
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] text-[11px] font-semibold">
                      Solo Merchant
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mb-2">Basic</h3>
                  <p className="font-sans text-[13px] text-[#3D4A42] mb-4 min-h-[38px]">
                    Perfect for boutique consultancies, single service desks, or freelance contractors.
                  </p>
                  <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-[#E5EEFF]">
                    <span className="text-3xl font-extrabold text-[#0B1C30] font-display">
                      {pricingData[currency].solo}
                    </span>
                    <span className="font-sans text-[13px] text-[#3D4A42] font-medium">
                      / lifetime license
                    </span>
                  </div>
                  <ul className="space-y-2.5 font-sans text-[13px] text-[#0B1C30] mb-6 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>1 Device Local Activation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Encrypted SQLite Offline Storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>UAE VAT &amp; ZATCA QR Compliant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>WhatsApp &amp; Email PDF Dispatch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Standard ESC/POS Thermal Printing</span>
                    </li>
                  </ul>
                </div>
                <a
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] font-display font-semibold text-[14px] transition-colors inline-block"
                  href="https://wa.me/971567064457?text=Interested%20in%20BillionDue%20Solo%20License"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Buy Basic License
                </a>
              </div>

              {/* Tier 2: Plus (Featured) */}
              <div className="bg-white rounded-xl p-6 border-2 border-[#006948] relative flex flex-col justify-between shadow-lg scale-[1.01] transform -translate-y-1">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#006948] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span>Most Popular · GCC Retail Standard</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 pt-1">
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#006948] font-semibold">
                      Store Multi-Till
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#00855D] text-white text-[11px] font-semibold">
                      Best ROI
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mb-2">Plus</h3>
                  <p className="font-sans text-[13px] text-[#3D4A42] mb-4 min-h-[38px]">
                    Engineered for busy retail shops, clinics, auto garages, and restaurants requiring multiple checkout lanes.
                  </p>
                  <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-[#E5EEFF]">
                    <span className="text-3xl font-extrabold text-[#006948] font-display">
                      {pricingData[currency].plus}
                    </span>
                    <span className="font-sans text-[13px] text-[#3D4A42] font-medium">
                      / lifetime license
                    </span>
                  </div>
                  <ul className="space-y-2.5 font-sans text-[13px] text-[#0B1C30] mb-6 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span className="font-semibold">3 Concurrent Workstations Included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Local LAN Zero-Lag Sync Engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Multi-Currency &amp; Customer Ledgers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Barcode Hand Scanner Direct Input</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>1 Year Priority Maintenance &amp; Patches</span>
                    </li>
                  </ul>
                </div>
                <a
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-[14px] transition-all shadow-md inline-block"
                  href="https://wa.me/971567064457?text=Interested%20in%20BillionDue%20Plus%20License"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Buy Plus License
                </a>
              </div>

              {/* Tier 3: Premium Multi-Branch */}
              <div className="bg-white rounded-xl p-6 border border-[#BCCAC0]/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#3D4A42] font-semibold">
                      Chain &amp; Enterprise
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E5EEFF] text-[#3D4A42] text-[11px] font-semibold">
                      Multi-Branch
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[24px] text-[#0B1C30] mb-2">Premium</h3>
                  <p className="font-sans text-[13px] text-[#3D4A42] mb-4 min-h-[38px]">
                    Unlimited tills, multi-warehouse consolidation, white-label branding, and dedicated engineering onboarding.
                  </p>
                  <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-[#E5EEFF]">
                    <span className="text-3xl font-extrabold text-[#0B1C30] font-display">
                      {pricingData[currency].premium}
                    </span>
                    <span className="font-sans text-[13px] text-[#3D4A42] font-medium">
                      / lifetime license
                    </span>
                  </div>
                  <ul className="space-y-2.5 font-sans text-[13px] text-[#0B1C30] mb-6 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span className="font-semibold">Up to 10 Workstations / Cash Tills</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Automated Nightly Encrypted Off-site Backup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>White-label Logo &amp; Custom Receipt CSS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Custom Excel / CSV Migration Service</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006948]">check</span>
                      <span>Lifetime Minor Updates &amp; SLA Onboarding</span>
                    </li>
                  </ul>
                </div>
                <a
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] font-display font-semibold text-[14px] transition-colors inline-block"
                  href="https://wa.me/971567064457?text=Interested%20in%20BillionDue%20Premium%20License"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Buy Premium License
                </a>
              </div>
            </div>
          </section>

          {/* Bottom Customization & Contact Call-to-Action */}
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-16">
            <div className="bg-gradient-to-br from-[#006948] via-[#006948] to-[#004e35] rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
              {/* Decorative Ambient Rings */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#68dba9]/10 pointer-events-none"></div>
              <div className="absolute right-40 -top-20 w-64 h-64 rounded-full bg-[#85f8c4]/10 pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl">
                <h2 className="font-display font-extrabold text-[32px] sm:text-[44px] leading-tight mb-4">
                  Need BillionDue Customized for Your Workflow?
                </h2>
                <p className="font-sans text-[15px] sm:text-[18px] leading-[26px] sm:leading-[28px] text-white/80 mb-8">
                  Every business is unique. We build tailored ERP connectors, branded enterprise releases, custom thermal invoice schemas, and proprietary hardware integrations with our team in Dubai and London.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Primary WhatsApp Hotline */}
                  <a
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#006948] font-display font-semibold text-[15px] px-6 py-2.5 rounded-lg hover:bg-slate-100 transition-all shadow-md min-w-[280px]"
                    href="https://wa.me/971567064457?text=Hello%20Team%20BC%20Dev,%20I%20would%20like%20to%20discuss%20customizing%20BillionDue%20or%20building%20a%20new%20product"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#006948]">chat</span>
                    <span>WhatsApp Direct: +971 567064457</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Interactive Download Modal Dialog */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/65 backdrop-blur-md transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDownloadModal();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#BCCAC0]/30 overflow-hidden transform transition-all p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E5EEFF]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,105,72,0.25)] flex-shrink-0">
                  <span className="material-symbols-outlined text-[26px]">deployed_code</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[18px] text-[#0B1C30]" id="modal-title">
                      Download BillionDue Desktop v2.4
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#85F8C4]/20 text-[#006948] border border-[#006948]/20">
                      v2.4.2 Production Release
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3D4A42] bg-[#E5EEFF] px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[13px] text-[#006948]">verified_user</span>
                      SHA-256 Checksum Verified
                    </span>
                    <span className="text-[13px] text-[#3D4A42] hidden sm:inline">
                      · Standalone Offline Binary
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={closeDownloadModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3D4A42] hover:text-[#0B1C30] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Security Highlights Row */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 my-4 bg-[#E5EEFF] rounded-xl text-center">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-[#006948] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">offline_bolt</span> 100% Offline-First
                </span>
                <span className="text-[11px] text-[#3D4A42] mt-0.5">No Cloud Required</span>
              </div>
              <div className="flex flex-col items-center border-x border-[#BCCAC0]/30">
                <span className="text-xs font-semibold text-[#006948] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">security</span> Zero Telemetry
                </span>
                <span className="text-[11px] text-[#3D4A42] mt-0.5">Local Private Hardware</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-[#006948] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span> AES-256
                </span>
                <span className="text-[11px] text-[#3D4A42] mt-0.5">Encrypted SQLite DB</span>
              </div>
            </div>

            {/* Download Platforms Binary Cards */}
            <div className="space-y-3">
              {/* macOS Universal Card */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#BCCAC0]/30 hover:border-[#006948]/50 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#0B1C30] group-hover:text-[#006948] transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">laptop_mac</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[15px] text-[#0B1C30] flex items-center gap-2 flex-wrap">
                      macOS Universal
                      <span className="text-[11px] text-[#006948] font-medium px-2 py-0.5 bg-[#006948]/10 rounded-full">
                        Apple Silicon &amp; Intel
                      </span>
                    </div>
                    <div className="text-[13px] text-[#3D4A42] mt-0.5">.dmg installer package · ~84.2 MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={downloadingFile === "BillionDue-v2.4.2-universal.dmg"}
                  onClick={() => triggerDownloadFile("BillionDue-v2.4.2-universal.dmg")}
                  className="px-4 py-2 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>
                    {downloadingFile === "BillionDue-v2.4.2-universal.dmg" ? "Connecting..." : "Download for macOS"}
                  </span>
                </button>
              </div>

              {/* Windows 10/11 Card */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#BCCAC0]/30 hover:border-[#006948]/50 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#0B1C30] group-hover:text-[#006948] transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">window</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[15px] text-[#0B1C30] flex items-center gap-2 flex-wrap">
                      Windows 10 / 11
                      <span className="text-[11px] text-[#3D4A42] font-medium px-2 py-0.5 bg-[#E5EEFF] rounded-full">
                        64-bit Standalone
                      </span>
                    </div>
                    <div className="text-[13px] text-[#3D4A42] mt-0.5">.exe standalone setup installer · ~91.8 MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={downloadingFile === "BillionDue Setup 0.1.0.exe"}
                  onClick={() => triggerDownloadFile("BillionDue Setup 0.1.0.exe", true)}
                  className="px-4 py-2 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>
                    {downloadingFile === "BillionDue Setup 0.1.0.exe" ? "Connecting..." : "Download for Windows"}
                  </span>
                </button>
              </div>
            </div>

            {/* Download Progress / Simulation Alert Toast */}
            {statusText && (
              <div className="mt-4 p-3.5 bg-[#00855D]/10 border border-[#006948]/30 rounded-xl flex items-center gap-3 text-[#006948] text-[13px] font-medium transition-all">
                <span className="material-symbols-outlined text-[22px] text-[#006948] flex-shrink-0">
                  {statusIcon}
                </span>
                <span className="text-[#0B1C30] leading-snug">{statusText}</span>
              </div>
            )}

            {/* Footer Note & Lifetime Licenses link */}
            <div className="mt-5 pt-3.5 border-t border-[#E5EEFF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#3D4A42]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#006948]">check_circle</span>
                <span>Includes UAE FTA 5% VAT &amp; ZATCA e-invoicing compliance out of the box.</span>
              </div>
              <a
                className="text-[#006948] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                href="#pricing"
                onClick={closeDownloadModal}
              >
                <span>View Lifetime Licenses</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
