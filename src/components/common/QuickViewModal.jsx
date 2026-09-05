import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, getStockBadgeInfo } from "../../utils/formatters";
import { X, ShoppingBag, Heart, ChevronRight, Ruler } from "lucide-react";

export const QuickViewModal = () => {
  const {
    isQuickViewOpen,
    setIsQuickViewOpen,
    quickViewProduct,
    settings,
    addToCart,
    wishlist,
    toggleWishlist,
    navigateToProduct,
    setIsSizeGuideOpen
  } = useStore();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImageIdx(0);
      setSelectedColor(quickViewProduct.colors?.[0] || null);
      
      // Auto-select first available in-stock size
      const availableSize = Object.keys(quickViewProduct.sizes || {}).find(
        (size) => (quickViewProduct.sizes[size] || 0) > 0
      );
      setSelectedSize(availableSize || "");
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!isQuickViewOpen || !quickViewProduct) return null;

  const stockBadge = getStockBadgeInfo(quickViewProduct.sizes);
  const isWishlisted = wishlist.includes(quickViewProduct.id);
  const selectedSizeStock = selectedSize ? (quickViewProduct.sizes?.[selectedSize] || 0) : 0;
  const isSelectedSizeOutOfStock = selectedSize && selectedSizeStock === 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    setIsQuickViewOpen(false);
  };

  const handleViewFullPage = () => {
    setIsQuickViewOpen(false);
    navigateToProduct(quickViewProduct.id);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsQuickViewOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(860px, calc(100vw - 16px))",
          padding: 0,
          overflow: "hidden",
          maxHeight: "min(94vh, calc(100dvh - 16px))"
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsQuickViewOpen(false)}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.92)",
            border: "1px solid var(--border-gold)",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-primary)",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          <X size={16} />
        </button>

        <div className="quickview-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "auto"
        }}>
          
          {/* Product Gallery Left */}
          <div style={{ background: "#1c1917", padding: "clamp(12px, 2.5vw, 20px)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{
              flex: 1,
              minHeight: "clamp(240px, 40vw, 360px)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              background: "#080a0e",
              position: "relative"
            }}>
              <img
                src={quickViewProduct.images?.[selectedImageIdx] || quickViewProduct.images?.[0]}
                alt={quickViewProduct.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              
              {/* Wishlist floating button */}
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isWishlisted ? "var(--accent-ruby)" : "var(--text-primary)"
                }}
              >
                <Heart size={16} fill={isWishlisted ? "var(--accent-ruby)" : "none"} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {quickViewProduct.images?.length > 1 && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                {quickViewProduct.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: selectedImageIdx === idx ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0
                    }}
                  >
                    <img src={imgUrl} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Right */}
          <div style={{ padding: "clamp(16px, 3.5vw, 28px)", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
            
            {/* Category & Stock Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-gold-dark)", fontWeight: 800 }}>
                {quickViewProduct.category}
              </span>
              <span className={`badge badge-${stockBadge.status === "in-stock" ? "delivered" : stockBadge.status === "low-stock" ? "dispatched" : "cancelled"}`}>
                {stockBadge.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif" style={{ fontSize: "clamp(1.15rem, 3vw, 1.45rem)", lineHeight: 1.3, color: "var(--text-primary)" }}>
              {quickViewProduct.name}
            </h2>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
              <span className="font-serif" style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.55rem)", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                {formatCurrency(quickViewProduct.price, settings.currencySymbol)}
              </span>
              {quickViewProduct.originalPrice > quickViewProduct.price && (
                <>
                  <span style={{ fontSize: "0.92rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                    {formatCurrency(quickViewProduct.originalPrice, settings.currencySymbol)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: 700 }}>
                    Save {Math.round(((quickViewProduct.originalPrice - quickViewProduct.price) / quickViewProduct.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Color variants */}
            {quickViewProduct.colors?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Color: <span style={{ color: "var(--text-primary)" }}>{selectedColor?.name || "Standard"}</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {quickViewProduct.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: color.hex || "#333",
                        border: selectedColor?.name === color.name ? "2px solid var(--accent-gold-dark)" : "1px solid rgba(0,0,0,0.15)",
                        outline: selectedColor?.name === color.name ? "2px solid var(--accent-gold)" : "none",
                        outlineOffset: "2px",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Select Size:
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--accent-gold-dark)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Ruler size={13} />
                  <span>Size Chart</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Object.entries(quickViewProduct.sizes || {}).map(([size, count]) => {
                  const stockNum = Number(count) || 0;
                  const isOutOfStock = stockNum === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`size-chip ${isSelected ? "size-chip-selected" : ""} ${isOutOfStock ? "size-chip-disabled" : ""}`}
                      style={{ minWidth: "44px", height: "44px" }}
                    >
                      <span className="size-chip-label" style={{ fontSize: "0.82rem" }}>{size}</span>
                      <span className={`size-chip-stock ${isOutOfStock ? "stock-out" : stockNum <= 2 ? "stock-low" : ""}`}>
                        {isOutOfStock ? "Sold" : `${stockNum} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "10px", flexWrap: "wrap" }}>
              <button
                disabled={!selectedSize || isSelectedSizeOutOfStock}
                onClick={handleAddToCart}
                className="btn btn-gold"
                style={{ flex: 1, opacity: !selectedSize || isSelectedSizeOutOfStock ? 0.6 : 1, padding: "10px 16px" }}
              >
                <ShoppingBag size={16} />
                <span>
                  {!selectedSize
                    ? "Select Size"
                    : isSelectedSizeOutOfStock
                    ? "Sold Out"
                    : "Add to Bag"}
                </span>
              </button>

              <button
                onClick={handleViewFullPage}
                className="btn btn-secondary"
                style={{ padding: "10px 14px" }}
                title="View full details and care guide"
              >
                <span>Full Details</span>
                <ChevronRight size={15} />
              </button>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 680px) {
            .quickview-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
