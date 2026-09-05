import React from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus 
} from "lucide-react";

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    shippingFee,
    cartTotal,
    settings,
    setIsCheckoutOpen,
    totalCartItemCount,
    isFreeShipping
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 2499;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)} style={{ justifyContent: "flex-end", padding: 0 }}>
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
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px"
            }}
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
            <span style={{ color: "var(--accent-gold-dark)", fontWeight: 800 }}>{progressPercent}%</span>
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
              <button onClick={() => setIsCartOpen(false)} className="btn btn-gold btn-sm">
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
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
                <div style={{ width: "62px", height: "76px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#0a0c10", flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            ))
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
