// Lightweight, High-Speed Firebase Cloud Database Connector for VANSHRA
// Works natively with 0 npm dependencies, zero bundle bloat, and 100% reliability across all devices!

const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBoaeObPWF3-E8GpXA-67EwKbKGVq2V1RI",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vanshra",
    databaseUrl: import.meta.env.VITE_FIREBASE_DATABASE_URL || ""
  };
};

export const isFirebaseConfigured = () => {
  const config = getFirebaseConfig();
  return Boolean(
    config.projectId &&
    config.projectId !== "" &&
    !config.projectId.includes("YOUR_")
  );
};

// Convert standard JS object to Firestore REST Document format
const toFirestoreFields = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) => {
            if (item === null || item === undefined) return { nullValue: null };
            if (typeof item === "object") {
              return { mapValue: { fields: toFirestoreFields(item) } };
            }
            if (typeof item === "number") {
              return Number.isInteger(item) ? { integerValue: String(item) } : { doubleValue: item };
            }
            if (typeof item === "boolean") return { booleanValue: item };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === "object") {
      fields[key] = {
        mapValue: {
          fields: toFirestoreFields(value)
        }
      };
    }
  }
  return fields;
};

// Convert Firestore REST Document back to standard JS object
const fromFirestoreFields = (fields) => {
  if (!fields) return {};
  const obj = {};
  for (const [key, value] of Object.entries(fields)) {
    if ("stringValue" in value) obj[key] = value.stringValue;
    else if ("integerValue" in value) obj[key] = parseInt(value.integerValue, 10);
    else if ("doubleValue" in value) obj[key] = value.doubleValue;
    else if ("booleanValue" in value) obj[key] = value.booleanValue;
    else if ("nullValue" in value) obj[key] = null;
    else if ("arrayValue" in value) {
      obj[key] = (value.arrayValue.values || []).map((v) => {
        if ("mapValue" in v) return fromFirestoreFields(v.mapValue.fields);
        if ("stringValue" in v) return v.stringValue;
        if ("integerValue" in v) return parseInt(v.integerValue, 10);
        return v;
      });
    } else if ("mapValue" in value) {
      obj[key] = fromFirestoreFields(value.mapValue.fields);
    }
  }
  return obj;
};

// ==========================================
// 1. Live Products Synchronization
// ==========================================

export const fetchCloudProducts = async () => {
  if (!isFirebaseConfigured()) return null;
  const config = getFirebaseConfig();

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/products?pageSize=300${config.apiKey ? `&key=${config.apiKey}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map((doc) => {
      const id = doc.name.split("/").pop();
      return {
        ...fromFirestoreFields(doc.fields),
        id
      };
    });
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to fetch products:", err);
    return null;
  }
};

export const saveProductToCloud = async (product) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();

  try {
    const docId = String(product.id);
    const prodWithUpdated = {
      ...product,
      updatedAt: product.updatedAt || new Date().toISOString()
    };
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/products/${docId}?${config.apiKey ? `key=${config.apiKey}` : ""}`;
    
    const body = JSON.stringify({
      fields: toFirestoreFields(prodWithUpdated)
    });

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[VANSHRA Cloud] Save product "${product.name || docId}" failed (${res.status}):`, errText);
    }

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to save product:", err);
    return false;
  }
};

export const deleteProductFromCloud = async (productId) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();

  try {
    const docId = String(productId);
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/products/${docId}?${config.apiKey ? `key=${config.apiKey}` : ""}`;

    const res = await fetch(url, {
      method: "DELETE"
    });

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to delete product:", err);
    return false;
  }
};

// ==========================================
// 2. Live Orders Synchronization
// ==========================================

export const fetchCloudOrders = async () => {
  if (!isFirebaseConfigured()) return null;
  const config = getFirebaseConfig();

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/orders?pageSize=300${config.apiKey ? `&key=${config.apiKey}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.documents) return [];

    const orders = data.documents.map((doc) => {
      const id = doc.name.split("/").pop();
      return {
        ...fromFirestoreFields(doc.fields),
        id
      };
    });

    // Sort newest first
    return orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to fetch orders:", err);
    return null;
  }
};

export const saveOrderToCloud = async (order) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();

  try {
    const docId = String(order.id);
    const orderWithUpdated = {
      ...order,
      updatedAt: order.updatedAt || new Date().toISOString()
    };
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/orders/${docId}?${config.apiKey ? `key=${config.apiKey}` : ""}`;

    const body = JSON.stringify({
      fields: toFirestoreFields(orderWithUpdated)
    });

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body
    });

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to save order:", err);
    return false;
  }
};

export const updateOrderStatusInCloud = async (orderId, newStatus, updatedAtIso) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();
  const nowIso = updatedAtIso || new Date().toISOString();

  try {
    const docId = String(orderId);
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/orders/${docId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt&${config.apiKey ? `key=${config.apiKey}` : ""}`;

    const body = JSON.stringify({
      fields: {
        status: { stringValue: newStatus },
        updatedAt: { stringValue: nowIso }
      }
    });

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body
    });

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to update order status:", err);
    return false;
  }
};

export const deleteOrderFromCloud = async (orderId) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();

  try {
    const docId = String(orderId);
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/orders/${docId}?${config.apiKey ? `key=${config.apiKey}` : ""}`;

    const res = await fetch(url, {
      method: "DELETE"
    });

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to delete order:", err);
    return false;
  }
};

// ==========================================
// 3. Live Store Settings Synchronization
// ==========================================

export const fetchCloudSettings = async () => {
  if (!isFirebaseConfigured()) return null;
  const config = getFirebaseConfig();

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/settings/store_config?${config.apiKey ? `key=${config.apiKey}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return fromFirestoreFields(data.fields);
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to fetch settings:", err);
    return null;
  }
};

export const saveSettingsToCloud = async (settings) => {
  if (!isFirebaseConfigured()) return false;
  const config = getFirebaseConfig();

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/settings/store_config?${config.apiKey ? `key=${config.apiKey}` : ""}`;

    const body = JSON.stringify({
      fields: toFirestoreFields(settings)
    });

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body
    });

    return res.ok;
  } catch (err) {
    console.warn("[VANSHRA Cloud] Failed to save settings:", err);
    return false;
  }
};
