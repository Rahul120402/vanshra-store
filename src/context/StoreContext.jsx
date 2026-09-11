import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_COUPONS } from "../data/initialData";
import { generateOrderId, getTotalStock, normalizeImageUrl, FALLBACK_PRODUCT_IMAGE } from "../utils/formatters";
import { playOrderChime } from "../utils/audio";
import confetti from "canvas-confetti";
import { 
  isFirebaseConfigured, 
  fetchCloudCatalog,
  fetchCloudProducts, 
  saveProductToCloud, 
  deleteProductFromCloud,
  fetchCloudOrders, 
  fetchCloudOrderById,
  saveOrderToCloud, 
  updateOrderStatusInCloud,
  deleteOrderFromCloud,
  fetchCloudSettings,
  saveSettingsToCloud,
  fetchStoreVersion,
  updateStoreVersion
} from "../services/firebase";
import { sendOrderToGoogleSheets } from "../services/googleSheets";

const DEMO_ORDER_IDS = new Set([
  "VAN-4204",
  "VAN-9081",
  "VAN-8021",
  "VAN-7945",
  "VAN-7415",
  "VAN-9079",
  "VAN-5319",
  "VAN-8001",
  "VAN-1001",
  "VAN-1002",
  "VAN-1003"
]);

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: "vanshra_clothing_products_v2",
  ORDERS: "vanshra_clothing_orders_v2",
  SETTINGS: "vanshra_clothing_settings_v2",
  CART: "vanshra_clothing_cart_v2",
  WISHLIST: "vanshra_clothing_wishlist_v2",
  COUPONS: "vanshra_clothing_coupons_v2",
  LAST_PRODUCT_SYNC: "vanshra_clothing_last_sync_v2",
  STORE_VERSION: "vanshra_clothing_version_v2",
  ORDERS_VERSION: "vanshra_clothing_orders_ver_v2"
};

// Clean up legacy deleted IDs blacklist from local storage
try {
  localStorage.removeItem("vanshra_clothing_deleted_prod_ids_v2");
  localStorage.removeItem("vanshra_clothing_deleted_ids_v2");
} catch {
  // ignore
}

export const normalizeOrder = (order) => {
  if (!order || typeof order !== "object") return null;

  // 1. Calculate items and total safely
  let items = Array.isArray(order.items) ? order.items : [];
  let subtotal = Number(order.subtotal) || 0;
  let shippingFee = Number(order.shippingFee) || 0;
  let total = Number(order.total) || 0;

  // Check if this matches a known initial order ID (or if it was corrupted to 0 items and 0 total)
  const initialMatch = INITIAL_ORDERS.find((init) => init.id === order.id);
  if (initialMatch && (items.length === 0 || total === 0)) {
    items = initialMatch.items;
    subtotal = initialMatch.subtotal;
    shippingFee = initialMatch.shippingFee;
    total = initialMatch.total;
  }

  // If items exist, calculate accurate subtotal and total
  if (items.length > 0) {
    const calcSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    if (subtotal === 0) subtotal = calcSubtotal;
    if (total === 0) total = subtotal + shippingFee;
  } else if (total === 0) {
    // If an order has 0 items and 0 total, repair it with a generic placeholder
    items = [
      {
        productId: "custom-item",
        name: "Boutique Apparel Item",
        image: FALLBACK_PRODUCT_IMAGE,
        size: "Standard",
        color: "Standard",
        price: 0,
        quantity: 1
      }
    ];
    subtotal = 0;
    shippingFee = 0;
    total = 0;
  }

  const custName = order.customer?.fullName && order.customer.fullName !== "Valued Customer" && order.customer.fullName !== "Customer"
    ? order.customer.fullName
    : (initialMatch ? initialMatch.customer.fullName : (order.fullName || "Customer"));

  const custPhone = order.customer?.phone || (initialMatch ? initialMatch.customer.phone : (order.phone || ""));
  const custEmail = order.customer?.email || (initialMatch ? initialMatch.customer.email : (order.email || ""));
  const custAddress = order.customer?.address || (initialMatch ? initialMatch.customer.address : (order.address || "Direct Order via WhatsApp"));
  const custCity = order.customer?.city && order.customer.city !== "India"
    ? order.customer.city
    : (initialMatch ? initialMatch.customer.city : (order.city || "Jaipur"));
  const custState = order.customer?.state || (initialMatch ? initialMatch.customer.state : (order.state || "Rajasthan"));
  const custPincode = order.customer?.pincode || (initialMatch ? initialMatch.customer.pincode : (order.pincode || "302001"));
  const custNotes = order.customer?.notes || (initialMatch ? initialMatch.customer.notes : (order.notes || ""));

  return {
    ...order,
    id: order.id || generateOrderId("VAN"),
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
    status: order.status || "New",
    customer: {
      fullName: custName,
      phone: custPhone,
      email: custEmail,
      address: custAddress,
      city: custCity,
      state: custState,
      pincode: custPincode,
      notes: custNotes
    },
    items,
    subtotal,
    shippingFee,
    total,
    paymentMethod: order.paymentMethod || "Prepaid (UPI)",
    dispatchInfo: {
      courierPartner: order.dispatchInfo?.courierPartner || "",
      trackingNumber: order.dispatchInfo?.trackingNumber || "",
      dispatchDate: order.dispatchInfo?.dispatchDate || "",
      notes: order.dispatchInfo?.notes || ""
    }
  };
};

// Module-level global in-flight & run-once guards (survives re-renders and StrictMode)
let isProductsSyncInProgress = false;
let isOrdersSyncInProgress = false;
let hasInitialProductsSyncRun = false;
let lastProductSyncTimestamp = 0;
let lastOrdersSyncTimestamp = 0;

