import React, { useEffect, useState } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  QrCode, 
  Layers 
} from "lucide-react";

export const HeroBanner = () => {
  const { settings, setActiveCategory } = useStore();
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll listener for subtle cinematic depth
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hero = {
    badge: "Official Brand Showroom • Handcrafted Apparel",
    title: "Thoughtfully Crafted,\nWorn With Grace",
    subtitle: "Explore our exclusive collection of comfortable silhouettes and handcrafted clothing. Connect directly on WhatsApp for personalized fit assistance and order confirmation.",
    primaryBtnText: "Explore All Products",
    secondaryBtnText: "Browse Categories",
    bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
    ...(settings?.hero || {})
  };

  const heroTitle = hero.title || "Thoughtfully Crafted,\nWorn With Grace";
  const heroBadge = hero.badge || "Official Brand Showroom • Handcrafted Apparel";
  const heroSubtitle = hero.subtitle || "Explore our exclusive collection of comfortable silhouettes and handcrafted clothing. Connect directly on WhatsApp for personalized fit assistance and order confirmation.";

  const handleExploreClick = () => {
    setActiveCategory("All");
    const catalogSection = document.getElementById("catalog-section");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryScroll = () => {
    const catalogSection = document.getElementById("catalog-section");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      aria-label="Hero Collection Showcase"
      style={{
        position: "relative",
        minHeight: "clamp(520px, 75vh, 680px)",
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        borderBottom: "1px solid var(--border-gold)",
        background: "var(--bg-primary)"
      }}
    >
      {/* Background Cinematic Image with Ken Burns Zoom & Subtle Parallax */}
      <div 
        className="animate-ken-burns"
        style={{
          position: "absolute",
          inset: "-5%",
          width: "110%",
          height: "110%",
          backgroundImage: `url('${hero.bannerImage}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          willChange: "transform",
          zIndex: 0
        }}
      />

      {/* Haute Couture Gradient & Noise Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(250, 248, 245, 0.94) 0%, rgba(244, 237, 228, 0.88) 45%, rgba(250, 248, 245, 0.72) 100%)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        zIndex: 1
      }} />

      {/* Decorative Warm Golden Halos & Ambient Glow */}
      <div 
        className="floating-element"
        style={{
          position: "absolute",
          top: "-15%",
          right: "-5%",
          width: "min(560px, 80vw)",
          height: "min(560px, 80vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 1
        }} 
      />

      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-5%",
        width: "min(440px, 60vw)",
        height: "min(440px, 60vw)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, rgba(255,255,255,0) 70%)",
        filter: "blur(50px)",
        pointerEvents: "none",
        zIndex: 1
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "clamp(36px, 6vw, 68px) clamp(12px, 3vw, 24px)" }}>
        <div style={{ maxWidth: "760px" }}>
          
          {/* Top Universal Brand Badge with Stagger Reveal 1 & Radar Pulse */}
          <div 
            className="text-reveal-item text-reveal-delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid var(--border-gold-bright)",
              color: "var(--accent-gold-dark)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "clamp(0.66rem, 2vw, 0.78rem)",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "18px",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.22)",
              maxWidth: "100%",
              lineHeight: 1.3
            }}
          >
            <Crown size={14} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>{heroBadge}</span>
            <span 
              className="radar-dot"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--accent-emerald)",
                display: "inline-block",
                flexShrink: 0
              }} 
            />
          </div>

          {/* Editorial Headline with Stagger Reveal 2 */}
          <h1 
            className="font-display text-reveal-item text-reveal-delay-2" 
            style={{
              fontSize: "clamp(2rem, 5.8vw, 3.9rem)",
              lineHeight: 1.12,
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "18px",
              letterSpacing: "0.01em",
              wordBreak: "break-word"
            }}
          >
            {String(heroTitle).replace(/\\n/g, "\n").split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <br />}
                {idx === 1 ? (
                  <span className="text-gold-gradient" style={{ fontWeight: 700, fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
                    {line}
                  </span>
                ) : (
                  line
                )}
              </React.Fragment>
            ))}
          </h1>

          {/* Subtitle with Stagger Reveal 3 */}
          <p 
            className="text-secondary text-reveal-item text-reveal-delay-3" 
            style={{
              fontSize: "clamp(0.92rem, 2vw, 1.12rem)",
              lineHeight: 1.65,
              marginBottom: "26px",
              maxWidth: "640px",
              fontWeight: 400
            }}
          >
            {heroSubtitle}
          </p>

          {/* Action Buttons with Stagger Reveal 4 */}
          <div 
            className="hero-btn-row text-reveal-item text-reveal-delay-4" 
            style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
          >
            <button
              onClick={handleExploreClick}
              className="btn btn-gold btn-lg"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(179, 135, 40, 0.4)"
              }}
            >
              <span>{hero.primaryBtnText || "Explore All Products"}</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={handleCategoryScroll}
              className="btn btn-secondary btn-lg"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderColor: "var(--border-gold)",
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)"
              }}
            >
              <Layers size={17} style={{ color: "var(--accent-gold)" }} />
              <span>{hero.secondaryBtnText || "Browse Categories"}</span>
            </button>
          </div>

          {/* Feature Highlights Bar */}
          <div 
            className="text-reveal-item text-reveal-delay-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
              gap: "10px",
              marginTop: "36px",
              paddingTop: "22px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "clamp(0.76rem, 1.8vw, 0.84rem)",
              color: "var(--text-secondary)"
            }}
          >
            <div 
              className="glass-panel-hover"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "9px", 
                padding: "9px 14px", 
                background: "rgba(255,255,255,0.92)", 
                borderRadius: "var(--radius-sm)", 
                border: "1px solid var(--border-gold)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <Sparkles size={16} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
              <span><strong>Artisan Handcrafted</strong> Silks</span>
            </div>

            <div 
              className="glass-panel-hover"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "9px", 
                padding: "9px 14px", 
                background: "rgba(255,255,255,0.92)", 
                borderRadius: "var(--radius-sm)", 
                border: "1px solid var(--border-gold)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <ShieldCheck size={16} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
              <span><strong>WhatsApp</strong> Fit Verification</span>
            </div>

            <div 
              className="glass-panel-hover"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "9px", 
                padding: "9px 14px", 
                background: "rgba(255,255,255,0.92)", 
                borderRadius: "var(--radius-sm)", 
                border: "1px solid var(--border-gold)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <QrCode size={16} style={{ color: "#25d366", flexShrink: 0 }} />
              <span><strong>Direct UPI</strong> Payment</span>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hero-btn-row {
            flex-direction: column;
            width: 100%;
          }
          .hero-btn-row .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};
