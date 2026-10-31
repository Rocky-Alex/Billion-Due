import React, { useState, useRef, useEffect } from "react";
import { Package } from "lucide-react";
import type { Product, Customer } from "@billiondue/shared";

interface ProductAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  placeholder?: string;
  autoFocus?: boolean;
}

export function ProductAutocomplete({
  value,
  onChange,
  onSelectProduct,
  products,
  placeholder = "Item description or service...",
  autoFocus = false,
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter matching products
  const matches = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const q = value.trim().toLowerCase();
    if (!q) {
      // If blank and open, show first 8 popular/available items
      return products.slice(0, 8);
    }
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.specs && p.specs.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [products, value]);

  // Close on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const handleSelect = (prod: Product) => {
    onSelectProduct(prod);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        display: "inline-block",
        zIndex: isOpen ? 99999 : "auto",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ width: "100%" }}
      />

      {isOpen && (
        <div
          className="product-autocomplete-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: 360,
            maxWidth: 480,
            background: "#ffffff",
            borderRadius: 8,
            boxShadow:
              "0 20px 35px -5px rgba(0, 0, 0, 0.25), 0 10px 15px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid #cbd5e1",
            zIndex: 999999,
            overflow: "hidden",
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          {products.length === 0 ? (
            <div style={{ padding: "16px 14px", textAlign: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#ECFDF5",
                  color: "#047857",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 8px",
                }}
              >
                <Package size={18} />
              </div>
              <strong style={{ display: "block", fontSize: 13, color: "#0f172a", marginBottom: 4 }}>
                Product Catalog is Empty
              </strong>
              <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
                Type any custom item description above, or add items in Products &amp; Catalog.
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div style={{ padding: "14px 12px", textAlign: "center", color: "#64748b" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12.5, fontWeight: 600, color: "#334155" }}>
                No catalog items matching "{value}"
              </p>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>
                You can keep typing to enter this as a custom item description.
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "6px 10px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Saved Laptop & PC Items ({matches.length})</span>
                <span style={{ fontSize: 9.5, fontWeight: 500 }}>
                  Click to autofill rate & warranty
                </span>
              </div>

              <div style={{ padding: "4px 0" }}>
                {matches.map((p) => (
                  <div
                    key={p.sku}
                    className="autocomplete-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(p);
                    }}
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {p.brand && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              padding: "1px 5px",
                              borderRadius: 3,
                              background: "#e2e8f0",
                              color: "#1e293b",
                            }}
                          >
                            {p.brand}
                          </span>
                        )}
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>
                          {p.name}
                        </strong>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        >
                          {p.sku}
                        </span>
                      </div>
                      {p.specs && (
                        <span style={{ fontSize: 11, color: "#475569", lineHeight: "1.2" }}>
                          {p.specs}
                        </span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: "#64748b" }}>
                        <span>{p.category || "Hardware"}</span>
                        {p.warranty && <span>· 🛡️ {p.warranty}</span>}
                        {p.stock !== null && p.stock !== undefined && (
                          <span style={{ color: p.stock > 0 ? "#047857" : "#ef4444" }}>
                            · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                      <strong style={{ fontSize: 13, color: "#047857" }}>
                        AED {p.price.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface CustomerAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  customers: Customer[];
  placeholder?: string;
  required?: boolean;
}

export function CustomerAutocomplete({
  value,
  onChange,
  onSelectCustomer,
  customers,
  placeholder = "Customer or business name",
  required = false,
}: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter matching customers
  const matches = React.useMemo(() => {
    if (!customers || customers.length === 0) return [];
    const q = value.trim().toLowerCase();
    if (!q) return customers.slice(0, 5);
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [customers, value]);

  // Close on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const handleSelect = (c: Customer) => {
    onSelectCustomer(c);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        display: "inline-block",
        zIndex: isOpen ? 99999 : "auto",
      }}
    >
      <input
        required={required}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (customers && customers.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        style={{ width: "100%" }}
      />

      {isOpen && matches.length > 0 && (
        <div
          className="customer-autocomplete-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            minWidth: 280,
            background: "#ffffff",
            borderRadius: 8,
            boxShadow:
              "0 20px 35px -5px rgba(0, 0, 0, 0.25), 0 10px 15px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid #cbd5e1",
            zIndex: 999999,
            overflow: "hidden",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: 10,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Existing Customers</span>
            <span style={{ fontSize: 9.5, fontWeight: 500 }}>
              Click to autofill contact details
            </span>
          </div>

          <div style={{ padding: "4px 0" }}>
            {matches.map((c) => (
              <div
                key={c.id || c.name}
                className="autocomplete-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(c);
                }}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <strong style={{ fontSize: 13, color: "#0f172a" }}>{c.name}</strong>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#64748b" }}>
                  {c.phone && <span>{c.phone}</span>}
                  {c.email && <span>{c.email}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
