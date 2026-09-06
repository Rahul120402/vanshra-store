import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { X, Printer, Tag, FileText, Sparkles, Layers, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export const BulkPackingSlipModal = ({ orders = [], isOpen, onClose }) => {
  const { settings } = useStore();
  const [labelFormat, setLabelFormat] = useState("4x6"); // "4x6" | "a4"
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!isOpen || !orders || orders.length === 0) return null;

  const currentPreviewOrder = orders[previewIndex] || orders[0];

  const handleBulkPrint = (formatToPrint = labelFormat) => {
    const is4x6 = formatToPrint === "4x6";

    const ordersHtml = orders.map((ord, idx) => {
      const custName = ord.customer?.fullName || "Valued Customer";
      const custPhone = ord.customer?.phone || "N/A";
      const custAddress = ord.customer?.address || "Direct Order via WhatsApp";
      const custCity = ord.customer?.city || "Jaipur";
      const custState = ord.customer?.state || "Rajasthan";
      const custPincode = ord.customer?.pincode || "302001";
      const courier = ord.dispatchInfo?.courierPartner || "";
      const awb = ord.dispatchInfo?.trackingNumber || "";

      const itemsRows = (ord.items || []).map((item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; font-weight: 600; color: #111827;">${item.name || "Apparel Item"}</td>
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; text-align: center;">
            <span style="display: inline-block; background: #f3f4f6; border: 1px solid #d1d5db; padding: ${is4x6 ? "1px 5px" : "2px 8px"}; border-radius: 4px; font-weight: 700; font-size: ${is4x6 ? "9.5px" : "12px"}; color: #111827;">
              ${item.size || "Free"}
            </span>
          </td>
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; text-align: center; color: #4b5563;">${item.color || "Standard"}</td>
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; text-align: center; font-weight: 700; color: #111827;">${item.quantity || 1}</td>
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; text-align: right; color: #374151;">${formatCurrency(item.price, settings.currencySymbol)}</td>
          <td style="padding: ${is4x6 ? "5px 7px" : "9px 12px"}; text-align: right; font-weight: 700; color: #111827;">${formatCurrency((item.price || 0) * (item.quantity || 1), settings.currencySymbol)}</td>
        </tr>
      `).join("");

      return `
        <div class="order-page">
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
                <div class="order-id-tag">Order #${ord.id}</div>
                <div class="order-date-tag">Date: ${formatDate(ord.createdAt)}</div>
                <div class="batch-tag">Batch Item ${idx + 1} of ${orders.length}</div>
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
                  <strong>Payment:</strong> ${ord.paymentMethod || "Prepaid (UPI)"}<br />
                  <strong>Status:</strong> ${ord.status}<br />
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
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Totals Area -->
            <div class="total-wrap">
              <div class="total-box">
                <div class="tot-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(ord.subtotal || ord.total, settings.currencySymbol)}</span>
                </div>
                ${ord.shippingFee > 0 ? `
                  <div class="tot-row">
                    <span>Shipping Fee:</span>
                    <span>${formatCurrency(ord.shippingFee, settings.currencySymbol)}</span>
                  </div>
                ` : `
                  <div class="tot-row" style="color: #059669;">
                    <span>Shipping:</span>
                    <span>FREE</span>
                  </div>
                `}
                <div class="tot-row tot-grand">
                  <span>Total Amount:</span>
                  <span>${formatCurrency(ord.total, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            <!-- Dispatch Barcode Visual Placeholder -->
            <div style="margin-bottom: ${is4x6 ? "8px" : "14px"}; padding: ${is4x6 ? "6px 8px" : "10px 14px"}; background: #ffffff; border: 1px dashed #d1d5db; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: ${is4x6 ? "8px" : "11px"}; font-weight: 700; color: #6b7280; text-transform: uppercase;">Tracking & Verification</div>
                <div style="font-size: ${is4x6 ? "10px" : "13px"}; font-weight: 800; color: #111827; letter-spacing: 0.06em;">VAN-SHIP-${ord.id}</div>
              </div>
              <div style="font-family: monospace; font-size: ${is4x6 ? "18px" : "24px"}; letter-spacing: 3px; font-weight: 900; color: #111827;">
                ||| | |||| || ||| | |||
              </div>
            </div>

            <!-- Footer Message -->
            <div class="footer-note">
              Thank you for ordering with <strong>${settings.brandName}</strong>! For alterations or care support, WhatsApp us at +${settings.adminWhatsApp}.
            </div>
          </div>
        </div>
      `;
    }).join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bulk Labels - ${orders.length} Orders (${is4x6 ? "4x6 Thermal" : "A4"})</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${is4x6 ? "4in 6in" : "A4 portrait"};
              margin: ${is4x6 ? "3mm 4mm" : "10mm 12mm"};
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
              font-size: ${is4x6 ? "9.5px" : "13px"};
              line-height: ${is4x6 ? "1.3" : "1.45"};
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .order-page {
              page-break-after: always;
              break-after: page;
              width: 100%;
              min-height: ${is4x6 ? "5.8in" : "280mm"};
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              margin-bottom: ${is4x6 ? "0" : "0"};
            }
            .order-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            .invoice-wrap {
              width: 100%;
              max-width: ${is4x6 ? "3.85in" : "780px"};
              margin: 0 auto;
              padding: ${is4x6 ? "4px 2px" : "10px"};
            }
            .header-sec {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #111827;
              padding-bottom: ${is4x6 ? "8px" : "14px"};
              margin-bottom: ${is4x6 ? "8px" : "16px"};
            }
            .brand-left {
              display: flex;
              align-items: center;
              gap: ${is4x6 ? "8px" : "14px"};
            }
            .brand-logo {
              width: ${is4x6 ? "34px" : "50px"};
              height: ${is4x6 ? "34px" : "50px"};
              object-fit: contain;
            }
            .brand-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: ${is4x6 ? "16px" : "24px"};
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #111827;
              line-height: 1.1;
            }
            .brand-sub {
              font-size: ${is4x6 ? "8.5px" : "11px"};
              color: #4b5563;
              margin-top: 2px;
            }
            .header-right {
              text-align: right;
            }
            .invoice-heading {
              font-size: ${is4x6 ? "11px" : "15px"};
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
              font-size: ${is4x6 ? "8.5px" : "11.5px"};
              color: #6b7280;
              margin-top: 1px;
            }
            .batch-tag {
              font-size: ${is4x6 ? "8px" : "10px"};
              font-weight: 700;
              color: #059669;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .grid-cards {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: ${is4x6 ? "6px" : "14px"};
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: ${is4x6 ? "6px" : "8px"};
              padding: ${is4x6 ? "7px 9px" : "12px 16px"};
              margin-bottom: ${is4x6 ? "8px" : "16px"};
            }
            .card-title {
              font-size: ${is4x6 ? "8px" : "10px"};
              text-transform: uppercase;
              font-weight: 800;
              letter-spacing: 0.05em;
              color: #6b7280;
              margin-bottom: 2px;
            }
            .customer-name {
              font-size: ${is4x6 ? "11px" : "14px"};
              font-weight: 700;
              color: #111827;
              margin-bottom: 2px;
            }
            .card-desc {
              font-size: ${is4x6 ? "9px" : "12px"};
              color: #374151;
              line-height: 1.35;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: ${is4x6 ? "8px" : "16px"};
              font-size: ${is4x6 ? "9px" : "12px"};
            }
            .items-table th {
              background: #111827;
              color: #ffffff;
              padding: ${is4x6 ? "5px 7px" : "8px 10px"};
              font-size: ${is4x6 ? "8px" : "11px"};
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .total-wrap {
              display: flex;
              justify-content: flex-end;
              margin-bottom: ${is4x6 ? "8px" : "16px"};
            }
            .total-box {
              width: ${is4x6 ? "180px" : "260px"};
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: ${is4x6 ? "6px" : "8px"};
              padding: ${is4x6 ? "7px 9px" : "10px 14px"};
              font-size: ${is4x6 ? "9px" : "12.5px"};
            }
            .tot-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              color: #4b5563;
            }
            .tot-grand {
              border-top: 2px solid #111827;
              margin-top: 3px;
              padding-top: 4px;
              font-size: ${is4x6 ? "11px" : "15px"};
              font-weight: 800;
              color: #111827;
            }
            .footer-note {
              border-top: 1px dashed #9ca3af;
              padding-top: ${is4x6 ? "6px" : "12px"};
              text-align: center;
              font-size: ${is4x6 ? "8px" : "11px"};
              color: #6b7280;
              line-height: 1.35;
            }
          </style>
        </head>
        <body>
          ${ordersHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=900,height=750");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      alert("Popup blocked! Please allow popups for this site to print packing slips.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "880px",
          width: "95vw",
          maxHeight: "92vh",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1.5px solid var(--border-gold-bright)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)"
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: "linear-gradient(135deg, #181512 0%, #2a241e 100%)",
          color: "#ffffff",
          padding: "clamp(16px, 3vw, 22px) clamp(20px, 4vw, 28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--border-gold-bright)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(212, 175, 55, 0.15)",
              border: "1px solid var(--border-gold-bright)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-gold-light)"
            }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 className="font-serif" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", margin: 0, color: "#ffffff" }}>
                  Bulk Shipping Labels & Packing Slips
                </h3>
                <span style={{
                  background: "var(--accent-gold)",
                  color: "#181512",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}>
                  {orders.length} Orders Selected
                </span>
              </div>
              <p style={{ fontSize: "0.80rem", color: "var(--accent-gold-light)", opacity: 0.85, margin: "3px 0 0" }}>
                Print all selected dispatch slips and shipping stickers in 1 continuous batch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar & Format Selector */}
        <div style={{
          padding: "14px 24px",
          background: "#fcfbf7",
          borderBottom: "1px solid #e7e0d3",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          {/* Format Radio Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "4px" }}>
              Print Format:
            </span>
            <button
              onClick={() => setLabelFormat("4x6")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                border: labelFormat === "4x6" ? "1.5px solid var(--accent-gold-dark)" : "1px solid #d1d5db",
                background: labelFormat === "4x6" ? "rgba(212, 175, 55, 0.15)" : "#ffffff",
                color: labelFormat === "4x6" ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Tag size={15} />
              4" × 6" Thermal Sticker Roll
            </button>

            <button
              onClick={() => setLabelFormat("a4")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                border: labelFormat === "a4" ? "1.5px solid var(--accent-gold-dark)" : "1px solid #d1d5db",
                background: labelFormat === "a4" ? "rgba(212, 175, 55, 0.15)" : "#ffffff",
                color: labelFormat === "a4" ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <FileText size={15} />
              A4 Standard Sheets
            </button>
          </div>

          {/* Master 1-Click Print Button */}
          <button
            onClick={() => handleBulkPrint(labelFormat)}
            className="btn btn-primary"
            style={{
              padding: "10px 22px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 800,
              boxShadow: "0 4px 16px rgba(179, 135, 40, 0.35)"
            }}
          >
            <Printer size={18} />
            Print All {orders.length} Labels (1-Click)
          </button>
        </div>

        {/* Interactive Preview Body */}
        <div style={{
          padding: "20px 24px",
          overflowY: "auto",
          flex: 1,
          background: "#f4f1ea",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          {/* Order Slider Navigator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: labelFormat === "4x6" ? "420px" : "680px",
            background: "#ffffff",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb"
          }}>
            <button
              onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
              disabled={previewIndex === 0}
              style={{
                border: "none",
                background: "transparent",
                cursor: previewIndex === 0 ? "not-allowed" : "pointer",
                opacity: previewIndex === 0 ? 0.3 : 1,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-primary)"
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              Viewing Slip <strong style={{ color: "var(--accent-gold-dark)" }}>#{previewIndex + 1}</strong> of <strong>{orders.length}</strong> (Order #{currentPreviewOrder.id})
            </span>

            <button
              onClick={() => setPreviewIndex((prev) => Math.min(orders.length - 1, prev + 1))}
              disabled={previewIndex === orders.length - 1}
              style={{
                border: "none",
                background: "transparent",
                cursor: previewIndex === orders.length - 1 ? "not-allowed" : "pointer",
                opacity: previewIndex === orders.length - 1 ? 0.3 : 1,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-primary)"
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Rendered Live Preview Card */}
          <div style={{
            width: "100%",
            maxWidth: labelFormat === "4x6" ? "420px" : "680px",
            background: "#ffffff",
            borderRadius: "12px",
            padding: labelFormat === "4x6" ? "18px" : "28px",
            border: "1px solid #d1d5db",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontSize: labelFormat === "4x6" ? "0.80rem" : "0.90rem"
          }}>
            {/* Header Preview */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111827", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/vanshra-logo.png" alt="" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
                <div>
                  <div className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase" }}>{settings.brandName}</div>
                  <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>Support: +{settings.adminWhatsApp}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827" }}>PACKING SLIP</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent-gold-dark)" }}>#{currentPreviewOrder.id}</div>
                <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{formatDate(currentPreviewOrder.createdAt)}</div>
              </div>
            </div>

            {/* Customer & Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", background: "#f9fafb", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #e5e7eb" }}>
              <div>
                <div style={{ fontSize: "0.70rem", fontWeight: 800, textTransform: "uppercase", color: "#6b7280" }}>Ship To (Customer):</div>
                <div style={{ fontWeight: 700, color: "#111827", margin: "2px 0" }}>{currentPreviewOrder.customer?.fullName || "Valued Customer"}</div>
                <div style={{ fontSize: "0.76rem", color: "#374151", lineHeight: 1.4 }}>
                  {currentPreviewOrder.customer?.address || "Address N/A"}<br />
                  {currentPreviewOrder.customer?.city || "Jaipur"}, {currentPreviewOrder.customer?.state || "Rajasthan"} - {currentPreviewOrder.customer?.pincode || ""}<br />
                  <strong>Phone:</strong> {currentPreviewOrder.customer?.phone || "N/A"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.70rem", fontWeight: 800, textTransform: "uppercase", color: "#6b7280" }}>Dispatch Details:</div>
                <div style={{ fontSize: "0.76rem", color: "#374151", lineHeight: 1.5, marginTop: "2px" }}>
                  <strong>Payment:</strong> {currentPreviewOrder.paymentMethod || "Prepaid (UPI)"}<br />
                  <strong>Status:</strong> <span style={{ color: "#059669", fontWeight: 700 }}>{currentPreviewOrder.status}</span><br />
                  {currentPreviewOrder.dispatchInfo?.courierPartner && <span><strong>Courier:</strong> {currentPreviewOrder.dispatchInfo.courierPartner}<br /></span>}
                  {currentPreviewOrder.dispatchInfo?.trackingNumber && <span><strong>AWB:</strong> {currentPreviewOrder.dispatchInfo.trackingNumber}</span>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem", marginBottom: "12px" }}>
              <thead>
                <tr style={{ background: "#111827", color: "#ffffff" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Item</th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>Size</th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(currentPreviewOrder.items || []).map((it, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>{it.name}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center" }}><span style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>{it.size || "Free"}</span></td>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>{it.quantity || 1}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "var(--accent-gold-dark)" }}>{formatCurrency((it.price || 0) * (it.quantity || 1), settings.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <div style={{ width: "180px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 10px", fontSize: "0.76rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#111827", borderTop: "1px solid #111827", paddingTop: "4px" }}>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(currentPreviewOrder.total, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Barcode Strip */}
            <div style={{ padding: "6px 10px", background: "#ffffff", border: "1px dashed #d1d5db", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.70rem", fontWeight: 800, color: "#111827" }}>VAN-SHIP-{currentPreviewOrder.id}</span>
              <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 900 }}>||| | |||| || |||</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "12px 24px",
          background: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
            ⚡ Tip: For thermal sticker printers (TVS, TSC, Zebra), select <strong>4" × 6"</strong> format for seamless printing.
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "8px 18px", fontSize: "0.84rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
