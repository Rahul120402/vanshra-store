import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, getStockBadgeInfo } from "../../utils/formatters";
import { createGeneralInquiryUrl } from "../../utils/whatsapp";
import { ProductCard } from "./ProductCard";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  Check, 
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  Info,
  Sparkles
} from "lucide-react";

export const ProductDetailPage = () => {
  const {
    products,
    selectedProductId,
    navigateToHome,
    navigateToCategory,
    settings,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsSizeGuideOpen,
    setIsCheckoutOpen,
    showToast
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  
  // Zoom on hover state for main stage image
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Mobile sticky CTA bar visibility state
  const [showStickyMobileBar, setShowStickyMobileBar] = useState(false);
  const ctaSectionRef = useRef(null);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedColor(product.colors?.[0] || null);
      
      // Auto-select first in-stock size
      const firstAvailableSize = Object.keys(product.sizes || {}).find(
        (size) => (product.sizes[size] || 0) > 0
      );
      setSelectedSize(firstAvailableSize || "");
      setQuantity(1);
    }
  }, [product?.id]);

  // Observer for showing mobile sticky CTA bar when main CTA is scrolled out of view
  useEffect(() => {
    const handleScroll = () => {
      if (ctaSectionRef.current) {
        const rect = ctaSectionRef.current.getBoundingClientRect();
        // If bottom of main CTA is above top of viewport or top is below viewport
        const isOutOfView = rect.bottom < 80;
        setShowStickyMobileBar(isOutOfView);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) return null;

  const stockBadge = getStockBadgeInfo(product.sizes);
  const isWishlisted = wishlist.includes(product.id);
  const selectedSizeStock = selectedSize ? (product.sizes?.[selectedSize] || 0) : 0;
  const isSelectedSizeOutOfStock = selectedSize && selectedSizeStock === 0;

  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast("Please select a size first", "warning");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast("Please select a size first", "warning");
      return;
    }
    const added = addToCart(product, selectedSize, selectedColor, quantity);
    if (added) {
      setIsCheckoutOpen(true);
    }
  };

  const handleWhatsAppConsult = () => {
    const url = createGeneralInquiryUrl(settings.adminWhatsApp, product.name, settings);
    window.open(url, "_blank");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard!", "success");
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="page-view-transition" style={{ padding: "clamp(18px, 3vw, 36px) 0 80px", width: "100%", maxWidth: "100vw" }}>
      <div className="container">
        
        {/* Breadcrumbs & Back Button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "24px"
        }}>
          <button
            onClick={navigateToHome}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)" }}
            title="Return to Catalog"
          >
            <ArrowLeft size={15} />
            <span>Back to All Collections</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.80rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
            <span 
              style={{ cursor: "pointer", transition: "color var(--transition-fast)" }} 
              onClick={navigateToHome}
              title="Go to Home"
            >
              Home
            </span>
            <ChevronRight size={12} />
            <span 
              style={{ cursor: "pointer", transition: "color var(--transition-fast)" }} 
              onClick={() => navigateToCategory(product.category)}
              title={`View all ${product.category}`}
            >
              {product.category}
            </span>
            <ChevronRight size={12} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</span>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="pdp-grid">
          
          {/* Left Column: Image Gallery with Interactive Zoom */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            {/* Main Stage Image with Lens Zoom */}
            <div 
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "125%",
                borderRadius: "clamp(16px, 3vw, 26px)",
                overflow: "hidden",
                background: "#1c1917",
                border: "1.5px solid var(--border-gold-bright)",
                boxShadow: "var(--shadow-luxury)",
                cursor: "zoom-in"
              }}
            >
              <img
                src={product.images?.[activeImageIdx] || product.images?.[0]}
                alt={product.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: isZooming ? "none" : "transform 0.5s ease-out",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? "scale(1.45)" : "scale(1)"
                }}
              />

              {/* Badges */}
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 3, pointerEvents: "none" }}>
                {product.isNew && (
                  <span style={{
                    background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
                    color: "var(--accent-gold-light)",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-xs)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: "1px solid var(--border-gold-bright)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}>
                    New Drop
                  </span>
                )}
                {discountPercent > 0 && (
                  <span style={{
                    background: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-xs)",
                    boxShadow: "0 4px 12px rgba(190, 18, 60, 0.4)"
                  }}>
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Floating Action Buttons */}
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 3 }}>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    background: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid var(--border-gold-bright)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: isWishlisted ? "var(--accent-ruby)" : "var(--text-primary)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    transition: "transform var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? "var(--accent-ruby)" : "none"} />
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    background: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid var(--border-gold-bright)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--text-primary)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    transition: "transform var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  title="Share Design"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: "clamp(68px, 15vw, 88px)",
                      height: "clamp(80px, 18vw, 100px)",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: activeImageIdx === idx ? "2.5px solid var(--accent-gold-dark)" : "1.5px solid var(--border-gold)",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      opacity: activeImageIdx === idx ? 1 : 0.65,
                      boxShadow: activeImageIdx === idx ? "0 4px 16px rgba(179, 135, 40, 0.38)" : "none",
                      transform: activeImageIdx === idx ? "scale(1.03)" : "scale(1)",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs, Sizing, CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            
            {/* Category & Stock Tag */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "clamp(0.76rem, 1.8vw, 0.84rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent-gold-dark)", fontWeight: 800 }}>
                {product.category} • SKU: {product.sku || "VANSHRA"}
              </span>
              <span className={`badge badge-${stockBadge.status === "in-stock" ? "delivered" : stockBadge.status === "low-stock" ? "dispatched" : "cancelled"}`}>
                {stockBadge.label}
              </span>
            </div>

            {/* Title in Italiana / Playfair Display */}
            <h1 className="font-display" style={{ fontSize: "clamp(1.75rem, 4.2vw, 2.6rem)", lineHeight: 1.18, color: "var(--text-primary)", wordBreak: "break-word" }}>
              {product.name}
            </h1>

            {/* Verified Rating Summary Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(217, 119, 6, 0.12)", padding: "4px 10px", borderRadius: "var(--radius-full)", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
                <Star size={14} fill="#d97706" color="#d97706" />
                <strong style={{ color: "#b45309", fontSize: "0.80rem" }}>4.9</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>(48 Reviews)</span>
              </div>
              <span style={{ color: "var(--accent-emerald-dark)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <CheckCircle2 size={14} style={{ color: "var(--accent-emerald)" }} />
                <span>98% True to Size</span>
              </span>
            </div>

            {/* Pricing */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
              <span className="font-serif" style={{ fontSize: "clamp(1.7rem, 4.2vw, 2.35rem)", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                {formatCurrency(product.price, settings.currencySymbol)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)", color: "var(--text-muted)", textDecoration: "line-through" }}>
                    {formatCurrency(product.originalPrice, settings.currencySymbol)}
                  </span>
                  <span style={{ fontSize: "0.84rem", color: "var(--accent-emerald-dark)", fontWeight: 700 }}>
                    Inclusive of all taxes
                  </span>
                </>
              )}
            </div>

            {/* Color Swatch Selection */}
            {product.colors?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Selected Color: <strong style={{ color: "var(--text-primary)" }}>{selectedColor?.name}</strong>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {product.colors.map((color) => {
                    const isColorSelected = selectedColor?.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 14px",
                          borderRadius: "var(--radius-full)",
                          background: isColorSelected ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
                          border: isColorSelected ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: isColorSelected ? 700 : 500,
                          boxShadow: isColorSelected ? "0 2px 10px rgba(179, 135, 40, 0.25)" : "var(--shadow-xs)",
                          transition: "all var(--transition-fast)"
                        }}
                      >
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: color.hex,
                            border: "1px solid rgba(0,0,0,0.15)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)"
                          }}
                        />
                        <span>{color.name}</span>
                        {isColorSelected && <Check size={13} style={{ color: "var(--accent-gold-dark)" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector with Live Stock Chips */}
            <div style={{
              background: "#ffffff",
              padding: "clamp(16px, 3vw, 22px)",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-gold-bright)",
              boxShadow: "0 4px 18px rgba(44, 30, 10, 0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Select Size</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--accent-gold-dark)", fontWeight: 600 }}>(Live Inventory)</span>
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  style={{
                    background: "rgba(203, 163, 88, 0.10)",
                    border: "1px solid var(--border-gold)",
                    color: "var(--accent-gold-dark)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <Ruler size={14} />
                  <span>Size Guide</span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(56px, 1fr))", gap: "8px" }}>
                {Object.entries(product.sizes || {}).map(([size, count]) => {
                  const stockNum = Number(count) || 0;
                  const isOutOfStock = stockNum === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`size-chip ${isSelected ? "size-chip-selected" : ""} ${isOutOfStock ? "size-chip-disabled" : ""}`}
                      style={{
                        borderRadius: "12px",
                        border: isSelected ? "2px solid var(--accent-gold-dark)" : "1px solid var(--border-gold)",
                        width: "100%"
                      }}
                    >
                      <span className="size-chip-label" style={{ fontWeight: 800 }}>{size}</span>
                      <span className={`size-chip-stock ${isOutOfStock ? "stock-out" : stockNum <= 2 ? "stock-low" : ""}`}>
                        {isOutOfStock ? "Sold" : `${stockNum} left`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSize && (
                <div style={{ marginTop: "14px", fontSize: "0.82rem", color: selectedSizeStock <= 2 ? "#d97706" : "var(--accent-emerald-dark)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                  <Info size={15} />
                  <span>
                    Size <strong>{selectedSize}</strong> is confirmed ({selectedSizeStock} piece{selectedSizeStock > 1 ? "s" : ""} remaining)
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {selectedSize && !isSelectedSizeOutOfStock && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "clamp(0.82rem, 1.8vw, 0.88rem)", fontWeight: 700, color: "var(--text-secondary)" }}>Quantity:</span>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border-gold)", borderRadius: "var(--radius-sm)", background: "#ffffff", boxShadow: "var(--shadow-xs)" }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: "6px 14px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: "0 10px", fontSize: "0.92rem", fontWeight: 800 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                    style={{ padding: "6px 14px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: "clamp(0.84rem, 1.8vw, 0.90rem)", color: "var(--accent-gold-dark)", fontWeight: 700 }}>
                  Total: {formatCurrency(product.price * quantity, settings.currencySymbol)}
                </span>
              </div>
            )}

            {/* Main Action CTAs (Targeted by Scroll Observer) */}
            <div ref={ctaSectionRef} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  disabled={!selectedSize || isSelectedSizeOutOfStock}
                  onClick={handleAddToCart}
                  className="btn btn-secondary btn-lg"
                  style={{
                    flex: "1 1 130px",
                    opacity: !selectedSize || isSelectedSizeOutOfStock ? 0.6 : 1,
                    fontWeight: 700,
                    borderColor: "var(--border-gold)",
                    fontSize: "clamp(0.80rem, 2vw, 0.90rem)",
                    padding: "12px 14px"
                  }}
                >
                  <ShoppingBag size={18} style={{ flexShrink: 0 }} />
                  <span>Add to Bag</span>
                </button>

                <button
                  disabled={!selectedSize || isSelectedSizeOutOfStock}
                  onClick={handleBuyNow}
                  className="btn btn-gold btn-lg"
                  style={{
                    flex: "1.2 1 150px",
                    opacity: !selectedSize || isSelectedSizeOutOfStock ? 0.6 : 1,
                    fontWeight: 800,
                    fontSize: "clamp(0.80rem, 2vw, 0.90rem)",
                    padding: "12px 14px"
                  }}
                >
                  <span>Instant Direct Order</span>
                </button>
              </div>

              {/* Direct WhatsApp Consultation Button */}
              <button
                onClick={handleWhatsAppConsult}
                className="btn btn-whatsapp btn-wrap"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "clamp(0.78rem, 2.2vw, 0.88rem)",
                  whiteSpace: "normal",
                  textAlign: "center",
                  lineHeight: 1.3
                }}
              >
                <MessageCircle size={18} style={{ flexShrink: 0 }} />
                <span>Chat on WhatsApp for Size & Fit Help</span>
              </button>
            </div>

            {/* Description & Fabric Details */}
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-gold)", boxShadow: "var(--shadow-xs)" }}>
                <h4 className="font-serif" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "8px" }}>
                  Silhouette & Artisan Craftsmanship
                </h4>
                <p className="text-secondary" style={{ fontSize: "0.90rem", lineHeight: 1.65 }}>
                  {product.description}
                </p>
              </div>

              {product.fabricCare && (
                <div style={{ background: "#ffffff", padding: "20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-gold)", boxShadow: "var(--shadow-xs)" }}>
                  <h4 className="font-serif" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "8px" }}>
                    Fabric & Pure Silk Care
                  </h4>
                  <p className="text-secondary" style={{ fontSize: "0.90rem", lineHeight: 1.65 }}>
                    {product.fabricCare}
                  </p>
                </div>
              )}

              {/* Verified Patron Reviews & Fit Feedback Accordion */}
              <div style={{ background: "#ffffff", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-gold)", boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
                <button
                  onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: isReviewsExpanded ? "rgba(212, 175, 55, 0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#d97706" color="#d97706" />
                      ))}
                    </div>
                    <span className="font-serif" style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      Patron Reviews & Fit Ratings (4.9 ★)
                    </span>
                  </div>
                  {isReviewsExpanded ? <ChevronUp size={18} style={{ color: "var(--accent-gold-dark)" }} /> : <ChevronDown size={18} style={{ color: "var(--accent-gold-dark)" }} />}
                </button>

                {isReviewsExpanded && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
                    
                    {/* Summary Box */}
                    <div style={{ background: "#fcfaf7", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                        <strong style={{ color: "var(--accent-emerald)" }}>✓ 100% Verified Purchases</strong> • Verified via WhatsApp
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--accent-gold-dark)", fontWeight: 700 }}>
                        98% recommend for true comfort
                      </span>
                    </div>

                    {/* Review 1 */}
                    <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>Rhea S. • Mumbai</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="#d97706" color="#d97706" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.55, fontStyle: "italic" }}>
                        "Fabric quality is exceptional. The silhouette feels breathable even in warm weather and the sizing call ensured a perfect custom fit."
                      </p>
                    </div>

                    {/* Review 2 */}
                    <div style={{ paddingBottom: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>Meera K. • New Delhi</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="#d97706" color="#d97706" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.55, fontStyle: "italic" }}>
                        "Delivered promptly in 2 days. The hand embroidery on the neck is very neat and subtle."
                      </p>
                    </div>

                    {/* Write Review CTA */}
                    <button
                      onClick={handleWhatsAppConsult}
                      style={{
                        background: "transparent",
                        border: "1.5px dashed var(--accent-gold)",
                        color: "var(--accent-gold-dark)",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.80rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>Submit Sizing Feedback or Review via WhatsApp</span>
                    </button>

                  </div>
                )}
              </div>
            </div>

            {/* Trust Assurances */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
              gap: "12px",
              padding: "18px",
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(250, 248, 245, 0.92) 100%)",
              border: "1.5px solid var(--border-gold)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-xs)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={22} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                  <strong>Personal Sizing Call</strong> before dispatch
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Truck size={22} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                  <strong>Direct UPI Order</strong> (Verified via WhatsApp)
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Collections */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "64px", paddingTop: "36px", borderTop: "1px solid var(--border-subtle)" }}>
            <h3 className="font-display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", color: "var(--text-primary)", marginBottom: "22px" }}>
              Pair With These Designs
            </h3>
            <div className="product-grid-layout">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Mobile "Add to Cart" Bar on Scroll */}
      {showStickyMobileBar && (
        <div className="sticky-mobile-cta-bar show-on-mobile-only">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <img 
              src={product.images?.[0] || ""} 
              alt={product.name}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                objectFit: "cover",
                border: "1px solid var(--border-gold-bright)",
                flexShrink: 0
              }} 
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.name}
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                {formatCurrency(product.price, settings.currencySymbol)}
                {selectedSize && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "4px" }}>({selectedSize})</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button
              disabled={!selectedSize || isSelectedSizeOutOfStock}
              onClick={handleAddToCart}
              className="btn btn-gold btn-sm"
              style={{
                padding: "8px 16px",
                fontWeight: 800,
                fontSize: "0.80rem",
                boxShadow: "0 4px 14px rgba(179, 135, 40, 0.35)"
              }}
            >
              <ShoppingBag size={15} />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .show-on-mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
