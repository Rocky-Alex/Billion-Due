import { AlertTriangle, LogOut, X, ShieldAlert } from "lucide-react";

export interface DisconnectConfirmModalProps {
  companyName: string;
  deviceName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisconnectConfirmModal({
  companyName,
  deviceName = "This Workstation",
  onConfirm,
  onCancel,
}: DisconnectConfirmModalProps) {
  return (
    <div className="modal-backdrop" data-testid="disconnect-confirm-modal">
      <div className="modal disconnect-modal-content">
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#fee2e2",
                color: "#dc2626",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AlertTriangle size={18} />
            </span>
            <div>
              <span className="eyebrow" style={{ color: "#dc2626" }}>
                SIGN OUT & DE-LINK
              </span>
              <h2 style={{ margin: 0, fontSize: 18 }}>Disconnect Workstation?</h2>
            </div>
          </div>
          <button onClick={onCancel} className="icon-btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="disconnect-modal-body" style={{ padding: "16px 0 20px" }}>
          <p style={{ fontSize: 13, color: "var(--ink, #334155)", lineHeight: 1.5, margin: "0 0 14px" }}>
            Are you sure you want to disconnect <b>{deviceName}</b> from <b>{companyName}</b>?
          </p>

          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: 8,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              fontSize: 12,
              color: "#9f1239",
              lineHeight: 1.45,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <b>Hardware lease will be de-linked:</b>
              <br />
              Signing out will de-register this computer. You will need your{" "}
              <b>Installation Key</b> or software administrator approval to reconnect and invoice.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            borderTop: "1px solid var(--line, #e2e8f0)",
            paddingTop: 16,
          }}
        >
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            data-testid="disconnect-cancel-btn"
          >
            Cancel / Keep Connected
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={onConfirm}
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
            data-testid="disconnect-confirm-btn"
          >
            <LogOut size={15} /> Confirm Disconnect & Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
