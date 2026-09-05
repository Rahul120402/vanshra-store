import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { X, Printer, Tag, FileText, Sparkles } from "lucide-react";

export const PackingSlipModal = ({ order, isOpen, onClose }) => {
  const { settings } = useStore();
  const [labelFormat, setLabelFormat] = useState("4x6"); // "4x6" | "a4"

  if (!isOpen || !order) return null;

  const custName = order.customer?.fullName || "Valued Customer";
  const custPhone = order.customer?.phone || "N/A";
  const custAddress = order.customer?.address || "Direct Order via WhatsApp";
  const custCity = order.customer?.city || "Jaipur";
  const custState = order.customer?.state || "Rajasthan";
  const custPincode = order.customer?.pincode || "302001";
  const courier = order.dispatchInfo?.courierPartner || "";
  const awb = order.dispatchInfo?.trackingNumber || "";

  const handlePrint = (formatToPrint = labelFormat) => {
    const is4x6 = formatToPrint === "4x6";

    const itemsRows = (order.items || []).map((item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; font-weight: 600; color: #111827;">${item.name || "Apparel Item"}</td>
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; text-align: center;">
          <span style="display: inline-block; background: #f3f4f6; border: 1px solid #d1d5db; padding: ${is4x6 ? "1px 6px" : "2px 8px"}; border-radius: 4px; font-weight: 700; font-size: ${is4x6 ? "10px" : "12px"}; color: #111827;">
            ${item.size || "Free"}
          </span>
        </td>
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; text-align: center; color: #4b5563;">${item.color || "Standard"}</td>
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; text-align: center; font-weight: 700; color: #111827;">${item.quantity || 1}</td>
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; text-align: right; color: #374151;">${formatCurrency(item.price, settings.currencySymbol)}</td>
        <td style="padding: ${is4x6 ? "6px 8px" : "10px 12px"}; text-align: right; font-weight: 700; color: #111827;">${formatCurrency((item.price || 0) * (item.quantity || 1), settings.currencySymbol)}</td>
      </tr>
    `).join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${order.id} (${is4x6 ? "4x6" : "A4"})</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${is4x6 ? "4in 6in" : "A4 portrait"};
              margin: ${is4x6 ? "3mm 4mm" : "12mm 15mm"};
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #111827;
              background: #ffffff;
              width: 100%;
              font-size: ${is4x6 ? "10px" : "13px"};
              line-height: ${is4x6 ? "1.35" : "1.45"};
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .invoice-wrap {
              width: 100%;
              max-width: ${is4x6 ? "3.85in" : "780px"};
              margin: 0 auto;
              padding: ${is4x6 ? "6px" : "12px"};
            }
            .header-sec {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #111827;
              padding-bottom: ${is4x6 ? "10px" : "16px"};
              margin-bottom: ${is4x6 ? "10px" : "18px"};
            }
            .brand-left {
              display: flex;
              align-items: center;
              gap: ${is4x6 ? "10px" : "14px"};
            }
            .brand-logo {
              width: ${is4x6 ? "38px" : "52px"};
              height: ${is4x6 ? "38px" : "52px"};
              object-fit: contain;
            }
            .brand-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: ${is4x6 ? "17px" : "26px"};
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #111827;
              line-height: 1.1;
            }
            .brand-sub {
              font-size: ${is4x6 ? "9px" : "11.5px"};
              color: #4b5563;
              margin-top: 2px;
            }
            .header-right {
              text-align: right;
            }
            .invoice-heading {
              font-size: ${is4x6 ? "11.5px" : "16px"};
              font-weight: 800;
              letter-spacing: 0.04em;
              color: #111827;
            }
            .order-id-tag {
              font-size: ${is4x6 ? "11px" : "14px"};
              font-weight: 800;
              color: #b45309;
              margin-top: 2px;
            }
            .order-date-tag {
              font-size: ${is4x6 ? "9px" : "12px"};
              color: #6b7280;
              margin-top: 1px;
            }
            .grid-cards {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: ${is4x6 ? "8px" : "16px"};
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: ${is4x6 ? "6px" : "8px"};
              padding: ${is4x6 ? "8px 10px" : "14px 18px"};
              margin-bottom: ${is4x6 ? "10px" : "18px"};
            }
            .card-title {
              font-size: ${is4x6 ? "8.5px" : "10.5px"};
              text-transform: uppercase;
              font-weight: 800;
              letter-spacing: 0.05em;
              color: #6b7280;
              margin-bottom: 3px;
            }
            .customer-name {
              font-size: ${is4x6 ? "11.5px" : "15px"};
              font-weight: 700;
              color: #111827;
              margin-bottom: 2px;
            }
            .card-desc {
              font-size: ${is4x6 ? "9.5px" : "12.5px"};
              color: #374151;
              line-height: 1.4;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: ${is4x6 ? "10px" : "18px"};
              font-size: ${is4x6 ? "9.5px" : "12.5px"};
            }
            .items-table th {
              background: #111827;
              color: #ffffff;
              padding: ${is4x6 ? "6px 8px" : "9px 12px"};
              font-size: ${is4x6 ? "8.5px" : "11.5px"};
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .total-wrap {
              display: flex;
              justify-content: flex-end;
              margin-bottom: ${is4x6 ? "10px" : "18px"};
            }
            .total-box {
              width: ${is4x6 ? "190px" : "280px"};
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: ${is4x6 ? "6px" : "8px"};
              padding: ${is4x6 ? "8px 10px" : "12px 16px"};
              font-size: ${is4x6 ? "9.5px" : "13px"};
            }
            .tot-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              color: #4b5563;
            }
            .tot-grand {
              border-top: 2px solid #111827;
              margin-top: 4px;
              padding-top: 5px;
              font-size: ${is4x6 ? "11.5px" : "16px"};
              font-weight: 800;
              color: #111827;
            }
            .footer-note {
              border-top: 1px dashed #9ca3af;
              padding-top: ${is4x6 ? "8px" : "14px"};
              text-align: center;
              font-size: ${is4x6 ? "8.5px" : "11.5px"};
              color: #6b7280;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">
            
            <!-- Header -->
            <div class="header-sec">
              <div class="brand-left">
                <img src="/vanshra-logo.png" alt="${settings.brandName}" class="brand-logo" />
                <div>
                  <div class="brand-title">${settings.brandName}</div>
                  <div class="brand-sub">${settings.storeAddress || settings.adminAddress ? `${settings.storeAddress || settings.adminAddress} • ` : ""}Support: +${settings.adminWhatsApp} | ${settings.adminEmail}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="invoice-heading">PACKING SLIP / INVOICE</div>
                <div class="order-id-tag">Order #${order.id}</div>
                <div class="order-date-tag">Date: ${formatDate(order.createdAt)}</div>
              </div>
            </div>

            <!-- Customer & Dispatch Info Grid -->
            <div class="grid-cards">
              <div>
                <div class="card-title">Ship To (Customer):</div>
                <div class="customer-name">${custName}</div>
                <div class="card-desc">
                  ${custAddress}<br />
                  ${custCity}${custState ? `, ${custState}` : ""} ${custPincode ? `- ${custPincode}` : ""}<br />
                  <strong>Mobile:</strong> ${custPhone}
                </div>
              </div>

              <div>
                <div class="card-title">Dispatch & Payment Details:</div>
                <div class="card-desc">
                  <strong>Payment:</strong> Prepaid (Advance UPI)<br />
                  <strong>Status:</strong> ${order.status}<br />
                  ${courier ? `<strong>Courier:</strong> ${courier}<br />` : ""}
                  ${awb ? `<strong>AWB/Tracking:</strong> ${awb}<br />` : ""}
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Item Description</th>
                  <th style="text-align: center;">Size</th>
                  <th style="text-align: center;">Color</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Total Calculation Box -->
            <div class="total-wrap">
              <div class="total-box">
                <div class="tot-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(order.subtotal, settings.currencySymbol)}</span>
                </div>
                <div class="tot-row">
                  <span>Shipping Fee:</span>
                  <span>${order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee, settings.currencySymbol)}</span>
                </div>
                <div class="tot-row tot-grand">
                  <span>Total Amount:</span>
                  <span style="color: #b45309;">${formatCurrency(order.total, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            <!-- Footer Note -->
            <div class="footer-note">
              Thank you for shopping with <strong>${settings.brandName}</strong>! For sizing exchanges or queries, reach us on WhatsApp at <strong>+${settings.adminWhatsApp}</strong>.
            </div>

          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 350);
    } else {
      window.print();
    }
  };

  const is4x6 = labelFormat === "4x6";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: is4x6 ? "520px" : "780px", 
          padding: "24px", 
          background: "#ffffff", 
          color: "#111827", 
          borderRadius: "var(--radius-lg)", 
          transition: "max-width 0.25s ease" 
        }}
      >
        {/* Top Control Bar */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #e5e7eb", paddingBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              Invoice & Packing Slip Print
            </span>
            <span style={{ fontSize: "0.76rem", color: "#6b7280" }}>
              Same premium invoice design scaled for 4x6" sticker or A4 page
            </span>
          </div>

          {/* Format Toggle Tabs */}
          <div style={{ display: "flex", background: "#f3f4f6", padding: "3px", borderRadius: "8px", gap: "4px" }}>
            <button
              onClick={() => setLabelFormat("4x6")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.80rem",
                fontWeight: 700,
                cursor: "pointer",
                background: is4x6 ? "#ffffff" : "transparent",
                color: is4x6 ? "var(--accent-gold-dark)" : "#6b7280",
                boxShadow: is4x6 ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              <Tag size={13} />
              <span>4x6" Size (Thermal)</span>
            </button>

            <button
              onClick={() => setLabelFormat("a4")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.80rem",
                fontWeight: 700,
                cursor: "pointer",
                background: !is4x6 ? "#ffffff" : "transparent",
                color: !is4x6 ? "var(--accent-gold-dark)" : "#6b7280",
                boxShadow: !is4x6 ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              <FileText size={13} />
              <span>A4 Full Size</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={() => handlePrint(labelFormat)} 
              className="btn btn-gold btn-sm" 
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>Print ({is4x6 ? "4x6\"" : "A4"})</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: "8px 12px" }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ================= INVOICE PREVIEW CONTAINER ================= */}
        <div style={{ 
          fontFamily: "var(--font-sans)", 
          lineHeight: is4x6 ? 1.38 : 1.45, 
          background: "#ffffff",
          maxWidth: is4x6 ? "420px" : "100%",
          margin: "0 auto",
          border: is4x6 ? "1px solid #e5e7eb" : "none",
          padding: is4x6 ? "14px" : "0",
          borderRadius: is4x6 ? "8px" : "0",
          boxShadow: is4x6 ? "0 4px 12px rgba(0,0,0,0.04)" : "none"
        }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111827", paddingBottom: is4x6 ? "10px" : "16px", marginBottom: is4x6 ? "12px" : "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: is4x6 ? "10px" : "14px" }}>
              <img src="/vanshra-logo.png" alt="Vanshra Logo" style={{ width: is4x6 ? "38px" : "52px", height: is4x6 ? "38px" : "52px", objectFit: "contain" }} />
              <div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: is4x6 ? "1.25rem" : "1.8rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", color: "#111827", lineHeight: 1.1 }}>
                  {settings.brandName}
                </h1>
                <p style={{ fontSize: is4x6 ? "0.72rem" : "0.8rem", color: "#4b5563", marginTop: "2px" }}>
                  {settings.storeAddress || settings.adminAddress ? `${settings.storeAddress || settings.adminAddress} • ` : ""}Support: +{settings.adminWhatsApp} | {settings.adminEmail}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: is4x6 ? "0.88rem" : "1.15rem", fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "0.04em" }}>
                PACKING SLIP / INVOICE
              </h2>
              <p style={{ fontSize: is4x6 ? "0.82rem" : "0.95rem", fontWeight: 800, color: "#b45309", marginTop: "2px" }}>
                Order #{order.id}
              </p>
              <p style={{ fontSize: is4x6 ? "0.70rem" : "0.78rem", color: "#6b7280" }}>
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Customer & Courier Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: is4x6 ? "10px" : "16px", marginBottom: is4x6 ? "12px" : "22px", padding: is4x6 ? "10px 12px" : "14px 18px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <div>
              <span style={{ fontSize: is4x6 ? "0.68rem" : "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "#6b7280", display: "block", marginBottom: "3px", letterSpacing: "0.05em" }}>
                Ship To (Customer):
              </span>
              <strong style={{ fontSize: is4x6 ? "0.88rem" : "0.98rem", display: "block", color: "#111827" }}>{custName}</strong>
              <div style={{ fontSize: is4x6 ? "0.76rem" : "0.86rem", color: "#374151", marginTop: "3px", lineHeight: 1.4 }}>
                {custAddress}<br />
                {custCity}${custState ? `, ${custState}` : ""} {custPincode ? `- ${custPincode}` : ""}<br />
                <strong>Mobile:</strong> {custPhone}
              </div>
            </div>

            <div>
              <span style={{ fontSize: is4x6 ? "0.68rem" : "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "#6b7280", display: "block", marginBottom: "3px", letterSpacing: "0.05em" }}>
                Dispatch & Payment Details:
              </span>
              <div style={{ fontSize: is4x6 ? "0.76rem" : "0.86rem", color: "#374151", lineHeight: 1.4 }}>
                <strong>Payment:</strong> Prepaid (Advance UPI)<br />
                <strong>Status:</strong> {order.status}<br />
                {courier && <><strong>Courier:</strong> {courier}<br /></>}
                {awb && <><strong>AWB/Tracking:</strong> {awb}<br /></>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: is4x6 ? "12px" : "22px", fontSize: is4x6 ? "0.76rem" : "0.86rem" }}>
            <thead>
              <tr style={{ background: "#111827", color: "#ffffff", textAlign: "left" }}>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Item Description</th>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", textAlign: "center", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase" }}>Size</th>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", textAlign: "center", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase" }}>Color</th>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", textAlign: "center", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase" }}>Qty</th>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", textAlign: "right", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase" }}>Price</th>
                <th style={{ padding: is4x6 ? "6px 8px" : "9px 12px", textAlign: "right", fontSize: is4x6 ? "0.70rem" : "0.78rem", textTransform: "uppercase" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", fontWeight: 600, color: "#111827" }}>{item.name}</td>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", background: "#f3f4f6", border: "1px solid #d1d5db", padding: is4x6 ? "1px 6px" : "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: is4x6 ? "0.72rem" : "0.82rem", color: "#111827" }}>
                      {item.size}
                    </span>
                  </td>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", textAlign: "center", color: "#4b5563" }}>{item.color}</td>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", textAlign: "center", fontWeight: 700, color: "#111827" }}>{item.quantity}</td>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", textAlign: "right", color: "#374151" }}>{formatCurrency(item.price, settings.currencySymbol)}</td>
                  <td style={{ padding: is4x6 ? "6px 8px" : "10px 12px", textAlign: "right", fontWeight: 700, color: "#111827" }}>{formatCurrency(item.price * item.quantity, settings.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Box */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: is4x6 ? "12px" : "24px" }}>
            <div style={{ width: is4x6 ? "210px" : "280px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: is4x6 ? "8px 12px" : "12px 16px", fontSize: is4x6 ? "0.78rem" : "0.88rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#4b5563" }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#4b5563" }}>
                <span>Shipping Fee:</span>
                <span>{order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee, settings.currencySymbol)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", borderTop: "2px solid #111827", fontSize: is4x6 ? "0.95rem" : "1.08rem", fontWeight: 800, color: "#111827", marginTop: "4px" }}>
                <span>Total Amount:</span>
                <span style={{ color: "#b45309" }}>{formatCurrency(order.total, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ borderTop: "1px dashed #d1d5db", paddingTop: is4x6 ? "8px" : "14px", textAlign: "center", fontSize: is4x6 ? "0.68rem" : "0.78rem", color: "#6b7280" }}>
            Thank you for shopping with <strong>{settings.brandName}</strong>! For sizing exchanges or queries, reach us on WhatsApp at <strong>+{settings.adminWhatsApp}</strong>.
          </div>

        </div>
      </div>
    </div>
  );
};
