// Currency and date formatting helpers

export const formatCurrency = (amount, symbol = "₹") => {
  if (amount === undefined || amount === null) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString("en-IN")}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const generateOrderId = (prefix = "MOH") => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export const getTotalStock = (sizes) => {
  if (!sizes || typeof sizes !== "object") return 0;
  return Object.values(sizes).reduce((sum, count) => sum + (Number(count) || 0), 0);
};

export const getStockBadgeInfo = (sizes) => {
  const total = getTotalStock(sizes);
  if (total === 0) {
    return { label: "Sold Out", status: "out-of-stock", color: "#e11d48" };
  }
  if (total <= 5) {
    return { label: `Only ${total} Left in Stock!`, status: "low-stock", color: "#d97706" };
  }
  return { label: "In Stock", status: "in-stock", color: "#059669" };
};

export const getMonthKey = (dateString) => {
  if (!dateString) return "unknown";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "unknown";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const formatMonthYear = (monthKeyOrDateString) => {
  if (!monthKeyOrDateString) return "";
  let date;
  if (typeof monthKeyOrDateString === "string" && monthKeyOrDateString.includes("-") && monthKeyOrDateString.length === 7) {
    const [year, month] = monthKeyOrDateString.split("-");
    date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  } else {
    date = new Date(monthKeyOrDateString);
  }
  if (isNaN(date.getTime())) return monthKeyOrDateString;
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

// High-speed browser canvas image optimizer (compresses 5MB+ photos to <150KB for fast cloud saving)
export const compressImage = (file, maxWidth = 1000, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let compressed = canvas.toDataURL("image/webp", quality);
        if (!compressed.startsWith("data:image/webp")) {
          compressed = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(event.target?.result || "");
      };
      img.src = event.target?.result;
    };
    reader.onerror = () => {
      resolve("");
    };
    reader.readAsDataURL(file);
  });
};

