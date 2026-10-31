import React from "react";
import {
  Wifi,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface OfflineSyncConfirmModalProps {
  companyName: string;
  changesSummary: string[];
  serverTemplates?: string[];
  currentTemplates?: string[];
  onConfirm: () => void;
  onDecline: () => void;
}

export function OfflineSyncConfirmModal({
  companyName,
  changesSummary,
  serverTemplates,
  currentTemplates,
  onConfirm,
  onDecline,
}: OfflineSyncConfirmModalProps) {
  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 99999,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
      }}
      data-testid="offline-sync-confirm-modal"
    >
      <div
        className="modal"
        style={{
          width: "min(580px, 94vw)",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 20px 40px -15px rgba(4, 120, 87, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.2)",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
            borderBottom: "1px solid #A7F3D0",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#047857",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)",
            }}
          >
            <Wifi size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span
                style={{
                  background: "#047857",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                Workstation Reconnected Online
              </span>
              <span
                style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {companyName}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#064E3B" }}>
              Administrative Updates Detected
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px" }}>
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.5,
              color: "#334155",
              margin: "0 0 16px",
            }}
          >
            This workstation was operating offline and has safely reconnected to the network.
            While offline, central administrative changes were configured in the software owner panel:
          </p>

          {/* Detailed Changes Container */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#047857",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={14} /> Pending Remote Updates
            </div>

            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "#1E293B", lineHeight: 1.6 }}>
              {changesSummary.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>
                  <strong>{item}</strong>
                </li>
              ))}
            </ul>

            {/* Template comparison preview if templates changed */}
            {serverTemplates && serverTemplates.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px dashed #CBD5E1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
                  Updated Assigned Layouts:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {serverTemplates.map((name) => (
                    <span
                      key={name}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#ECFDF5",
                        color: "#047857",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#1E40AF",
              lineHeight: 1.45,
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0, color: "#2563EB" }} />
            <span>
              Would you like to apply these administrative changes now, or continue operating with your current local state?
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: "14px 24px 20px",
            background: "#FAFAFA",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            className="secondary-btn"
            onClick={onDecline}
            data-testid="offline-sync-decline-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            <XCircle size={15} />
            No, Keep Current State
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={onConfirm}
            data-testid="offline-sync-confirm-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(4, 120, 87, 0.3)",
            }}
          >
            <CheckCircle2 size={16} />
            Apply Updates
          </button>
        </div>
      </div>
    </div>
  );
}

