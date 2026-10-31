import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Laptop,
  Monitor,
  Cpu,
  Wrench,
} from "lucide-react";
import type { Product } from "@billiondue/shared";
import {
  COMPUTER_CATEGORIES,
  COMPUTER_BRANDS,
} from "@billiondue/shared";

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  notify: (message: string, tone?: "ok" | "warn") => void;
}

export function ProductManager({
  products,
  setProducts,
  notify,
}: ProductManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state tailored for Laptop & Desktop Sales
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("Lenovo");
  const [formCategory, setFormCategory] = useState<string>("Laptops");
  const [formSpecs, setFormSpecs] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formTax, setFormTax] = useState("0");
  const [formStock, setFormStock] = useState("");

  // Extract all unique categories (merge predefined computer categories + any existing)
  const categories = useMemo(() => {
    const set = new Set<string>(COMPUTER_CATEGORIES);
    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }
    return ["all", ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => (p.category || "Laptops").toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.specs && p.specs.toLowerCase().includes(q)) ||
          (p.serialNumber && p.serialNumber.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  // Generate SKU with intelligent prefix by category
  const generateSku = (category = formCategory) => {
    let prefix = "ITM";
    const catLower = (category || "").toLowerCase();
    if (catLower.includes("laptop")) prefix = "LAP";
    else if (catLower.includes("desktop")) prefix = "DSK";
    else if (catLower.includes("gaming")) prefix = "GAM";
    else if (catLower.includes("monitor")) prefix = "MON";
    else if (catLower.includes("component")) prefix = "CMP";
    else if (catLower.includes("access")) prefix = "ACC";
    else if (catLower.includes("soft")) prefix = "SFT";
    else if (catLower.includes("serv")) prefix = "SRV";

    const num = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${num}`;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("Lenovo");
    setFormCategory("Laptops");
    setFormSpecs("");
    setFormSerial("");
    setFormSku(generateSku("Laptops"));
    setFormPrice("");
    setFormTax("0");
    setFormStock("5");
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand || "Other");
    setFormCategory(p.category || "Laptops");
    setFormSpecs(p.specs || "");
    setFormSerial(p.serialNumber || "");
    setFormSku(p.sku);
    setFormPrice(String(p.price));
    setFormTax(p.tax !== undefined ? String(p.tax) : "0");
    setFormStock(p.stock !== null && p.stock !== undefined ? String(p.stock) : "");
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      notify("Item / Model name is required", "warn");
      return;
    }
    const priceNum = Math.max(0, Number(formPrice) || 0);
    const taxNum = Number(formTax) || 0;
    const stockVal = formStock.trim() === "" ? null : Math.max(0, parseInt(formStock, 10) || 0);
    const cleanSku = formSku.trim() || generateSku(formCategory);

    const productPayload: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: cleanName,
      brand: formBrand.trim() || undefined,
      category: formCategory.trim() || "Laptops",
      specs: formSpecs.trim() || undefined,
      serialNumber: formSerial.trim() || undefined,
      sku: cleanSku,
      price: priceNum,
      tax: taxNum,
      stock: stockVal,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.sku === editingProduct.sku || (p.id && p.id === editingProduct.id)
            ? productPayload
            : p
        )
      );
      notify(`Item "${cleanName}" updated successfully`, "ok");
    } else {
      setProducts((prev) => [productPayload, ...prev]);
      notify(`Item "${cleanName}" added to Laptop / PC Catalog`, "ok");
    }

    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = (sku: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      notify(`Item "${name}" removed from catalog`, "ok");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all items from the catalog?")) {
      setProducts([]);
      notify("Catalog cleared", "ok");
    }
  };

  const fmtMoney = (val: number) =>
    "AED " +
    val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getCategoryIcon = (cat = "") => {
    const c = cat.toLowerCase();
    if (c.includes("laptop")) return <Laptop size={16} />;
    if (c.includes("desktop") || c.includes("gaming") || c.includes("monitor"))
      return <Monitor size={16} />;
    if (c.includes("component")) return <Cpu size={16} />;
    if (c.includes("serv")) return <Wrench size={16} />;
    return <Package size={16} />;
  };

  return (
    <section className="desk-panel desk-page">
      {/* Header */}
      <div className="panel-head">
        <div>
          <h2>Laptop & Desktop Sales Catalog</h2>
          <p>
            {products.length} hardware systems & accessories configured for fast invoicing
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {products.length > 0 && (
            <button
              type="button"
              className="secondary-btn"
              onClick={handleClearAll}
              title="Clear all hardware catalog items"
              style={{ color: "#dc2626" }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={15} /> Add Laptop / PC
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          margin: "12px 0 16px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: 280, maxWidth: 420, flex: 1 }}>
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
            placeholder="Search by Laptop, Desktop, Specs, Brand, or S/N..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
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

        {/* Category Filter Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid",
                borderColor: selectedCategory === cat ? "#047857" : "#cbd5e1",
                background: selectedCategory === cat ? "#ECFDF5" : "#ffffff",
                color: selectedCategory === cat ? "#047857" : "#475569",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {cat === "all" ? "All Systems & Hardware" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Products */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: "44%" }}>System / Model &amp; Specs</th>
              <th style={{ width: "18%" }}>SKU</th>
              <th style={{ width: "16%" }}>Category</th>
              <th style={{ width: "14%" }}>Unit price</th>
              <th style={{ width: "8%" }}>In Stock</th>
              <th style={{ textAlign: "right" }} />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                    }}
                  >
                    <Laptop size={36} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
                    <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>
                      {searchQuery
                        ? `No items matching "${searchQuery}"`
                        : "No laptops, desktops, or hardware items added yet"}
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button className="primary-btn" onClick={openAddModal}>
                        <Plus size={14} /> Add Laptop / Desktop
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.sku}>
                  <td>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background:
                            p.category === "Laptops"
                              ? "#ECFDF5"
                              : p.category === "Desktops" || p.category === "Gaming PCs"
                              ? "#e0e7ff"
                              : p.category === "Components"
                              ? "#fef3c7"
                              : "#f1f5f9",
                          color:
                            p.category === "Laptops"
                              ? "#047857"
                              : p.category === "Desktops" || p.category === "Gaming PCs"
                              ? "#047857"
                              : p.category === "Components"
                              ? "#d97706"
                              : "#475569",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {getCategoryIcon(p.category)}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {p.brand && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 4,
                                background: "#f1f5f9",
                                color: "#0f172a",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              {p.brand}
                            </span>
                          )}
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>{p.name}</strong>
                        </div>
                        {p.specs && (
                          <span style={{ fontSize: 11, color: "#64748b", lineHeight: "1.3" }}>
                            {p.specs}
                          </span>
                        )}
                        {p.serialNumber && (
                          <span style={{ fontSize: 10.5, color: "#047857", fontWeight: 600 }}>
                            S/N: {p.serialNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code
                      style={{
                        padding: "2px 6px",
                        background: "#f1f5f9",
                        borderRadius: 4,
                        fontSize: 11,
                        color: "#334155",
                      }}
                    >
                      {p.sku}
                    </code>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      {p.category || "Hardware"}
                    </span>
                  </td>
                  <td>
                    <strong>{fmtMoney(p.price)}</strong>
                  </td>
                  <td>
                    {p.stock !== null && p.stock !== undefined ? (
                      <span
                        style={{
                          color: p.stock > 0 ? "#047857" : "#ef4444",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {p.stock} units
                      </span>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: 11 }}>Service</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => openEditModal(p)}
                        title="Edit hardware item"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleDelete(p.sku, p.name)}
                        title="Delete product"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Hardware & Laptop Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {editingProduct ? "UPDATE HARDWARE ITEM" : "NEW HARDWARE CATALOG ITEM"}
                </span>
                <h2>
                  {editingProduct
                    ? "Edit Laptop / Desktop Item"
                    : "Add Laptop, Desktop or Component"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: "12px 0",
                  maxHeight: "75vh",
                  overflowY: "auto",
                }}
              >
                {/* Name / Model */}
                <label>
                  Laptop / Desktop / Product Model Name *
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lenovo ThinkPad T14 Gen 3 or Dell OptiPlex 7090"
                    autoFocus
                  />
                </label>

                {/* Category & Brand */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label>
                    Category
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setFormCategory(newCat);
                        if (!editingProduct) {
                          setFormSku(generateSku(newCat));
                        }
                      }}
                    >
                      {COMPUTER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Brand / Manufacturer
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                    >
                      {COMPUTER_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Specifications / Specs */}
                <label>
                  Specifications / Configuration
                  <input
                    type="text"
                    value={formSpecs}
                    onChange={(e) => setFormSpecs(e.target.value)}
                    placeholder='e.g. Core i7 12th Gen, 16GB RAM, 512GB NVMe SSD, 14" FHD'
                  />
                </label>

                {/* Serial Number & SKU */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
                  <label>
                    Serial Number / Service Tag (Optional)
                    <input
                      type="text"
                      value={formSerial}
                      onChange={(e) => setFormSerial(e.target.value)}
                      placeholder="e.g. S/N: 8HG721X"
                    />
                  </label>

                  <label>
                    SKU / Code
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        placeholder="LAP-101"
                      />
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setFormSku(generateSku(formCategory))}
                        title="Auto-generate SKU"
                        style={{ padding: "0 8px", fontSize: 11 }}
                      >
                        Gen
                      </button>
                    </div>
                  </label>
                </div>

                {/* Price & Stock Quantity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label>
                    Default Unit Price (AED) *
                    <input
                      required
                      type="number"
                      step="any"
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    In-Stock Quantity (leave blank for Service)
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="e.g. 5 (or blank for service)"
                    />
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <CheckCircle2 size={14} />
                  {editingProduct ? "Save Changes" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
