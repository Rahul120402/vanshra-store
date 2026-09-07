import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Calendar, 
  Download, 
  Layers, 
  PieChart as PieIcon, 
  BarChart3, 
  MapPin, 
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Zap,
  Activity
} from "lucide-react";

export const AdminAnalyticsView = ({ onQuickStock, onSelectOrder }) => {
  const { orders, products, settings, showToast } = useStore();
  const [timeRange, setTimeRange] = useState("all"); // "7days" | "30days" | "all"
  const [metricView, setMetricView] = useState("revenue"); // "revenue" | "orders"

  // 1. Calculate Comprehensive Analytics Metrics
  const analytics = useMemo(() => {
    // Filter orders by time range
    const now = new Date();
    const filteredOrders = orders.filter((order) => {
      if (timeRange === "all") return true;
      const orderDate = new Date(order.createdAt);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeRange === "7days") return diffDays <= 7;
      if (timeRange === "30days") return diffDays <= 30;
      return true;
    });

    // Confirmed sales volume (Confirmed, Dispatched, Delivered)
    const confirmedOrdersList = filteredOrders.filter((o) => ["Confirmed", "Dispatched", "Delivered"].includes(o.status));
    const totalRevenue = confirmedOrdersList.reduce((sum, o) => sum + o.total, 0);
    const confirmedRevenue = totalRevenue;
    const pendingInquiryRevenue = filteredOrders.filter((o) => o.status === "New").reduce((sum, o) => sum + o.total, 0);

    const totalOrdersCount = filteredOrders.length;
    const completedOrders = filteredOrders.filter((o) => o.status === "Delivered").length;
    const dispatchedOrders = filteredOrders.filter((o) => o.status === "Dispatched").length;
    const confirmedOrders = filteredOrders.filter((o) => o.status === "Confirmed").length;
    const newOrders = filteredOrders.filter((o) => o.status === "New").length;
    const cancelledOrders = filteredOrders.filter((o) => o.status === "Cancelled").length;

    const avgOrderValue = confirmedOrdersList.length > 0 
      ? Math.round(totalRevenue / confirmedOrdersList.length) 
      : 0;
    
    // Total units sold
    let totalUnitsSold = 0;
    const categorySales = {};
    const sizeDemand = { XXS: 0, XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 };
    const productSalesMap = {};
    const cityDemand = {};

    filteredOrders.forEach((order) => {
      if (order.status === "Cancelled") return;

      // City analytics
      const city = order.customer.city?.trim() || "Other";
      cityDemand[city] = (cityDemand[city] || 0) + 1;

      order.items?.forEach((item) => {
        const qty = Number(item.quantity) || 1;
        totalUnitsSold += qty;

        // Size demand
        if (item.size && sizeDemand[item.size] !== undefined) {
          sizeDemand[item.size] += qty;
        }

        // Product sales
        if (!productSalesMap[item.name]) {
          productSalesMap[item.name] = { name: item.name, units: 0, revenue: 0, image: item.image };
        }
        productSalesMap[item.name].units += qty;
        productSalesMap[item.name].revenue += item.price * qty;

        // Category sales (find product category if possible)
        const matchedProd = products.find((p) => p.id === item.productId || p.name === item.name);
        const cat = matchedProd?.category || "Kurtis";
        if (!categorySales[cat]) {
          categorySales[cat] = { category: cat, revenue: 0, units: 0 };
        }
        categorySales[cat].revenue += item.price * qty;
        categorySales[cat].units += qty;
      });
    });

    // Low stock items analysis
    const lowStockAlerts = [];
    products.forEach((p) => {
      Object.entries(p.sizes || {}).forEach(([size, stock]) => {
        if (stock <= 3) {
          lowStockAlerts.push({
            id: p.id,
            name: p.name,
            size,
            stock,
            image: p.images?.[0]
          });
        }
      });
    });

    // Top selling products sorted by revenue
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Categories sorted by revenue
    const sortedCategories = Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);

    // Top cities sorted
    const topCities = Object.entries(cityDemand)
      .map(([city, count]) => ({ city, count, percentage: Math.round((count / (totalOrdersCount || 1)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Fulfillment Rate
    const fulfillmentRate = totalOrdersCount > 0 
      ? Math.round(((dispatchedOrders + completedOrders) / totalOrdersCount) * 100) 
      : 100;

    return {
      filteredOrders,
      totalRevenue,
      confirmedRevenue,
      totalOrdersCount,
      completedOrders,
      dispatchedOrders,
      confirmedOrders,
      newOrders,
      cancelledOrders,
      avgOrderValue,
      totalUnitsSold,
      sizeDemand,
      topProducts,
      sortedCategories,
      topCities,
      lowStockAlerts,
      fulfillmentRate
    };
  }, [orders, products, timeRange]);

  // Export Sales Report CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast("No orders available to export", "info");
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Phone", "City", "State", "PIN", "Items", "Total Amount", "Status", "Payment Method"];
    const rows = orders.map((o) => [
      o.id || "N/A",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A",
      `"${(o.customer?.fullName || "Guest Customer").replace(/"/g, '""')}"`,
      `"${o.customer?.phone || ""}"`,
      `"${o.customer?.city || ""}"`,
      `"${o.customer?.state || ""}"`,
      `"${o.customer?.pincode || ""}"`,
      `"${(o.items || []).map((i) => `${i.name || "Item"} (${i.size || "-"}x${i.quantity || 1})`).join(", ")}"`,
      o.total || 0,
      o.status || "New",
      `"${o.paymentMethod || "Prepaid / UPI"}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vanshra_sales_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Sales Analytics CSV exported successfully!", "success");
  };

  const totalSizeUnits = Object.values(analytics.sizeDemand).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Top Header & Range Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-gold-dark)", fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Activity size={16} />
            <span>Business Intelligence & Performance</span>
          </div>
          <h2 className="font-serif" style={{ fontSize: "1.7rem", color: "var(--text-primary)", marginTop: "4px" }}>
            Executive Analytics Dashboard
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.86rem" }}>
            Real-time revenue metrics, order velocity, size demand trends, and stock analytics.
          </p>
        </div>

        {/* Action Controls & Range Selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Time Range Pills */}
          <div style={{
            display: "inline-flex",
            background: "var(--bg-secondary)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)"
          }}>
            {[
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" },
              { id: "all", label: "All Time" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  background: timeRange === tab.id ? "linear-gradient(135deg, var(--accent-gold-light) 0%, var(--accent-gold) 100%)" : "transparent",
                  color: timeRange === tab.id ? "#ffffff" : "var(--text-secondary)",
                  fontWeight: timeRange === tab.id ? 700 : 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            title="Download CSV report of all sales"
          >
            <Download size={15} style={{ color: "var(--accent-gold)" }} />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* 1. Key Performance Metric KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "16px"
      }}>
        {/* Total Gross Revenue */}
        <div className="glass-panel" style={{ padding: "22px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Revenue
            </span>
            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(212, 175, 55, 0.15)", color: "var(--accent-gold-dark)" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--accent-gold-dark)", lineHeight: 1.1 }}>
            {formatCurrency(analytics.totalRevenue, settings.currencySymbol)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--accent-emerald)", marginTop: "8px", fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>Verified Paid: {formatCurrency(analytics.confirmedRevenue, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* Total Orders & Conversion */}
        <div className="glass-panel" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Orders Volume
            </span>
            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
            {analytics.totalOrdersCount}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "8px" }}>
            <span>🟡 {analytics.newOrders} New • 🔵 {analytics.confirmedOrders} Paid</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="glass-panel" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Avg Order Value (AOV)
            </span>
            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
            {formatCurrency(analytics.avgOrderValue, settings.currencySymbol)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "8px" }}>
            <span>{analytics.totalUnitsSold} total garments ordered</span>
          </div>
        </div>

        {/* Fulfillment & Dispatch Rate */}
        <div className="glass-panel" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fulfillment Rate
            </span>
            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(147, 51, 234, 0.12)", color: "#9333ea" }}>
              <Truck size={20} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
            {analytics.fulfillmentRate}%
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--accent-emerald)", marginTop: "8px", fontWeight: 600 }}>
            <span>{analytics.dispatchedOrders + analytics.completedOrders} of {analytics.totalOrdersCount} dispatched</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts & Funnel Breakdown Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }} className="analytics-grid-two">
        
        {/* Order Status Distribution Funnel */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <PieIcon size={18} style={{ color: "var(--accent-gold)" }} />
                <span>Order Status Distribution</span>
              </h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Pipeline of customer orders from inquiry to delivery
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "New (Pending Size/UPI Call)", count: analytics.newOrders, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
              { label: "Confirmed (Payment Received)", count: analytics.confirmedOrders, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
              { label: "Dispatched (In Transit)", count: analytics.dispatchedOrders, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
              { label: "Delivered (Fulfilled)", count: analytics.completedOrders, color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
              { label: "Cancelled", count: analytics.cancelledOrders, color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" }
            ].map((st, idx) => {
              const pct = analytics.totalOrdersCount > 0 ? Math.round((st.count / analytics.totalOrdersCount) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{st.label}</span>
                    <span style={{ fontWeight: 700, color: st.color }}>{st.count} orders ({pct}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "9px", background: "var(--bg-secondary)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: st.color, borderRadius: "9999px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Size Demand & Fit Popularity Heatmap */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--accent-gold)" }} />
              <span>Size Demand Breakdown</span>
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Helps you stock & manufacture the most popular sizes
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: "10px", textAlign: "center" }}>
            {["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => {
              const count = analytics.sizeDemand[sz] || 0;
              const share = Math.round((count / totalSizeUnits) * 100);
              const isPopular = share >= 25;

              return (
                <div
                  key={sz}
                  style={{
                    padding: "16px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: isPopular ? "linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(255,255,255,1) 100%)" : "var(--bg-secondary)",
                    border: isPopular ? "1.5px solid var(--border-gold)" : "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isPopular ? "var(--accent-gold-dark)" : "var(--text-primary)" }}>
                    {sz}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {count}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: isPopular ? "var(--accent-emerald)" : "var(--text-muted)", fontWeight: 700 }}>
                    {share}% share
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "20px", padding: "12px", background: "rgba(212, 175, 55, 0.08)", borderRadius: "var(--radius-xs)", border: "1px dashed var(--border-gold)", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            💡 <strong>Inventory Tip:</strong> Sizes <strong>M</strong> and <strong>L</strong> consistently represent the highest volume for Indian silhouette apparel. Keep 2x buffer stock in these sizes.
          </div>
        </div>

      </div>

      {/* 3. Category Contribution & Top Products */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }} className="analytics-grid-two">
        
        {/* Category Contribution */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} style={{ color: "var(--accent-gold)" }} />
            <span>Category Revenue Share</span>
          </h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "18px" }}>
            Revenue generated by each product line
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {analytics.sortedCategories.length > 0 ? (
              analytics.sortedCategories.map((cat, idx) => {
                const pct = analytics.totalRevenue > 0 ? Math.round((cat.revenue / analytics.totalRevenue) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cat.category} ({cat.units} pcs)</span>
                      <span style={{ fontWeight: 700, color: "var(--accent-gold-dark)" }}>{formatCurrency(cat.revenue, settings.currencySymbol)} ({pct}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--bg-secondary)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-gold-light) 0%, var(--accent-gold) 100%)", borderRadius: "9999px" }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No category sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Silhouettes */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} style={{ color: "var(--accent-gold)" }} />
            <span>Top Performing Silhouettes</span>
          </h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "18px" }}>
            Best-selling designs ranked by total earnings
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: idx === 0 ? "var(--accent-gold)" : "var(--border-subtle)", color: idx === 0 ? "#ffffff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem" }}>
                    {idx + 1}
                  </span>
                  {p.image && (
                    <img src={p.image} alt={p.name} style={{ width: "36px", height: "46px", objectFit: "cover", borderRadius: "var(--radius-xs)" }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.86rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      {p.units} units sold
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--accent-gold-dark)", fontSize: "0.95rem" }}>
                    {formatCurrency(p.revenue, settings.currencySymbol)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Geographic Reach & Low Stock Urgency Monitor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="analytics-grid-two">
        
        {/* Top Cities */}
        <div className="glass-panel" style={{ padding: "26px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={18} style={{ color: "var(--accent-gold)" }} />
            <span>Top Patron Cities</span>
          </h3>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "18px" }}>
            Where your customers are ordering from
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {analytics.topCities.length > 0 ? (
              analytics.topCities.map((c, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-xs)" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.85rem" }}>
                    📍 {c.city}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--accent-gold-dark)", fontSize: "0.82rem" }}>
                    {c.count} orders ({c.percentage}%)
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No customer addresses logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Urgency Monitor */}
        <div className="glass-panel" style={{ padding: "26px", border: analytics.lowStockAlerts.length > 0 ? "1.5px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} style={{ color: "var(--accent-ruby)" }} />
              <span>Low Stock Alerts ({analytics.lowStockAlerts.length})</span>
            </h3>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "18px" }}>
            Sizes with 3 or fewer units remaining in stock
          </span>

          <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
            {analytics.lowStockAlerts.length > 0 ? (
              analytics.lowStockAlerts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: item.stock === 0 ? "rgba(244, 63, 94, 0.08)" : "var(--bg-secondary)",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.84rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: item.stock === 0 ? "var(--accent-ruby)" : "var(--accent-amber)", fontWeight: 700 }}>
                      Size: {item.size} • {item.stock === 0 ? "OUT OF STOCK (0)" : `Only ${item.stock} left`}
                    </div>
                  </div>

                  {onQuickStock && (
                    <button
                      onClick={() => onQuickStock({ id: item.id, name: item.name, sizes: { [item.size]: item.stock } })}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                    >
                      <Zap size={12} style={{ color: "var(--accent-gold)" }} />
                      <span>Restock</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--accent-emerald)", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                <span>All sizes and inventory are healthy!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .analytics-grid-two {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};
