import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { STANDARD_SIZES } from "../../data/initialData";
import { compressImage, normalizeImageUrl, FALLBACK_PRODUCT_IMAGE } from "../../utils/formatters";
import { uploadProductPhotoToCloud } from "../../services/imageUpload";
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
  DollarSign,
  AlertCircle,
  ExternalLink,
  Loader2
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
      XXS: 0,
      XS: 0,
      S: 5,
      M: 5,
      L: 5,
      XL: 5,
      XXL: 0,
      XXXL: 0
    },
    isNew: true,
    isBestSeller: false
  });

  const [newCatInput, setNewCatInput] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (product) {
      const productSizes = {};
      STANDARD_SIZES.forEach((s) => {
        productSizes[s] = product.sizes?.[s] ?? 0;
      });

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
        sizes: productSizes,
        isNew: Boolean(product.isNew),
        isBestSeller: Boolean(product.isBestSeller)
      });
    } else {
      const defaultSizes = {};
      STANDARD_SIZES.forEach((s) => {
        defaultSizes[s] = ["S", "M", "L"].includes(s) ? 5 : ["XS", "XL"].includes(s) ? 2 : 0;
      });

      setFormData({
        name: "",
        category: settings.categories.find((c) => c !== "All") || "Kurtis",
        price: "",
        originalPrice: "",
        sku: `VAN-${Math.floor(100 + Math.random() * 900)}`,
        description: "",
        fabricCare: "Premium handcrafted fabric. Gentle wash or dry clean recommended.",
        images: [""],
        colors: [{ name: "Standard", hex: "#1a1a1a" }],
        sizes: defaultSizes,
        isNew: true,
        isBestSeller: false
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    // Automatically convert Google Drive / Dropbox / raw URL format
    const normalized = normalizeImageUrl(value);
    newImages[index] = normalized || value;
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploadingImage(true);
    showToast("Uploading photo to cloud storage...", "info", 3000);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const cloudUrl = await uploadProductPhotoToCloud(file);
        if (cloudUrl) {
          uploadedUrls.push(cloudUrl);
        }
      } catch (err) {
        console.warn("Cloud image upload failed:", err);
      }
    }

    setIsUploadingImage(false);

    if (uploadedUrls.length > 0) {
      setFormData((prev) => {
        const existing = prev.images.filter((img) => img.trim() !== "");
        return {
          ...prev,
          images: existing.length === 0 ? uploadedUrls : [...existing, ...uploadedUrls]
        };
      });
      showToast("Photo uploaded to cloud successfully!", "success", 2500);
    } else {
      showToast("Could not upload photo. Please check internet connection.", "warning", 3000);
    }
    e.target.value = "";
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

    const cleanedImages = formData.images
      .filter((img) => img && typeof img === "string" && img.trim() !== "")
      .map(normalizeImageUrl)
      .filter(Boolean);

    const finalImages = cleanedImages.length > 0 ? cleanedImages : [FALLBACK_PRODUCT_IMAGE];

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      sku: formData.sku || `VAN-${Math.floor(1000 + Math.random() * 9000)}`,
      description: formData.description.trim() || "Elegant apparel piece designed with fine tailoring and premium silhouette.",
      fabricCare: formData.fabricCare.trim() || "Dry clean only.",
      images: finalImages,
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
                placeholder="VAN-001"
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
              <label 
                className="btn btn-secondary btn-sm" 
                style={{ 
                  cursor: isUploadingImage ? "not-allowed" : "pointer", 
                  padding: "6px 12px", 
                  fontSize: "0.78rem",
                  opacity: isUploadingImage ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {isUploadingImage ? <Loader2 size={13} className="spin-animation" /> : <Upload size={13} />}
                <span>{isUploadingImage ? "Uploading to Cloud..." : "Upload From Device"}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  disabled={isUploadingImage}
                  onChange={handleFileUpload} 
                  style={{ display: "none" }} 
                />
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {imgUrl ? (
                    <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0, borderRadius: "var(--radius-xs)", overflow: "hidden", border: "1.5px solid var(--border-gold)", background: "#f8f5ee" }}>
                      <img 
                        src={normalizeImageUrl(imgUrl) || imgUrl} 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                  ) : (
                    <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "var(--radius-xs)", border: "1px dashed var(--border-subtle)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <input
                    type="url"
                    placeholder="Paste Image URL (Google Drive, Imgur, Unsplash, or Direct Web Link)"
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    onBlur={(e) => handleImageChange(idx, e.target.value)}
                    className="input-field"
                    style={{ flex: 1, fontSize: "0.84rem" }}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px" }}
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={handleAddImageField}
                  style={{
                    background: "transparent",
                    border: "1px dashed var(--border-gold)",
                    borderRadius: "var(--radius-sm)",
                    padding: "7px 14px",
                    color: "var(--accent-gold-dark)",
                    cursor: "pointer",
                    fontSize: "0.80rem",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Plus size={14} />
                  <span>Add Another Photo Link</span>
                </button>

                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  💡 Supports Google Drive public links, Dropbox, Imgur, or direct image URLs
                </span>
              </div>
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
