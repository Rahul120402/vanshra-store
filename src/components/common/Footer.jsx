import React from "react";
import { useStore } from "../../context/StoreContext";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  HeartHandshake,
  Instagram,
  MapPin
} from "lucide-react";
import { createGeneralInquiryUrl } from "../../utils/whatsapp";

export const Footer = () => {
  const { settings, navigateToHome, navigateToCategory, openAdminLogin } = useStore();

  const handleWhatsAppHelp = () => {
    const url = createGeneralInquiryUrl(settings.adminWhatsApp, "your latest collection", settings);
    window.open(url, "_blank");
  };

  return (
    <footer style={{
      background: "linear-gradient(180deg, #181512 0%, #0d0b09 100%)",
      color: "#ffffff",
      borderTop: "1.5px solid var(--border-gold)",
      marginTop: "clamp(40px, 6vw, 80px)",
      padding: "clamp(40px, 6vw, 70px) 0 32px",
      width: "100%",
      maxWidth: "100vw"
    }}>
      <div className="container">
        {/* Value Highlights Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: "clamp(16px, 3vw, 28px)",
          paddingBottom: "clamp(24px, 4vw, 40px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)"
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(212, 175, 55, 0.15)",
              color: "var(--accent-gold-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid var(--border-gold)"
            }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "3px", color: "#ffffff" }}>Personal Fit Verification</h4>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "#d6cfc7" }}>
                We personally contact you on WhatsApp to confirm fit, sizing, & delivery address before dispatch.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--accent-emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid rgba(16, 185, 129, 0.3)"
            }}>
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "3px", color: "#ffffff" }}>Direct UPI & QR Confirmation</h4>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "#d6cfc7" }}>
                Personal fit assistance on WhatsApp and fast UPI / QR confirmation before dispatch.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(212, 175, 55, 0.15)",
              color: "var(--accent-gold-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid var(--border-gold)"
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "3px", color: "#ffffff" }}>Artisan Craftsmanship</h4>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "#d6cfc7" }}>
                Curated silhouettes, premium Chanderi silks, fine mulmul linens, and meticulous tailoring.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Contact */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: "clamp(24px, 4vw, 40px)",
          padding: "clamp(30px, 5vw, 50px) 0"
        }}>
          {/* Brand Info */}
          <div>
            <div 
              onClick={navigateToHome}
              style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }}
              title="Return to Home"
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--border-gold-bright)",
                boxShadow: "0 0 14px rgba(212, 175, 55, 0.3)",
                flexShrink: 0
              }}>
                <img src="/vanshra-logo.png" alt="Vanshra Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <h2 className="font-display" style={{ fontSize: "1.6rem", color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.10em" }}>
                {settings.brandName || "VANSHRA"}
              </h2>
            </div>
            <p style={{ fontSize: "0.84rem", lineHeight: 1.55, marginBottom: "16px", color: "#d6cfc7" }}>
              {settings.tagline || "Bespoke Haute Couture & Contemporary Luxury. Handcrafted with timeless grace and artisan tailoring."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleWhatsAppHelp}
                className="btn btn-whatsapp btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp Support</span>
              </button>

              {settings.instagramHandle && (
                <a
                  href={`https://instagram.com/${settings.instagramHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", textDecoration: "none", background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  <Instagram size={14} style={{ color: "#f472b6" }} />
                  <span>{settings.instagramHandle}</span>
                </a>
              )}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 style={{ fontSize: "0.90rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", color: "var(--accent-gold-light)" }}>
              Collections
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {(settings.categories || []).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigateToCategory(cat)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-secondary)",
                      fontSize: "0.84rem",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support & Contact */}
          <div>
            <h4 style={{ fontSize: "0.90rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", color: "var(--accent-gold-light)" }}>
              Help & Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              {(settings.storeAddress || settings.adminAddress) && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <MapPin size={16} style={{ color: "var(--accent-gold)", flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ lineHeight: 1.45, color: "#d6cfc7" }}>
                    {settings.storeAddress || settings.adminAddress}
                  </span>
                </div>
              )}
              {settings.adminPhone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={15} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                  <span>{settings.adminPhone}</span>
                </div>
              )}
              {settings.adminEmail && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={15} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-all" }}>{settings.adminEmail}</span>
                </div>
              )}
              {settings.adminWhatsApp && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MessageCircle size={15} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                  <span>WhatsApp: +{settings.adminWhatsApp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Instagram Column */}
          <div>
            <h4 style={{ fontSize: "0.90rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", color: "var(--accent-gold-light)" }}>
              Instagram Atelier
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#d6cfc7", lineHeight: 1.5, marginBottom: "12px" }}>
              Follow our official boutique feed for daily styling inspirations, new drops, and behind-the-scenes craft.
            </p>
            <a
              href={`https://www.instagram.com/${(settings.instagramHandle || "@_VANSHRA_").replace("@", "")}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                fontSize: "0.82rem",
                width: "100%",
                justifyContent: "center",
                padding: "8px 16px"
              }}
            >
              <Instagram size={15} style={{ color: "#e1306c" }} />
              <span>Follow {settings.instagramHandle || "@_VANSHRA_"}</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright & Discreet owner access */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "clamp(0.74rem, 1.8vw, 0.82rem)",
          color: "var(--text-muted)"
        }}>
          <div>
            © {new Date().getFullYear()} <strong>{settings.brandName} Couture</strong>. All rights reserved.
          </div>
          <button
            onClick={openAdminLogin}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.76rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 8px",
              borderRadius: "var(--radius-xs)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Owner Security Gateway"
          >
            <ShieldCheck size={13} />
            <span>Owner & Staff Login</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
