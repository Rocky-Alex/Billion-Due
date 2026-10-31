import React from "react";
import {
  AlertTriangle,
  Check,
  Database,
} from "lucide-react";
import logoDefault from "../assets/logo.png";
import logoWhite from "../assets/logo-white.png";
import logoIconDefault from "../assets/logo-icon.png";
import logoIconWhite from "../assets/logo-icon-white.png";
import type { Toast } from "../types";

export const money = (value: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);

export function Logo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""} ${className}`.trim()}>
      {compact ? (
        <>
          <img
            src={logoIconDefault}
            alt="BillionDue"
            className="logo-img logo-img-icon logo-img-default"
          />
          <img
            src={logoIconWhite}
            alt="BillionDue"
            className="logo-img logo-img-icon logo-img-white"
          />
        </>
      ) : (
        <>
          <img
            src={logoDefault}
            alt="BillionDue — Turn invoices into income"
            className="logo-img logo-img-default"
          />
          <img
            src={logoWhite}
            alt="BillionDue — Turn invoices into income"
            className="logo-img logo-img-white"
          />
        </>
      )}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "blue" | "slate";
}) {
  return (
    <span className={`status status-${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="toasts">
      {items.map((t) => (
        <div
          className={`toast ${t.tone === "warn" ? "toast-warn" : ""}`}
          key={t.id}
        >
          {t.tone === "warn" ? (
            <AlertTriangle size={17} />
          ) : (
            <Check size={17} />
          )}{" "}
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="metric">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export function EmptyRows({ text }: { text: string }) {
  return (
    <div className="empty-rows">
      <Database />
      <span>{text}</span>
    </div>
  );
}

