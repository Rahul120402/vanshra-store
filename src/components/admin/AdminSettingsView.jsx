import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Store, 
  MessageCircle, 
  Truck, 
  Sparkles,
  Phone,
  Mail,
  Sliders,
  KeyRound,
  Image as ImageIcon,
  Crown,
  Eye,
  ArrowRight,
  Instagram,
  QrCode,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
  Send,
  CheckCircle2
} from "lucide-react";

export const AdminSettingsView = () => {
  const { settings, updateSettings, exportStoreData, importStoreData, resetToDemoData, showToast, updateAdminPin, setCurrentView } = useStore();

  const [form, setForm] = useState({
    brandName: settings.brandName || "VANSHRA",
    tagline: settings.tagline || "",
    currencySymbol: settings.currencySymbol || "₹",
    adminPhone: settings.adminPhone || "",
    adminWhatsApp: settings.adminWhatsApp || "",
    adminUpiId: settings.adminUpiId || "918769102796@paytm",
    adminEmail: settings.adminEmail || "support@vanshra.com",
    storeAddress: settings.storeAddress || settings.adminAddress || "Vanshra Studio & Boutique, 102 Heritage Lane, Jaipur, Rajasthan - 302001",
    googleSheetWebhookUrl: settings.googleSheetWebhookUrl || "",
    adminPin: settings.adminPin || "1234",
    freeShippingThreshold: settings.freeShippingThreshold ?? 1999,
    standardShippingFee: settings.standardShippingFee ?? 100,
    announcementText: settings.announcementText || "",
    instagramHandle: settings.instagramHandle || "@vanshra.couture",
    heroBadge: settings.hero?.badge || "Official Brand Showroom • Handcrafted Apparel",
    heroTitle: settings.hero?.title || "Thoughtfully Crafted,\nWorn With Grace",
    heroSubtitle: settings.hero?.subtitle || "Explore our exclusive collection of comfortable silhouettes and handcrafted clothing. Connect directly on WhatsApp for personalized fit assistance and order confirmation.",
    heroImage: settings.hero?.bannerImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
  });

  const [newPin, setNewPin] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Keep form in sync if settings update from external import, reset, or cross-tab (only when not actively typing)
  useEffect(() => {
    if (!isDirty) {
      setForm({
        brandName: settings.brandName || "VANSHRA",
        tagline: settings.tagline || "",
        currencySymbol: settings.currencySymbol || "₹",
        adminPhone: settings.adminPhone || "",
        adminWhatsApp: settings.adminWhatsApp || "",
        adminUpiId: settings.adminUpiId || "918769102796@paytm",
        adminEmail: settings.adminEmail || "support@vanshra.com",
        storeAddress: settings.storeAddress || settings.adminAddress || "Vanshra Studio & Boutique, 102 Heritage Lane, Jaipur, Rajasthan - 302001",
        googleSheetWebhookUrl: settings.googleSheetWebhookUrl || "",
        adminPin: settings.adminPin || "1234",
        freeShippingThreshold: settings.freeShippingThreshold ?? 1999,
        standardShippingFee: settings.standardShippingFee ?? 100,
        announcementText: settings.announcementText || "",
        instagramHandle: settings.instagramHandle || "@vanshra.couture",
        heroBadge: settings.hero?.badge || "Official Brand Showroom • Handcrafted Apparel",
        heroTitle: settings.hero?.title || "Thoughtfully Crafted,\nWorn With Grace",
        heroSubtitle: settings.hero?.subtitle || "Explore our exclusive collection of comfortable silhouettes and handcrafted clothing. Connect directly on WhatsApp for personalized fit assistance and order confirmation.",
        heroImage: settings.hero?.bannerImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
      });
    }
  }, [settings, isDirty]);

  const updateFormField = (key, value) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettingsData = () => {
    updateSettings({
      brandName: form.brandName,
      tagline: form.tagline,
      currencySymbol: form.currencySymbol,
      adminPhone: form.adminPhone,
      adminWhatsApp: form.adminWhatsApp,
      adminUpiId: form.adminUpiId ? form.adminUpiId.trim() : "918769102796@paytm",
      adminEmail: form.adminEmail,
      storeAddress: form.storeAddress ? form.storeAddress.trim() : "",
      adminAddress: form.storeAddress ? form.storeAddress.trim() : "",
      googleSheetWebhookUrl: form.googleSheetWebhookUrl ? form.googleSheetWebhookUrl.trim() : "",
      freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
      standardShippingFee: Number(form.standardShippingFee) || 0,
      announcementText: form.announcementText,
      instagramHandle: form.instagramHandle,
      hero: {
        badge: form.heroBadge,
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
        bannerImage: form.heroImage,
        primaryBtnText: "Explore All Products",
        secondaryBtnText: "Browse Categories"
      }
    });

    if (newPin.trim()) {
      updateAdminPin(newPin.trim());
      setNewPin("");
    }
    setIsDirty(false);
  };

  const handleTestWebhook = async () => {
    if (!form.googleSheetWebhookUrl || !form.googleSheetWebhookUrl.trim().startsWith("http")) {
      showToast("Please enter a valid Google Apps Script Webhook URL first!", "warning");
      return;
    }
    setIsTestingWebhook(true);
    try {
      const testPayload = {
        orderId: "TEST-" + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
        status: "Confirmed",
        customer: {
          fullName: "Vanshra Patron (Test)",
          phone: form.adminWhatsApp || "919876543210",
          email: form.adminEmail || "support@vanshra.com",
          address: "102 Heritage Lane, Atelier Studio",
          city: "Jaipur",
          state: "Rajasthan",
          pincode: "302001",
          notes: "Live Google Sheet & Email Test Order"
        },
        items: [
          {
            name: "Gulabi Chanderi Silk Kurti (Test Sample)",
            size: "M",
            color: "Gulabi Rose",
            quantity: 1,
            price: 1899,
            total: 1899
          }
        ],
        subtotal: 1899,
        shippingFee: 0,
        total: 1899,
        paymentMethod: "Prepaid (UPI)",
        settings: {
          brandName: form.brandName || "VANSHRA",
          tagline: form.tagline || "Crafted for Comfort, Worn with Grace",
          currencySymbol: form.currencySymbol || "₹",
          adminEmail: form.adminEmail || "support@vanshra.com",
          adminWhatsApp: form.adminWhatsApp || "919876543210",
          adminPhone: form.adminPhone || "+91 98765 43210",
          adminUpiId: form.adminUpiId || "918769102796@paytm",
          storeAddress: form.storeAddress || "Jaipur, Rajasthan - 302001"
        }
      };

      await fetch(form.googleSheetWebhookUrl.trim(), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(testPayload)
      });

      showToast("Test order dispatched! Check your Google Sheet & Email inbox.", "success", 6000);
    } catch (err) {
      showToast("Webhook test failed: " + err.message, "error");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSettingsData();
  };

  const handleSaveAndViewStorefront = (e) => {
    e.preventDefault();
    saveSettingsData();
    if (window.location.hash === "#admin") {
      window.history.pushState(null, "", window.location.pathname);
    }
    setCurrentView("store");
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importStoreData(json);
        setIsDirty(false);
      } catch (err) {
        showToast("Invalid JSON backup file", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your catalog and demo orders to default?")) {
      resetToDemoData();
      setIsDirty(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header with Top Save Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: "1.6rem", color: "var(--text-primary)" }}>
            Store Settings & Security Controls
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
            Customize brand details, WhatsApp phone numbers, hero banner, and security PIN.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={handleSave} className="btn btn-gold" style={{ padding: "9px 20px", fontWeight: 700 }}>
            <Save size={16} />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Store Owner Security PIN */}
        <div className="glass-panel" style={{ padding: "24px", border: "1.5px solid var(--border-gold)", background: "linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, #ffffff 100%)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <KeyRound size={18} />
            <span>Store Owner Security Passcode / PIN</span>
          </h3>
          <p className="text-secondary" style={{ fontSize: "0.82rem", marginBottom: "16px" }}>
            Customers cannot view or access your Admin portal without this PIN code. (Current default: <strong>1234</strong>)
          </p>

          <div style={{ maxWidth: "340px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Change Owner Security PIN (Minimum 4 digits)
            </label>
            <input
              type="text"
              placeholder="e.g. 5678"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="input-field"
              maxLength={8}
              style={{ fontWeight: 700, letterSpacing: "0.1em" }}
            />
          </div>
        </div>

        {/* Dynamic Hero Banner Customization */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Crown size={18} />
            <span>Dynamic Hero Banner & Headlines</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Top Badge Tagline
              </label>
              <input
                type="text"
                value={form.heroBadge}
                onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Hero Background Photo URL
              </label>
              <input
                type="url"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Hero Main Headline (Use \n or New Line for Gold accent row)
              </label>
              <textarea
                rows={2}
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Hero Subtitle Description
              </label>
              <textarea
                rows={2}
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Brand & Store Profile */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Store size={18} />
            <span>Brand Identity & Currency</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Brand / Store Name *
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => updateFormField("brandName", e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Brand Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => updateFormField("tagline", e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Currency Symbol
              </label>
              <select
                value={form.currencySymbol}
                onChange={(e) => updateFormField("currencySymbol", e.target.value)}
                className="input-field"
                style={{ fontWeight: 700 }}
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="AED ">AED (Dirham)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & WhatsApp Support Settings */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageCircle size={18} />
            <span>Store Owner Contact & WhatsApp Channels</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Admin WhatsApp Number (Country code + digits, e.g. 919876543210) *
              </label>
              <input
                type="text"
                value={form.adminWhatsApp}
                onChange={(e) => updateFormField("adminWhatsApp", e.target.value)}
                className="input-field"
                placeholder="919876543210"
                required
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Used for 1-click customer chats and incoming order confirmations.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Customer Calling Phone
              </label>
              <input
                type="text"
                value={form.adminPhone}
                onChange={(e) => updateFormField("adminPhone", e.target.value)}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Customer Support Email
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => updateFormField("adminEmail", e.target.value)}
                className="input-field"
                placeholder="support@vanshra.com"
              />
            </div>
          </div>
        </div>

        {/* Business UPI Payment Gateway & Customer Collection Settings */}
        <div className="glass-panel" style={{ padding: "24px", border: "1.5px solid var(--border-gold)", background: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, #ffffff 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <QrCode size={18} />
                <span>UPI Payment ID (Customer Payment Collection)</span>
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.82rem", marginTop: "3px" }}>
                This UPI ID will be sent directly in WhatsApp payment requests and order checkout messages to collect customer payments.
              </p>
            </div>

            {form.adminUpiId && (
              <span className="badge badge-confirmed" style={{ fontSize: "0.76rem", fontWeight: 700, padding: "4px 10px" }}>
                ✓ Active Payment ID
              </span>
            )}
          </div>

          <div style={{ maxWidth: "480px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Owner / Business UPI ID (VPA) *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={form.adminUpiId}
                onChange={(e) => updateFormField("adminUpiId", e.target.value)}
                className="input-field"
                placeholder="e.g. 918769102796@paytm, yourname@oksbi, brand@upi"
                style={{ fontWeight: 700, letterSpacing: "0.02em", color: "var(--accent-gold-dark)", fontSize: "0.98rem" }}
                required
              />
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px", display: "block", lineHeight: 1.4 }}>
              💡 <strong>Example:</strong> <code>918769102796@paytm</code> or <code>rahuls.cvc@oksbi</code>. Customers will see: <em>"UPI ID: {form.adminUpiId || 'your-upi-id'}"</em> in WhatsApp.
            </span>
          </div>
        </div>

        {/* Physical Store Address (Footer Location) */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} />
                <span>Store / Boutique Physical Address (दुकान / स्टोर का पता)</span>
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.82rem", marginTop: "3px" }}>
                Yeh address website ke home page footer me <strong>Help & Support</strong> section ke andar customers ko dikhega.
              </p>
            </div>

            {form.storeAddress && (
              <span className="badge badge-confirmed" style={{ fontSize: "0.76rem", fontWeight: 700, padding: "4px 10px" }}>
                ✓ Footer Address Set
              </span>
            )}
          </div>

          <div style={{ maxWidth: "640px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Boutique / Atelier Address (दुकान का पूरा पता)
            </label>
            <textarea
              rows={3}
              value={form.storeAddress}
              onChange={(e) => updateFormField("storeAddress", e.target.value)}
              className="input-field"
              placeholder="e.g. Vanshra Studio & Boutique, 102 Heritage Lane, Jaipur, Rajasthan - 302001"
              style={{ lineHeight: 1.5, resize: "vertical" }}
            />
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px", display: "block", lineHeight: 1.4 }}>
              📍 <strong>Live Preview:</strong> Website footer me <code style={{ color: "var(--accent-gold-dark)" }}>{form.storeAddress || "No address entered yet"}</code> ke roop me dikhega.
            </span>
          </div>
        </div>

        {/* Google Sheets & Automatic Email Integration */}
        <div className="glass-panel" style={{ padding: "24px", border: "1.5px solid var(--border-gold)", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, #ffffff 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={18} style={{ color: "var(--accent-emerald)" }} />
                <span>Google Sheets & Automatic Email Automation (Webhook)</span>
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.82rem", marginTop: "3px" }}>
                Har naye order par automatically Google Sheet me entry ho jayegi aur aapko + customer dono ko branded luxury email notification chala jayega.
              </p>
            </div>

            {form.googleSheetWebhookUrl ? (
              <span className="badge badge-confirmed" style={{ fontSize: "0.76rem", fontWeight: 700, padding: "4px 10px" }}>
                ✓ Webhook Configured
              </span>
            ) : (
              <span className="badge badge-new" style={{ fontSize: "0.76rem", fontWeight: 700, padding: "4px 10px" }}>
                Optional Setup
              </span>
            )}
          </div>

          <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Google Apps Script Web App Deployment URL
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="url"
                  value={form.googleSheetWebhookUrl}
                  onChange={(e) => updateFormField("googleSheetWebhookUrl", e.target.value)}
                  className="input-field"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  style={{ flex: "1 1 300px", fontFamily: "monospace", fontSize: "0.82rem" }}
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || !form.googleSheetWebhookUrl}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    whiteSpace: "nowrap", 
                    borderColor: "var(--accent-emerald)", 
                    color: "var(--accent-emerald-dark)",
                    fontWeight: 700
                  }}
                  title="Send sample order to verify Google Sheets & Email delivery"
                >
                  <Send size={13} />
                  <span>{isTestingWebhook ? "Testing Webhook..." : "Test Webhook"}</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Box */}
            <div style={{ background: "var(--bg-secondary)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                💡 Kaise Setup Karein (2-Minute Guide):
              </strong>
              1. Apni Google Drive me ek nayi Google Sheet banayein.<br/>
              2. <strong>Extensions</strong> → <strong>Apps Script</strong> par click karein.<br/>
              3. Project folder me <code>google-apps-script/Code.gs</code> ka poora code copy karke wahan paste karein.<br/>
              4. <strong>Deploy</strong> → <strong>New deployment</strong> → Select <strong>Web app</strong> → Execute as: <em>Me</em>, Who has access: <em>Anyone</em> → <strong>Deploy</strong>.<br/>
              5. Wahan se mila hua <strong>Web app URL</strong> yahan paste karke <strong>Save Changes</strong> daba dein!
            </div>
          </div>
        </div>

        {/* Shipping & Announcement Bar */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} />
            <span>Delivery Rules & Announcement Bar</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Free Shipping Order Threshold ({form.currencySymbol})
              </label>
              <input
                type="number"
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Standard Delivery Fee ({form.currencySymbol})
              </label>
              <input
                type="number"
                value={form.standardShippingFee}
                onChange={(e) => setForm({ ...form, standardShippingFee: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Top Header Announcement Banner Text
            </label>
            <input
              type="text"
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className="input-field"
              placeholder="✨ Handcrafted Comfort Silhouettes • Personal WhatsApp Sizing • Fast Nationwide Dispatch"
            />
          </div>
        </div>

        {/* Official Instagram Integration */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Instagram size={18} />
            <span>Official Instagram Handle & Links</span>
          </h3>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Instagram Handle / Username
            </label>
            <div style={{ maxWidth: "480px" }}>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
                className="input-field"
                placeholder="@_VANSHRA_"
                style={{ fontWeight: 700 }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Displayed in website footer, customer gallery banner, and links to <strong>https://instagram.com/{form.instagramHandle.replace("@", "")}</strong>
            </span>

            <div style={{ marginTop: "12px" }}>
              <a
                href={`https://instagram.com/${form.instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                <ExternalLink size={14} />
                <span>Test Instagram Profile Link</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Instant Preview of Storefront Banner */}
        <div className="glass-panel" style={{ padding: "24px", border: "1.5px solid var(--border-gold)", background: "linear-gradient(180deg, #ffffff 0%, rgba(203, 163, 88, 0.04) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={18} />
              <span>Live Storefront Preview (What Customers See)</span>
            </h3>
            <span style={{ fontSize: "0.74rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)", padding: "3px 10px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
              Live Real-Time Feedback
            </span>
          </div>

          {/* Live Announcement Bar Preview */}
          {form.announcementText && form.announcementText.trim() && (
            <div style={{
              background: "linear-gradient(90deg, #9a7828 0%, #caa44c 50%, #9a7828 100%)",
              color: "#ffffff",
              padding: "6px 14px",
              textAlign: "center",
              fontSize: "0.76rem",
              fontWeight: 700,
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}>
              <Sparkles size={13} style={{ color: "#fff3cc" }} />
              <span>{form.announcementText}</span>
              <Sparkles size={13} style={{ color: "#fff3cc" }} />
            </div>
          )}

          {/* Live Mini Hero Preview */}
          <div style={{
            position: "relative",
            minHeight: "240px",
            padding: "28px 24px",
            borderRadius: form.announcementText?.trim() ? "0 0 var(--radius-sm) var(--radius-sm)" : "var(--radius-sm)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            background: `linear-gradient(135deg, rgba(250, 248, 245, 0.88) 0%, rgba(244, 237, 228, 0.72) 50%, rgba(250, 248, 245, 0.55) 100%), url('${form.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"}') center/cover no-repeat`
          }}>
            {/* Live Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid var(--border-gold)",
              color: "var(--accent-gold-dark)",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "12px"
            }}>
              <Crown size={12} style={{ color: "var(--accent-gold)" }} />
              <span>{form.heroBadge || "Official Brand Showroom"}</span>
            </div>

            {/* Live Title */}
            <h4 className="font-display" style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "10px", lineHeight: 1.25 }}>
              {String(form.heroTitle || "Brand Headline").replace(/\\n/g, "\n").split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <br />}
                  {idx === 1 ? (
                    <span className="text-gold-gradient" style={{ fontWeight: 700 }}>
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </React.Fragment>
              ))}
            </h4>

            {/* Live Subtitle */}
            <p className="text-secondary" style={{ fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "480px", marginBottom: "14px" }}>
              {form.heroSubtitle || "Explore our collection"}
            </p>

            {/* Live CTA buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="btn btn-gold btn-sm" style={{ pointerEvents: "none", fontSize: "0.78rem" }}>
                <span>Explore All Products</span>
                <ArrowRight size={13} />
              </div>
              <div className="btn btn-secondary btn-sm" style={{ pointerEvents: "none", fontSize: "0.78rem" }}>
                <span>Browse Categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          <button type="button" onClick={handleSaveAndViewStorefront} className="btn btn-secondary btn-lg">
            <Store size={18} />
            <span>Save & View Storefront</span>
          </button>

          <button type="submit" className="btn btn-gold btn-lg">
            <Save size={18} />
            <span>Save All Store Settings</span>
          </button>
        </div>

      </form>

      {/* Backup, Export & Reset Section */}
      <div className="glass-panel" style={{ padding: "24px", marginTop: "10px", border: "1px dashed var(--border-gold)" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Data Backup & Maintenance
        </h3>
        <p className="text-secondary" style={{ fontSize: "0.85rem", marginBottom: "20px" }}>
          Download a complete JSON snapshot of all your products, inventory stock counts, customer orders, and settings. You can restore it on any device at any time.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button onClick={exportStoreData} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>Export Store Data (JSON)</span>
          </button>

          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            <Upload size={15} />
            <span>Import / Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
          </label>

          <button onClick={handleReset} className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }}>
            <RotateCcw size={15} />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};
