import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, getTotalStock, getStockBadgeInfo, FALLBACK_PRODUCT_IMAGE, sortProductSizes } from "../../utils/formatters";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Eye, 
  AlertCircle
} from "lucide-react";

export const AdminProductsView = ({ onAddProduct, onEditProduct, onQuickStock }) => {
  const { products, deleteProduct, settings, setSelectedProductId, setCurrentView } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  const filteredProducts = products.filter((prod) => {
    if (selectedCategoryFilter !== "All" && prod.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchCat = prod.category.toLowerCase().includes(q);
      const matchSku = (prod.sku || "").toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchSku) return false;
    }
    return true;
  });

  const handleDelete = (e, prod) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${prod.name}" from your catalog?`)) {
      deleteProduct(prod.id);
    }
  };

  const handlePreviewInStore = (e, prodId) => {
    e.stopPropagation();
    setSelectedProductId(prodId);
    setCurrentView("store");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
      
      {/* Header & Action */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px"
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", color: "var(--text-primary)", lineHeight: 1.2 }}>
            Product Catalog & Inventory
          </h2>
          <p className="text-secondary" style={{ fontSize: "clamp(0.78rem, 1.8vw, 0.86rem)", marginTop: "3px" }}>
            Add, update photos, edit pricing, and manage stock counts per size without writing code.
          </p>
        </div>

        <button onClick={onAddProduct} className="btn btn-gold" style={{ padding: "8px 18px", fontWeight: 700 }}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px"
      }}>
        {/* Category Filters with Touch Scroll */}
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          paddingBottom: "4px",
          maxWidth: "100%"
        }}>
          {settings.categories.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  background: isSelected ? "linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(179, 135, 40, 0.32) 100%)" : "#ffffff",
                  border: isSelected ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-gold)",
                  color: isSelected ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                  fontSize: "0.78rem",
                  fontWeight: isSelected ? 800 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ width: "100%", maxWidth: "320px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "36px", height: "38px", fontSize: "0.84rem", width: "100%" }}
          />
        </div>
      </div>

      {/* Products Display (Mobile Cards + Desktop Table) */}
      {filteredProducts.length > 0 ? (
        <>
          {/* Mobile Product Cards (< 768px) */}
          <div className="admin-products-mobile-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredProducts.map((product) => {
              const totalStock = getTotalStock(product.sizes);
              const badge = getStockBadgeInfo(product.sizes);

              return (
                <div
                  key={product.id}
                  className="glass-panel"
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-gold)",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    boxShadow: "0 4px 16px rgba(44, 30, 10, 0.05)"
                  }}
                >
                  {/* Top Row: Thumbnail, Title, Category, Price */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <img
                      src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }
                      }}
                      style={{
                        width: "56px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-gold)",
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                        <strong style={{ color: "var(--text-primary)", fontSize: "0.90rem", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {product.name}
                        </strong>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--accent-gold-dark)", fontWeight: 700, marginTop: "2px" }}>
                        {product.category} • SKU: {product.sku || "N/A"}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
                        <span className="font-serif" style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--accent-gold-dark)" }}>
                          {formatCurrency(product.price, settings.currencySymbol)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                            {formatCurrency(product.originalPrice, settings.currencySymbol)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Stock Breakdown */}
                  <div style={{ background: "var(--bg-surface-elevated)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-muted)", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600 }}>Size Stock Counts:</span>
                      <span className={`badge badge-${badge.status === "in-stock" ? "delivered" : badge.status === "low-stock" ? "dispatched" : "cancelled"}`} style={{ fontSize: "0.64rem", padding: "1px 6px" }}>
                        {badge.label} ({totalStock})
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {Object.entries(sortProductSizes(product.sizes || {})).map(([sz, cnt]) => {
                        const countNum = Number(cnt) || 0;
                        const isOut = countNum === 0;

                        return (
                          <span
                            key={sz}
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: isOut ? "rgba(244, 63, 94, 0.12)" : countNum <= 2 ? "rgba(245, 158, 11, 0.12)" : "#ffffff",
                              border: isOut ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid var(--border-gold)",
                              color: isOut ? "#e11d48" : countNum <= 2 ? "#d97706" : "var(--text-primary)",
                              fontWeight: 700
                            }}
                          >
                            {sz}: {countNum}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div style={{ display: "flex", gap: "6px", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                    <button
                      onClick={() => onQuickStock(product)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: "7px 10px", fontSize: "0.78rem", fontWeight: 700 }}
                    >
                      <Layers size={13} style={{ color: "var(--accent-gold)" }} />
                      <span>Stock (+/-)</span>
                    </button>

                    <button
                      onClick={() => onEditProduct(product)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: "7px 10px", fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={(e) => handlePreviewInStore(e, product.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "7px 10px" }}
                      title="View in Store"
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, product)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "7px 10px" }}
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Desktop Product Table (>= 768px) */}
          <div className="admin-products-desktop-table glass-panel" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-surface-elevated)", color: "var(--accent-gold-dark)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <th style={{ padding: "14px 18px" }}>Product</th>
                    <th style={{ padding: "14px 18px" }}>Category & SKU</th>
                    <th style={{ padding: "14px 18px" }}>Price</th>
                    <th style={{ padding: "14px 18px" }}>Stock per Size (XXS - XXXL)</th>
                    <th style={{ padding: "14px 18px" }}>Stock Status</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => {
                    const totalStock = getTotalStock(product.sizes);
                    const badge = getStockBadgeInfo(product.sizes);

                    return (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: idx % 2 === 1 ? "rgba(250, 248, 245, 0.6)" : "transparent"
                        }}
                      >
                        {/* Product Thumbnail & Title */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <img
                              src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
                                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                }
                              }}
                              style={{ width: "48px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}
                            />
                            <div>
                              <strong style={{ color: "var(--text-primary)", display: "block" }}>
                                {product.name}
                              </strong>
                              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                                {product.isNew && (
                                  <span style={{ fontSize: "0.65rem", padding: "1px 5px", background: "rgba(203,163,88,0.2)", color: "var(--accent-gold-dark)", borderRadius: "3px", fontWeight: 700 }}>
                                    NEW
                                  </span>
                                )}
                                {product.isBestSeller && (
                                  <span style={{ fontSize: "0.65rem", padding: "1px 5px", background: "rgba(16,185,129,0.2)", color: "#0f766e", borderRadius: "3px", fontWeight: 700 }}>
                                    BEST SELLER
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & SKU */}
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{product.category}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{product.sku || "N/A"}</span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "14px 18px" }}>
                          <strong style={{ color: "var(--accent-gold-dark)", fontSize: "1rem" }}>
                            {formatCurrency(product.price, settings.currencySymbol)}
                          </strong>
                          {product.originalPrice > product.price && (
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "line-through", display: "block" }}>
                              {formatCurrency(product.originalPrice, settings.currencySymbol)}
                            </span>
                          )}
                        </td>

                        {/* Size Stock Pills */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
                            {Object.entries(sortProductSizes(product.sizes || {})).map(([sz, cnt]) => {
                              const countNum = Number(cnt) || 0;
                              const isOut = countNum === 0;

                              return (
                                <span
                                  key={sz}
                                  style={{
                                    fontSize: "0.72rem",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-xs)",
                                    background: isOut ? "rgba(244, 63, 94, 0.12)" : countNum <= 2 ? "rgba(245, 158, 11, 0.12)" : "var(--bg-surface-elevated)",
                                    border: isOut ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid var(--border-subtle)",
                                    color: isOut ? "#e11d48" : countNum <= 2 ? "#d97706" : "var(--text-primary)",
                                    fontWeight: 700
                                  }}
                                >
                                  {sz}: {countNum}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Overall Stock Status */}
                        <td style={{ padding: "14px 18px" }}>
                          <span className={`badge badge-${badge.status === "in-stock" ? "delivered" : badge.status === "low-stock" ? "dispatched" : "cancelled"}`}>
                            {badge.label} ({totalStock})
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => onQuickStock(product)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "6px 10px" }}
                              title="Quick Stock Replenishment"
                            >
                              <Layers size={14} />
                              <span className="hide-on-mobile">Stock</span>
                            </button>

                            <button
                              onClick={() => onEditProduct(product)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "6px 10px" }}
                              title="Edit Product Details & Photos"
                            >
                              <Edit3 size={14} />
                              <span className="hide-on-mobile">Edit</span>
                            </button>

                            <button
                              onClick={(e) => handlePreviewInStore(e, product.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "6px 10px" }}
                              title="View Product Page in Storefront"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={(e) => handleDelete(e, product)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "6px 10px" }}
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <AlertCircle size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <h4 style={{ color: "var(--text-primary)", marginBottom: "4px" }}>No Products Found</h4>
          <p style={{ fontSize: "0.85rem" }}>
            {searchTerm ? `No products match "${searchTerm}"` : "Your catalog is empty. Click 'Add New Product' to begin!"}
          </p>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .admin-products-mobile-list {
            display: none !important;
          }
          .admin-products-desktop-table {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .admin-products-desktop-table {
            display: none !important;
          }
          .admin-products-mobile-list {
            display: flex !important;
          }
        }
      `}</style>

    </div>
  );
};
