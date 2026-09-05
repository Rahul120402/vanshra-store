import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { STANDARD_SIZES } from "../../data/initialData";
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  Palette, 
  Layers,
  DollarSign
} from "lucide-react";

export const ProductFormModal = ({ product, isOpen, onClose }) => {
  const { addProduct, updateProduct, settings, addCategory, showToast } = useStore();

  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    name: "",
    category: settings.categories[1] || "Dresses",
    price: "",
    originalPrice: "",
    sku: "",
    description: "",
    fabricCare: "",
    images: [""],
    colors: [{ name: "Standard", hex: "#111827" }],
    sizes: {
      S: 5,
      M: 5,
      L: 5,
      XL: 5,
      XXL: 0
    },
    isNew: true,
    isBestSeller: false
  });

  const [newCatInput, setNewCatInput] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "Dresses",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        sku: product.sku || "",
        description: product.description || "",
        fabricCare: product.fabricCare || "",
        images: product.images?.length ? product.images : [""],
        colors: product.colors?.length ? product.colors : [{ name: "Standard", hex: "#111827" }],
        sizes: {
          S: product.sizes?.S ?? 0,
          M: product.sizes?.M ?? 0,
          L: product.sizes?.L ?? 0,
          XL: product.sizes?.XL ?? 0,
          XXL: product.sizes?.XXL ?? 0
        },
        isNew: Boolean(product.isNew),
        isBestSeller: Boolean(product.isBestSeller)
      });
    } else {
      setFormData({
        name: "",
        category: settings.categories.find((c) => c !== "All") || "Dresses",
        price: "",
        originalPrice: "",
        sku: `MOH-${Math.floor(100 + Math.random() * 900)}`,
        description: "",
        fabricCare: "Premium fabric. Dry clean recommended.",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80"],
        colors: [{ name: "Classic Onyx", hex: "#1a1a1a" }],
        sizes: { S: 5, M: 8, L: 5, XL: 2, XXL: 0 },
        isNew: true,
        isBestSeller: false
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleRemoveImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: prev.images[0] === "" ? [reader.result] : [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: "New Color", hex: "#cba358" }]
    }));
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleSizeStockChange = (size, value) => {
    const count = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: count
      }
    }));
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setFormData((prev) => ({ ...prev, category: newCatInput.trim() }));
    setNewCatInput("");
    setShowNewCatInput(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please enter a product name", "warning");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      showToast("Please enter a valid price", "warning");
      return;
    }

    const cleanedImages = formData.images.filter((img) => img.trim() !== "");
    if (cleanedImages.length === 0) {
      showToast("Please provide at least one product photo", "warning");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      sku: formData.sku || `MOH-${Math.floor(1000 + Math.random() * 9000)}`,
      description: formData.description.trim() || "Elegant apparel piece designed with fine tailoring and premium silhouette.",
      fabricCare: formData.fabricCare.trim() || "Dry clean only.",
      images: cleanedImages,
      colors: formData.colors,
      sizes: formData.sizes,
      isNew: formData.isNew,
      isBestSeller: formData.isBestSeller
    };

    if (isEditing) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "860px", maxHeight: "92vh", padding: 0 }}
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
          <div>
            <span style={{ fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: 700 }}>
              No-Code Catalog Management
            </span>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", color: "var(--text-primary)" }}>
              {isEditing ? `Edit: ${product.name}` : "Add New Clothing Design"}
            </h2>
          </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "clamp(16px, 3vw, 28px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Basic Info: Name, Category, SKU */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Product Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Crimson Silk Peplum Gown"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  style={{ background: "transparent", border: "none", color: "var(--accent-gold)", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {showNewCatInput ? "Cancel" : "+ New Category"}
                </button>
              </div>

              {!showNewCatInput ? (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {settings.categories.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="New Category"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="input-field"
                  />
                  <button type="button" onClick={handleCreateCategory} className="btn btn-gold btn-sm">Add</button>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                SKU Code
              </label>
              <input
                type="text"
                placeholder="MOH-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Selling Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                placeholder="e.g. 2999"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Compare-at / Original Price (for Discount Badge)
              </label>
              <input
                type="number"
                placeholder="e.g. 3999"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* SIZES WITH INDIVIDUAL STOCK COUNTS (Core requirement) */}
          <div style={{
            background: "var(--bg-surface)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontSize: "0.90rem", fontWeight: 700, color: "var(--accent-gold-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} />
                <span>Size-wise Stock Inventory (Live Counts)</span>
              </span>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Total Stock: {Object.values(formData.sizes).reduce((sum, n) => sum + (Number(n) || 0), 0)} units
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(52px, 1fr))", gap: "8px" }}>
              {STANDARD_SIZES.map((size) => (
                <div key={size} style={{ textAlign: "center" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                    Size {size}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sizes[size] ?? 0}
                    onChange={(e) => handleSizeStockChange(size, e.target.value)}
                    className="input-field"
                    style={{ textAlign: "center", fontWeight: 700, fontSize: "1rem" }}
                  />
                  <span style={{ fontSize: "0.68rem", color: (formData.sizes[size] ?? 0) === 0 ? "#ef4444" : "var(--text-muted)", marginTop: "3px", display: "block" }}>
                    {(formData.sizes[size] ?? 0) === 0 ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Variants */}
          <div style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-gold-light)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Palette size={16} />
                <span>Color Variants</span>
              </span>
              <button
                type="button"
                onClick={handleAddColor}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
              >
                <Plus size={13} />
                <span>Add Color</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {formData.colors.map((color, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => handleColorChange(idx, "hex", e.target.value)}
                    style={{ width: "38px", height: "38px", padding: 0, border: "none", borderRadius: "6px", cursor: "pointer", background: "transparent" }}
                  />
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Emerald Green)"
                    value={color.name}
                    onChange={(e) => handleColorChange(idx, "name", e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photo Management (URLs & File Upload) */}
          <div style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-gold-light)", display: "flex", alignItems: "center", gap: "8px" }}>
                <ImageIcon size={16} />
                <span>Product Photos (URLs or Upload)</span>
              </span>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", padding: "4px 10px", fontSize: "0.75rem" }}>
                <Upload size={13} />
                <span>Upload From Device</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {imgUrl && (
                    <img src={imgUrl} alt="Preview" style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }} />
                  )}
                  <input
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddImageField}
                style={{
                  background: "transparent",
                  border: "1px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px",
                  color: "var(--accent-gold)",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Plus size={14} />
                <span>Add Another Photo URL</span>
              </button>
            </div>
          </div>

          {/* Description & Fabric/Care */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Evocative description of fit, silhouette, and styling occasions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                style={{ resize: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Fabric & Care Instructions
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 100% Mulberry Silk. Dry clean only. Gentle steam iron."
                value={formData.fabricCare}
                onChange={(e) => setFormData({ ...formData, fabricCare: e.target.value })}
                className="input-field"
                style={{ resize: "none" }}
              />
            </div>
          </div>

          {/* Highlight Badges (New / Best Seller) */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                style={{ width: "16px", height: "16px", accentColor: "var(--accent-gold)" }}
              />
              <span>Mark as <strong>"New Drop"</strong></span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                style={{ width: "16px", height: "16px", accentColor: "var(--accent-gold)" }}
              />
              <span>Mark as <strong>"Best Seller"</strong></span>
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-lg">
              <Save size={18} />
              <span>{isEditing ? "Save Product Changes" : "Publish to Storefront"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
