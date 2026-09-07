import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, FALLBACK_PRODUCT_IMAGE } from "../../utils/formatters";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus,
  Tag,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Percent
} from "lucide-react";

export const CartDrawer = () => {
  const {
    isCartOpen,
    closeCart,
    openCheckout,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    couponDiscount,
    appliedCoupon,
    coupons,
    applyCoupon,
    removeCoupon,
    shippingFee,
    cartTotal,
    settings,
    totalCartItemCount,
    isFreeShipping,
    navigateToProduct
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [showOffers, setShowOffers] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 2499;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponInput("");
      setShowOffers(false);
    }
  };

  const handleApplyQuickCoupon = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponInput("");
      setShowOffers(false);
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    openCheckout();
  };

  const handleStartShopping = () => {
    closeCart();
    setTimeout(() => {
      const catalogEl = document.getElementById("catalog-section");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  const activeCoupons = (coupons || []).filter((c) => c.isActive !== false);

  return (
    <div className="modal-overlay" onClick={closeCart} style={{ justifyContent: "flex-end", padding: 0 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "min(460px, 100vw)",
          height: "100%",
          maxHeight: "100dvh",
          background: "#ffffff",
          borderLeft: "1.5px solid var(--border-gold)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-luxury)",
          animation: "slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "clamp(16px, 3vw, 22px) clamp(16px, 3.5vw, 24px)",
          borderBottom: "1px solid var(--border-gold)",
          background: "linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={20} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-serif" style={{ fontSize: "clamp(1.15rem, 3vw, 1.35rem)", color: "var(--text-primary)", fontWeight: 700 }}>
              Shopping Bag ({totalCartItemCount})
            </h3>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px"
            }}
            title="Close Bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(250, 248, 245, 0.9) 100%)",
          padding: "12px clamp(16px, 3.5vw, 24px)",
          borderBottom: "1px solid var(--border-gold)",
          fontSize: "0.82rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: isFreeShipping ? "var(--accent-emerald-dark)" : "var(--text-secondary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
              <Truck size={15} style={{ color: isFreeShipping ? "var(--accent-emerald)" : "var(--accent-gold)", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isFreeShipping ? "FREE Nationwide Delivery Unlocked!" : `Add ${formatCurrency(amountNeededForFree, settings.currencySymbol)} for FREE Delivery`}
              </span>
            </span>
            <strong style={{ color: "var(--accent-gold-dark)", fontWeight: 800 }}>{progressPercent}%</strong>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
            <div style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #b38728 0%, #d4af37 50%, #f7e09e 100%)",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "clamp(12px, 3vw, 20px)", display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-muted)" }}>
              <ShoppingBag size={42} style={{ margin: "0 auto 14px", opacity: 0.3 }} />
              <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>
                Your shopping bag is empty
              </p>
              <p style={{ fontSize: "0.82rem", marginBottom: "16px" }}>
                Explore our signature designs and add your favorite fits!
              </p>
              <button onClick={handleStartShopping} className="btn btn-gold btn-sm">
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "12px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  {/* Thumbnail */}
                  <div 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigateToProduct(item.productId);
                    }}
                    style={{ width: "62px", height: "76px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#0a0c10", flexShrink: 0, cursor: "pointer" }}
                    title="View Product"
                  >
                    <img 
                      src={item.image || FALLBACK_PRODUCT_IMAGE} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                        <h4 
                          onClick={() => {
                            setIsCartOpen(false);
                            navigateToProduct(item.productId);
                          }}
                          style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "2px",
                            flexShrink: 0
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "2px", fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                        <span>Size: <strong style={{ color: "var(--accent-gold-dark)" }}>{item.size}</strong></span>
                        {item.color && (
                          <span>Color: <strong style={{ color: "var(--text-primary)" }}>{item.color}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xs)", background: "var(--bg-surface-elevated)" }}>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          style={{ padding: "2px 7px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ padding: "0 6px", fontSize: "0.80rem", fontWeight: 700 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          style={{ padding: "2px 7px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span style={{ fontSize: "0.90rem", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupons & Promo Code Section */}
              <div style={{
                marginTop: "6px",
                padding: "14px",
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(253, 251, 247, 0.9) 100%)",
                border: "1px dashed var(--border-gold)",
                borderRadius: "var(--radius-md)"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    <Tag size={15} style={{ color: "var(--accent-gold)" }} />
                    <span>Coupons & Offers</span>
                  </div>
                  {activeCoupons.length > 0 && !appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => setShowOffers(!showOffers)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold-dark)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      <span>{showOffers ? "Hide Offers" : `View ${activeCoupons.length} Offers`}</span>
                      {showOffers ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  /* Applied Coupon State */
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1.5px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "var(--radius-sm)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "var(--accent-emerald)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--accent-emerald-dark)", letterSpacing: "0.04em" }}>
                            {appliedCoupon.code}
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-emerald-dark)", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            Saved {formatCurrency(couponDiscount, settings.currencySymbol)}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {appliedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "4px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        marginLeft: "6px"
                      }}
                      title="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  /* Coupon Input Form */
                  <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. VANSHRA10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: "0.80rem",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className="btn btn-gold btn-sm"
                      style={{ padding: "8px 16px", fontSize: "0.80rem", fontWeight: 700, flexShrink: 0 }}
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Available Offers Accordion */}
                {showOffers && !appliedCoupon && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px dashed var(--border-gold)", paddingTop: "10px" }}>
                    {activeCoupons.map((c) => {
                      const isEligible = cartSubtotal >= (c.minOrder || 0);
                      const amountShort = Math.max(0, (c.minOrder || 0) - cartSubtotal);

                      return (
                        <div
                          key={c.id}
                          style={{
                            padding: "8px 10px",
                            background: "#ffffff",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "var(--accent-gold-dark)", letterSpacing: "0.05em", background: "rgba(212, 175, 55, 0.12)", padding: "1px 6px", borderRadius: "3px" }}>
                                {c.code}
                              </span>
                              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                {c.discountType === "percentage" ? `${c.value}% OFF` : `Flat ₹${c.value} OFF`}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.70rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                              {c.description}
                            </p>
                            {!isEligible && (
                              <span style={{ fontSize: "0.68rem", color: "var(--accent-ruby)", fontWeight: 600 }}>
                                Add {formatCurrency(amountShort, settings.currencySymbol)} more to use
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={!isEligible}
                            onClick={() => handleApplyQuickCoupon(c.code)}
                            className={isEligible ? "btn btn-gold btn-sm" : "btn btn-secondary btn-sm"}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              opacity: isEligible ? 1 : 0.6,
                              cursor: isEligible ? "pointer" : "not-allowed",
                              flexShrink: 0
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div style={{
            padding: "clamp(14px, 3vw, 20px)",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              <span>Bag Subtotal</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatCurrency(cartSubtotal, settings.currencySymbol)}</span>
            </div>

            {/* Coupon Savings Row */}
            {appliedCoupon && couponDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "var(--accent-emerald-dark)", fontWeight: 700 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={13} />
                  <span>Coupon ({appliedCoupon.code})</span>
                </span>
                <span>-{formatCurrency(couponDiscount, settings.currencySymbol)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              <span>Express Delivery</span>
              <span style={{ color: isFreeShipping ? "var(--accent-emerald)" : "var(--text-primary)", fontWeight: 600 }}>
                {isFreeShipping ? "FREE" : formatCurrency(shippingFee, settings.currencySymbol)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--accent-gold-dark)" }}>{formatCurrency(cartTotal, settings.currencySymbol)}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn btn-gold btn-lg"
              style={{ width: "100%", marginTop: "2px" }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
              <ShieldCheck size={13} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
              <span>Personal Fit Verification • Direct UPI Confirmation</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
