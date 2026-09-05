import React, { useState, useEffect } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { NotificationToast } from "./components/common/NotificationToast";
import { HeroBanner } from "./components/storefront/HeroBanner";
import { ProductGrid } from "./components/storefront/ProductGrid";
import { ProductDetailPage } from "./components/storefront/ProductDetailPage";
import { CustomerExperienceSection } from "./components/storefront/CustomerExperienceSection";
import { CartDrawer } from "./components/storefront/CartDrawer";
import { CheckoutModal } from "./components/storefront/CheckoutModal";
import { OrderSuccessModal } from "./components/storefront/OrderSuccessModal";
import { OrderTrackingModal } from "./components/storefront/OrderTrackingModal";
import { QuickViewModal } from "./components/common/QuickViewModal";
import { SizeGuideModal } from "./components/common/SizeGuideModal";
import { AdminAuthModal } from "./components/common/AdminAuthModal";
import { AdminLayout } from "./components/admin/AdminLayout";
import { MessageCircle, Sparkles } from "lucide-react";
import { createGeneralInquiryUrl } from "./utils/whatsapp";

const MainContent = () => {
  const { 
    currentView, 
    selectedProductId, 
    settings, 
    isAdminAuthenticated, 
    isAdminAuthModalOpen, 
    setIsAdminAuthModalOpen 
  } = useStore();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Desktop subtle cursor spotlight tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    // Quick luxury initial loader
    const timer = setTimeout(() => {
      setIsLoadingInitial(false);
    }, 600);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // Universal Click Ripple Wave for All Interactive Buttons & Cards (Admin + Storefront)
  useEffect(() => {
    const handlePointerDown = (e) => {
      const target = e.target.closest("button, .btn, a.btn, [role='button'], .category-pill, .size-btn, .admin-nav-item, .tab-btn, .badge-clickable, .icon-btn, .social-icon-btn, .card-action-btn, .qty-btn, .wishlist-toggle-btn, .filter-chip");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "click-ripple-wave";

      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      const prevPos = window.getComputedStyle(target).position;
      if (prevPos === "static") {
        target.style.position = "relative";
      }
      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 500);
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  // If user navigated to admin and is authenticated, show Admin
  if (currentView === "admin" && isAdminAuthenticated) {
    return <AdminLayout />;
  }

  const handleFloatingWhatsApp = () => {
    const url = createGeneralInquiryUrl(settings.adminWhatsApp, "your collection", settings);
    window.open(url, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Luxury Initial Brand Splash Loader */}
      {isLoadingInitial && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#181512",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "var(--accent-gold-light)",
            transition: "opacity 0.45s ease-out",
            opacity: isLoadingInitial ? 1 : 0,
            pointerEvents: isLoadingInitial ? "all" : "none"
          }}
        >
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#ffffff",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 32px rgba(212, 175, 55, 0.6)",
            border: "2px solid var(--border-gold-bright)",
            animation: "pulseGlow 2s infinite"
          }}>
            <img src="/vanshra-logo.png" alt="Vanshra Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="font-display" style={{ fontSize: "1.4rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
            {settings.brandName || "VANSHRA"}
          </div>
        </div>
      )}

      {/* Desktop Spotlight Layer */}
      <div className="cursor-spotlight-layer" />

      {/* Toast notifications */}
      <NotificationToast />

      {/* Navigation Header (Clean Customer View - No Admin Buttons) */}
      <Navbar />

      {/* Main Storefront Body with Smooth View Transition */}
      <main style={{ flex: 1, position: "relative", zIndex: 2 }}>
        {selectedProductId ? (
          <ProductDetailPage key={selectedProductId} />
        ) : (
          <div className="page-view-transition">
            <HeroBanner />
            <ProductGrid />
            <CustomerExperienceSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Modals */}
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <QuickViewModal />
      <SizeGuideModal />

      {/* Secret Store Owner PIN Login Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
      />

      {/* Floating WhatsApp Help with Breathing Pulse */}
      <button
        onClick={handleFloatingWhatsApp}
        className="btn-whatsapp pulse-glow"
        style={{
          position: "fixed",
          bottom: "clamp(16px, 3.5vw, 24px)",
          right: "clamp(14px, 3.5vw, 24px)",
          zIndex: 90,
          borderRadius: "var(--radius-full)",
          padding: "clamp(10px, 2.5vw, 14px) clamp(16px, 3vw, 22px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 22px rgba(37, 211, 102, 0.45)"
        }}
        title="Chat with Us on WhatsApp"
      >
        <MessageCircle size={20} />
        <span style={{ fontSize: "clamp(0.78rem, 2vw, 0.90rem)", fontWeight: 700 }}>Chat with Us</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
