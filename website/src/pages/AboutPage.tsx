import React from "react";

interface AboutPageProps {
  navigate: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function AboutPage({ navigate }: AboutPageProps) {
  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="w-full bg-[#F8F9FF] min-h-[calc(100vh-80px)] py-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Subtle Ambient Glow */}
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-r from-[#85F8C4]/20 via-[#00855D]/15 to-[#D3E4FE]/30 blur-3xl pointer-events-none -z-10 rounded-full"></div>
        </div>

        {/* HERO SECTION */}
        <section className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E5EEFF] rounded-full text-[#006948] font-sans font-semibold text-[12px] uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
            <span>About Team BC Dev</span>
            <span className="text-[#BCCAC0]">•</span>
            <span className="text-[#565E74]">Bespoke Engineering Studio</span>
          </div>

          <h1 className="font-display font-extrabold text-[40px] sm:text-[52px] leading-[48px] sm:leading-[60px] text-[#0B1C30] tracking-tight mb-6">
            Perpetual Software Ownership Over Cloud Subscription Traps.
          </h1>

          <p className="font-sans text-[18px] leading-[30px] text-[#3D4A42] leading-relaxed mb-8">
            We founded <strong>Team BC Dev</strong> to provide an antidote to the SaaS bloat that holds modern businesses hostage. We believe that when you buy software to run your enterprise, you should own it outright, operate it without mandatory internet connections, and never be locked out of your own records.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EFF4FF]">
            <div>
              <div className="font-display font-extrabold text-[32px] text-[#006948]">&lt;15ms</div>
              <div className="font-sans text-[13px] text-[#565E74]">Local SQLite Latency</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[32px] text-[#006948]">\$0.00</div>
              <div className="font-sans text-[13px] text-[#565E74]">Monthly Software Rent</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[32px] text-[#006948]">100%</div>
              <div className="font-sans text-[13px] text-[#565E74]">Hardware Sovereignty</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[32px] text-[#006948]">50+</div>
              <div className="font-sans text-[13px] text-[#565E74]">Production Systems</div>
            </div>
          </div>
        </section>

        {/* 3 CORE PILLARS */}
        <section className="mb-20">
          <div className="mb-8">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#006948] block mb-1">
              ENGINEERING FOUNDATIONS
            </span>
            <h2 className="font-display font-bold text-[32px] text-[#0B1C30]">
              How We Architect Software Differently
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#EFF4FF] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-6">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <h3 className="font-display font-bold text-[22px] text-[#0B1C30] mb-3">
                1. Ironclad Data Sovereignty
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42]">
                Your customer database, invoices, ledger entries, and financial balances stay on your computer in local AES-256 encrypted SQLite vaults. No foreign cloud servers, no third-party data scraping, and no risk of sudden account suspension.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EFF4FF] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-6">
                <span className="material-symbols-outlined text-[28px]">speed</span>
              </div>
              <h3 className="font-display font-bold text-[22px] text-[#0B1C30] mb-3">
                2. Bare-Metal Speed
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42]">
                We avoid clunky browser-wrapped bloat. By utilizing compiled backends, high-performance C++/Rust/Go modules, and direct hardware IO, our systems launch in milliseconds and process thousands of barcode and invoice lookups instantaneously.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EFF4FF] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#006948] mb-6">
                <span className="material-symbols-outlined text-[28px]">key</span>
              </div>
              <h3 className="font-display font-bold text-[22px] text-[#0B1C30] mb-3">
                3. Perpetual Ownership
              </h3>
              <p className="font-sans text-[15px] leading-[24px] text-[#3D4A42]">
                We provide perpetual commercial licenses. Once installed on your workstation, the software works indefinitely without calling home or requiring recurrent monthly fee deductions. Your business stays operational regardless of internet downtime.
              </p>
            </div>
          </div>
        </section>

        {/* REGIONAL HUBS & GLOBAL PRESENCE */}
        <section className="mb-20">
          <div className="bg-[#213145] text-white rounded-2xl p-8 lg:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#85F8C4] block mb-2">
                  GLOBAL ENGINEERING FOOTPRINT
                </span>
                <h2 className="font-display font-extrabold text-[32px] sm:text-[40px] leading-[42px] sm:leading-[50px] mb-4">
                  Rooted in Dubai. Engineered for the World.
                </h2>
                <p className="font-sans text-[16px] leading-[26px] text-[#D3E4FE]/90 mb-6">
                  With dedicated offices in the UAE and the United Kingdom, our team designs custom ERP systems, POS architectures, and fiscal compliance engines built strictly to regional standards like UAE FTA VAT, Saudi ZATCA e-invoicing, and global multi-currency ledgers.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => goTo("/contact")}
                    className="px-6 py-2.5 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-[15px] shadow-sm transition-all cursor-pointer"
                  >
                    Schedule Regional Consultation
                  </button>
                  <a
                    href="https://wa.me/971567064457"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-[15px] transition-all"
                  >
                    Direct WhatsApp: +971 567064457
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-[#121B27] border border-white/10">
                  <div className="flex items-center gap-2 text-[#85F8C4] font-sans font-bold text-[14px] uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    Dubai &amp; GCC Regional Hub
                  </div>
                  <p className="font-sans text-[14px] text-white/80 leading-[22px]">
                    Operating across Business Bay &amp; Sharjah Industrial Area 5, UAE. Dedicated to retail checkout integration, thermal printer firmware, and UAE FTA Corporate Tax registers.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#121B27] border border-white/10">
                  <div className="flex items-center gap-2 text-[#85F8C4] font-sans font-bold text-[14px] uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    London Systems Architecture
                  </div>
                  <p className="font-sans text-[14px] text-white/80 leading-[22px]">
                    Silicon Roundabout, Old Street, EC2A, London, UK. Systems research in high-throughput local SQLite sync engines, AES-256 cryptographic hardware binding, and cross-platform desktop frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center py-10 bg-white rounded-2xl border border-[#EFF4FF] p-8 shadow-sm">
          <h2 className="font-display font-bold text-[30px] text-[#0B1C30] mb-3">
            Ready to Take Control of Your Software Stack?
          </h2>
          <p className="font-sans text-[16px] text-[#3D4A42] max-w-xl mx-auto mb-6">
            Explore our flagship product BillionDue Desktop or speak directly with our engineering team for bespoke developments.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={() => goTo("/products")}
              className="px-6 py-2.5 rounded-lg bg-[#006948] hover:bg-[#00855D] text-white font-display font-semibold text-[15px] shadow-sm transition-all cursor-pointer"
            >
              Explore Products
            </button>
            <button
              onClick={() => goTo("/contact")}
              className="px-6 py-2.5 rounded-lg bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] font-display font-semibold text-[15px] transition-all cursor-pointer"
            >
              Contact Engineering
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
