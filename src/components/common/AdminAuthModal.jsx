import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Lock, KeyRound, X, ArrowRight, AlertCircle } from "lucide-react";

export const AdminAuthModal = ({ isOpen, onClose }) => {
  const { authenticateAdmin, showToast, settings } = useStore();
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setError("Please enter the security passcode");
      return;
    }

    const success = authenticateAdmin(pinInput.trim());
    if (success) {
      setError("");
      setPinInput("");
      showToast("Access granted. Welcome to Vanshra Owner Portal.", "success");
    } else {
      setError("Invalid security passcode. Access denied.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleCloseModal = () => {
    // Clean up hash if closed without login
    if (window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setError("");
    setPinInput("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(400px, calc(100vw - 16px))",
          textAlign: "center",
          padding: "clamp(24px, 5vw, 36px) clamp(18px, 4vw, 28px)",
          border: "1.5px solid var(--border-gold)",
          boxShadow: "var(--shadow-lg)",
          animation: isShaking ? "shake 0.4s ease" : "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Close */}
        <button
          onClick={handleCloseModal}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "4px"
          }}
        >
          <X size={18} />
        </button>

        {/* Lock Icon */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(179, 135, 40, 0.25) 100%)",
          border: "2px solid var(--accent-gold)",
          color: "var(--accent-gold-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          boxShadow: "0 0 16px rgba(179, 135, 40, 0.2)"
        }}>
          <Lock size={24} />
        </div>

        <span style={{ fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-gold-dark)", fontWeight: 800 }}>
          Security Verification
        </span>

        <h3 className="font-serif" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.4rem)", color: "var(--text-primary)", marginTop: "2px", marginBottom: "6px" }}>
          {settings.brandName} Owner Portal
        </h3>

        <p className="text-secondary" style={{ fontSize: "0.82rem", marginBottom: "18px", lineHeight: 1.5 }}>
          Enter your owner passcode to access catalog and order operations.
        </p>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ position: "relative" }}>
              <KeyRound size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--accent-gold)" }} />
              <input
                type="password"
                placeholder="Passcode"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (error) setError("");
                }}
                maxLength={12}
                className="input-field"
                style={{ paddingLeft: "36px", textAlign: "center", fontSize: "1.1rem", letterSpacing: "0.20em", fontWeight: 700, height: "42px" }}
                autoFocus
              />
            </div>
            {error && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--accent-ruby)", fontSize: "0.78rem", marginTop: "6px", fontWeight: 600 }}>
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-gold btn-lg" style={{ width: "100%", padding: "10px" }}>
            <span>Authenticate</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
          }
        `}</style>
      </div>
    </div>
  );
};
