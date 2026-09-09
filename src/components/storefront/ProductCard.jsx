import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, getTotalStock, getStockBadgeInfo, FALLBACK_PRODUCT_IMAGE, sortProductSizes } from "../../utils/formatters";
import { Eye, Check, ShoppingBag } from "lucide-react";

export const ProductCard = ({ product }) => {
  const {
    settings,
    navigateToProduct,
    setIsQuickViewOpen,
    setQuickViewProduct,
    addToCart,
    showToast
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAddedSize, setJustAddedSize] = useState(null);
  const [isCardBagAdded, setIsCardBagAdded] = useState(false);

  const totalStock = getTotalStock(product.sizes);
  const stockBadge = getStockBadgeInfo(product.sizes);
  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleCardClick = () => {
    navigateToProduct(product.id);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleQuickAdd = (e, size) => {
    e.stopPropagation();
    if ((product.sizes?.[size] || 0) <= 0) return;
    
    // Trigger micro-interaction animation
    setJustAddedSize(size);
    setTimeout(() => setJustAddedSize(null), 1200);

    addToCart(product, size, product.colors?.[0], 1);
  };

  const handleQuickAddDirect = (e) => {
    e.stopPropagation();
    const sortedSizes = sortProductSizes(product.sizes || {});
    const inStockSize = Object.keys(sortedSizes).find(
      (s) => (Number(sortedSizes[s]) || 0) > 0
    );

    if (!inStockSize) {
      showToast(`${product.name} is currently out of stock`, "warning");
      return;
    }

    setIsCardBagAdded(true);
    setTimeout(() => setIsCardBagAdded(false), 1400);

    addToCart(product, inStockSize, product.colors?.[0], 1);
  };

  const hasSecondaryImage = product.images && product.images.length > 1;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-panel glass-panel-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        borderRadius: "clamp(14px, 2.5vw, 22px)",
        cursor: "pointer",
        background: "#ffffff",
        border: "1px solid var(--border-gold)",
        boxShadow: "0 4px 20px rgba(44, 30, 10, 0.05)",
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        willChange: "transform",
        width: "100%",
        maxWidth: "100%"
      }}
      onClick={handleCardClick}
    >
      {/* Product Image Area (Editorial 4:5 Lookbook ratio with Smooth Crossfade) */}
      <div style={{
        position: "relative",
        width: "100%",
        paddingTop: "125%",
        background: "linear-gradient(135deg, #f7f3eb 0%, #ece5d8 100%)",
        overflow: "hidden"
      }}>
        {/* Main & Secondary Image on hover (instant switch on cursor hover) */}
        <img
          src={
            isHovered && product.images?.length > 1
              ? product.images[1]
              : product.images?.[0] || FALLBACK_PRODUCT_IMAGE
          }
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "transform",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isHovered ? "scale(1.08)" : "scale(1)"
          }}
        />

        {/* Hidden preloader for instant 2nd image availability on hover */}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        )}

        {/* Subtle Vignette & Gradient Depth */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.14) 0%, transparent 40%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
          transition: "opacity var(--transition-base)",
          opacity: isHovered ? 0.9 : 0.6
        }} />

        {/* Top Ribbon Badges */}
        <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 3, maxWidth: "80%" }}>
          {product.isBestSeller && (
            <span style={{
              background: "linear-gradient(135deg, #fcebc2 0%, #d4af37 45%, #b38728 100%)",
              color: "#1a1408",
              fontSize: "clamp(0.56rem, 1.5vw, 0.66rem)",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "var(--radius-xs)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
              border: "1px solid rgba(255,255,255,0.85)"
            }}>
              ★ Best Seller
            </span>
          )}

          {product.isNew && (
            <span style={{
              background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
              color: "var(--accent-gold-light)",
              fontSize: "clamp(0.56rem, 1.5vw, 0.66rem)",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "var(--radius-xs)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "1px solid var(--border-gold-bright)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)"
            }}>
              New
            </span>
          )}

          {discountPercent > 0 && (
            <span style={{
              background: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)",
              color: "#fff",
              fontSize: "clamp(0.56rem, 1.5vw, 0.66rem)",
              fontWeight: 800,
              padding: "3px 7px",
              borderRadius: "var(--radius-xs)",
              letterSpacing: "0.04em",
              boxShadow: "0 3px 10px rgba(190, 18, 60, 0.4)"
            }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick Add to Cart Button */}
        <button
          onClick={handleQuickAddDirect}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: isCardBagAdded ? "var(--accent-emerald)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: isCardBagAdded ? "1px solid var(--accent-emerald)" : "1.5px solid var(--border-gold-bright)",
            borderRadius: "50%",
            width: "clamp(32px, 6.5vw, 38px)",
            height: "clamp(32px, 6.5vw, 38px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isCardBagAdded ? "#ffffff" : "var(--accent-gold-dark)",
            zIndex: 3,
            transition: "all var(--transition-fast)",
            boxShadow: "0 4px 14px rgba(44, 30, 10, 0.16)"
          }}
          onMouseEnter={(e) => {
            if (!isCardBagAdded) {
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.background = "linear-gradient(135deg, #181512 0%, #2a241e 100%)";
              e.currentTarget.style.color = "var(--accent-gold-light)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isCardBagAdded) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
              e.currentTarget.style.color = "var(--accent-gold-dark)";
            }
          }}
          title="Add to Shopping Bag"
          aria-label="Add to Shopping Bag"
        >
          {isCardBagAdded ? (
            <Check size={16} strokeWidth={2.6} />
          ) : (
            <ShoppingBag size={16} strokeWidth={2.2} />
          )}
        </button>

        {/* Quick View Button Hover Overlay (Desktop) */}
        <div className="card-quick-view-overlay" style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          right: "10px",
          display: "flex",
          gap: "6px",
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 3
        }}>
          <button
            onClick={handleQuickView}
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(12px)",
              borderColor: "var(--border-gold-bright)",
              color: "var(--accent-gold-dark)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              fontWeight: 700,
              padding: "6px 10px",
              fontSize: "0.76rem"
            }}
          >
            <Eye size={14} style={{ color: "var(--accent-gold)" }} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div style={{ padding: "clamp(10px, 2.2vw, 16px)", display: "flex", flexDirection: "column", flex: 1, gap: "5px" }}>
        
        {/* Category & Stock Tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "clamp(0.64rem, 1.5vw, 0.70rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-gold-dark)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.category}
          </span>
          <span style={{
            fontSize: "clamp(0.60rem, 1.4vw, 0.68rem)",
            color: stockBadge.color,
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}>
            {stockBadge.label}
          </span>
        </div>

        {/* Product Name with 2-line clamp and serif elegance */}
        <h3 className="font-serif" style={{
          fontSize: "clamp(0.86rem, 1.8vw, 1.02rem)",
          fontWeight: 600,
          lineHeight: 1.3,
          color: "var(--text-primary)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minHeight: "2.6em"
        }}>
          {product.name}
        </h3>

        {/* Pricing */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "7px", flexWrap: "wrap", margin: "2px 0" }}>
          <span className="font-serif" style={{ fontSize: "clamp(1.02rem, 2.2vw, 1.28rem)", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
            {formatCurrency(product.price, settings.currencySymbol)}
          </span>
          {product.originalPrice > product.price && (
            <span style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.80rem)", color: "var(--text-muted)", textDecoration: "line-through" }}>
              {formatCurrency(product.originalPrice, settings.currencySymbol)}
            </span>
          )}
        </div>

        {/* Quick Sizes & Stock Pills with Micro-Interaction */}
        <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "0.70rem", color: "var(--text-muted)", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Quick Add Size:</span>
            <span style={{ fontSize: "0.64rem", color: "var(--accent-emerald-dark)", fontWeight: 700 }}>In Stock</span>
          </div>

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {Object.entries(sortProductSizes(product.sizes || {})).map(([size, count]) => {
              const stockNum = Number(count) || 0;
              const isOut = stockNum === 0;
              const isJustAdded = justAddedSize === size;

              return (
                <button
                  key={size}
                  disabled={isOut}
                  onClick={(e) => handleQuickAdd(e, size)}
                  title={isOut ? `${size} (Sold Out)` : `Quick Add Size ${size} (${stockNum} in stock)`}
                  style={{
                    padding: "4px 8px",
                    fontSize: "clamp(0.68rem, 1.6vw, 0.74rem)",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: isJustAdded
                      ? "1.5px solid var(--accent-emerald)"
                      : isOut 
                        ? "1px dashed rgba(0,0,0,0.15)" 
                        : "1px solid var(--border-gold)",
                    background: isJustAdded
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(13, 148, 136, 0.28) 100%)"
                      : isOut 
                        ? "#f5f5f5" 
                        : "linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%)",
                    color: isJustAdded
                      ? "var(--accent-emerald-dark)"
                      : isOut 
                        ? "var(--text-muted)" 
                        : "var(--text-primary)",
                    cursor: isOut ? "not-allowed" : "pointer",
                    textDecoration: isOut ? "line-through" : "none",
                    opacity: isOut ? 0.45 : 1,
                    transition: "transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    boxShadow: isOut ? "none" : "0 2px 5px rgba(44, 30, 10, 0.05)",
                    transform: isJustAdded ? "scale(1.08)" : "scale(1)"
                  }}
                  onMouseEnter={(e) => {
                    if (!isOut && !isJustAdded) {
                      e.currentTarget.style.borderColor = "var(--accent-gold-dark)";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(179, 135, 40, 0.3) 100%)";
                      e.currentTarget.style.transform = "translateY(-1px) scale(1.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isOut && !isJustAdded) {
                      e.currentTarget.style.borderColor = "var(--border-gold)";
                      e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%)";
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                    }
                  }}
                >
                  {isJustAdded ? (
                    <>
                      <Check size={11} style={{ color: "var(--accent-emerald)" }} />
                      <span>{size}</span>
                    </>
                  ) : (
                    <>
                      <span>{size}</span>
                      <span style={{ fontSize: "0.60rem", color: isOut ? "#ef4444" : stockNum <= 2 ? "#d97706" : "var(--text-muted)", fontWeight: 800 }}>
                        ({stockNum})
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        @media (hover: none) {
          .card-quick-view-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
