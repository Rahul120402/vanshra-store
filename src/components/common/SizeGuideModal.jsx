import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Ruler, Sparkles, MessageCircle } from "lucide-react";
import { createGeneralInquiryUrl } from "../../utils/whatsapp";

export const SizeGuideModal = () => {
  const { isSizeGuideOpen, closeSizeGuide, settings } = useStore();
  const [unit, setUnit] = useState("in"); // "in" | "cm"

  if (!isSizeGuideOpen) return null;

  const sizeChart = [
    { size: "XXS", bustIn: "30-32", bustCm: "76-81", waistIn: "24-26", waistCm: "61-66", hipIn: "33-35", hipCm: "84-89", lengthIn: "43-45", lengthCm: "109-114" },
    { size: "XS", bustIn: "32-34", bustCm: "81-86", waistIn: "26-28", waistCm: "66-71", hipIn: "35-37", hipCm: "89-94", lengthIn: "44-46", lengthCm: "112-117" },
    { size: "S", bustIn: "34-36", bustCm: "86-91", waistIn: "28-30", waistCm: "71-76", hipIn: "37-39", hipCm: "94-99", lengthIn: "45-47", lengthCm: "114-119" },
    { size: "M", bustIn: "36-38", bustCm: "91-97", waistIn: "30-32", waistCm: "76-81", hipIn: "39-41", hipCm: "99-104", lengthIn: "45-47", lengthCm: "114-119" },
    { size: "L", bustIn: "38-40", bustCm: "97-102", waistIn: "32-34", waistCm: "81-86", hipIn: "41-43", hipCm: "104-109", lengthIn: "46-48", lengthCm: "117-122" },
    { size: "XL", bustIn: "40-42", bustCm: "102-107", waistIn: "34-36", waistCm: "86-91", hipIn: "43-45", hipCm: "109-114", lengthIn: "46-48", lengthCm: "117-122" },
    { size: "XXL", bustIn: "42-44", bustCm: "107-112", waistIn: "36-38", waistCm: "91-97", hipIn: "45-47", hipCm: "114-119", lengthIn: "47-49", lengthCm: "119-124" },
    { size: "XXXL", bustIn: "44-46", bustCm: "112-117", waistIn: "38-40", waistCm: "97-102", hipIn: "47-49", hipCm: "119-124", lengthIn: "47-49", lengthCm: "119-124" }
  ];

  const handleWhatsAppConsult = () => {
    const url = createGeneralInquiryUrl(settings.adminWhatsApp, "custom size and fit advice", settings);
    window.open(url, "_blank");
  };

  return (
    <div className="modal-overlay" onClick={closeSizeGuide}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(680px, calc(100vw - 16px))",
          padding: "clamp(16px, 3.5vw, 26px)",
          maxHeight: "min(94vh, calc(100dvh - 16px))",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-gold-dark)", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Ruler size={14} />
              <span>Standard Measurements</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.5rem)", color: "var(--text-primary)", marginTop: "2px" }}>
              Size & Fit Guide
            </h2>
          </div>
          <button
            onClick={closeSizeGuide}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Unit Selector */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", margin: 0 }}>
            Measurements reflect actual body fit. Sizing runs standard Indian couture.
          </p>

          <div style={{ display: "inline-flex", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-gold)", borderRadius: "var(--radius-xs)", padding: "2px" }}>
            <button
              onClick={() => setUnit("in")}
              style={{
                padding: "3px 10px",
                border: "none",
                background: unit === "in" ? "var(--accent-gold-dark)" : "transparent",
                color: unit === "in" ? "#ffffff" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "var(--radius-xs)",
                cursor: "pointer"
              }}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              style={{
                padding: "3px 10px",
                border: "none",
                background: unit === "cm" ? "var(--accent-gold-dark)" : "transparent",
                color: unit === "cm" ? "#ffffff" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "var(--radius-xs)",
                cursor: "pointer"
              }}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-gold)", marginBottom: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem", minWidth: "380px" }}>
            <thead>
              <tr style={{ background: "rgba(212, 175, 55, 0.12)", color: "var(--accent-gold-dark)", borderBottom: "1.5px solid var(--border-gold)" }}>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Size</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Bust ({unit})</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Waist ({unit})</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Hip ({unit})</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Length ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row, idx) => (
                <tr key={row.size} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fbf9f5", borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 800, color: "var(--accent-gold-dark)" }}>{row.size}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text-primary)" }}>{unit === "in" ? row.bustIn : row.bustCm}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text-primary)" }}>{unit === "in" ? row.waistIn : row.waistCm}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text-primary)" }}>{unit === "in" ? row.hipIn : row.hipCm}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text-primary)" }}>{unit === "in" ? row.lengthIn : row.lengthCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WhatsApp Custom Sizing Help */}
        <div style={{
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(250, 248, 245, 0.95) 100%)",
          border: "1px solid var(--border-gold)",
          borderRadius: "var(--radius-sm)",
          padding: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
              <span>Need Custom Tailoring or Between Sizes?</span>
            </div>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px", margin: 0 }}>
              Our team assists with custom measurements and fit advice directly on WhatsApp.
            </p>
          </div>

          <button
            onClick={handleWhatsAppConsult}
            className="btn btn-whatsapp btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.78rem" }}
          >
            <MessageCircle size={14} />
            <span>WhatsApp Fit Help</span>
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setIsSizeGuideOpen(false)} className="btn btn-gold btn-sm">
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
