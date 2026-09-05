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

