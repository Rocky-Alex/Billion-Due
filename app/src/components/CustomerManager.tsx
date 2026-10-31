import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  ReceiptText,
  Eye,
  X,
  Pencil,
  Trash2,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import type { Customer, Invoice } from "@billiondue/shared";

interface CustomerManagerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  invoices: Invoice[];
  onOpenPreview: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onCreateInvoiceForCustomer: (customer: Customer) => void;
  notify: (message: string, tone?: "ok" | "warn") => void;
}

export function CustomerManager({
  customers,
  setCustomers,
  invoices,
  onOpenPreview,
  onEditInvoice,
  onCreateInvoiceForCustomer,
  notify,
}: CustomerManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Calculate financial statistics for each customer based on actual invoices
  const customerFinancials = useMemo(() => {
    const stats = new Map<
      string,
      {
        totalInvoiced: number;
        totalPaid: number;
        totalDue: number;
        invoices: Invoice[];
      }
    >();

    // Initialize map for all known customers
    for (const c of customers) {
      stats.set(c.name.trim().toLowerCase(), {
        totalInvoiced: 0,
        totalPaid: 0,
        totalDue: 0,
        invoices: [],
      });
    }

    // Map invoices to customers
    for (const inv of invoices) {
      const nameKey = (inv.customer || "").trim().toLowerCase();
      if (!nameKey) continue;
      let entry = stats.get(nameKey);
      if (!entry) {
        entry = {
          totalInvoiced: 0,
          totalPaid: 0,
          totalDue: 0,
          invoices: [],
        };
        stats.set(nameKey, entry);
      }
      const amount = Number(inv.amount) || 0;
      entry.totalInvoiced += amount;
      if (inv.status === "Paid") {
        entry.totalPaid += amount;
      } else {
        entry.totalDue += amount;
      }
      entry.invoices.push(inv);
    }

    return stats;
  }, [customers, invoices]);

  // Overall aggregate metrics across all customers
  const overallMetrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalDue = 0;
    for (const entry of customerFinancials.values()) {
      totalInvoiced += entry.totalInvoiced;
      totalPaid += entry.totalPaid;
      totalDue += entry.totalDue;
    }
    return {
      totalInvoiced,
      totalPaid,
      totalDue,
      customerCount: customers.length,
    };
  }, [customerFinancials, customers.length]);

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Modal open handlers
  const openAddModal = () => {
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setEditingCustomer(null);
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone || "");
    setFormEmail(c.email || "");
    setFormAddress(c.address || "");
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      notify("Customer name is required", "warn");
      return;
    }

    if (editingCustomer) {
      // Edit existing
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                name: cleanName,
                phone: formPhone.trim() || undefined,
                email: formEmail.trim() || undefined,
                address: formAddress.trim() || undefined,
              }
            : c
        )
      );
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer({
          ...editingCustomer,
          name: cleanName,
          phone: formPhone.trim() || undefined,
          email: formEmail.trim() || undefined,
          address: formAddress.trim() || undefined,
        });
      }
      notify(`Customer "${cleanName}" updated successfully`, "ok");
    } else {
      // Create new
      const newCust: Customer = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        address: formAddress.trim() || undefined,
        createdAt: new Date().toLocaleDateString(),
      };
      setCustomers((prev) => [newCust, ...prev]);
      notify(`Customer "${cleanName}" added to local storage`, "ok");
    }

    setShowAddModal(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
      notify(`Customer "${customerName}" removed`, "ok");
    }
  };

  // Helper to format currency
  const fmtMoney = (val: number) =>
    "AED " +
    val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Get selected customer stats
  const selectedStats = useMemo(() => {
    if (!selectedCustomer) return null;
    return (
      customerFinancials.get(selectedCustomer.name.trim().toLowerCase()) || {
        totalInvoiced: 0,
        totalPaid: 0,
        totalDue: 0,
        invoices: [],
      }
    );
  }, [selectedCustomer, customerFinancials]);

  // Color generator for customer initials badge
  const getAvatarGradient = (name: string) => {
    const colors = [
      "linear-gradient(135deg, #047857 0%, #047857 100%)",
      "linear-gradient(135deg, #047857 0%, #047857 100%)",
      "linear-gradient(135deg, #0ea5e9 0%, #047857 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  return (
    <section className="desk-panel desk-page">
      {/* Top Header */}
      <div className="panel-head">
        <div>
          <h2>Customers</h2>
          <p>
            {customers.length} customer accounts · {fmtMoney(overallMetrics.totalDue)} total outstanding
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={15} /> Add customer
          </button>
        </div>
      </div>

      {/* Aggregate Financial Metrics Banner */}
      <div className="customer-metrics-banner">
        <div className="cust-metric-card">
          <div className="cust-metric-icon emerald">
            <Users size={18} />
          </div>
          <div>
            <span className="cust-metric-label">Total Accounts</span>
            <strong className="cust-metric-val">{overallMetrics.customerCount}</strong>
          </div>
        </div>

        <div className="cust-metric-card">
          <div className="cust-metric-icon blue">
            <ReceiptText size={18} />
          </div>
          <div>
            <span className="cust-metric-label">Lifetime Invoiced</span>
            <strong className="cust-metric-val">{fmtMoney(overallMetrics.totalInvoiced)}</strong>
          </div>
        </div>

        <div className="cust-metric-card">
          <div className="cust-metric-icon green">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="cust-metric-label">Total Paid / Collected</span>
            <strong className="cust-metric-val" style={{ color: "#047857" }}>
              {fmtMoney(overallMetrics.totalPaid)}
            </strong>
          </div>
        </div>

        <div className="cust-metric-card">
          <div className="cust-metric-icon amber">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="cust-metric-label">Outstanding Balance</span>
            <strong className="cust-metric-val" style={{ color: overallMetrics.totalDue > 0 ? "#f59e0b" : "#64748b" }}>
              {fmtMoney(overallMetrics.totalDue)}
            </strong>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="customer-search-bar" style={{ marginTop: 14, marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ position: "relative", maxWidth: 420 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#f8fafc",
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
            marginTop: 10,
          }}
        >
          <Users size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ margin: "0 0 6px", fontSize: 15, color: "#1e293b" }}>
            {searchQuery ? "No matching customers found" : "No customers saved yet"}
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
            {searchQuery
              ? `No customer records matched "${searchQuery}". Clear search to view all.`
              : "Customers are automatically synced whenever you create an invoice, or you can add them manually."}
          </p>
          <button className="primary-btn" onClick={openAddModal} style={{ margin: "0 auto" }}>
            <Plus size={14} /> Add First Customer
          </button>
        </div>
      )}

      {/* Customers Cards Grid */}
      <div className="customer-grid">
        {filteredCustomers.map((c) => {
          const stats = customerFinancials.get(c.name.trim().toLowerCase()) || {
            totalInvoiced: 0,
            totalPaid: 0,
            totalDue: 0,
            invoices: [],
          };
          const initials = c.name
            .split(" ")
            .map((x) => x[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              className="customer-interactive-card"
              key={c.id || c.name}
              onClick={() => setSelectedCustomer(c)}
              title="Click to view full customer history and invoices"
            >
              <div className="cust-card-top">
                <span
                  className="cust-avatar"
                  style={{ background: getAvatarGradient(c.name) }}
                >
                  {initials || "C"}
                </span>
                <div className="cust-main-info">
                  <strong>{c.name}</strong>
                  {c.phone && (
                    <small>
                      <Phone size={12} /> {c.phone}
                    </small>
                  )}
                  {c.email && (
                    <small>
                      <Mail size={12} /> {c.email}
                    </small>
                  )}
                  {c.address && (
                    <small>
                      <MapPin size={12} /> {c.address}
                    </small>
                  )}
                </div>
                <div className="cust-card-action">
                  <span className="inv-count-pill">
                    {stats.invoices.length} {stats.invoices.length === 1 ? "inv" : "invs"}
                  </span>
                </div>
              </div>

              {/* Financial Summary Strip */}
              <div className="cust-financial-strip">
                <div className="fin-pill">
                  <span>Billed</span>
                  <b>{fmtMoney(stats.totalInvoiced)}</b>
                </div>
                <div className="fin-pill paid">
                  <span>Paid</span>
                  <b style={{ color: "#047857" }}>{fmtMoney(stats.totalPaid)}</b>
                </div>
                <div className="fin-pill due">
                  <span>Due</span>
                  <b style={{ color: stats.totalDue > 0 ? "#f59e0b" : "#64748b" }}>
                    {fmtMoney(stats.totalDue)}
                  </b>
                </div>
              </div>

              <div className="cust-card-footer">
                <span className="view-history-link">
                  View invoice history & balance <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && selectedStats && (
        <div className="modal-backdrop">
          <div
            className="modal cust-dossier-modal"
            style={{
              width: "min(1080px, 94vw)",
              maxWidth: 1080,
              height: "min(780px, 88vh)",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="modal-head cust-dossier-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  className="cust-avatar-lg"
                  style={{
                    background: getAvatarGradient(selectedCustomer.name),
                    width: 46,
                    height: 46,
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {selectedCustomer.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <span className="eyebrow" style={{ color: "#047857", letterSpacing: "0.5px" }}>
                    CUSTOMER ACCOUNT DOSSIER
                  </span>
                  <h2 style={{ margin: "2px 0 0", fontSize: 21, fontWeight: 800 }}>
                    {selectedCustomer.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                title="Close dossier"
                style={{
                  border: 0,
                  background: "#f1f5f9",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="cust-dossier-body">
              {/* Contact Information & Quick Actions Bar */}
              <div className="cust-dossier-top-bar">
                <div className="cust-contact-details">
                  {selectedCustomer.phone && (
                    <div className="contact-row">
                      <Phone size={14} color="#64748b" />
                      <span style={{ fontWeight: 600 }}>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.email && (
                    <div className="contact-row">
                      <Mail size={14} color="#64748b" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="contact-row">
                      <MapPin size={14} color="#64748b" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  )}
                  {selectedCustomer.createdAt && (
                    <div className="contact-row">
                      <Calendar size={14} color="#64748b" />
                      <span>Customer since {selectedCustomer.createdAt}</span>
                    </div>
                  )}
                </div>

                <div className="cust-dossier-actions">
                  <button
                    className="primary-btn"
                    onClick={() => {
                      const cust = selectedCustomer;
                      setSelectedCustomer(null);
                      onCreateInvoiceForCustomer(cust);
                    }}
                    title="Create a new invoice directly for this customer"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    <Plus size={14} /> Create Invoice
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => openEditModal(selectedCustomer)}
                    title="Edit customer details"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() =>
                      handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)
                    }
                    title="Delete customer"
                    style={{ color: "#ef4444", width: 34, height: 34 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* 3 Highlight Financial Metric Cards */}
              <div className="dossier-metrics-grid">
                <div className="dossier-metric-box">
                  <div className="metric-header">
                    <span>Lifetime Invoiced</span>
                    <ReceiptText size={16} color="#047857" />
                  </div>
                  <strong>{fmtMoney(selectedStats.totalInvoiced)}</strong>
                  <small>
                    {selectedStats.invoices.length}{" "}
                    {selectedStats.invoices.length === 1 ? "invoice" : "invoices"} generated
                  </small>
                </div>

                <div className="dossier-metric-box paid">
                  <div className="metric-header">
                    <span>Total Paid / Received</span>
                    <CheckCircle2 size={16} color="#047857" />
                  </div>
                  <strong style={{ color: "#047857" }}>
                    {fmtMoney(selectedStats.totalPaid)}
                  </strong>
                  <small>
                    {selectedStats.invoices.filter((i) => i.status === "Paid").length} paid in full
                  </small>
                </div>

                <div className="dossier-metric-box due">
                  <div className="metric-header">
                    <span>Outstanding / Balance Due</span>
                    <AlertCircle
                      size={16}
                      color={selectedStats.totalDue > 0 ? "#f59e0b" : "#64748b"}
                    />
                  </div>
                  <strong
                    style={{
                      color: selectedStats.totalDue > 0 ? "#f59e0b" : "#64748b",
                    }}
                  >
                    {fmtMoney(selectedStats.totalDue)}
                  </strong>
                  <small>
                    {selectedStats.invoices.filter((i) => i.status !== "Paid").length} pending collection
                  </small>
                </div>
              </div>

              {/* Invoices History Table */}
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 220,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                    Invoice History for {selectedCustomer.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#047857",
                      background: "#eef2ff",
                      padding: "2px 10px",
                      borderRadius: 12,
                    }}
                  >
                    {selectedStats.invoices.length}{" "}
                    {selectedStats.invoices.length === 1 ? "record" : "records"}
                  </span>
                </div>

                {selectedStats.invoices.length === 0 ? (
                  <div
                    style={{
                      padding: "36px 20px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px dashed #cbd5e1",
                      textAlign: "center",
                      margin: "auto 0",
                    }}
                  >
                    <FileText size={30} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
                      No invoices have been billed to this customer yet.
                    </p>
                    <button
                      className="primary-btn"
                      style={{ margin: "0 auto" }}
                      onClick={() => {
                        const cust = selectedCustomer;
                        setSelectedCustomer(null);
                        onCreateInvoiceForCustomer(cust);
                      }}
                    >
                      <Plus size={14} /> Create First Invoice
                    </button>
                  </div>
                ) : (
                  <div className="table-wrap cust-dossier-table-wrap">
                    <table style={{ width: "100%" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th style={{ width: "18%", padding: "11px 16px" }}>Invoice #</th>
                          <th style={{ width: "18%", padding: "11px 16px" }}>Issued Date</th>
                          <th style={{ width: "18%", padding: "11px 16px" }}>Due Date</th>
                          <th style={{ width: "22%", padding: "11px 16px" }}>Total Amount</th>
                          <th style={{ width: "12%", padding: "11px 16px" }}>Status</th>
                          <th style={{ width: "12%", padding: "11px 16px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStats.invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td style={{ padding: "11px 16px" }}>
                              <button
                                className="invoice-link"
                                onClick={() => {
                                  setSelectedCustomer(null);
                                  onOpenPreview(inv);
                                }}
                                title="Click to preview & print invoice"
                                style={{ fontWeight: 700 }}
                              >
                                {inv.id}
                              </button>
                            </td>
                            <td style={{ padding: "11px 16px" }}>{inv.issued}</td>
                            <td style={{ padding: "11px 16px" }}>{inv.due}</td>
                            <td style={{ padding: "11px 16px" }}>
                              <strong>{fmtMoney(inv.amount)}</strong>
                            </td>
                            <td style={{ padding: "11px 16px" }}>
                              <span
                                className={`invoice-status-badge status-${(inv.status || "Draft").toLowerCase()}`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: "11px 16px", textAlign: "right" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  className="icon-btn"
                                  onClick={() => {
                                    setSelectedCustomer(null);
                                    onOpenPreview(inv);
                                  }}
                                  title="Preview invoice"
                                >
                                  <Eye size={14} />
                                </button>
                                {onEditInvoice && (
                                  <button
                                    className="icon-btn"
                                    onClick={() => {
                                      setSelectedCustomer(null);
                                      onEditInvoice(inv);
                                    }}
                                    title="Edit / Update invoice"
                                    data-testid={`customer-edit-invoice-${inv.id}`}
                                  >
                                    <Pencil size={14} color="#047857" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="modal-actions cust-dossier-actions-footer">
              <button
                className="secondary-btn"
                onClick={() => setSelectedCustomer(null)}
                style={{ padding: "8px 22px", fontSize: 13, fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {editingCustomer ? "EDIT RECORD" : "NEW CUSTOMER ACCOUNT"}
                </span>
                <h2>{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 0" }}>
                <label>
                  Customer / Business Name *
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Acme Gulf Trading LLC"
                    autoFocus
                  />
                </label>

                <label>
                  Phone / WhatsApp Number
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                  />
                </label>

                <label>
                  Billing Email
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. billing@acme.ae"
                  />
                </label>

                <label>
                  Address / City
                  <textarea
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Office 402, Business Bay, Dubai, UAE"
                    style={{ resize: "vertical" }}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <CheckCircle2 size={14} />
                  {editingCustomer ? "Save Changes" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
