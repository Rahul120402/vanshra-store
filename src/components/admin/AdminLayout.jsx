import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { AdminDashboardView } from "./AdminDashboardView";
import { AdminAnalyticsView } from "./AdminAnalyticsView";
import { AdminOrdersView } from "./AdminOrdersView";
import { AdminProductsView } from "./AdminProductsView";
import { AdminSettingsView } from "./AdminSettingsView";
import { OrderDetailModal } from "./OrderDetailModal";
import { ProductFormModal } from "./ProductFormModal";
import { QuickStockModal } from "./QuickStockModal";
import { WhatsAppTemplatesModal } from "./WhatsAppTemplatesModal";
import { 
  LayoutDashboard, 
  BarChart3,
  ShoppingBag, 
  Layers, 
  Settings, 
  MessageCircle, 
  ShieldCheck,
  Store
} from "lucide-react";

export const AdminLayout = () => {
  const { 
    adminTab, 
    setAdminTab, 
    setCurrentView, 
    settings, 
    metrics, 
    orders, 
    selectedOrderForDetail, 
    setSelectedOrderForDetail,
    logoutAdmin
  } = useStore();

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductFormOpen(true);
  };

  const handleOpenQuickStock = (prod) => {
    setStockProduct(prod);
    setIsQuickStockOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", maxWidth: "100vw", overflowX: "hidden" }}>
      
      {/* Top Admin Header Bar */}
      <header style={{
        background: "var(--bg-secondary)",
        borderBottom: "1.5px solid var(--border-gold)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 18px rgba(44, 30, 10, 0.05)"
      }}>
        {/* Upper Brand & Action Header */}
        <div className="container" style={{
          paddingTop: "clamp(10px, 2vw, 14px)",
          paddingBottom: "clamp(8px, 1.5vw, 12px)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            
            {/* Brand & Portal Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)", minWidth: 0, flex: "1 1 auto" }}>
              <div style={{
                width: "clamp(34px, 8vw, 42px)",
                height: "clamp(34px, 8vw, 42px)",
                borderRadius: "50%",
                background: "#ffffff",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--border-gold-bright)",
                boxShadow: "0 0 14px rgba(212, 175, 55, 0.35)",
                flexShrink: 0
              }}>
                <img src="/vanshra-logo.png" alt="Vanshra Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <h1 className="font-display" style={{
                    fontSize: "clamp(1.1rem, 3.5vw, 1.4rem)",
                    color: "var(--text-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    lineHeight: 1.1,
                    margin: 0
                  }}>
                    {settings.brandName || "VANSHRA"}
                  </h1>
                  <span style={{
                    fontSize: "0.62rem",
                    padding: "2px 7px",
                    background: "linear-gradient(135deg, #f7e09e 0%, #d4af37 50%, #b38728 100%)",
                    color: "#1a1408",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(255,255,255,0.6)"
                  }}>
                    Portal
                  </span>
                </div>
                <span className="admin-header-subtitle text-muted" style={{
                  fontSize: "clamp(0.68rem, 1.8vw, 0.75rem)",
                  display: "block",
                  marginTop: "1px",
                  fontWeight: 500
                }}>
                  No-Code Catalog & Order Dispatch
                </span>
              </div>
            </div>

            {/* Right Header Navigation & Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 10px",
                  fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
                  borderColor: "rgba(37, 211, 102, 0.4)",
                  color: "#128c7e",
                  fontWeight: 700
                }}
                title="WhatsApp Message Templates"
              >
                <MessageCircle size={14} style={{ color: "#25d366", flexShrink: 0 }} />
                <span className="hide-on-mobile">WhatsApp Templates</span>
              </button>

              <button
                onClick={() => {
                  if (window.location.hash === "#admin") {
                    window.history.pushState(null, "", window.location.pathname);
                  }
                  setCurrentView("store");
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 10px",
                  fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
                  fontWeight: 600
                }}
                title="Return to Customer Storefront"
              >
                <Store size={14} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                <span className="hide-on-mobile">Storefront</span>
              </button>

              <button
                onClick={logoutAdmin}
                className="btn btn-danger btn-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 10px",
                  fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
                  fontWeight: 700
                }}
                title="Securely Lock Admin Portal"
              >
                <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                <span>Exit</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab Navigation Bar with Smooth Horizontal Touch Scroll */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(8px)"
        }}>
          <div className="container" style={{
            display: "flex",
            gap: "clamp(4px, 1.5vw, 8px)",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingTop: "2px",
            paddingBottom: "0px"
          }}>
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag, badge: metrics.newOrdersCount },
              { id: "products", label: "Products & Stock", icon: Layers },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "clamp(10px, 2vw, 12px) clamp(10px, 2vw, 16px)",
                    background: "transparent",
                    border: "none",
                    borderBottom: isActive ? "2.5px solid var(--accent-gold-dark)" : "2.5px solid transparent",
                    color: isActive ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(0.76rem, 2vw, 0.86rem)",
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? "var(--accent-gold-dark)" : "inherit", flexShrink: 0 }} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span style={{
                      fontSize: "0.64rem",
                      padding: "1px 5px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--accent-ruby)",
                      color: "#fff",
                      fontWeight: 800,
                      lineHeight: 1.2
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content View */}
      <main style={{ flex: 1, padding: "clamp(16px, 3vw, 32px) 0 60px" }}>
        <div className="container">
          {adminTab === "overview" && (
            <AdminDashboardView
              onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
              onAddProduct={handleOpenAddProduct}
              onOpenStockAdjust={handleOpenQuickStock}
            />
          )}

          {adminTab === "analytics" && (
            <AdminAnalyticsView
              onQuickStock={handleOpenQuickStock}
              onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
            />
          )}

          {adminTab === "orders" && (
            <AdminOrdersView
              onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
            />
          )}

          {adminTab === "products" && (
            <AdminProductsView
              onAddProduct={handleOpenAddProduct}
              onEditProduct={handleOpenEditProduct}
              onQuickStock={handleOpenQuickStock}
            />
          )}

          {adminTab === "settings" && <AdminSettingsView />}
        </div>
      </main>

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        isOpen={Boolean(selectedOrderForDetail)}
        onClose={() => setSelectedOrderForDetail(null)}
      />

      <ProductFormModal
        product={editingProduct}
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
      />

      <QuickStockModal
        product={stockProduct}
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
      />

      <WhatsAppTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <style>{`
        @media (max-width: 480px) {
          .admin-header-subtitle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
