import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { 
  createAdminToCustomerConfirmUrl, 
  createAdminToCustomerDispatchUrl 
} from "../../utils/whatsapp";
import { PackingSlipModal } from "./PackingSlipModal";
import { 
  X, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  Package, 
  Printer, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Clock, 
  User, 
  ExternalLink 
} from "lucide-react";

export const OrderDetailModal = ({ order, isOpen, onClose }) => {
  const { updateOrderStatus, deleteOrder, settings, showToast } = useStore();

  const [currentStatus, setCurrentStatus] = useState(order?.status || "New");
  const [courierPartner, setCourierPartner] = useState(order?.dispatchInfo?.courierPartner || "");
  const [trackingNumber, setTrackingNumber] = useState(order?.dispatchInfo?.trackingNumber || "");
  const [adminNotes, setAdminNotes] = useState(order?.dispatchInfo?.notes || "");
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status || "New");
      setCourierPartner(order.dispatchInfo?.courierPartner || "");
      setTrackingNumber(order.dispatchInfo?.trackingNumber || "");
      setAdminNotes(order.dispatchInfo?.notes || "");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSaveStatusAndDispatch = () => {
    updateOrderStatus(order.id, currentStatus, {
      courierPartner,
      trackingNumber,
      notes: adminNotes,
      dispatchDate: currentStatus === "Dispatched" ? (order.dispatchInfo?.dispatchDate || new Date().toISOString().split("T")[0]) : order.dispatchInfo?.dispatchDate
    });
    showToast(`Order #${order.id} status updated to ${currentStatus}!`, "success");
  };

  const handleWhatsAppConfirm = () => {
    const phone = order.customer?.phone || "";
    const url = createAdminToCustomerConfirmUrl(phone, order, settings);
    window.open(url, "_blank");
  };

  const handleWhatsAppDispatch = () => {
    const phone = order.customer?.phone || "";
    const url = createAdminToCustomerDispatchUrl(phone, {
      ...order,
      dispatchInfo: { courierPartner, trackingNumber, notes: adminNotes }
    }, settings);
    window.open(url, "_blank");
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete order #${order.id}?`)) {
      deleteOrder(order.id);
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "840px", maxHeight: "92vh" }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 className="font-serif" style={{ fontSize: "1.4rem", color: "var(--text-primary)" }}>
                    Order #{order.id}
                  </h3>
                  <span className={`badge badge-${currentStatus.toLowerCase()}`}>
                    {currentStatus}
                  </span>
                </div>
                <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                  Placed on {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => setIsPackingSlipOpen(true)}
                className="btn btn-secondary btn-sm"
                title="Print Packing Slip"
              >
                <Printer size={15} />
                <span>Print Slip</span>
              </button>

              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
                title="Delete Order"
              >
                <Trash2 size={15} />
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Grid */}
          <div style={{ padding: "clamp(14px, 3vw, 24px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "clamp(14px, 3vw, 24px)" }}>
            
            {/* Left: Customer Info & WhatsApp Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Customer Contact Card */}
              <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-gold-light)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={16} />
                  <span>Customer Details</span>
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: "0.75rem", display: "block" }}>Full Name</span>
                    <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{order.customer?.fullName || "Valued Customer"}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <span className="text-muted" style={{ fontSize: "0.75rem", display: "block" }}>Phone / WhatsApp</span>
                      <strong style={{ color: "var(--text-primary)" }}>{order.customer?.phone || "N/A"}</strong>
                    </div>
                    {order.customer?.phone && (
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "5px 10px" }}
                        title="Direct Phone Call"
                      >
                        <Phone size={14} style={{ color: "var(--accent-gold)" }} />
                        <span>Call</span>
                      </a>
                    )}
                  </div>

                  {order.customer?.email && (
                    <div>
                      <span className="text-muted" style={{ fontSize: "0.75rem", display: "block" }}>Email</span>
                      <a href={`mailto:${order.customer.email}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                        {order.customer.email}
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="text-muted" style={{ fontSize: "0.75rem", display: "block" }}>Shipping Address</span>
                    <span style={{ color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {order.customer?.address || "Address on WhatsApp"}, {order.customer?.city || ""}, {order.customer?.state || ""} {order.customer?.pincode ? `- ${order.customer.pincode}` : ""}
                    </span>
                  </div>

                  {order.customer?.notes && (
                    <div style={{ padding: "10px", background: "rgba(203, 163, 88, 0.08)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-gold)", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold-light)", display: "block" }}>Customer Delivery Notes:</span>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.82rem" }}>{order.customer.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Click WhatsApp Customer Support Center */}
              <div style={{
                background: "rgba(37, 211, 102, 0.08)",
                border: "1px solid rgba(37, 211, 102, 0.3)",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#25d366", fontWeight: 700, fontSize: "0.92rem" }}>
                  <MessageCircle size={18} />
                  <span>1-Click WhatsApp Communication</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Connect directly with {order.customer?.fullName || "Customer"} on WhatsApp with pre-formatted messages:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={handleWhatsAppConfirm}
                    className="btn btn-whatsapp btn-sm"
                    style={{ justifyContent: "flex-start", padding: "10px 14px" }}
                  >
                    <MessageCircle size={16} />
                    <span>Send Order & Size Confirmation</span>
                  </button>

                  <button
                    onClick={handleWhatsAppDispatch}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: "flex-start", padding: "10px 14px", borderColor: "rgba(37, 211, 102, 0.4)", color: "#25d366" }}
                  >
                    <Truck size={16} />
                    <span>Send Dispatch & Courier Tracking</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Order Status Management & Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Status & Dispatch Update Panel */}
              <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-gold-light)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={16} />
                  <span>Manage Order Status & Dispatch</span>
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Status Dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Order Status
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className="input-field"
                      style={{ fontWeight: 700 }}
                    >
                      <option value="New">🟡 New / Pending Verification</option>
                      <option value="Confirmed">🔵 Confirmed (Ready to Pack)</option>
                      <option value="Dispatched">🟠 Dispatched / In Transit</option>
                      <option value="Delivered">🟢 Delivered Successfully</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>
                  </div>

                  {/* Courier Partner */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BlueDart / Delhivery"
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Tracking / AWB Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BD98472918IN"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Internal Admin Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                      Admin Notes (Internal dispatch notes)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Customer verified size M over WhatsApp"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <button
                    onClick={handleSaveStatusAndDispatch}
                    className="btn btn-gold btn-sm"
                    style={{ width: "100%", marginTop: "6px" }}
                  >
                    <Save size={15} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-gold-light)", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                  <span>Items Ordered ({(order.items || []).length})</span>
                  <span style={{ color: "var(--accent-gold-dark)" }}>Total: {formatCurrency(order.total, settings.currencySymbol)}</span>
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
                      <img src={item.image} alt={item.name} style={{ width: "45px", height: "55px", objectFit: "cover", borderRadius: "var(--radius-xs)" }} />
                      <div style={{ flex: 1, fontSize: "0.85rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                          Size: <strong style={{ color: "var(--accent-gold-light)", padding: "1px 5px", background: "var(--bg-surface-elevated)", borderRadius: "3px" }}>{item.size}</strong> • Color: {item.color} • Qty: <strong>{item.quantity}</strong>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--accent-gold-light)" }}>
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  <span>Subtotal: {formatCurrency(order.subtotal, settings.currencySymbol)}</span>
                  <span>Shipping: {order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee, settings.currencySymbol)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Packing Slip Modal */}
      <PackingSlipModal
        order={order}
        isOpen={isPackingSlipOpen}
        onClose={() => setIsPackingSlipOpen(false)}
      />
    </>
  );
};
