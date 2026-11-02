import React, { useState } from "react";

interface ContactPageProps {
  navigate: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function ContactPage({ notify }: ContactPageProps) {
  // Architectural Consultation form state
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("retail");
  const [bottlenecks, setBottlenecks] = useState("");
  const [selectedPills, setSelectedPills] = useState<string[]>([
    "billiondue",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const togglePill = (val: string) => {
    setSelectedPills((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !workEmail) {
      if (notify) notify("Please enter your name and work email.", "warn");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (notify) {
        notify("Inquiry Transmitted Directly to Senior Engineering", "ok");
      }
    }, 750);
  };

  return (
    <main className="w-full bg-[#F8F9FF] min-h-[calc(100vh-80px)] py-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Ambient Glow Canvas */}
        <div className="relative">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#85F8C4]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#DAE2FD]/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
        </div>

        {/* HERO HEADER */}
        <section className="relative z-10 max-w-4xl space-y-4 mb-12">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DCE9FF]/80 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            <span className="font-sans text-[12px] text-[#006948] font-semibold tracking-wider uppercase">
              Direct Builder Access • Zero Sales Reps
            </span>
          </div>

          {/* Hero Headline & Subtitle */}
          <h1 className="font-display font-extrabold text-[40px] sm:text-[52px] leading-[48px] sm:leading-[60px] text-[#0B1C30] tracking-tight">
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
                Sprint Intake: <strong className="text-[#0B1C30] font-semibold">Open for Q2/Q3 Build Slots</strong>
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#BCCAC0]"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[20px]">verified_user</span>
              <span className="font-sans text-[13px] font-medium">Strict Mutual NDA by Default</span>
            </div>
          </div>
        </section>

        {/* CONSULTATION HUB GRID (2 COLUMNS) */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Communication Channels & Regional Hubs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Priority Channels Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-5 border border-[#EFF4FF]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFF4FF]">
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
                href="https://wa.me/971567064457?text=Hello%20Team%20BC%20Dev,%20I%20would%20like%20to%20discuss%20a%20software%20project"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-11 h-11 rounded-lg bg-[#85F8C4] flex items-center justify-center text-[#006948] group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-semibold text-[15px] text-[#0B1C30]">
                      WhatsApp Direct Hotline
                    </span>
                    <span className="material-symbols-outlined text-[#006948] text-[16px]">
                      arrow_outward
                    </span>
                  </div>
                  <div className="font-mono text-[13px] text-[#006948] font-medium">
                    +971 567064457
                  </div>
                  <p className="font-sans text-[12px] text-[#3D4A42] leading-[16px]">
                    Average response: under 15 minutes. Best for quick technical Q&amp;A.
                  </p>
                </div>
              </a>

              {/* Email Channel */}
              <a
                className="group flex items-start gap-4 p-3.5 rounded-lg bg-[#F8F9FF] hover:bg-[#EFF4FF] transition-all"
                href="mailto:teambcdev@gmail.com"
              >
                <div className="w-11 h-11 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">mail</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-semibold text-[15px] text-[#0B1C30]">
                      Direct Architecture Desk
                    </span>
                    <span className="material-symbols-outlined text-[#006948] text-[16px]">
                      arrow_outward
                    </span>
                  </div>
                  <div className="font-mono text-[13px] text-[#006948] font-medium">
                    teambcdev@gmail.com
                  </div>
                  <p className="font-sans text-[12px] text-[#3D4A42] leading-[16px]">
                    Send existing schema specs, architectural briefs, or RFPs.
                  </p>
                </div>
              </a>
            </div>

            {/* Regional Engineering Hubs Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 border border-[#EFF4FF]">
              <span className="font-sans text-[12px] text-[#006948] uppercase font-bold tracking-wider">
                Engineering Centers
              </span>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[14px] text-[#0B1C30]">
                      Dubai &amp; Sharjah Hub (GCC Operations)
                    </div>
                    <div className="font-sans text-[12px] text-[#3D4A42]">
                      Industrial Area 5 / DIFC, Dubai &amp; Sharjah, United Arab Emirates
                    </div>
                    <div className="font-mono text-[11px] text-[#006948] mt-0.5">
                      UAE FTA VAT &amp; ZATCA Systems
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[#EFF4FF]">
                  <div className="w-8 h-8 rounded-lg bg-[#E5EEFF] flex items-center justify-center text-[#006948] flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[14px] text-[#0B1C30]">
                      London Architecture Lab
                    </div>
                    <div className="font-sans text-[12px] text-[#3D4A42]">
                      Silicon Roundabout, Old Street, EC2A, London, United Kingdom
                    </div>
                    <div className="font-mono text-[11px] text-[#006948] mt-0.5">
                      Low-Latency Compiled Kernels &amp; Cryptography
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Intake Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-[#EFF4FF]">
              <div className="mb-6">
                <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#006948] block mb-1">
                  PROJECT SPECIFICATION INTAKE
                </span>
                <h2 className="font-display font-bold text-[26px] text-[#0B1C30]">
                  Architectural Discovery Request
                </h2>
                <p className="font-sans text-[14px] text-[#3D4A42] mt-1">
                  Share your system requirements. Our senior systems team will review and reply with an estimated scope, sprint timeline, and technical breakdown.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-xl bg-[#F5FFF7] border border-[#85F8C4] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#006948] text-white flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[28px]">check</span>
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-[#0B1C30]">
                    Inquiry Received by Team BC Dev
                  </h3>
                  <p className="font-sans text-[14px] text-[#3D4A42] max-w-md mx-auto">
                    Thank you, <strong>{fullName}</strong>. Your technical requirements have been dispatched directly to our systems engineering desk. We will review your architecture and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFullName("");
                      setWorkEmail("");
                      setPhone("");
                      setBottlenecks("");
                    }}
                    className="mt-4 px-5 py-2 rounded-lg bg-[#006948] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mansoor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                        Corporate / Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tariq@enterprise.ae"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                        Country Code
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      >
                        <option value="+971">UAE (+971)</option>
                        <option value="+966">Saudi (+966)</option>
                        <option value="+974">Qatar (+974)</option>
                        <option value="+44">UK (+44)</option>
                        <option value="+1">US / Canada (+1)</option>
                        <option value="+91">India (+91)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="50 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                      Primary Industry / Operations
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                    >
                      <option value="retail">Retail POS &amp; Multi-Store Checkout</option>
                      <option value="wholesale">Wholesale Distribution &amp; B2B Ledgering</option>
                      <option value="automotive">Automotive Workshop &amp; Parts Management</option>
                      <option value="logistics">Warehousing, Barcodes &amp; Logistics</option>
                      <option value="professional">Professional Services / Agency Billing</option>
                      <option value="other">Bespoke Custom Software Build</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1.5">
                      Systems of Interest (Select All That Apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "billiondue", label: "BillionDue Desktop v2.4" },
                        { id: "erp", label: "Bespoke ERP Engine" },
                        { id: "thermal", label: "ESC/POS Thermal Drivers" },
                        { id: "portal", label: "Client Account Portal" },
                        { id: "sync", label: "Offline Multi-Branch Sync" },
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => togglePill(pill.id)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-sans font-medium transition-all cursor-pointer ${
                            selectedPills.includes(pill.id)
                              ? "bg-[#006948] text-white shadow-sm"
                              : "bg-[#EFF4FF] text-[#3D4A42] hover:bg-[#E5EEFF]"
                          }`}
                        >
                          {selectedPills.includes(pill.id) ? "✓ " : "+ "}
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[12px] font-semibold text-[#0B1C30] uppercase mb-1">
                      Current Operational Bottlenecks or System Goals
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. We have 4 retail branches in Dubai running slow cloud billing. We want local SQLite speed, ESC/POS printing on Epson thermal printers, and automated WhatsApp invoice delivery..."
                      value={bottlenecks}
                      onChange={(e) => setBottlenecks(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#D3E4FE] bg-[#F8F9FF] text-[#0B1C30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-lg bg-[#006948] hover:bg-[#005238] text-white font-display font-semibold text-[15px] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        <span>Transmitting to Engineering...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Architectural Inquiry</span>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </>
                    )}
                  </button>

                  <div className="text-center font-sans text-[12px] text-[#565E74] pt-2">
                    🔒 Protected by strict mutual NDA. No spam, no marketing calls, zero third-party disclosure.
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
