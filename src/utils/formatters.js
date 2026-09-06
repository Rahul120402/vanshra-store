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

export const generateOrderId = (prefix = "VAN") => {
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

// High-Definition Luxury Image Optimizer (Crisp HD 1200x1500, high smoothing, rich fabric detail)
export const compressImage = (file, maxWidth = 1200, maxHeight = 1500, quality = 0.85) => {
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
        
        // Enable high-quality anti-aliasing & bicubic rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
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
// Fallback luxury placeholder image (Neutral royal champagne placeholder)
export const FALLBACK_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 750' width='600' height='750'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fdfaf5'/%3E%3Cstop offset='100%25' stop-color='%23f4ede0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Crect x='20' y='20' width='560' height='710' fill='none' stroke='%23d4af37' stroke-width='1.5' stroke-dasharray='6 6' rx='12' opacity='0.5'/%3E%3Cg transform='translate(300, 340)' text-anchor='middle'%3E%3Ccircle cx='0' cy='-40' r='42' fill='%23ffffff' stroke='%23d4af37' stroke-width='1.5'/%3E%3Ctext y='-33' font-family='serif' font-size='26' fill='%23b38728'%3EV%3C/text%3E%3Ctext y='45' font-family='sans-serif' font-size='17' font-weight='600' letter-spacing='3' fill='%232c1e0a'%3EVANSHRA%3C/text%3E%3Ctext y='72' font-family='sans-serif' font-size='12' font-weight='500' letter-spacing='1' fill='%238c734b'%3EPHOTO COMING SOON%3C/text%3E%3C/g%3E%3C/svg%3E";

// Smart Image URL Normalizer (Converts Google Drive, Dropbox, Imgur links to direct loadable images)
export const normalizeImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();
  if (!url) return "";

  // Already base64 data URI, blob, or internal relative path
  if (url.startsWith("data:image/") || url.startsWith("blob:") || url.startsWith("/")) {
    return url;
  }

  // Handle protocol-relative URL
  if (url.startsWith("//")) {
    url = "https:" + url;
  }

  // Auto-prepend https if missing protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // 1. Google Drive direct link conversion
  // Handles /file/d/{id}/view, ?id={id}, etc.
  if (url.includes("drive.google.com")) {
    const gDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      const fileId = gDriveMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  // 2. Dropbox share link conversion (dl=0 -> raw=1)
  if (url.includes("dropbox.com")) {
    url = url.replace("?dl=0", "").replace("&dl=0", "");
    url += (url.includes("?") ? "&" : "?") + "raw=1";
    return url;
  }

  // 3. Imgur link conversion (imgur.com/{id} -> i.imgur.com/{id}.jpg)
  if (url.includes("imgur.com") && !url.includes("i.imgur.com")) {
    const imgurMatch = url.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)/);
    if (imgurMatch && imgurMatch[1]) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  }

  return url;
};
