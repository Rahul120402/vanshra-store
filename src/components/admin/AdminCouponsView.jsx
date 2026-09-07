import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Sparkles, 
  X, 
  Percent, 
  CheckCircle2, 
  XCircle,
  ShoppingBag,
  SlidersHorizontal
} from "lucide-react";

export const AdminCouponsView = () => {
  const { 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon, 
    toggleCouponStatus, 
    settings, 
    showToast 
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // "All" | "percentage" | "flat" | "active"

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    value: 10,
    minOrder: 999,
    maxDiscount: 500,
    isActive: true,
    description: ""
  });

  const [copiedCode, setCopiedCode] = useState("");

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      value: 10,
      minOrder: 999,
      maxDiscount: 500,
      isActive: true,
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      value: coupon.value || 0,
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount || 0,
      isActive: coupon.isActive !== false,
      description: coupon.description || ""
    });
    setIsModalOpen(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Promo code "${code}" copied to clipboard!`, "success");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      showToast("Please enter a valid coupon code", "error");
      return;
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        code: cleanCode,
        discountType: formData.discountType,
        value: Number(formData.value) || 0,
        minOrder: Number(formData.minOrder) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        isActive: formData.isActive,
        description: formData.description
      });
    } else {
      addCoupon({
        code: cleanCode,
        discountType: formData.discountType,
        value: Number(formData.value) || 0,
        minOrder: Number(formData.minOrder) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        isActive: formData.isActive,
        description: formData.description
      });
    }

    setIsModalOpen(false);
  };

  const filteredCoupons = (coupons || []).filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterType === "active") return c.isActive !== false;
    if (filterType === "percentage") return c.discountType === "percentage";
    if (filterType === "flat") return c.discountType === "flat";
    return true;
  });

  const activeCount = (coupons || []).filter((c) => c.isActive !== false).length;
  const percentageCount = (coupons || []).filter((c) => c.discountType === "percentage").length;
  const flatCount = (coupons || []).filter((c) => c.discountType === "flat").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header & Quick Stats */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(179, 135, 40, 0.1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-gold-dark)",
              border: "1px solid var(--border-gold)"
            }}>
              <Tag size={18} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: "var(--text-primary)", margin: 0 }}>
                Discount Coupons & Offers
              </h2>
              <span style={{ fontSize: "0.80rem", color: "var(--text-secondary)" }}>
                Manage customer promo codes, minimum cart values, and instant discounts
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-gold btn-md"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px"
      }}>
        <div style={{
          padding: "14px 18px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(212, 175, 55, 0.12)",
            color: "var(--accent-gold-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Tag size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Coupons</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>{coupons.length}</div>
          </div>
        </div>

        <div style={{
          padding: "14px 18px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.12)",
            color: "var(--accent-emerald)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Active Promos</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--accent-emerald)" }}>{activeCount}</div>
          </div>
        </div>

        <div style={{
          padding: "14px 18px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Percent size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Percentage % Off</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>{percentageCount}</div>
          </div>
        </div>

        <div style={{
          padding: "14px 18px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.12)",
            color: "#a855f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Flat ₹ Off</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>{flatCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        background: "var(--bg-secondary)",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)"
      }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "All", label: "All Coupons" },
            { id: "active", label: "Active Only" },
            { id: "percentage", label: "Percentage %" },
            { id: "flat", label: "Flat ₹ Discount" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                border: filterType === f.id ? "1.5px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                background: filterType === f.id ? "var(--accent-gold-light)" : "#ffffff",
                color: filterType === f.id ? "#1a1408" : "var(--text-secondary)",
                fontSize: "0.76rem",
                fontWeight: filterType === f.id ? 800 : 600,
                cursor: "pointer"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px",
              fontSize: "0.80rem",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              background: "#ffffff"
            }}
          />
        </div>
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-subtle)"
        }}>
          <Tag size={40} style={{ margin: "0 auto 12px", opacity: 0.3, color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700 }}>No coupons found</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
            Create custom promo codes to boost boutique orders and reward loyal customers.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-gold btn-sm">
            Create First Coupon
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px"
        }}>
          {filteredCoupons.map((coupon) => {
            const isPercentage = coupon.discountType === "percentage";
            const isActive = coupon.isActive !== false;

            return (
              <div
                key={coupon.id}
                style={{
                  background: "#ffffff",
                  border: isActive ? "1.5px solid var(--border-gold)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: isActive ? "0 4px 15px rgba(212, 175, 55, 0.08)" : "none",
                  opacity: isActive ? 1 : 0.7,
                  position: "relative",
                  transition: "all var(--transition-fast)"
                }}
              >
                <div>
                  {/* Card Header: Code & Active Toggle */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "var(--accent-gold-dark)",
                        letterSpacing: "0.06em",
                        background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(253, 251, 247, 0.9) 100%)",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-gold)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: copiedCode === coupon.code ? "var(--accent-emerald)" : "var(--text-muted)",
                          cursor: "pointer",
                          padding: "4px"
                        }}
                        title="Copy Promo Code"
                      >
                        {copiedCode === coupon.code ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>

                    <button
                      onClick={() => toggleCouponStatus(coupon.id)}
                      style={{
                        padding: "3px 9px",
                        borderRadius: "var(--radius-full)",
                        border: "none",
                        background: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(120, 113, 108, 0.15)",
                        color: isActive ? "var(--accent-emerald-dark)" : "var(--text-muted)",
                        fontSize: "0.70rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      title="Click to toggle status"
                    >
                      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </button>
                  </div>

                  {/* Discount Offer Big Title */}
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                    {isPercentage ? `${coupon.value}% Instant Discount` : `Flat ₹${coupon.value} OFF`}
                  </div>

                  <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 14px" }}>
                    {coupon.description || "Valid on all handcrafted silhouettes and seasonal styles."}
                  </p>

                  {/* Conditions Details */}
                  <div style={{
                    background: "var(--bg-secondary)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.76rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    color: "var(--text-secondary)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Min Cart Value:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(coupon.minOrder || 0, settings.currencySymbol)}</strong>
                    </div>

                    {isPercentage && coupon.maxDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Max Discount Cap:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(coupon.maxDiscount, settings.currencySymbol)}</strong>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Discount Type:</span>
                      <strong style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{coupon.discountType}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "16px",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "12px"
                }}>
                  <button
                    onClick={() => handleOpenEdit(coupon)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "0.75rem" }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete promo code "${coupon.code}"?`)) {
                        deleteCoupon(coupon.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "0.75rem" }}
                    title="Delete Coupon"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px", width: "100%", padding: "clamp(18px, 3vw, 26px)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={18} style={{ color: "var(--accent-gold)" }} />
                <h3 className="font-serif" style={{ fontSize: "1.25rem", color: "var(--text-primary)", margin: 0 }}>
                  {editingCoupon ? "Edit Coupon Code" : "Create New Coupon Code"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Promo Code */}
              <div>
                <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Promo Code (Uppercase without spaces) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20, WELCOME100"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  required
                  style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}
                />
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="input-field"
                    style={{ background: "#ffffff" }}
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="flat">Flat Amount (₹) Off</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    {formData.discountType === "percentage" ? "Discount Percentage (%) *" : "Discount Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === "percentage" ? "100" : "50000"}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Minimum Order & Max Cap */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999 (0 for no min)"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500 (0 for no cap)"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="input-field"
                    disabled={formData.discountType === "flat"}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Offer Description / Terms (Shown to Customer)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% Instant Discount on orders above ₹999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent-gold-dark)" }}
                />
                <label htmlFor="couponActiveCheck" style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)", cursor: "pointer" }}>
                  Active (Customers can apply this coupon immediately)
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-md"
                >
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