export const StoreProvider = ({ children }) => {
  // 1. Core State with LocalStorage initialization
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id))
            .map(normalizeOrder)
            .filter(Boolean);
          try {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cleaned));
          } catch {
            // ignore
          }
          return cleaned;
        }
      }
      return INITIAL_ORDERS.filter((o) => o && !DEMO_ORDER_IDS.has(o.id)).map(normalizeOrder).filter(Boolean);
    } catch {
      return INITIAL_ORDERS.filter((o) => o && !DEMO_ORDER_IDS.has(o.id)).map(normalizeOrder).filter(Boolean);
    }
  });


  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const handle = (parsed.instagramHandle && parsed.instagramHandle !== "@vanshra.couture")
          ? parsed.instagramHandle
          : "@_VANSHRA_";

        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          googleSheetWebhookUrl: parsed.googleSheetWebhookUrl || INITIAL_SETTINGS.googleSheetWebhookUrl,
          instagramHandle: handle,
          instagramQrUrl: parsed.instagramQrUrl || "/vanshra-instagram-qr.jpg",
          hero: {
            ...INITIAL_SETTINGS.hero,
            ...(parsed.hero || {})
          }
        };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Admin PIN Authentication & Privacy
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem("vanshra_admin_auth") === "true";
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Cloud Sync Indicators
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);

  // 2. Navigation & UI state
  const [currentView, setCurrentView] = useState("store"); // "store" | "admin"
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("overview"); // "overview" | "orders" | "products" | "settings"

  // 3. Storefront Filters & Search
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("featured"); // "featured" | "newest" | "price-low" | "price-high"
  const [priceRange, setPriceRange] = useState(10000);

  // 4. Notifications & Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Comprehensive Centralized SPA Navigation Helpers
  const navigateToHome = () => {
    setCurrentView("store");
    setSelectedProductId(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsQuickViewOpen(false);
    setIsSizeGuideOpen(false);
    setIsOrderTrackingOpen(false);
    setIsAdminAuthModalOpen(false);
    setSelectedOrderForDetail(null);
    setSearchQuery("");

    // Clear URL hash to pure root
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToProduct = (productId) => {
    setCurrentView("store");
    setSelectedProductId(productId);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsQuickViewOpen(false);
    setIsSizeGuideOpen(false);
    setIsOrderTrackingOpen(false);
    setSelectedOrderForDetail(null);

    const targetHash = `#product-${productId}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ modal: "product", id: productId }, "", targetHash);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToCategory = (categoryName) => {
    setCurrentView("store");
    setSelectedProductId(null);
    setActiveCategory(categoryName);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsQuickViewOpen(false);
    setIsSizeGuideOpen(false);
    setIsOrderTrackingOpen(false);
    setSelectedOrderForDetail(null);

    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }

    setTimeout(() => {
      const catalogEl = document.getElementById("catalog-section");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const navigateToAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView("admin");
      if (window.location.hash !== "#admin") {
        window.history.pushState({ modal: "admin" }, "", "#admin");
      }
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  // Dedicated Modal Opener and Closer Helpers (Handles URL Hash Cleanly)
  const openCart = () => {
    setIsCartOpen(true);
    if (window.location.hash !== "#cart") {
      window.history.pushState({ modal: "cart" }, "", "#cart");
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
    if (window.location.hash === "#cart") {
      window.history.pushState(null, "", window.location.pathname + (selectedProductId ? `#product-${selectedProductId}` : ""));
    }
  };

  const openCheckout = () => {
    setIsCheckoutOpen(true);
    if (window.location.hash !== "#checkout") {
      window.history.pushState({ modal: "checkout" }, "", "#checkout");
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    if (window.location.hash === "#checkout") {
      window.history.pushState(null, "", window.location.pathname + (selectedProductId ? `#product-${selectedProductId}` : ""));
    }
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
    if (window.location.hash !== "#quickview") {
      window.history.pushState({ modal: "quickview" }, "", "#quickview");
    }
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
    if (window.location.hash === "#quickview") {
      window.history.pushState(null, "", window.location.pathname + (selectedProductId ? `#product-${selectedProductId}` : ""));
    }
  };

  const openSizeGuide = () => {
    setIsSizeGuideOpen(true);
    if (window.location.hash !== "#sizeguide") {
      window.history.pushState({ modal: "sizeguide" }, "", "#sizeguide");
    }
  };

  const closeSizeGuide = () => {
    setIsSizeGuideOpen(false);
    if (window.location.hash === "#sizeguide") {
      window.history.pushState(null, "", window.location.pathname + (selectedProductId ? `#product-${selectedProductId}` : ""));
    }
  };

  const openOrderTracking = () => {
    setIsOrderTrackingOpen(true);
    if (window.location.hash !== "#tracking") {
      window.history.pushState({ modal: "tracking" }, "", "#tracking");
    }
  };

  const closeOrderTracking = () => {
    setIsOrderTrackingOpen(false);
    if (window.location.hash === "#tracking") {
      window.history.pushState(null, "", window.location.pathname + (selectedProductId ? `#product-${selectedProductId}` : ""));
    }
  };

  const closeAdminAuth = () => {
    setIsAdminAuthModalOpen(false);
    if (window.location.hash === "#admin" && sessionStorage.getItem("vanshra_admin_auth") !== "true") {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  // Dynamic URL hash, Browser History (Back / Forward / Mobile Swipe Back) & Router Sync
  useEffect(() => {
    // 1. Synchronize state with current URL hash
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#product-")) {
        const prodId = hash.replace("#product-", "");
        setSelectedProductId(prodId);
        setCurrentView("store");
      } else if (hash === "#admin" || window.location.search.includes("admin")) {
        if (sessionStorage.getItem("vanshra_admin_auth") === "true") {
          setCurrentView("admin");
        } else {
          setIsAdminAuthModalOpen(true);
        }
      } else if (hash === "#cart") {
        setIsCartOpen(true);
      } else if (hash === "#tracking") {
        setIsOrderTrackingOpen(true);
      } else if (hash === "#checkout") {
        setIsCheckoutOpen(true);
      } else if (hash === "#sizeguide") {
        setIsSizeGuideOpen(true);
      } else if (!hash || hash === "#") {
        setSelectedProductId(null);
        setCurrentView("store");
      }
    };

    syncFromHash();

    // 2. Keyboard shortcuts (Escape to close modals, Ctrl+Shift+A for Admin)
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isCheckoutOpen) closeCheckout();
        else if (isCartOpen) closeCart();
        else if (isQuickViewOpen) closeQuickView();
        else if (isSizeGuideOpen) closeSizeGuide();
        else if (isOrderTrackingOpen) closeOrderTracking();
        else if (isAdminAuthModalOpen) closeAdminAuth();
        else if (selectedOrderForDetail) setSelectedOrderForDetail(null);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        navigateToAdmin();
      }
    };

    // 3. Popstate event listener (Browser Back / Mobile Swipe Back Navigation)
    const handlePopState = () => {
      const currentHash = window.location.hash;

      // Priority 1: Modals
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (isQuickViewOpen) {
        setIsQuickViewOpen(false);
        setQuickViewProduct(null);
        return;
      }
      if (isSizeGuideOpen) {
        setIsSizeGuideOpen(false);
        return;
      }
      if (isOrderTrackingOpen) {
        setIsOrderTrackingOpen(false);
        return;
      }
      if (isAdminAuthModalOpen) {
        setIsAdminAuthModalOpen(false);
        return;
      }
      if (selectedOrderForDetail) {
        setSelectedOrderForDetail(null);
        return;
      }

      // Priority 2: Product Detail Page
      if (selectedProductId && !currentHash.startsWith("#product-")) {
        setSelectedProductId(null);
        return;
      }

      // Priority 3: Admin Layout
      if (currentView === "admin" && currentHash !== "#admin") {
        setCurrentView("store");
        return;
      }

      // Priority 4: Re-sync state from active URL Hash
      syncFromHash();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isCheckoutOpen,
    isCartOpen,
    isQuickViewOpen,
    isSizeGuideOpen,
    isOrderTrackingOpen,
    isAdminAuthModalOpen,
    selectedOrderForDetail,
    selectedProductId,
    currentView
  ]);

  // Sync URL hash when modal states change
  useEffect(() => {
    if (selectedProductId) {
      if (window.location.hash !== `#product-${selectedProductId}`) {
        window.history.pushState({ modal: "product", id: selectedProductId }, "", `#product-${selectedProductId}`);
      }
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (isCartOpen && window.location.hash !== "#cart") {
      window.history.pushState({ modal: "cart" }, "", "#cart");
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (isCheckoutOpen && window.location.hash !== "#checkout") {
      window.history.pushState({ modal: "checkout" }, "", "#checkout");
    }
  }, [isCheckoutOpen]);

  useEffect(() => {
    if (isQuickViewOpen && window.location.hash !== "#quickview") {
      window.history.pushState({ modal: "quickview" }, "", "#quickview");
    }
  }, [isQuickViewOpen]);

  useEffect(() => {
    if (isSizeGuideOpen && window.location.hash !== "#sizeguide") {
      window.history.pushState({ modal: "sizeguide" }, "", "#sizeguide");
    }
  }, [isSizeGuideOpen]);

  useEffect(() => {
    if (isOrderTrackingOpen && window.location.hash !== "#tracking") {
      window.history.pushState({ modal: "tracking" }, "", "#tracking");
    }
  }, [isOrderTrackingOpen]);

  // Safe LocalStorage setter with QuotaExceededError protection & auto-pruning
  const safeSetStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage quota exceeded for key: ${key}. Attempting storage optimization...`, e);
      try {
        if (key === STORAGE_KEYS.ORDERS && Array.isArray(value)) {
          const trimmed = value.slice(0, 20);
          localStorage.setItem(key, JSON.stringify(trimmed));
        } else if (key === STORAGE_KEYS.PRODUCTS && Array.isArray(value)) {
          const trimmed = value.map((p) => ({
            ...p,
            images: (p.images || []).slice(0, 2)
          }));
          localStorage.setItem(key, JSON.stringify(trimmed));
        }
      } catch (innerErr) {
        console.warn("Storage write fallback failed.", innerErr);
      }
    }
  };

  // Sync state to LocalStorage with quota protection
  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.COUPONS, coupons);
  }, [coupons]);

  // Multi-tab real-time synchronization (instantly reflects admin changes on open customer storefront tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_KEYS.SETTINGS) {
          const parsed = JSON.parse(e.newValue);
          setSettings({
            ...INITIAL_SETTINGS,
            ...parsed,
            hero: { ...INITIAL_SETTINGS.hero, ...(parsed.hero || {}) }
          });
        } else if (e.key === STORAGE_KEYS.PRODUCTS) {
          setProducts(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.ORDERS) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed.map(normalizeOrder).filter(Boolean));
          }
        } else if (e.key === STORAGE_KEYS.COUPONS) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCoupons(parsed);
          }
        }
      } catch (err) {
        console.warn("Storage sync listener error", err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Dynamic Browser Tab / Document Title
  useEffect(() => {
    const title = settings.brandName
      ? `${settings.brandName} | ${settings.tagline || "Crafted for Comfort, Worn with Grace"}`
      : "VANSHRA | Crafted for Comfort, Worn with Grace";
    document.title = title;
  }, [settings.brandName, settings.tagline]);

  // ==========================================
  // Optimized Cloud Synchronization & Caching
  // ==========================================

  // 1. Products & Settings Sync (Optimized with Version Cache - Consumes 1 Read when unchanged)
  const syncProductsWithCloud = useCallback(async (force = false) => {
    if (!isFirebaseConfigured() || isProductsSyncInProgress) return;

    const now = Date.now();
    try {
      isProductsSyncInProgress = true;
      hasInitialProductsSyncRun = true;
      setIsSyncingProducts(true);

      // Check local cache
      let localVersion = null;
      try {
        const rawVer = localStorage.getItem(STORAGE_KEYS.STORE_VERSION);
        localVersion = rawVer ? JSON.parse(rawVer) : null;
      } catch {
        localVersion = null;
      }

      let hasLocalProducts = false;
      try {
        const rawProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const parsed = rawProds ? JSON.parse(rawProds) : null;
        hasLocalProducts = Array.isArray(parsed) && parsed.length > 0;
      } catch {
        hasLocalProducts = false;
      }

      // Check lightweight version document FIRST (Consumes ONLY 1 Firestore read!)
      const versionMeta = await fetchStoreVersion();

      // If version matches and we already have products in cache, skip heavy collection read!
      if (!force && hasLocalProducts && localVersion && versionMeta?.productsUpdatedAt) {
        if (versionMeta.productsUpdatedAt === localVersion) {
          console.log(`[VANSHRA Cache] ✓ Catalog is up-to-date (v: ${localVersion}). Consumed only 1 Firestore read.`);
          lastProductSyncTimestamp = now;
          safeSetStorage(STORAGE_KEYS.LAST_PRODUCT_SYNC, String(now));
          return;
        }
      }

      // Catalog has changed or initial visit: Fetch full catalog & settings from Firestore
      console.log(`[VANSHRA Cloud] Fetching live products (Cloud v: ${versionMeta?.productsUpdatedAt || "none"}, Local v: ${localVersion || "none"})...`);
      const [cloudProducts, cloudSettings] = await Promise.all([
        fetchCloudCatalog(),
        fetchCloudSettings()
      ]);

      if (cloudProducts && Array.isArray(cloudProducts)) {
        const validCloud = cloudProducts.filter((p) => p && p.id);
        setProducts(validCloud);
        safeSetStorage(STORAGE_KEYS.PRODUCTS, validCloud);
      }

      if (cloudSettings && Object.keys(cloudSettings).length > 0) {
        setSettings((prev) => {
          const merged = { ...prev, ...cloudSettings };
          if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
          safeSetStorage(STORAGE_KEYS.SETTINGS, merged);
          return merged;
        });
      }

      // Update version and sync markers
      lastProductSyncTimestamp = now;
      const latestVer = (versionMeta && versionMeta.productsUpdatedAt) || new Date().toISOString();
      safeSetStorage(STORAGE_KEYS.STORE_VERSION, latestVer);
      safeSetStorage(STORAGE_KEYS.LAST_PRODUCT_SYNC, String(now));
    } catch (err) {
      console.warn("[VANSHRA Cloud Products Sync]", err);
    } finally {
      setIsSyncingProducts(false);
      isProductsSyncInProgress = false;
    }
  }, []);

  // 2. Orders Sync (Strictly Authenticated Admin Only - Zero Reads for Normal Visitors)
  const syncOrdersWithCloud = useCallback(async (force = false) => {
    if (!isFirebaseConfigured() || !isAdminAuthenticated || isOrdersSyncInProgress) return;

    const now = Date.now();
    if (!force && (now - lastOrdersSyncTimestamp < 60000)) return;

    try {
      isOrdersSyncInProgress = true;
      setIsSyncingOrders(true);

      let localOrdersVersion = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ORDERS_VERSION);
        localOrdersVersion = raw ? JSON.parse(raw) : null;
      } catch {
        localOrdersVersion = null;
      }

      const versionMeta = await fetchStoreVersion();

      // Check if orders have been modified since last sync
      let hasLocalOrders = false;
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
        const parsed = saved ? JSON.parse(saved) : [];
        hasLocalOrders = Array.isArray(parsed);
      } catch {
        hasLocalOrders = false;
      }

      if (!force && hasLocalOrders && versionMeta && versionMeta.ordersUpdatedAt) {
        if (localOrdersVersion && versionMeta.ordersUpdatedAt === localOrdersVersion) {
          // No new orders or order status changes in Firestore! Reuse local storage with 0 reads!
          lastOrdersSyncTimestamp = now;
          setIsSyncingOrders(false);
          isOrdersSyncInProgress = false;
          return;
        }
      }

      const cloudOrders = await fetchCloudOrders(50);

      if (cloudOrders && Array.isArray(cloudOrders)) {
        const normalizedCloud = cloudOrders
          .filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id))
          .map(normalizeOrder)
          .filter(Boolean)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // Cloud is single source of truth: accurately reflects additions and deletions across devices
        setOrders(normalizedCloud);
        safeSetStorage(STORAGE_KEYS.ORDERS, normalizedCloud);

        lastOrdersSyncTimestamp = now;
        const latestVer = (versionMeta && versionMeta.ordersUpdatedAt) || new Date().toISOString();
        safeSetStorage(STORAGE_KEYS.ORDERS_VERSION, latestVer);

        setSelectedOrderForDetail((curr) => {
          if (!curr) return null;
          const match = normalizedCloud.find((o) => o.id === curr.id);
          if (!match) return null;
          return match;
        });
      }
    } catch (err) {
      console.warn("[VANSHRA Cloud Orders Sync]", err);
    } finally {
      setIsSyncingOrders(false);
      isOrdersSyncInProgress = false;
    }
  }, [isAdminAuthenticated]);

  // 3. Targeted Single Order Lookup (For Customer Tracking - Reads exactly 1 doc, never the entire collection)
  const lookupOrder = useCallback(async (query) => {
    const cleanQuery = query ? String(query).trim() : "";
    if (!cleanQuery) return null;

    const upperQuery = cleanQuery.toUpperCase();
    const digitsOnly = cleanQuery.replace(/[^0-9]/g, "");

    // A. Check local state orders first (orders placed on this device)
    const localMatch = orders.find(
      (o) =>
        o.id?.toUpperCase() === upperQuery ||
        (digitsOnly.length >= 6 && o.customer?.phone && o.customer.phone.replace(/[^0-9]/g, "").includes(digitsOnly)) ||
        (o.customer?.email && o.customer.email.toLowerCase() === cleanQuery.toLowerCase())
    );

    if (localMatch) return localMatch;

    // B. Direct single-doc lookup in Firestore (Cost: 1 read!)
    if (isFirebaseConfigured()) {
      try {
        const cloudDoc = await fetchCloudOrderById(upperQuery);
        if (cloudDoc) {
          const normalized = normalizeOrder(cloudDoc);
          if (normalized) {
            // Cache in local state so subsequent viewings cost 0 reads
            setOrders((prev) => {
              if (prev.some((o) => o.id === normalized.id)) return prev;
              const updated = [normalized, ...prev];
              safeSetStorage(STORAGE_KEYS.ORDERS, updated);
              return updated;
            });
            return normalized;
          }
        }
      } catch (err) {
        console.warn("[VANSHRA Order Lookup]", err);
      }
    }

    return null;
  }, [orders]);

  // Initial mount sync: Run EXACTLY ONCE on page load (Cache-first single check)
  useEffect(() => {
    syncProductsWithCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin orders sync: Runs strictly when admin authenticates
  useEffect(() => {
    if (isAdminAuthenticated) {
      syncOrdersWithCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated]);

  // ==================== PRODUCT ACTIONS ====================

  const addProduct = async (productData) => {
    const nowIso = new Date().toISOString();
    const cleanedImages = Array.isArray(productData.images)
      ? productData.images.map(normalizeImageUrl).filter(Boolean)
      : [];

    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      images: cleanedImages.length > 0 ? cleanedImages : [FALLBACK_PRODUCT_IMAGE],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    safeSetStorage(STORAGE_KEYS.STORE_VERSION, nowIso);
    lastProductSyncTimestamp = Date.now();

    const next = [newProduct, ...products];
    setProducts(next);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, next);

    if (isFirebaseConfigured()) {
      const saved = await saveProductToCloud(newProduct);
      if (saved) {
        await updateStoreVersion({ productsUpdatedAt: nowIso });
        console.log(`[VANSHRA] Product "${newProduct.name}" saved to Firestore ✓`);
      } else {
        console.error(`[VANSHRA] FIRESTORE SAVE FAILED for product "${newProduct.name}"`);
        showToast(
          `⚠️ Product added locally but cloud save failed! Check browser console (F12) for error details.`,
          "error",
          7000
        );
      }
    }
    showToast(`Product "${newProduct.name}" created successfully!`, "success");
    return newProduct;
  };

  const updateProduct = async (productId, updatedFields) => {
    const nowIso = new Date().toISOString();
    let fields = { ...updatedFields, updatedAt: nowIso };
    if (Array.isArray(fields.images)) {
      const cleaned = fields.images.map(normalizeImageUrl).filter(Boolean);
      fields.images = cleaned.length > 0 ? cleaned : [FALLBACK_PRODUCT_IMAGE];
    }

    let updatedProdObj = null;
    const next = products.map((prod) => {
      if (prod.id === productId) {
        updatedProdObj = { ...prod, ...fields };
        return updatedProdObj;
      }
      return prod;
    });

    safeSetStorage(STORAGE_KEYS.STORE_VERSION, nowIso);
    lastProductSyncTimestamp = Date.now();
    setProducts(next);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, next);

    if (isFirebaseConfigured() && updatedProdObj) {
      await saveProductToCloud(updatedProdObj);
      await updateStoreVersion({ productsUpdatedAt: nowIso });
    }
    showToast("Product updated successfully!", "success");
  };

  const deleteProduct = async (productId) => {
    const nowIso = new Date().toISOString();
    const next = products.filter((prod) => prod.id !== productId);
    safeSetStorage(STORAGE_KEYS.STORE_VERSION, nowIso);
    lastProductSyncTimestamp = Date.now();
    setProducts(next);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, next);

    if (isFirebaseConfigured()) {
      await deleteProductFromCloud(productId);
      await updateStoreVersion({ productsUpdatedAt: nowIso });
    }
    showToast("Product removed from catalog", "info");
  };

  const updateSizeStock = async (productId, sizeKey, newCount) => {
    const count = Math.max(0, parseInt(newCount, 10) || 0);
    const nowIso = new Date().toISOString();
    let updatedProdObj = null;

    const next = products.map((prod) => {
      if (prod.id === productId) {
        updatedProdObj = {
          ...prod,
          sizes: {
            ...prod.sizes,
            [sizeKey]: count
          },
          updatedAt: nowIso
        };
        return updatedProdObj;
      }
      return prod;
    });

    safeSetStorage(STORAGE_KEYS.STORE_VERSION, nowIso);
    lastProductSyncTimestamp = Date.now();
    setProducts(next);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, next);

    if (isFirebaseConfigured() && updatedProdObj) {
      await saveProductToCloud(updatedProdObj);
      await updateStoreVersion({ productsUpdatedAt: nowIso });
    }
    showToast(`Updated ${sizeKey} stock to ${count}`, "success");
  };

  const addCategory = (newCat) => {
    const trimmed = newCat.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    setSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, trimmed]
    }));
    showToast(`Category "${trimmed}" added`, "success");
  };

  const deleteCategory = (catToDelete) => {
    if (catToDelete === "All") return;
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== catToDelete)
    }));
    if (activeCategory === catToDelete) {
      setActiveCategory("All");
    }
    showToast(`Category "${catToDelete}" removed`, "info");
  };

  // ==================== CART & WISHLIST ACTIONS ====================

  const addToCart = (product, size, color, quantity = 1) => {
    if (!size) {
      showToast("Please select a size first", "warning");
      return false;
    }

    const availableStock = product.sizes?.[size] ?? 0;
    if (availableStock <= 0) {
      showToast(`Size ${size} is currently out of stock!`, "error");
      return false;
    }

    const cartItemId = `${product.id}-${size}-${color?.name || "default"}`;
    const existingIndex = cart.findIndex((item) => item.id === cartItemId);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + quantity > availableStock) {
        showToast(`Only ${availableStock} items in size ${size} available in stock`, "warning");
        return false;
      }
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      const newItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        size,
        color: color?.name || "Default",
        colorHex: color?.hex || "#000",
        quantity: Math.min(quantity, availableStock),
        maxStock: availableStock
      };
      setCart((prev) => [...prev, newItem]);
    }

    showToast(`Added ${product.name} (${size}) to your bag!`, "success");
    setIsCartOpen(true);
    return true;
  };

  const updateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const product = products.find((p) => p.id === item.productId);
          const maxStock = product?.sizes?.[item.size] ?? 99;
          const clampedQty = Math.min(newQty, maxStock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast("Item removed from bag", "info");
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Removed from wishlist", "info");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Saved to wishlist!", "success");
        return [...prev, productId];
      }
    });
  };

  // Cart & Coupon calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const couponDiscount = appliedCoupon
    ? (() => {
        if (cartSubtotal < (appliedCoupon.minOrder || 0)) return 0;
        if (appliedCoupon.discountType === "percentage") {
          const calc = Math.round((cartSubtotal * appliedCoupon.value) / 100);
          return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
        }
        return Math.min(appliedCoupon.value, cartSubtotal);
      })()
    : 0;

  // Auto-remove appliedCoupon if cart becomes empty or falls below threshold
  useEffect(() => {
    if (appliedCoupon && cartSubtotal > 0 && cartSubtotal < (appliedCoupon.minOrder || 0)) {
      showToast(`Coupon "${appliedCoupon.code}" removed: Minimum order of ₹${appliedCoupon.minOrder} required`, "warning");
      setAppliedCoupon(null);
    } else if (appliedCoupon && cartSubtotal === 0) {
      setAppliedCoupon(null);
    }
  }, [cartSubtotal, appliedCoupon]);

  const isFreeShipping = (cartSubtotal - couponDiscount) >= settings.freeShippingThreshold || cartSubtotal === 0;
  const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee;
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount) + shippingFee;
  const totalCartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ==================== COUPON ACTIONS ====================

  const applyCoupon = (code) => {
    if (!code || typeof code !== "string") {
      showToast("Please enter a coupon code", "warning");
      return { success: false, message: "Please enter a coupon code" };
    }
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive !== false);

    if (!found) {
      showToast(`Coupon code "${trimmed}" is invalid or expired`, "error");
      return { success: false, message: `Coupon code "${trimmed}" is invalid or expired` };
    }

    if (cartSubtotal < (found.minOrder || 0)) {
      showToast(`Coupon "${trimmed}" requires a minimum order of ₹${found.minOrder}`, "warning");
      return { success: false, message: `Minimum order of ₹${found.minOrder} required for this coupon` };
    }

    let discountVal = 0;
    if (found.discountType === "percentage") {
      discountVal = Math.round((cartSubtotal * found.value) / 100);
      if (found.maxDiscount) {
        discountVal = Math.min(discountVal, found.maxDiscount);
      }
    } else {
      discountVal = Math.min(found.value, cartSubtotal);
    }

    setAppliedCoupon(found);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}
    showToast(`🎉 Coupon "${found.code}" applied! You saved ₹${discountVal}`, "success");
    return { success: true, coupon: found, discount: discountVal };
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      showToast(`Coupon "${appliedCoupon.code}" removed`, "info");
      setAppliedCoupon(null);
    }
  };

  const addCoupon = (couponData) => {
    const newCode = (couponData.code || "").trim().toUpperCase();
    if (!newCode) {
      showToast("Coupon code cannot be empty", "error");
      return false;
    }
    if (coupons.some((c) => c.code.toUpperCase() === newCode)) {
      showToast(`Coupon code "${newCode}" already exists`, "error");
      return false;
    }
    const newCoupon = {
      id: `cpn-${Date.now()}`,
      code: newCode,
      discountType: couponData.discountType || "percentage",
      value: Number(couponData.value) || 0,
      minOrder: Number(couponData.minOrder) || 0,
      maxDiscount: Number(couponData.maxDiscount) || 0,
      isActive: couponData.isActive !== false,
      description: couponData.description || ""
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon "${newCode}" added successfully!`, "success");
    return newCoupon;
  };

  const updateCoupon = (couponId, fields) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const updated = { ...c, ...fields };
          if (fields.code) updated.code = fields.code.trim().toUpperCase();
          if (fields.value !== undefined) updated.value = Number(fields.value) || 0;
          if (fields.minOrder !== undefined) updated.minOrder = Number(fields.minOrder) || 0;
          if (fields.maxDiscount !== undefined) updated.maxDiscount = Number(fields.maxDiscount) || 0;
          return updated;
        }
        return c;
      })
    );
    showToast("Coupon updated successfully!", "success");
    return true;
  };

  const deleteCoupon = (couponId) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    if (appliedCoupon?.id === couponId) {
      setAppliedCoupon(null);
    }
    showToast("Coupon removed", "info");
  };

  const toggleCouponStatus = (couponId) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const nextStatus = !c.isActive;
          showToast(`Coupon "${c.code}" is now ${nextStatus ? "Active" : "Inactive"}`, "info");
          return { ...c, isActive: nextStatus };
        }
        return c;
      })
    );
  };

  // ==================== ORDER ACTIONS ====================

  const placeOrder = (customerData) => {
    if (cart.length === 0) {
      showToast("Your bag is empty", "error");
      return null;
    }

    const orderId = customerData.orderId || generateOrderId("VAN");

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: customerData.status || "New",
      paymentMethod: customerData.paymentMethod || "Prepaid (UPI via Razorpay)",
      razorpayPaymentId: customerData.razorpayPaymentId || "",
      razorpayOrderId: customerData.razorpayOrderId || "",
      customer: {
        fullName: customerData.fullName,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        notes: customerData.notes || ""
      },
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: cartSubtotal,
      couponCode: appliedCoupon?.code || "",
      couponDiscount: couponDiscount || 0,
      shippingFee,
      total: cartTotal,
      dispatchInfo: {
        courierPartner: "",
        trackingNumber: "",
        dispatchDate: "",
        notes: ""
      }
    };

    // 1. Decrement stock for ordered sizes across all items in cart synchronously
    const nowIso = new Date().toISOString();
    const updatedProductsToSync = [];

    const nextProducts = products.map((prod) => {
      // Find ALL items in cart that correspond to this product (supports multiple sizes of the same product)
      const matchingCartItems = cart.filter((item) => item.productId === prod.id);
      if (matchingCartItems.length === 0) return prod;

      const updatedSizes = { ...(prod.sizes || {}) };
      matchingCartItems.forEach((cartItem) => {
        const currentStock = Number(updatedSizes[cartItem.size]) || 0;
        const qty = Number(cartItem.quantity) || 1;
        updatedSizes[cartItem.size] = Math.max(0, currentStock - qty);
      });

      const updatedProd = {
        ...prod,
        sizes: updatedSizes,
        updatedAt: nowIso
      };
      updatedProductsToSync.push(updatedProd);
      return updatedProd;
    });

    setProducts(nextProducts);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, nextProducts);

    // Persist decremented inventory to Cloud
    if (isFirebaseConfigured() && updatedProductsToSync.length > 0) {
      updatedProductsToSync.forEach((p) => saveProductToCloud(p));
    }

    // 2. Save order in 1 single Write
    const updatedOrder = normalizeOrder(newOrder);
    setOrders((prev) => {
      const nextOrders = [updatedOrder, ...prev.filter((o) => o.id !== updatedOrder.id)];
      safeSetStorage(STORAGE_KEYS.ORDERS, nextOrders);
      return nextOrders;
    });

    if (isFirebaseConfigured()) {
      saveOrderToCloud(updatedOrder);
    }

    // 3. Dispatch order to Google Sheets & Trigger Automatic Emails
    sendOrderToGoogleSheets(updatedOrder, settings);

    // 4. Clear cart, reset coupon and set latest order for success screen
    clearCart();
    setAppliedCoupon(null);
    setLatestPlacedOrder(newOrder);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    // 4. Play audio chime and trigger celebration
    playOrderChime();
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    showToast(`Order #${orderId} placed successfully!`, "success", 6000);
    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus, dispatchData = {}) => {
    const nowIso = new Date().toISOString();
    let updatedOrderObj = null;

    const next = orders.map((order) => {
      if (order.id === orderId) {
        updatedOrderObj = normalizeOrder({
          ...order,
          status: newStatus,
          updatedAt: nowIso,
          dispatchInfo: {
            ...(order.dispatchInfo || {}),
            ...dispatchData
          }
        });
        return updatedOrderObj;
      }
      return order;
    });

    setOrders(next);
    safeSetStorage(STORAGE_KEYS.ORDERS, next);

    if (updatedOrderObj) {
      setSelectedOrderForDetail((prev) => (prev && prev.id === orderId ? updatedOrderObj : prev));

      if (isFirebaseConfigured()) {
        try {
          const success = await saveOrderToCloud(updatedOrderObj);
          if (!success) {
            await updateOrderStatusInCloud(orderId, newStatus, nowIso);
          }
        } catch (err) {
          console.warn("[VANSHRA Cloud] updateOrderStatus error:", err);
          await updateOrderStatusInCloud(orderId, newStatus, nowIso);
        }
      }
    }
    showToast(`Order #${orderId} marked as ${newStatus}`, "success");
    return updatedOrderObj;
  };

  const deleteOrder = (orderId) => {
    const next = orders.filter((o) => o.id !== orderId);
    const nowIso = new Date().toISOString();
    setOrders(next);
    safeSetStorage(STORAGE_KEYS.ORDERS, next);
    safeSetStorage(STORAGE_KEYS.ORDERS_VERSION, nowIso);
    if (isFirebaseConfigured()) {
      deleteOrderFromCloud(orderId);
      updateStoreVersion({ ordersUpdatedAt: nowIso });
    }
    if (selectedOrderForDetail?.id === orderId) {
      setSelectedOrderForDetail(null);
    }
    showToast(`Order #${orderId} removed`, "info");
  };

  const clearAllOrders = () => {
    const nowIso = new Date().toISOString();
    orders.forEach((o) => {
      if (isFirebaseConfigured() && o.id) {
        deleteOrderFromCloud(o.id);
      }
    });
    setOrders([]);
    safeSetStorage(STORAGE_KEYS.ORDERS, []);
    safeSetStorage(STORAGE_KEYS.ORDERS_VERSION, nowIso);
    if (isFirebaseConfigured()) {
      updateStoreVersion({ ordersUpdatedAt: nowIso });
    }
    if (selectedOrderForDetail) {
      setSelectedOrderForDetail(null);
    }
    showToast("All customer orders cleared", "info");
  };

  const authenticateAdmin = (enteredPin) => {
    const validPin = String(settings.adminPin || "1234").trim();
    if (String(enteredPin).trim() === validPin) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("vanshra_admin_auth", "true");
      setIsAdminAuthModalOpen(false);
      setCurrentView("admin");
      if (window.location.hash !== "#admin") {
        window.history.pushState({ modal: "admin" }, "", "#admin");
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("vanshra_admin_auth");
    setCurrentView("store");
    if (window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    showToast("Admin Portal locked successfully", "info");
  };

  const updateAdminPin = (newPin) => {
    const cleanPin = String(newPin).trim();
    if (!cleanPin || cleanPin.length < 4) {
      showToast("PIN must be at least 4 digits", "error");
      return false;
    }
    const updated = { ...settings, adminPin: cleanPin };
    setSettings(updated);
    safeSetStorage(STORAGE_KEYS.SETTINGS, updated);
    if (isFirebaseConfigured()) {
      saveSettingsToCloud(updated);
    }
    showToast("Owner security PIN updated successfully!", "success");
    return true;
  };

  const openAdminLogin = () => {
    if (isAdminAuthenticated) {
      setCurrentView("admin");
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const updateSettings = (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    safeSetStorage(STORAGE_KEYS.SETTINGS, merged);
    if (isFirebaseConfigured()) {
      saveSettingsToCloud(merged);
    }
    showToast("Store settings saved successfully!", "success");
  };

  // ==================== BACKUP & RESTORE ====================

  const exportStoreData = () => {
    const data = {
      brand: settings.brandName,
      exportedAt: new Date().toISOString(),
      products,
      orders,
      settings
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${settings.brandName.toLowerCase()}_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Store data exported as JSON backup!", "success");
  };

  const importStoreData = (jsonData) => {
    try {
      if (jsonData.products && Array.isArray(jsonData.products)) {
        setProducts(jsonData.products);
        safeSetStorage(STORAGE_KEYS.PRODUCTS, jsonData.products);
        if (isFirebaseConfigured()) {
          jsonData.products.forEach((p) => saveProductToCloud(p));
        }
      }
      if (jsonData.orders && Array.isArray(jsonData.orders)) {
        const cleaned = jsonData.orders.map(normalizeOrder).filter(Boolean);
        setOrders(cleaned);
        safeSetStorage(STORAGE_KEYS.ORDERS, cleaned);
        if (isFirebaseConfigured()) {
          cleaned.forEach((o) => saveOrderToCloud(o));
        }
      }
      if (jsonData.settings && typeof jsonData.settings === "object") {
        setSettings(jsonData.settings);
        safeSetStorage(STORAGE_KEYS.SETTINGS, jsonData.settings);
        if (isFirebaseConfigured()) {
          saveSettingsToCloud(jsonData.settings);
        }
      }
      showToast("Store data successfully imported & restored!", "success");
      return true;
    } catch (err) {
      showToast("Failed to parse backup JSON file", "error");
      return false;
    }
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    safeSetStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    safeSetStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setCart([]);
    showToast("Reset store catalog & sample orders!", "info");
  };

  // Computed metrics for Admin Dashboard
  const confirmedList = orders.filter((o) => ["Confirmed", "Dispatched", "Delivered"].includes(o.status));
  const metrics = {
    // Total Sales strictly sums Confirmed, Dispatched, and Delivered orders
    totalRevenue: confirmedList.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    confirmedUnitsSold: confirmedList.reduce((sum, o) => sum + (o.items?.reduce((iSum, i) => iSum + (Number(i.quantity) || 1), 0) || 0), 0),
    confirmedOrdersCount: confirmedList.length,
    pipelineRevenue: orders.filter((o) => o.status === "New").reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    totalOrders: orders.length,
    newOrdersCount: orders.filter((o) => o.status === "New").length,
    confirmedCount: orders.filter((o) => o.status === "Confirmed").length,
    dispatchedCount: orders.filter((o) => o.status === "Dispatched").length,
    deliveredCount: orders.filter((o) => o.status === "Delivered").length,
    lowStockProducts: products.filter((p) => {
      const total = getTotalStock(p.sizes);
      return total > 0 && total <= 5;
    }),
    outOfStockProducts: products.filter((p) => getTotalStock(p.sizes) === 0)
  };

  return (
    <StoreContext.Provider
      value={{
        // Data
        products,
        orders,
        settings,
        cart,
        wishlist,
        metrics,
        // Views & Modals & Navigation
        currentView,
        setCurrentView,
        navigateToHome,
        navigateToProduct,
        navigateToCategory,
        navigateToAdmin,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openQuickView,
        closeQuickView,
        openSizeGuide,
        closeSizeGuide,
        openOrderTracking,
        closeOrderTracking,
        closeAdminAuth,
        isAdminAuthenticated,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        openAdminLogin,
        authenticateAdmin,
        logoutAdmin,
        updateAdminPin,
        selectedProductId,
        setSelectedProductId,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        latestPlacedOrder,
        setLatestPlacedOrder,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isQuickViewOpen,
        setIsQuickViewOpen,
        quickViewProduct,
        setQuickViewProduct,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        adminTab,
        setAdminTab,
        // Filters & Search
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        sizeFilter,
        setSizeFilter,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        // Cart & Coupon values
        cartSubtotal,
        couponDiscount,
        appliedCoupon,
        coupons,
        shippingFee,
        cartTotal,
        totalCartItemCount,
        isFreeShipping,
        // Actions
        applyCoupon,
        removeCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSizeStock,
        addCategory,
        deleteCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
        updateSettings,
        exportStoreData,
        importStoreData,
        resetToDemoData,
        // Cloud Sync Methods & Status
        syncProductsWithCloud,
        syncOrdersWithCloud,
        lookupOrder,
        isSyncingProducts,
        isSyncingOrders,
        // Toast
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
