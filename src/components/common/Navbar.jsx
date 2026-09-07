import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Truck, 
  X,
  MessageCircle
} from "lucide-react";

export const Navbar = () => {
  const { 
    settings, 
    cart, 
    totalCartItemCount, 
    openCart, 
    navigateToHome,
    searchQuery, 
    setSearchQuery,
    openOrderTracking
  } = useStore();

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bagAnimated, setBagAnimated] = useState(false);

  // Dynamic scroll listener for glassmorphism elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger bag bounce animation whenever cart count changes
  useEffect(() => {
    if (totalCartItemCount > 0) {
      setBagAnimated(true);
      const timer = setTimeout(() => setBagAnimated(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalCartItemCount]);

  return (
    <header className="storefront-header" style={{
      position: "sticky",
      top: 0,
      zIndex: 999,
      width: "100%",
      maxWidth: "100vw",
      background: isScrolled 
        ? "linear-gradient(180deg, rgba(254, 250, 242, 0.97) 0%, rgba(248, 240, 226, 0.97) 100%)" 
        : "linear-gradient(180deg, #fdf9f1 0%, #f6ecdc 100%)",
      backdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "blur(16px)",
      WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "blur(16px)",
      borderBottom: "1.5px solid rgba(197, 150, 50, 0.32)",
      boxShadow: isScrolled ? "0 8px 30px rgba(44, 30, 10, 0.09)" : "0 4px 18px rgba(44, 30, 10, 0.05)",
      transition: "background var(--transition-base), box-shadow var(--transition-base), backdrop-filter var(--transition-base)"
    }}>
      {/* Top Header Announcement Bar (Dynamic Luxury Ticker) */}
      <div style={{
        background: "linear-gradient(90deg, #1c1917 0%, #292524 30%, #3a3222 50%, #292524 70%, #1c1917 100%)",
        color: "var(--accent-gold-light)",
        padding: "5px 10px",
        textAlign: "center",
        fontSize: "clamp(0.64rem, 1.8vw, 0.75rem)",
        fontWeight: 700,
        letterSpacing: "0.06em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
        textTransform: "uppercase",
        overflow: "hidden",
        lineHeight: 1.25
      }}>
        <Sparkles size={11} style={{ color: "var(--accent-gold-light)", flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {settings.announcementText && settings.announcementText.trim()
            ? settings.announcementText
            : "Bespoke Handcrafted Apparel • WhatsApp Fit Verification • Express Dispatch"}
        </span>
        <Sparkles size={11} style={{ color: "var(--accent-gold-light)", flexShrink: 0 }} />
      </div>

      {/* Main Navigation Bar */}
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: isScrolled ? "clamp(58px, 7vw, 70px)" : "clamp(64px, 8vw, 78px)",
        gap: "clamp(8px, 2vw, 20px)",
        transition: "height var(--transition-base)"
      }}>
        
        {/* Brand Logo & Royal Emblem */}
        <div style={{ display: "flex", alignItems: "center", minWidth: 0, flexShrink: 1 }}>
          <button
            onClick={navigateToHome}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 1.8vw, 14px)",
              padding: 0,
              minWidth: 0,
              textAlign: "left"
            }}
            title="Return to Home Catalog"
          >
            {/* Peacock Emblem with crisp golden ring */}
            <div style={{
              width: isScrolled ? "clamp(34px, 7vw, 44px)" : "clamp(38px, 8vw, 50px)",
              height: isScrolled ? "clamp(34px, 7vw, 44px)" : "clamp(38px, 8vw, 50px)",
              borderRadius: "50%",
              background: "#ffffff",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(44, 30, 10, 0.12)",
              border: "1.5px solid var(--accent-gold-dark)",
              overflow: "hidden",
              transition: "all var(--transition-base)",
              flexShrink: 0
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06) rotate(3deg)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
            >
              <img
                src="/vanshra-logo.png"
                alt="Vanshra Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "contain"
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <h1 className="font-display" style={{
                fontSize: isScrolled ? "clamp(1.10rem, 3.8vw, 1.7rem)" : "clamp(1.2rem, 4vw, 1.88rem)",
                letterSpacing: "0.10em",
                color: "var(--text-primary)",
                textTransform: "uppercase",
                lineHeight: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "font-size var(--transition-base)"
              }}>
                {settings.brandName || "VANSHRA"}
              </h1>
              <span className="nav-tagline" style={{
                fontSize: "clamp(0.55rem, 1.4vw, 0.70rem)",
                letterSpacing: "0.04em",
                color: "var(--accent-gold-dark)",
                fontFamily: "var(--font-sans)",
                fontStyle: "italic",
                display: "block",
                marginTop: "2px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {settings.tagline || "Crafted for Comfort, Worn with Grace"}
              </span>
            </div>
          </button>
        </div>

        {/* Search Bar (Desktop) */}
        <div style={{
          flex: 1,
          maxWidth: "380px",
          display: "none",
          alignItems: "center",
          position: "relative"
        }} className="desktop-search">
          <Search size={15} style={{ position: "absolute", left: "14px", color: "var(--accent-gold-dark)" }} />
          <input
            type="text"
            placeholder="Search kurtis, co-ords, silks, tops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: "40px",
              paddingRight: searchQuery ? "34px" : "14px",
              height: "40px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.86rem",
              background: "#ffffff",
              border: "1.5px solid rgba(197, 150, 50, 0.35)",
              boxShadow: "0 2px 8px rgba(44, 30, 10, 0.04)"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 10px)", flexShrink: 0 }}>
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="mobile-search-btn"
            style={{
              background: "#ffffff",
              border: "1.5px solid rgba(197, 150, 50, 0.35)",
              borderRadius: "var(--radius-full)",
              width: "clamp(36px, 8vw, 40px)",
              height: "clamp(36px, 8vw, 40px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-gold-dark)",
              cursor: "pointer",
              boxShadow: "var(--shadow-xs)",
              flexShrink: 0,
              transition: "all var(--transition-fast)"
            }}
            title="Search Catalog"
          >
            <Search size={16} />
          </button>

          {/* WhatsApp Support Quick Pill */}
          <a
            href={`https://wa.me/${(settings.adminWhatsApp || "919876543210").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Vanshra Team, I would like assistance regarding your latest collection.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm hide-on-tablet nav-link-indicator"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "var(--radius-full)",
              textDecoration: "none",
              background: "#ffffff",
              borderColor: "rgba(37, 211, 102, 0.5)",
              color: "#128c7e",
              fontWeight: 700
            }}
            title="Chat with Us on WhatsApp"
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#25d366", display: "inline-block" }} />
            <span>WhatsApp Help</span>
          </a>

          {/* Track Order Button */}
          <button
            onClick={openOrderTracking}
            className="btn btn-secondary btn-sm nav-link-indicator"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#ffffff",
              border: "1.5px solid rgba(197, 150, 50, 0.35)",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              padding: "clamp(5px, 1.2vw, 7px) clamp(8px, 1.8vw, 14px)",
              flexShrink: 0
            }}
            title="Track Your Order"
          >
            <Truck size={15} style={{ color: "var(--accent-gold)" }} />
            <span className="hide-on-mobile">Track</span>
          </button>

          {/* Shopping Bag Button with Glowing Pulse Badge & Pop animation */}
          <button
            onClick={openCart}
            className="btn btn-gold"
            style={{
              borderRadius: "var(--radius-full)",
              padding: "clamp(6px, 1.4vw, 9px) clamp(12px, 2.4vw, 18px)",
              fontSize: "clamp(0.80rem, 1.8vw, 0.88rem)",
              position: "relative",
              fontWeight: 700,
              boxShadow: "0 4px 18px rgba(179, 135, 40, 0.38)",
              flexShrink: 0,
              animation: bagAnimated ? "bagBounce 0.5s ease" : "none"
            }}
          >
            <ShoppingBag size={16} />
            <span>Bag</span>
            {totalCartItemCount > 0 && (
              <span style={{
                background: "#ffffff",
                color: "var(--accent-gold-dark)",
                fontSize: "0.70rem",
                fontWeight: 800,
                padding: "1px 6px",
                borderRadius: "var(--radius-full)",
                marginLeft: "3px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}>
                {totalCartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {isSearchVisible && (
        <div style={{
          padding: "8px 14px 12px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          animation: "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search catalog by dress, size, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              autoFocus
              style={{
                paddingLeft: "38px",
                borderRadius: "var(--radius-full)",
                height: "38px",
                fontSize: "0.88rem",
                border: "1.5px solid var(--border-gold)"
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-search { display: flex !important; }
          .mobile-search-btn { display: none !important; }
        }
        @media (max-width: 860px) {
          .hide-on-tablet { display: none !important; }
        }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-tagline { display: none !important; }
        }
      `}</style>
    </header>
  );
};
