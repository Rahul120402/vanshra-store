import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";
import { createCustomerOrderMessage } from "../../utils/whatsapp";
import { 
  CheckCircle2, 
  MessageCircle,
  Copy,
  Check,
  QrCode
} from "lucide-react";

export const OrderSuccessModal = () => {
  const { 
    latestPlacedOrder, 
    setLatestPlacedOrder, 
    settings, 
    showToast,
    navigateToHome 
  } = useStore();
  const [isCopied, setIsCopied] = useState(false);

  if (!latestPlacedOrder) return null;

  const handleClose = () => {
    setLatestPlacedOrder(null);
    navigateToHome();
  };

  const handleWhatsAppSend = () => {
    const url = createCustomerOrderMessage(latestPlacedOrder, settings);
    window.open(url, "_blank");
  };

  const handleCopyUpi = () => {
    const upi = settings.adminUpiId || "918769102796@paytm";
    navigator.clipboard.writeText(upi);
    setIsCopied(true);
    showToast("UPI ID copied to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const upiId = settings.adminUpiId || "918769102796@paytm";

  const isPaid = Boolean(
    latestPlacedOrder.razorpayPaymentId || 
    latestPlacedOrder.status === "Confirmed" ||
    latestPlacedOrder.paymentMethod?.includes("Razorpay")
  );

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(540px, calc(100vw - 16px))",
          width: "100%",
          padding: "clamp(20px, 4vw, 32px)",
          textAlign: "center",
          border: "1.5px solid var(--border-gold)",
          boxShadow: "var(--shadow-lg)",
          maxHeight: "min(94vh, calc(100dvh - 16px))",
          overflowY: "auto"
        }}
      >
        {/* Success Icon */}
        <div style={{
          width: "clamp(54px, 12vw, 68px)",
          height: "clamp(54px, 12vw, 68px)",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%)",
          border: "2px solid var(--accent-emerald)",
          color: "var(--accent-emerald)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.25)"
        }}>
          <CheckCircle2 size={30} />
        </div>

        <span style={{ fontSize: "clamp(0.70rem, 1.8vw, 0.78rem)", letterSpacing: "0.10em", textTransform: "uppercase", color: isPaid ? "var(--accent-emerald)" : "var(--accent-gold-dark)", fontWeight: 800 }}>
          {isPaid ? "✓ Payment Verified & Order Confirmed" : "Order Successfully Recorded"}
        </span>

        <h2 className="font-serif" style={{ fontSize: "clamp(1.3rem, 4vw, 1.65rem)", color: "var(--text-primary)", marginTop: "2px", marginBottom: "4px" }}>
          Order #{latestPlacedOrder.id}
        </h2>

        <p className="text-secondary" style={{ fontSize: "clamp(0.82rem, 2vw, 0.88rem)", marginBottom: "18px", lineHeight: 1.5 }}>
          {isPaid ? (
            <>
              Thank you, <strong>{latestPlacedOrder.customer?.fullName || "Valued Customer"}</strong>! Your online payment of <strong>{formatCurrency(latestPlacedOrder.total, settings.currencySymbol)}</strong> has been verified and received. Your order is confirmed for express dispatch.
            </>
          ) : (
            <>
              Thank you, <strong>{latestPlacedOrder.customer?.fullName || "Valued Customer"}</strong>! Tap below to send your order on WhatsApp to confirm sizing and receive the UPI payment details for same-day dispatch.
            </>
          )}
        </p>

        {/* Paid Details Box if Paid */}
        {isPaid && (
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, #ffffff 100%)",
            border: "1.5px solid var(--accent-emerald)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            textAlign: "left",
            fontSize: "0.80rem",
            marginBottom: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--accent-emerald)" }}>Payment Status:</span>
              <span className="badge badge-confirmed" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>PAID & VERIFIED</span>
            </div>
            {latestPlacedOrder.razorpayPaymentId && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.76rem" }}>
                <span>Razorpay Payment ID:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>{latestPlacedOrder.razorpayPaymentId}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.76rem" }}>
              <span>Payment Mode:</span>
              <span style={{ fontWeight: 600 }}>Prepaid (Razorpay UPI / Cards)</span>
            </div>
          </div>
        )}

        {/* 3-Step Process Guide */}
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          textAlign: "left",
          fontSize: "0.78rem",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "18px"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: isPaid ? "var(--accent-emerald)" : "var(--accent-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.68rem", flexShrink: 0, marginTop: "1px" }}>✓</span>
            <span>{isPaid ? "Payment received & order confirmed" : "Order received on store"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--accent-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.68rem", flexShrink: 0, marginTop: "1px" }}>2</span>
            <span>Master artisans hand-inspect & pack your garments</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--accent-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.68rem", flexShrink: 0, marginTop: "1px" }}>3</span>
            <span>Parcel is dispatched with express tracking link</span>
          </div>
        </div>

        {/* Order Summary Snapshot */}
        <div style={{
          background: "#ffffff",
          border: "1px dashed var(--border-gold)",
          borderRadius: "var(--radius-sm)",
          padding: "12px",
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.84rem"
        }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{isPaid ? "Amount Paid" : "Total Payable"}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isPaid ? "var(--accent-emerald)" : "var(--text-primary)" }}>
              {formatCurrency(latestPlacedOrder.total, settings.currencySymbol)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Items</div>
            <div style={{ fontWeight: 700, color: "var(--accent-gold-dark)" }}>
              {(latestPlacedOrder.items || []).length} Product(s)
            </div>
          </div>
        </div>

        {/* Only show UPI ID for Unpaid / Manual orders */}
        {!isPaid && (
          <div style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, #ffffff 100%)",
            border: "1.5px solid var(--border-gold)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            textAlign: "left"
          }}>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "var(--accent-gold-dark)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "5px" }}>
                <QrCode size={13} />
                <span>Official UPI ID for Payment</span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px", fontFamily: "monospace" }}>
                {upiId}
              </div>
            </div>

            <button
              onClick={handleCopyUpi}
              className="btn btn-secondary btn-sm"
              style={{ 
                height: "34px", 
                padding: "0 12px", 
                fontSize: "0.76rem", 
                fontWeight: 700,
                gap: "4px",
                borderColor: isCopied ? "var(--accent-emerald)" : "var(--border-gold)",
                color: isCopied ? "var(--accent-emerald)" : "var(--accent-gold-dark)"
              }}
              title="Copy UPI ID"
            >
              {isCopied ? <Check size={14} /> : <Copy size={13} />}
              <span>{isCopied ? "Copied!" : "Copy UPI"}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={handleWhatsAppSend}
            className="btn btn-whatsapp btn-lg"
            style={{ width: "100%", justifyContent: "center", gap: "8px", fontSize: "0.92rem", padding: "12px" }}
          >
            <MessageCircle size={18} />
            <span>{isPaid ? "Share Order Receipt on WhatsApp" : "Send Order on WhatsApp"}</span>
          </button>

          <button
            onClick={handleClose}
            className="btn btn-secondary btn-md"
            style={{ width: "100%", justifyContent: "center", padding: "9px" }}
          >
            <span>Continue Browsing Collection</span>
          </button>
        </div>

      </div>
    </div>
  );
};
