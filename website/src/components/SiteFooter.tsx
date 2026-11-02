import React from "react";

interface SiteFooterProps {
  navigate: (path: string) => void;
}

export function SiteFooter({ navigate }: SiteFooterProps) {
  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#F8F9FF] border-t border-[#EFF4FF] py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#EFF4FF]">
          {/* Brand Info */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#006948] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <svg
                  width="16"
                  height="16"
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
              <span className="font-display font-bold text-[16px] text-[#0B1C30]">
                Team BC Dev
              </span>
            </div>
            <p className="font-sans text-[13px] leading-[20px] text-[#3D4A42] mb-3">
              Precision commercial desktop tools and bespoke software engineering. Zero SaaS hostage traps. Complete hardware sovereignty.
            </p>
            <div className="font-sans font-semibold text-[11px] uppercase tracking-wider text-[#006948] mb-1">
              REGIONAL &amp; GLOBAL HUBS
            </div>
            <p className="font-sans text-[12px] leading-[18px] text-[#3D4A42]">
              Dubai &amp; Sharjah: DIFC / Industrial Area 5, UAE<br />
              London: Silicon Roundabout, EC2A, UK
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <div className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#0B1C30] mb-3">
              PAGES
            </div>
            <ul className="space-y-2 text-[13px] text-[#3D4A42]">
              <li>
                <button
                  onClick={() => goTo("/")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  Home (Software Studio)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/products")}
                  className="hover:text-[#006948] text-left font-medium text-[#006948] cursor-pointer transition-colors"
                >
                  Products (BillionDue Desktop)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/about")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  About US
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/contact")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  Contact Us (Consultation Hub)
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Software Products */}
          <div className="col-span-1">
            <div className="font-sans font-semibold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#0B1C30] mb-3">
              PRODUCTS
            </div>
            <ul className="space-y-2 text-[13px] text-[#3D4A42]">
              <li>
                <button
                  onClick={() => goTo("/products")}
                  className="hover:text-[#006948] text-left font-medium text-[#006948] cursor-pointer transition-colors"
                >
                  BillionDue Desktop v2.4
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/products")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  Perpetual Subscriptions (AED/USD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/contact")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  Bespoke ERP Integration
                </button>
              </li>
              <li>
                <button
                  onClick={() => goTo("/contact")}
                  className="hover:text-[#006948] text-left cursor-pointer transition-colors"
                >
                  Custom ESC/POS Thermal Drivers
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
                <a href="https://wa.me/971567064457" target="_blank" rel="noopener noreferrer" className="hover:text-[#006948]">
                  +971 567064457 (WhatsApp)
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => goTo("/login")}
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
          <div>© 2026 Team BC Dev. All rights reserved. Precision bespoke engineering.</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => goTo("/about")}
              className="hover:text-[#006948] cursor-pointer"
            >
              About US
            </button>
            <button
              onClick={() => goTo("/contact")}
              className="hover:text-[#006948] cursor-pointer"
            >
              Contact Us
            </button>
            <a
              href="https://wa.me/971567064457"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#006948]"
            >
              WhatsApp Direct
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
