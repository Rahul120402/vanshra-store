import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, MessageCircle, Copy, Check } from "lucide-react";

export const WhatsAppTemplatesModal = ({ isOpen, onClose }) => {
  const { settings, showToast } = useStore();
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const templates = [
    {
      title: "1. Order Confirmation & UPI Payment Request",
      trigger: "Send when a customer places a new order",
      text: `Hello [Customer Name],

Thank you for placing order #[Order ID] with ${settings.brandName}.

Order Summary:
- [Product Name] (Size: [Size], Qty: 1)
Total Amount: ${settings.currencySymbol}[Amount]

Delivery Address:
[Customer Address], [City], [State] - [Pincode]

To confirm your order and initiate dispatch, please complete the payment via UPI:
💳 UPI ID: ${settings.adminUpiId || "918769102796@paytm"}
Amount: ${settings.currencySymbol}[Amount]

Please reply with a screenshot once payment is completed so our team can pack and dispatch your parcel today. Thank you!

- Team ${settings.brandName}`
    },
    {
      title: "2. Dispatch & Tracking Details",
      trigger: "Send after parcel is handed to courier",
      text: `Hello [Customer Name],

Your order #[Order ID] from ${settings.brandName} has been dispatched.

Dispatch Details:
Courier Partner: [Courier Partner]
Tracking Number (AWB): [Tracking Number]

Please feel free to message us here if you have any questions regarding your delivery. Thank you!

- Team ${settings.brandName}`
    },
    {
      title: "3. Delivery Follow-Up & Feedback",
      trigger: "Send after delivery is completed",
      text: `Hello [Customer Name],

We hope you received your order #[Order ID] from ${settings.brandName} in perfect condition.

How does the fit and fabric feel? We would love to hear your feedback.

Thank you for choosing ${settings.brandName}!

- Team ${settings.brandName}`
    }
  ];

  const handleCopy = (text, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      showToast("Template copied to clipboard", "success");
      setTimeout(() => setCopiedIdx(null), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 0
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-secondary)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(37, 211, 102, 0.12)", color: "#25d366" }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Quick WhatsApp Message Templates
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.78rem" }}>
                Clean, professional ready-to-copy customer notification messages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Template List */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {templates.map((tpl, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "18px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {tpl.title}
                  </h4>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    {tpl.trigger}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(tpl.text, idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check size={14} style={{ color: "var(--accent-emerald)" }} />
                      <span style={{ color: "var(--accent-emerald)" }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre style={{
                background: "#ffffff",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xs)",
                padding: "14px",
                fontSize: "0.82rem",
                fontFamily: "var(--font-sans)",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                margin: 0
              }}>
                {tpl.text}
              </pre>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
