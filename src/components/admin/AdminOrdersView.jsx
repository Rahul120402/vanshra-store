import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate, getMonthKey, formatMonthYear } from "../../utils/formatters";
import { createAdminConfirmMessage } from "../../utils/whatsapp";
import { 
  Search, 
  Filter, 
  Eye, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Calendar,
  MapPin,
  X,
  TrendingUp,
  Layers,
  Trash2,
  Lock,
  ShieldAlert
} from "lucide-react";

export const AdminOrdersView = ({ onSelectOrder }) => {
  const { orders, updateOrderStatus, clearAllOrders, settings } = useStore();
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Security confirmation for clearing orders
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearPinInput, setClearPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const STATUS_CONFIG = {
    New: { color: "var(--accent-ruby)", bg: "rgba(244, 63, 94, 0.12)", icon: Clock },
    Confirmed: { color: "var(--accent-gold-dark)", bg: "rgba(212, 175, 55, 0.15)", icon: CheckCircle2 },
    Dispatched: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", icon: Truck },
    Delivered: { color: "var(--accent-emerald)", bg: "rgba(16, 185, 129, 0.12)", icon: CheckCircle2 },
    Cancelled: { color: "var(--text-muted)", bg: "rgba(120, 113, 108, 0.12)", icon: XCircle }
  };

  const VALID_SALES_STATUSES = useMemo(() => new Set(["Confirmed", "Dispatched", "Delivered"]), []);

  // 1. Compute dynamic list of available months from existing orders
  const availableMonths = useMemo(() => {
    const monthsMap = new Map();

    // Include current active month
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    monthsMap.set(currentKey, {
      key: currentKey,
      label: formatMonthYear(currentKey),
      count: 0,
      totalRevenue: 0
    });

    // Populate from all past and current orders
    orders.forEach((order) => {
      const key = getMonthKey(order?.createdAt);
      if (key && key !== "unknown") {
        const existing = monthsMap.get(key) || {
          key,
          label: formatMonthYear(key),
          count: 0,
          totalRevenue: 0
        };
        existing.count += 1;
        if (VALID_SALES_STATUSES.has(order?.status)) {
          existing.totalRevenue += (Number(order?.total) || 0);
        }
        monthsMap.set(key, existing);
      }
    });

    // Sort descending by month key (newest first)
    return Array.from(monthsMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [orders, VALID_SALES_STATUSES]);

  // 2. Filter orders by Month, Status, and Search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order) return false;
      const orderMonthKey = getMonthKey(order.createdAt);
      const matchesMonth = selectedMonth === "All" || orderMonthKey === selectedMonth;
      const matchesStatus = filterStatus === "All" || order.status === filterStatus;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (order.id && order.id.toLowerCase().includes(term)) ||
        (order.customer?.fullName && order.customer.fullName.toLowerCase().includes(term)) ||
        (order.customer?.phone && order.customer.phone.includes(term)) ||
        (order.customer?.city && order.customer.city.toLowerCase().includes(term)) ||
        (Array.isArray(order.items) && order.items.some((it) => it.name && it.name.toLowerCase().includes(term)));

      return matchesMonth && matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, selectedMonth, filterStatus, searchTerm]);

  // 3. Group filtered orders month-wise
  const ordersByMonth = useMemo(() => {
    const groups = {};

    filteredOrders.forEach((order) => {
      const key = getMonthKey(order.createdAt);
      if (!groups[key]) {
        groups[key] = {
          key,
          label: formatMonthYear(key),
          orders: [],
          totalRevenue: 0,
          newCount: 0,
          confirmedCount: 0,
          dispatchedCount: 0,
          deliveredCount: 0,
          cancelledCount: 0
        };
      }
      groups[key].orders.push(order);
      if (VALID_SALES_STATUSES.has(order.status)) {
        groups[key].totalRevenue += (Number(order.total) || 0);
      }

      if (order.status === "New") groups[key].newCount++;
      else if (order.status === "Confirmed") groups[key].confirmedCount++;
      else if (order.status === "Dispatched") groups[key].dispatchedCount++;
      else if (order.status === "Delivered") groups[key].deliveredCount++;
      else if (order.status === "Cancelled") groups[key].cancelledCount++;
    });

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredOrders, VALID_SALES_STATUSES]);

  const handleStatusChange = (e, orderId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    updateOrderStatus(orderId, newStatus);
  };

  const handleQuickWhatsApp = (e, order) => {
    e.stopPropagation();
    const url = createAdminConfirmMessage(order, settings);
    window.open(url, "_blank");
  };

  const handleResetFilters = () => {
    setSelectedMonth("All");
    setFilterStatus("All");
    setSearchTerm("");
  };

  const handleConfirmClearOrders = (e) => {
    e?.preventDefault?.();
    const currentAdminPin = String(settings.adminPin || "1234").trim();
    const entered = String(clearPinInput).trim();
    if (entered === currentAdminPin) {
      clearAllOrders();
      setIsClearModalOpen(false);
      setClearPinInput("");
      setPinError("");
    } else {
      setPinError("Incorrect PIN! Please enter your valid Admin PIN.");
    }
  };

  const handleOpenClearModal = () => {
    setClearPinInput("");
    setPinError("");
    setIsClearModalOpen(true);
  };

  const hasActiveFilters = selectedMonth !== "All" || filterStatus !== "All" || searchTerm !== "";

  // Confirmed, Dispatched, Delivered orders in current filter set
  const salesOrders = useMemo(() => {
    return filteredOrders.filter((o) => VALID_SALES_STATUSES.has(o.status));
  }, [filteredOrders, VALID_SALES_STATUSES]);

  const totalFilteredRevenue = useMemo(() => {
    // If specifically filtered by a single non-All status (e.g. user selected "New"), show that specific status sum
    if (filterStatus !== "All") {
      return filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    }
    // Otherwise, Total Sales is strictly Confirmed + Dispatched + Delivered
    return salesOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [filteredOrders, filterStatus, salesOrders]);

  const displayOrdersCount = filterStatus === "All" ? salesOrders.length : filteredOrders.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              Customer Orders ({orders.length})
            </h2>
            <p className="text-secondary" style={{ fontSize: "clamp(0.78rem, 1.8vw, 0.86rem)", marginTop: "3px" }}>
              Monthly categorized WhatsApp orders, sizing verifications, and dispatches.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Quick Stats Summary Pill */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              background: "var(--bg-surface-elevated)", 
              padding: "6px 14px", 
              borderRadius: "var(--radius-full)", 
              border: "1px solid var(--border-gold)" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                <TrendingUp size={15} />
                <span>{filterStatus !== "All" ? `Filtered (${filterStatus}):` : "Total Sales:"}</span>
              </div>
              <span className="font-serif" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {formatCurrency(totalFilteredRevenue, settings.currencySymbol)}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "10px" }}>
                {displayOrdersCount} {displayOrdersCount === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.length > 0 && (
              <button
                onClick={handleOpenClearModal}
                className="btn btn-secondary btn-sm"
                style={{ 
                  height: "34px", 
                  padding: "0 12px", 
                  fontSize: "0.78rem", 
                  color: "var(--accent-ruby)", 
                  borderColor: "rgba(244, 63, 94, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                title="Clear all orders (requires PIN)"
              >
                <Lock size={13} />
                <span>Clear All Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges & Search (Responsive Row) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "min(100%, 200px)" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search order ID, customer, city, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", height: "38px", fontSize: "0.85rem", width: "100%" }}
            />
          </div>

          {/* Month Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "0 1 auto" }}>
            <Calendar size={15} style={{ color: "var(--accent-gold-dark)", flexShrink: 0 }} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
              style={{ 
                height: "38px", 
                padding: "0 10px", 
                fontSize: "0.84rem", 
                fontWeight: 600, 
                width: "auto",
                borderColor: selectedMonth !== "All" ? "var(--accent-gold)" : "var(--border-subtle)",
                background: selectedMonth !== "All" ? "rgba(212, 175, 55, 0.08)" : "#ffffff"
              }}
            >
              <option value="All">All Months (All Time • {orders.length})</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  🗓️ {m.label} ({m.count} {m.count === 1 ? "order" : "orders"})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "0 1 auto" }}>
            <Filter size={15} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
              style={{ height: "38px", padding: "0 10px", fontSize: "0.84rem", fontWeight: 600, width: "auto" }}
            >
              <option value="All">All Statuses ({orders.length})</option>
              <option value="New">🟡 New Orders</option>
              <option value="Confirmed">🔵 Confirmed & Paid</option>
              <option value="Dispatched">🟠 Dispatched</option>
              <option value="Delivered">🟢 Delivered</option>
              <option value="Cancelled">🔴 Cancelled</option>
            </select>
          </div>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ height: "38px", padding: "0 12px", fontSize: "0.80rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
              title="Reset all filters to show all orders"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Month Selector Tabs / Horizontal Pills */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          overflowX: "auto", 
          paddingBottom: "4px",
          scrollbarWidth: "none"
        }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", flexShrink: 0 }}>
            Quick Month:
          </span>

          <button
            onClick={() => setSelectedMonth("All")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              border: selectedMonth === "All" ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-subtle)",
              background: selectedMonth === "All" ? "var(--accent-gold-dark)" : "#ffffff",
              color: selectedMonth === "All" ? "#ffffff" : "var(--text-primary)",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              boxShadow: selectedMonth === "All" ? "0 2px 8px rgba(184, 134, 11, 0.25)" : "none"
            }}
          >
            All Time ({orders.length})
          </button>

          {availableMonths.map((m) => {
            const isSelected = selectedMonth === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "var(--accent-gold-dark)" : "#ffffff",
                  color: isSelected ? "#ffffff" : "var(--text-primary)",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: isSelected ? "0 2px 8px rgba(184, 134, 11, 0.25)" : "none"
                }}
              >
                <span>{m.label}</span>
                <span style={{ 
                  background: isSelected ? "rgba(255,255,255,0.25)" : "var(--bg-secondary)", 
                  padding: "1px 6px", 
                  borderRadius: "10px", 
                  fontSize: "0.70rem" 
                }}>
                  {m.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month-wise Grouped Orders Display */}
      {ordersByMonth.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {ordersByMonth.map((group) => (
            <div 
              key={group.key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                padding: "clamp(12px, 2vw, 16px)",
                border: "1.5px solid var(--border-gold)"
              }}
            >
              {/* Monthly Group Header Banner */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                paddingBottom: "10px",
                borderBottom: "1.5px solid rgba(212, 175, 55, 0.25)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid var(--border-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-gold-dark)"
                  }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      {group.label}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      <span>{group.orders.length} {group.orders.length === 1 ? "Order" : "Orders"}</span>
                      {group.newCount > 0 && (
                        <span style={{ color: "var(--accent-ruby)", fontWeight: 700 }}>• {group.newCount} New</span>
                      )}
                      {group.confirmedCount > 0 && (
                        <span style={{ color: "var(--accent-gold-dark)", fontWeight: 700 }}>• {group.confirmedCount} Confirmed</span>
                      )}
                      {group.deliveredCount > 0 && (
                        <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>• {group.deliveredCount} Delivered</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monthly Subtotal Pill */}
                <div style={{
                  background: "#ffffff",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-gold)",
                  textAlign: "right"
                }}>
                  <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
                    Monthly Revenue
                  </div>
                  <div className="font-serif" style={{ fontSize: "0.98rem", fontWeight: 800, color: "var(--accent-gold-dark)" }}>
                    {formatCurrency(group.totalRevenue, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Mobile Order Cards for this month */}
              <div className="admin-orders-mobile-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {group.orders.map((order) => {
                  const custName = order.customer?.fullName || "Guest Customer";
                  const custPhone = order.customer?.phone || "";
                  const custCity = order.customer?.city || "";
                  const custState = order.customer?.state || "";

                  return (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="glass-panel"
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        boxShadow: "0 2px 10px rgba(44, 30, 10, 0.04)",
                        background: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      {/* Card Header: ID, Date, and Status Selector */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
                            #{order.id}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                            {formatDate(order.createdAt)}
                          </div>
                        </div>

                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={order.status || "New"}
                            onChange={(e) => handleStatusChange(e, order.id)}
                            style={{
                              cursor: "pointer",
                              outline: "none",
                              fontSize: "0.76rem",
                              fontWeight: 700,
                              padding: "5px 10px",
                              borderRadius: "var(--radius-full)",
                              border: `1.5px solid ${STATUS_CONFIG[order.status]?.color || "var(--border-subtle)"}`,
                              background: STATUS_CONFIG[order.status]?.bg || "#ffffff",
                              color: STATUS_CONFIG[order.status]?.color || "var(--text-primary)",
                              display: "inline-block",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                            }}
                          >
                            <option value="New">🟡 New</option>
                            <option value="Confirmed">🔵 Confirmed</option>
                            <option value="Dispatched">🟠 Dispatched</option>
                            <option value="Delivered">🟢 Delivered</option>
                            <option value="Cancelled">🔴 Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.90rem" }}>
                            {custName}
                          </div>
                          {custPhone && (
                            <div style={{ fontSize: "0.82rem", color: "var(--accent-gold-dark)", fontWeight: 700, marginTop: "2px" }}>
                              {custPhone}
                            </div>
                          )}
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                            <span>{custCity ? `${custCity}, ${custState}` : "Direct Order"}</span>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div style={{ textAlign: "right" }}>
                          <div className="font-serif" style={{ fontWeight: 800, color: "var(--accent-gold-dark)", fontSize: "1.1rem" }}>
                            {formatCurrency(order.total, settings.currencySymbol)}
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "var(--accent-emerald)", fontWeight: 700 }}>
                            Prepaid (UPI)
                          </span>
                        </div>
                      </div>

                      {/* Ordered Items Pill Breakdown */}
                      <div style={{ background: "var(--bg-surface-elevated)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {(order.items || []).map((item, i) => (
                          <div key={i} style={{ fontSize: "0.80rem", color: "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                              • {item.name}
                            </span>
                            <span style={{ fontSize: "0.74rem", fontWeight: 700 }}>
                              <strong style={{ color: "var(--accent-gold-dark)", padding: "1px 6px", background: "#ffffff", border: "1px solid var(--border-gold)", borderRadius: "4px", marginRight: "4px" }}>
                                {item.size}
                              </strong>
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Mobile Action Buttons Bar */}
                      <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleQuickWhatsApp(e, order)}
                          className="btn btn-whatsapp"
                          style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem", fontWeight: 700 }}
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </button>

                        {custPhone && (
                          <a
                            href={`tel:${custPhone}`}
                            className="btn btn-secondary"
                            style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                            title="Call Customer"
                          >
                            <Phone size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => onSelectOrder(order)}
                          className="btn btn-secondary"
                          style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                          title="View Full Order"
                        >
                          <Eye size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View for this month */}
              <div className="admin-orders-desktop-table glass-panel" style={{ overflow: "hidden", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-surface-elevated)", color: "var(--accent-gold-dark)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem" }}>Order ID & Date</th>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem" }}>Customer Details</th>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem" }}>Items & Sizes</th>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem" }}>Total (Prepaid)</th>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem" }}>Status</th>
                        <th style={{ padding: "12px 16px", fontSize: "0.82rem", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.orders.map((order, idx) => {
                        const custName = order.customer?.fullName || "Guest Customer";
                        const custPhone = order.customer?.phone || "";
                        const custCity = order.customer?.city || "";
                        const custState = order.customer?.state || "";

                        return (
                          <tr
                            key={order.id}
                            onClick={() => onSelectOrder(order)}
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              background: idx % 2 === 1 ? "rgba(250, 248, 245, 0.6)" : "transparent",
                              cursor: "pointer",
                              transition: "background 0.15s ease"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212, 175, 55, 0.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 1 ? "rgba(250, 248, 245, 0.6)" : "transparent")}
                          >
                            {/* ID & Date */}
                            <td style={{ padding: "14px 16px" }}>
                              <strong style={{ color: "var(--text-primary)", display: "block", fontSize: "0.92rem" }}>
                                #{order.id}
                              </strong>
                              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                {formatDate(order.createdAt)}
                              </span>
                            </td>

                            {/* Customer */}
                            <td style={{ padding: "14px 16px" }}>
                              <strong style={{ color: "var(--text-primary)", display: "block" }}>
                                {custName}
                              </strong>
                              {custPhone && (
                                <span style={{ fontSize: "0.8rem", color: "var(--accent-gold-dark)", fontWeight: 600 }}>
                                  {custPhone}
                                </span>
                              )}
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {custCity ? `${custCity}, ${custState}` : "Direct Order"}
                              </div>
                            </td>

                            {/* Items & Sizes */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {(order.items || []).map((item, i) => (
                                  <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                                    • {item.name} <strong style={{ color: "var(--accent-gold-dark)", padding: "1px 5px", background: "var(--bg-secondary)", borderRadius: "3px" }}>{item.size}</strong> ({item.color}) x{item.quantity}
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Total */}
                            <td style={{ padding: "14px 16px" }}>
                              <strong style={{ color: "var(--accent-gold-dark)", fontSize: "1.05rem" }}>
                                {formatCurrency(order.total, settings.currencySymbol)}
                              </strong>
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                                Prepaid (UPI)
                              </span>
                            </td>

                            {/* Status Dropdown */}
                            <td 
                              style={{ padding: "14px 16px" }} 
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={order.status || "New"}
                                onChange={(e) => handleStatusChange(e, order.id)}
                                style={{
                                  cursor: "pointer",
                                  outline: "none",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  padding: "5px 10px",
                                  borderRadius: "var(--radius-full)",
                                  border: `1.5px solid ${STATUS_CONFIG[order.status]?.color || "var(--border-subtle)"}`,
                                  background: STATUS_CONFIG[order.status]?.bg || "#ffffff",
                                  color: STATUS_CONFIG[order.status]?.color || "var(--text-primary)",
                                  display: "inline-block",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                                }}
                              >
                                <option value="New">🟡 New</option>
                                <option value="Confirmed">🔵 Confirmed</option>
                                <option value="Dispatched">🟠 Dispatched</option>
                                <option value="Delivered">🟢 Delivered</option>
                                <option value="Cancelled">🔴 Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: "14px 16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                <button
                                  onClick={(e) => handleQuickWhatsApp(e, order)}
                                  className="btn btn-whatsapp btn-sm"
                                  style={{ padding: "6px 10px" }}
                                  title="Chat with customer on WhatsApp"
                                >
                                  <MessageCircle size={15} />
                                  <span>WhatsApp</span>
                                </button>

                                {custPhone && (
                                  <a
                                    href={`tel:${custPhone}`}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: "6px 10px" }}
                                    title="Call Customer Directly"
                                  >
                                    <Phone size={14} />
                                  </a>
                                )}

                                <button
                                  onClick={() => onSelectOrder(order)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: "6px 10px" }}
                                  title="View Full Order"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 24px", 
          color: "var(--text-muted)", 
          background: "var(--bg-surface)", 
          borderRadius: "var(--radius-lg)", 
          border: "1px dashed var(--border-gold)",
          maxWidth: "600px",
          margin: "20px auto"
        }}>
          {orders.length === 0 ? (
            <>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.12)",
                color: "var(--accent-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <Clock size={28} />
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                No Orders Yet
              </h3>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto" }}>
                All demo orders have been removed. As customers place orders on your website or confirm over WhatsApp, their real orders will appear here automatically.
              </p>
            </>
          ) : (
            <>
              <Clock size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <h4 style={{ color: "var(--text-primary)", marginBottom: "4px" }}>No Matching Orders Found</h4>
              <p style={{ fontSize: "0.85rem", marginBottom: "16px" }}>
                {searchTerm 
                  ? `No orders matched search query "${searchTerm}"` 
                  : selectedMonth !== "All"
                  ? `No orders found for ${formatMonthYear(selectedMonth)} with status "${filterStatus}"`
                  : `No orders with status "${filterStatus}"`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.84rem" }}
                >
                  Reset Filters & View All Orders
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Security Verification Modal for Clearing All Orders */}
      {isClearModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClearModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: "440px", padding: "28px 24px", borderRadius: "var(--radius-lg)" }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.12)",
                color: "var(--accent-ruby)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px"
              }}>
                <ShieldAlert size={28} />
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                Security Verification
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Enter your <strong>Admin Security PIN</strong> to confirm permanent deletion of all orders.
              </p>
            </div>

            <form onSubmit={handleConfirmClearOrders} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Admin PIN / Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter PIN (e.g. 1234)"
                    value={clearPinInput}
                    onChange={(e) => {
                      setClearPinInput(e.target.value);
                      if (pinError) setPinError("");
                    }}
                    className="input-field"
                    style={{
                      paddingLeft: "36px",
                      height: "42px",
                      letterSpacing: "3px",
                      fontSize: "1rem",
                      borderColor: pinError ? "var(--accent-ruby)" : "var(--border-subtle)"
                    }}
                  />
                </div>
                {pinError && (
                  <p style={{ color: "var(--accent-ruby)", fontSize: "0.78rem", marginTop: "6px", fontWeight: 600 }}>
                    {pinError}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: "42px", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1.2, height: "42px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <Trash2 size={15} />
                  <span>Confirm Clear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .admin-orders-mobile-list {
            display: none !important;
          }
          .admin-orders-desktop-table {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .admin-orders-desktop-table {
            display: none !important;
          }
          .admin-orders-mobile-list {
            display: flex !important;
          }
        }
      `}</style>

    </div>
  );
};
