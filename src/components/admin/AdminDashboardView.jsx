import React from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate, getTotalStock } from "../../utils/formatters";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus, 
  Sparkles
} from "lucide-react";

export const AdminDashboardView = ({ onSelectOrder, onAddProduct, onOpenStockAdjust }) => {
  const { metrics, orders, products, settings, setAdminTab } = useStore();

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter((o) => o.status === "New");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 26px)" }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(203, 163, 88, 0.15) 0%, rgba(250, 248, 245, 0.95) 100%)",
        border: "1.5px solid var(--border-gold)",
        borderRadius: "var(--radius-lg)",
        padding: "clamp(16px, 3vw, 26px)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 4px 18px rgba(44, 30, 10, 0.04)"
      }}>
        <div style={{ flex: "1 1 280px" }}>
          <span style={{ fontSize: "0.76rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-gold-dark)", fontWeight: 800 }}>
            Executive Store Overview
          </span>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", color: "var(--text-primary)", marginTop: "2px", lineHeight: 1.2 }}>
            {settings.brandName || "VANSHRA"} Control Center
          </h2>
          <p className="text-secondary" style={{ fontSize: "clamp(0.80rem, 1.8vw, 0.88rem)", marginTop: "4px" }}>
            {pendingOrders.length > 0
              ? `You have ${pendingOrders.length} new order${pendingOrders.length > 1 ? "s" : ""} requiring WhatsApp confirmation!`
              : "All customer orders are verified and up to date."}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button onClick={() => setAdminTab("analytics")} className="btn btn-secondary btn-sm" style={{ padding: "8px 14px" }}>
            <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
            <span>Analytics</span>
          </button>

          <button onClick={onAddProduct} className="btn btn-gold btn-sm" style={{ padding: "8px 14px", fontWeight: 700 }}>
            <Plus size={15} />
            <span>Add Design</span>
          </button>

          <button onClick={() => setAdminTab("orders")} className="btn btn-secondary btn-sm" style={{ padding: "8px 14px" }}>
            <span>Orders ({orders.length})</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
        gap: "clamp(10px, 2vw, 16px)"
      }}>
        {/* Total Confirmed Revenue */}
        <div className="glass-panel" style={{ padding: "clamp(14px, 2.5vw, 20px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Sales</span>
            <span style={{ padding: "4px", background: "rgba(203, 163, 88, 0.15)", color: "var(--accent-gold)", borderRadius: "var(--radius-xs)" }}>
              <DollarSign size={15} />
            </span>
          </div>
          <div className="font-serif" style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)", fontWeight: 800, color: "var(--accent-gold-dark)" }}>
            {formatCurrency(metrics.totalRevenue, settings.currencySymbol)}
          </div>
          <div style={{ fontSize: "0.70rem", color: "var(--accent-emerald-dark)", fontWeight: 700, marginTop: "4px" }}>
            ✓ {metrics.confirmedUnitsSold} items sold
          </div>
        </div>

        {/* New / Pending Orders */}
        <div className="glass-panel" style={{ padding: "clamp(14px, 2.5vw, 20px)", borderColor: metrics.newOrdersCount > 0 ? "var(--border-gold-bright)" : "var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>New (Pending)</span>
            <span style={{ padding: "4px", background: "rgba(244, 63, 94, 0.15)", color: "#e11d48", borderRadius: "var(--radius-xs)" }}>
              <Clock size={15} />
            </span>
          </div>
          <div className="font-serif" style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)", fontWeight: 800, color: metrics.newOrdersCount > 0 ? "var(--accent-ruby)" : "var(--text-primary)" }}>
            {metrics.newOrdersCount}
          </div>
          <span style={{ fontSize: "0.70rem", color: "var(--accent-gold-dark)", fontWeight: 600 }}>Needs WhatsApp Call</span>
        </div>

        {/* Confirmed Orders */}
        <div className="glass-panel" style={{ padding: "clamp(14px, 2.5vw, 20px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>Confirmed</span>
            <span style={{ padding: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#2563eb", borderRadius: "var(--radius-xs)" }}>
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className="font-serif" style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)", fontWeight: 800, color: "var(--text-primary)" }}>
            {metrics.confirmedCount}
          </div>
          <span style={{ fontSize: "0.70rem", color: "var(--text-secondary)" }}>Ready for Courier</span>
        </div>

        {/* In Transit / Dispatched */}
        <div className="glass-panel" style={{ padding: "clamp(14px, 2.5vw, 20px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>Dispatched</span>
            <span style={{ padding: "4px", background: "rgba(217, 119, 6, 0.15)", color: "#d97706", borderRadius: "var(--radius-xs)" }}>
              <Truck size={15} />
            </span>
          </div>
          <div className="font-serif" style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)", fontWeight: 800, color: "var(--text-primary)" }}>
            {metrics.dispatchedCount}
          </div>
          <span style={{ fontSize: "0.70rem", color: "var(--text-secondary)" }}>Active in Transit</span>
        </div>
      </div>

      {/* Grid: Recent Orders Feed & Low Stock Warnings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "clamp(16px, 3vw, 24px)" }}>
        
        {/* Recent Orders Panel */}
        <div className="glass-panel" style={{ padding: "clamp(16px, 3vw, 22px)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recent Orders
            </h3>
            <button
              onClick={() => setAdminTab("orders")}
              style={{ background: "transparent", border: "none", color: "var(--accent-gold-dark)", fontSize: "0.80rem", cursor: "pointer", fontWeight: 700 }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "0.88rem" }}>#{order.id}</strong>
                    <span className={`badge badge-${order.status.toLowerCase()}`} style={{ fontSize: "0.66rem", padding: "2px 6px" }}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {order.customer?.fullName || "Guest Customer"} • {(order.items || []).length} item{(order.items || []).length > 1 ? "s" : ""}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--accent-gold-dark)", fontSize: "0.92rem" }}>
                    {formatCurrency(order.total, settings.currencySymbol)}
                  </div>
                  <div style={{ fontSize: "0.70rem", color: "var(--text-muted)" }}>
                    {formatDate(order.createdAt).split(",")[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="glass-panel" style={{ padding: "clamp(16px, 3vw, 22px)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} style={{ color: "var(--accent-ruby)" }} />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Stock & Sizing Alerts
              </h3>
            </div>
            <button
              onClick={() => setAdminTab("products")}
              style={{ background: "transparent", border: "none", color: "var(--accent-gold-dark)", fontSize: "0.80rem", cursor: "pointer", fontWeight: 700 }}
            >
              Catalog Inventory →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {products
              .filter((p) => {
                const total = getTotalStock(p.sizes);
                const hasOutOfStockSize = Object.values(p.sizes || {}).some((cnt) => Number(cnt) === 0);
                return total <= 8 || hasOutOfStockSize;
              })
              .slice(0, 4)
              .map((prod) => {
                return (
                  <div
                    key={prod.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <img src={prod.images?.[0]} alt={prod.name} style={{ width: "40px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-xs)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name}</div>
                      <div style={{ display: "flex", gap: "3px", marginTop: "3px", flexWrap: "wrap" }}>
                        {Object.entries(prod.sizes || {}).map(([sz, cnt]) => (
                          <span
                            key={sz}
                            style={{
                              fontSize: "0.66rem",
                              padding: "1px 5px",
                              borderRadius: "3px",
                              background: cnt === 0 ? "rgba(244,63,94,0.15)" : cnt <= 2 ? "rgba(245,158,11,0.15)" : "var(--bg-surface-elevated)",
                              color: cnt === 0 ? "#e11d48" : cnt <= 2 ? "#d97706" : "var(--text-secondary)",
                              fontWeight: 700
                            }}
                          >
                            {sz}:{cnt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenStockAdjust(prod)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                    >
                      Restock
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

    </div>
  );
};
