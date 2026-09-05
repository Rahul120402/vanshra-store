import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { STANDARD_SIZES } from "../../data/initialData";
import { X, Save, Layers, Sparkles } from "lucide-react";

export const QuickStockModal = ({ product, isOpen, onClose }) => {
  const { updateProduct, showToast } = useStore();

  const [sizes, setSizes] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  useEffect(() => {
    if (product?.sizes) {
      setSizes({
        S: product.sizes.S ?? 0,
        M: product.sizes.M ?? 0,
        L: product.sizes.L ?? 0,
        XL: product.sizes.XL ?? 0,
        XXL: product.sizes.XXL ?? 0
      });
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleStockChange = (size, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setSizes((prev) => ({ ...prev, [size]: num }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProduct(product.id, { sizes });
    showToast(`Inventory updated for ${product.name}!`, "success");
    onClose();
  };

  const totalStock = Object.values(sizes).reduce((sum, n) => sum + (Number(n) || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={18} style={{ color: "var(--accent-gold)" }} />
            <div>
              <h3 className="font-serif" style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
                Quick Stock Adjust
              </h3>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                {product.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {STANDARD_SIZES.map((size) => (
              <div key={size} style={{ textAlign: "center" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {size}
                </label>
                <input
                  type="number"
                  min="0"
                  value={sizes[size]}
                  onChange={(e) => handleStockChange(size, e.target.value)}
                  className="input-field"
                  style={{ textAlign: "center", fontWeight: 700, fontSize: "1.1rem", padding: "10px 4px" }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.85rem" }}>
            <span className="text-secondary">Combined Total Stock:</span>
            <strong style={{ color: totalStock === 0 ? "#ef4444" : totalStock <= 5 ? "#f59e0b" : "var(--accent-emerald)", fontSize: "1rem" }}>
              {totalStock} Units
            </strong>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-sm">
              <Save size={14} />
              <span>Update Stock</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
