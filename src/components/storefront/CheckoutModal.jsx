import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Edit3,
  Mail
} from "lucide-react";

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    cart,
    cartSubtotal,
    shippingFee,
    cartTotal,
    settings,
    placeOrder,
    showToast
  } = useStore();

  const [step, setStep] = useState("details"); // "details" | "confirm"
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isCheckoutOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Please enter your full name";
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.address.trim()) errs.address = "Please enter complete street address";
    if (!formData.city.trim()) errs.city = "Please enter your city";
    if (!formData.state.trim()) errs.state = "Please enter your state";
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      errs.pincode = "Please enter a valid 6-digit PIN code";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@domain.com)";
    }
    return errs;
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fill all required delivery details", "error");
      return;
    }
    setErrors({});
    setStep("confirm");
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    try {
      placeOrder(formData);
      setStep("details");
    } catch (err) {
      showToast("Failed to submit order. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("details");
    closeCheckout();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(880px, calc(100vw - 16px))",
          width: "100%",
          maxHeight: "min(94vh, calc(100dvh - 16px))",
          overflowY: "auto",
          padding: 0
        }}
      >
        {/* Header */}
        <div style={{
          padding: "clamp(14px, 3vw, 22px) clamp(16px, 3.5vw, 28px)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255,255,255,1) 100%)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-gold-dark)", fontSize: "clamp(0.72rem, 1.8vw, 0.80rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Sparkles size={14} />
              <span>{step === "details" ? "Step 1 of 2: Delivery Details" : "Step 2 of 2: Order Verification"}</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.55rem)", color: "var(--text-primary)", marginTop: "2px" }}>
              {step === "details" ? "Complete Delivery Details" : "Review & Confirm Your Order"}
            </h2>
          </div>
          <button
            onClick={handleClose}
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

        {/* STEP 1: Details Entry */}
        {step === "details" ? (
          <form onSubmit={handleProceedToConfirm}>
            <div className="checkout-layout" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0" }}>
              
              {/* Left Column: Customer Details */}
              <div className="checkout-left-col" style={{ padding: "clamp(16px, 3vw, 28px)", borderRight: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
                  <span>Shipping & Contact Information</span>
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Full Name *
                    </label>
                    <div style={{ position: "relative" }}>
                      <User size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        placeholder="e.g. Rahul Saini"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-field"
                        style={{ paddingLeft: "36px" }}
                        required
                      />
                    </div>
                    {errors.fullName && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.fullName}</span>}
                  </div>

                  {/* Mobile / WhatsApp & Email */}
                  <div className="checkout-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        WhatsApp / Phone *
                      </label>
                      <div style={{ position: "relative" }}>
                        <Phone size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="input-field"
                          style={{ paddingLeft: "36px" }}
                          required
                        />
                      </div>
                      {errors.phone && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.phone}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Email Address (For Order Updates)
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
                        <input
                          type="email"
                          placeholder="e.g. yourname@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-field"
                          style={{ paddingLeft: "36px" }}
                        />
                      </div>
                      {errors.email && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.email}</span>}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Complete Delivery Address *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="House/Flat No, Apartment, Street name, Landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-field"
                      required
                    />
                    {errors.address && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.address}</span>}
                  </div>

                  {/* City, State, PIN */}
                  <div className="checkout-three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jaipur"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="input-field"
                        required
                      />
                      {errors.city && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.city}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajasthan"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="input-field"
                        required
                      />
                      {errors.state && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.state}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        placeholder="6 digits"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="input-field"
                        maxLength={6}
                        required
                      />
                      {errors.pincode && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.pincode}</span>}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Special Sizing / Fit Request (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please verify bust measurement"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="checkout-right-col" style={{ padding: "clamp(16px, 3vw, 28px)", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShoppingBag size={16} style={{ color: "var(--accent-gold)" }} />
                    <span>Cart Items ({cart.length})</span>
                  </h3>

                  {/* Cart Items List */}
                  <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px", paddingRight: "4px" }}>
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.size}-${item.color}`} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.80rem" }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: "36px", height: "44px", objectFit: "cover", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.name}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                            Size: <strong style={{ color: "var(--accent-gold-dark)" }}>{item.size}</strong> • Qty: {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>
                          {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.84rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartSubtotal, settings.currencySymbol)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Express Delivery</span>
                      <span>{shippingFee === 0 ? <strong style={{ color: "var(--accent-emerald)" }}>FREE</strong> : formatCurrency(shippingFee, settings.currencySymbol)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.05rem", borderTop: "1.5px dashed var(--border-gold)", paddingTop: "10px", marginTop: "4px" }}>
                      <span>Total Amount</span>
                      <span className="text-gold-gradient">{formatCurrency(cartTotal, settings.currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                {/* Continue to Confirmation Step */}
                <div style={{ marginTop: "18px" }}>
                  <button
                    type="submit"
                    className="btn btn-gold btn-lg"
                    style={{ width: "100%", justifyContent: "center", gap: "8px" }}
                  >
                    <span>Review Order Details</span>
                    <ArrowRight size={16} />
                  </button>
                  <span style={{ display: "block", textAlign: "center", fontSize: "0.70rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    🔒 Next step: Review summary & confirm
                  </span>
                </div>

              </div>

            </div>
          </form>
        ) : (
          /* STEP 2: Pre-Order Confirmation Review Screen */
          <div style={{ padding: "clamp(16px, 3.5vw, 28px)" }}>
            
            <div style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1.5px solid var(--border-gold)",
              borderRadius: "var(--radius-md)",
              padding: "clamp(14px, 3vw, 20px)",
              marginBottom: "18px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-gold-dark)", fontWeight: 800 }}>
                    Customer & Delivery Address
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {formData.fullName} ({formData.phone})
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", marginTop: "3px", lineHeight: 1.5 }}>
                    {formData.address}, {formData.city}, {formData.state} - <strong>{formData.pincode}</strong>
                  </p>
                  {formData.notes && (
                    <p style={{ color: "var(--accent-gold-dark)", fontSize: "0.78rem", marginTop: "3px", fontStyle: "italic" }}>
                      📝 Note: "{formData.notes}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Edit3 size={13} />
                  <span>Edit Address</span>
                </button>
              </div>

              {/* Items Summary Table */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                  Selected Garments ({cart.length})
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.84rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: "34px", height: "42px", objectFit: "cover", borderRadius: "var(--radius-xs)", flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "var(--text-primary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</strong>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Size: <span style={{ color: "var(--accent-gold-dark)", fontWeight: 700 }}>{item.size}</span> • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px dashed var(--border-gold)", paddingTop: "12px", marginTop: "14px", fontSize: "1.05rem", fontWeight: 800 }}>
                  <span>Total Amount Payable:</span>
                  <span className="text-gold-gradient">{formatCurrency(cartTotal, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Verification & Next Steps Explainer */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              marginBottom: "20px",
              fontSize: "0.80rem",
              color: "var(--text-secondary)",
              lineHeight: 1.55
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "3px" }}>
                <CheckCircle2 size={15} />
                <span>What Happens Next?</span>
              </div>
              <p style={{ margin: 0 }}>
                When you click <strong>"Confirm & Place Order"</strong> below, your order is recorded. You can then tap WhatsApp to confirm sizing and receive our official UPI QR code for dispatch!
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="btn btn-secondary btn-lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeft size={15} />
                <span>Back to Details</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="btn btn-gold btn-lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 26px" }}
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? "Placing Order..." : "Confirm & Place Order"}</span>
              </button>
            </div>

          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .checkout-layout {
              grid-template-columns: 1fr !important;
            }
            .checkout-left-col {
              border-right: none !important;
              border-bottom: 1px solid var(--border-subtle);
              padding: 16px !important;
            }
            .checkout-right-col {
              padding: 16px !important;
            }
          }
          @media (max-width: 480px) {
            .checkout-two-col {
              grid-template-columns: 1fr !important;
            }
            .checkout-three-col {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
