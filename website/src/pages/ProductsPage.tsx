import React from "react";

interface ProductsPageProps {
  navigate?: (path: string) => void;
  notify?: (message: string, tone?: "ok" | "warn" | "danger") => void;
}

export function ProductsPage({}: ProductsPageProps) {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-[#F8F9FF]">
      {/* Blank page */}
    </main>
  );
}
