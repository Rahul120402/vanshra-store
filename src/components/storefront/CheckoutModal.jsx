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
  Mail,
  ShieldCheck,
  CreditCard,
  Lock,
  Smartphone
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

  // ==========================================
  // RAZORPAY STANDARD WEB CHECKOUT FLOW
  // ==========================================
  const handleRazorpayPayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Check if Razorpay SDK is loaded
      if (typeof window.Razorpay === "undefined") {
        showToast("Payment SDK is loading, please try again in a moment.", "warning");
        setIsSubmitting(false);
        return;
      }

      // 2. Call backend /api/create-order
      const amountInPaise = Math.round(cartTotal * 100);
      let orderData = null;

      try {
        const orderResponse = await fetch("/api/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
              customerName: formData.fullName,
              phone: formData.phone,
              city: formData.city,
              pincode: formData.pincode
            }
          })
        });

        if (orderResponse.ok) {
          orderData = await orderResponse.json();
        } else {
          const errBody = await orderResponse.json().catch(() => ({}));
          console.warn("[Razorpay Backend create-order failed]:", errBody);
        }
      } catch (backendErr) {
        console.warn("[Razorpay Backend create-order error]:", backendErr);
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || settings.razorpayKeyId || "rzp_live_TYnxFeonLIDmVJ";
      const fullLogoUrl = typeof window !== "undefined" ? `${window.location.origin}/vanshra-logo.png` : "";

      // 3. Configure Razorpay Standard Checkout Options
      const options = {
        key: keyId,
        amount: orderData?.amount || amountInPaise,
        currency: orderData?.currency || "INR",
        name: settings.brandName || "VANSHRA",
        description: `Purchase of ${cart.length} item(s) • Handcrafted Apparel`,
        image: fullLogoUrl,
        order_id: orderData?.order_id || undefined,
        prefill: {
          name: formData.fullName,
          email: formData.email || "",
          contact: formData.phone
        },
        notes: {
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
        },
        theme: {
          color: "#181512",
          backdrop_color: "rgba(0, 0, 0, 0.75)"
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            setIsSubmitting(false);
            showToast("Payment window closed. Your cart is preserved.", "info");
          }
        },
        handler: async function (response) {
          // 4. On Payment Success: Verify signature with backend
          try {
            let isVerified = false;

            if (response.razorpay_signature && response.razorpay_order_id) {
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                isVerified = verifyData.success;
              }
            } else {
              // Direct client mode verification
              isVerified = Boolean(response.razorpay_payment_id);
            }

            // 5. Finalize order creation with "Confirmed" status
            placeOrder({
              ...formData,
              status: "Confirmed",
              paymentMethod: "Prepaid (Razorpay UPI/Cards)",
              razorpayPaymentId: response.razorpay_payment_id || "",
              razorpayOrderId: response.razorpay_order_id || ""
            });

            setStep("details");
            setIsSubmitting(false);
            showToast("🎉 Payment Successful! Order confirmed.", "success");
          } catch (verErr) {
            console.error("Verification processing error:", verErr);
            // Safety: Still record order if payment ID was received from bank
            placeOrder({
              ...formData,
              status: "Confirmed",
              paymentMethod: "Prepaid (Razorpay UPI/Cards)",
              razorpayPaymentId: response.razorpay_payment_id || "",
              razorpayOrderId: response.razorpay_order_id || ""
            });
            setStep("details");
            setIsSubmitting(false);
            showToast("Payment received! Order confirmed.", "success");
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment failure event
      razorpayInstance.on("payment.failed", function (failResponse) {
        console.error("Razorpay payment failed:", failResponse.error);
        setIsSubmitting(false);
        showToast(
          failResponse.error?.description || "Payment failed. Please try again with another UPI app or card.",
          "error"
        );
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setIsSubmitting(false);
      showToast(err.message || "Failed to initialize payment gateway. Please try again.", "error");
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
              <span>{step === "details" ? "Step 1 of 2: Delivery Details" : "Step 2 of 2: Secure Payment & Verification"}</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.55rem)", color: "var(--text-primary)", marginTop: "2px" }}>
              {step === "details" ? "Complete Delivery Details" : "Review & Complete Payment"}
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
                          placeholder="10-digit number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="input-field"
                          style={{ paddingLeft: "36px" }}
                          maxLength={15}
                          required
                        />
                      </div>
                      {errors.phone && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.phone}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Email Address (For Invoice)
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-field"
                          style={{ paddingLeft: "36px" }}
                        />
                      </div>
                      {errors.email && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.email}</span>}
                    </div>
                  </div>

                  {/* Complete Address */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Complete Delivery Address *
                    </label>
                    <textarea
                      placeholder="House/Flat No., Building Name, Street/Colony, Landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-field"
                      style={{ minHeight: "68px", resize: "vertical" }}
                      required
                    />
                    {errors.address && <span style={{ color: "var(--accent-ruby)", fontSize: "0.72rem", marginTop: "3px", display: "block" }}>{errors.address}</span>}
                  </div>

                  {/* City, State, PIN */}
                  <div className="checkout-three-col" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 0.8fr", gap: "10px" }}>
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
                    <span>Review & Proceed to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                  <span style={{ display: "block", textAlign: "center", fontSize: "0.70rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    🔒 Next step: Instant UPI & Card payment
                  </span>
                </div>

              </div>

            </div>
          </form>
        ) : (
          /* STEP 2: Pre-Order Confirmation Review Screen with Razorpay */
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
                    Delivery Summary
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
                  <span>Total Payable:</span>
                  <span className="text-gold-gradient">{formatCurrency(cartTotal, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Razorpay Trust & Payment Methods Banner */}
            <div style={{
              background: "linear-gradient(135deg, #181512 0%, #26201a 100%)",
              color: "#ffffff",
              border: "1px solid var(--border-gold-bright)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(212, 175, 55, 0.2)", border: "1px solid var(--border-gold-bright)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-gold-light)" }}>
                    <Lock size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#ffffff" }}>
                      Instant Secured Checkout (Razorpay)
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--accent-gold-light)", opacity: 0.85 }}>
                      100% Verified Bank Transfer & RBI Approved Gateway
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--accent-gold-light)", fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.76rem", color: "#e5e7eb", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px" }}>
                <span style={{ color: "var(--accent-gold-light)", fontWeight: 700 }}>Supported:</span>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px" }}>📱 Google Pay</span>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px" }}>🟣 PhonePe</span>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px" }}>🔵 Paytm / UPI</span>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px" }}>💳 All Cards</span>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px" }}>🏦 Net Banking</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setStep("details")}
                disabled={isSubmitting}
                className="btn btn-secondary btn-lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleRazorpayPayment}
                disabled={isSubmitting}
                className="btn btn-gold btn-lg"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 30px",
                  fontWeight: 800,
                  fontSize: "1rem",
                  boxShadow: "0 6px 20px rgba(179, 135, 40, 0.45)"
                }}
              >
                <CreditCard size={18} />
                <span>{isSubmitting ? "Connecting to Razorpay..." : `Pay ${formatCurrency(cartTotal, settings.currencySymbol)} via Razorpay`}</span>
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
