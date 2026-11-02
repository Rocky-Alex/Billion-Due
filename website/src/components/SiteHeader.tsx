import React from "react";

interface SiteHeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function SiteHeader({ currentPath, navigate }: SiteHeaderProps) {
  const isHome = currentPath === "/" || currentPath === "/home";
  const isProducts = currentPath === "/products";
  const isAbout = currentPath === "/about" || currentPath === "/about-us";
  const isContact = currentPath === "/contact" || currentPath === "/contact-us";

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[80px] bg-[#F8F9FF]/90 backdrop-blur-[24px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#EFF4FF]">
      <div className="max-w-[1280px] h-full mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => goTo("/")}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#006948] flex items-center justify-center shadow-[0_2px_8px_rgba(0,105,72,0.25)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-[22px]">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[18px] text-[#0B1C30] tracking-tight group-hover:text-[#006948] transition-colors">
              Team BC Dev
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => goTo("/")}
            className={`font-display text-[15px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isHome
                ? "bg-[#00855D] text-[#F5FFF7] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#3D4A42] hover:text-[#0B1C30] hover:bg-[#EFF4FF] font-medium"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => goTo("/products")}
            className={`font-display text-[15px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isProducts
                ? "bg-[#00855D] text-[#F5FFF7] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#3D4A42] hover:text-[#0B1C30] hover:bg-[#EFF4FF] font-medium"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => goTo("/about")}
            className={`font-display text-[15px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isAbout
                ? "bg-[#00855D] text-[#F5FFF7] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#3D4A42] hover:text-[#0B1C30] hover:bg-[#EFF4FF] font-medium"
            }`}
          >
            About US
          </button>
          <button
            onClick={() => goTo("/contact")}
            className={`font-display text-[15px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isContact
                ? "bg-[#00855D] text-[#F5FFF7] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#3D4A42] hover:text-[#0B1C30] hover:bg-[#EFF4FF] font-medium"
            }`}
          >
            Contact Us
          </button>
        </nav>

        {/* Quick Action: Contact Us button & Client Portal Login Icon */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo("/contact")}
            className="hidden sm:inline-flex items-center justify-center font-display font-semibold text-[15px] text-white bg-[#006948] hover:bg-[#00855D] hover:text-[#F5FFF7] px-5 py-2 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer"
          >
            Contact Us
          </button>
          <button
            onClick={() => goTo("/login")}
            title="Client Portal Login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5EEFF] hover:bg-[#D3E4FE] text-[#0B1C30] transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#006948] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[16px]">person</span>
            </div>
            <span className="font-display font-semibold text-[13px] text-[#006948] hidden lg:inline pr-1">
              Portal
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#EFF4FF] bg-[#F8F9FF] px-4">
        <button
          onClick={() => goTo("/")}
          className={`font-display text-[13px] px-3 py-1 rounded-lg ${
            isHome ? "bg-[#00855D] text-white font-semibold" : "text-[#3D4A42]"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => goTo("/products")}
          className={`font-display text-[13px] px-3 py-1 rounded-lg ${
            isProducts ? "bg-[#00855D] text-white font-semibold" : "text-[#3D4A42]"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => goTo("/about")}
          className={`font-display text-[13px] px-3 py-1 rounded-lg ${
            isAbout ? "bg-[#00855D] text-white font-semibold" : "text-[#3D4A42]"
          }`}
        >
          About US
        </button>
        <button
          onClick={() => goTo("/contact")}
          className={`font-display text-[13px] px-3 py-1 rounded-lg ${
            isContact ? "bg-[#00855D] text-white font-semibold" : "text-[#3D4A42]"
          }`}
        >
          Contact Us
        </button>
      </div>
    </header>
  );
}
