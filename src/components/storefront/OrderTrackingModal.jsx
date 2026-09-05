import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";
import { 
  X, 
  Search, 
  Truck, 
  AlertCircle
} from "lucide-react";

export const OrderTrackingModal = () => {
  const { isOrderTrackingOpen, setIsOrderTrackingOpen, orders, settings } = useStore();
  const [searchInput, setSearchInput] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    setSearchAttempted(true);
    const found = orders.find(
      (o) =>
        o.id.toUpperCase() === query ||
        o.customer.phone.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, "")) ||
        (o.customer.email && o.customer.email.toLowerCase() === searchInput.trim().toLowerCase())
    );
    setSearchedOrder(found || null);
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case "New": return 0;
      case "Confirmed": return 1;
      case "Dispatched": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const steps = [
    { title: "Placed", desc: "Awaiting confirmation" },
    { title: "Confirmed", desc: "Verified fit" },
    { title: "Dispatched", desc: "In transit" },
    { title: "Delivered", desc: "Doorstep" }
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsOrderTrackingOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(620px, calc(100vw - 16px))",
          padding: 0,
          maxHeight: "min(94vh, calc(100dvh - 16px))",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "clamp(14px, 3vw, 20px) clamp(16px, 3.5vw, 24px)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255,255,255,1) 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-serif" style={{ fontSize: "clamp(1.15rem, 3vw, 1.3rem)", color: "var(--text-primary)" }}>
              Track Your Order
            </h3>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
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

        {/* Content */}
        <div style={{ padding: "clamp(16px, 3.5vw, 24px)", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Order ID (e.g. VAN-1001) or Phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "36px" }}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-gold" style={{ padding: "8px 20px" }}>
              Track
            </button>
          </form>

          {/* Search Results */}
          {searchedOrder ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Order Status Card */}
              <div style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-gold)",
                padding: "clamp(14px, 3vw, 18px)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--accent-gold-dark)", fontWeight: 700 }}>
                      Order Status
                    </span>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      #{searchedOrder.id}
                    </h4>
                  </div>
                  <span className={`badge badge-${searchedOrder.status.toLowerCase()}`}>
                    {searchedOrder.status}
                  </span>
                </div>

                {/* Stepper Progress */}
                {searchedOrder.status !== "Cancelled" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", margin: "14px 0 12px" }}>
                    {steps.map((step, idx) => {
                      const currentIdx = getStatusStepIndex(searchedOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={idx} style={{ textAlign: "center" }}>
                          <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: isComplete ? "var(--accent-gold)" : "var(--bg-surface-elevated)",
                            color: isComplete ? "#000" : "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 4px",
                            fontWeight: 700,
                            fontSize: "0.70rem",
                            boxShadow: isCurrent ? "0 0 10px rgba(203, 163, 88, 0.4)" : "none"
                          }}>
                            {isComplete ? "✓" : idx + 1}
                          </div>
                          <div style={{ fontSize: "0.70rem", fontWeight: 700, color: isComplete ? "var(--text-primary)" : "var(--text-muted)" }}>
                            {step.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dispatch Details if available */}
                {searchedOrder.dispatchInfo?.trackingNumber && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    background: "rgba(203, 163, 88, 0.08)",
                    border: "1px solid var(--border-gold)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.80rem"
                  }}>
                    <div style={{ color: "var(--accent-gold-dark)", fontWeight: 700 }}>
                      Courier: {searchedOrder.dispatchInfo.courierPartner || "Express Partner"}
                    </div>
                    <div style={{ color: "var(--text-primary)", marginTop: "2px" }}>
                      Tracking: <strong>{searchedOrder.dispatchInfo.trackingNumber}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h5 style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "8px" }}>
                  Garments in this Order
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 10px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <img src={item.image} alt={item.name} style={{ width: "32px", height: "40px", objectFit: "cover", borderRadius: "var(--radius-xs)", flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: "0.78rem", minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.70rem" }}>Size: {item.size} • Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--accent-gold-dark)", flexShrink: 0 }}>
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : searchAttempted ? (
            <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--text-muted)" }}>
              <AlertCircle size={32} style={{ color: "var(--accent-ruby)", margin: "0 auto 10px" }} />
              <h4 style={{ color: "var(--text-primary)", marginBottom: "4px", fontSize: "0.95rem" }}>No Order Found</h4>
              <p style={{ fontSize: "0.80rem" }}>
                We could not find an order matching "{searchInput}". Please verify the Order ID or phone number.
              </p>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};
