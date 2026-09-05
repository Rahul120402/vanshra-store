import React from "react";
import { useStore } from "../../context/StoreContext";
import { CheckCircle2, AlertCircle, Info, X, Bell } from "lucide-react";

export const NotificationToast = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconColor = "var(--accent-gold)";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          iconColor = "var(--accent-emerald)";
        } else if (toast.type === "error" || toast.type === "warning") {
          Icon = AlertCircle;
          iconColor = "var(--accent-ruby)";
        } else if (toast.type === "order") {
          Icon = Bell;
          iconColor = "var(--accent-gold-light)";
        }

        return (
          <div key={toast.id} className="toast-item">
            <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex"
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
