import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS } from "../data/initialData";
import { generateOrderId, getTotalStock, normalizeImageUrl, FALLBACK_PRODUCT_IMAGE } from "../utils/formatters";
import { playOrderChime } from "../utils/audio";
import confetti from "canvas-confetti";
import { 
  isFirebaseConfigured, 
  fetchCloudProducts, 
  saveProductToCloud, 
  deleteProductFromCloud,
  fetchCloudOrders, 
  saveOrderToCloud, 
  deleteOrderFromCloud,
  fetchCloudSettings,
  saveSettingsToCloud
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
  DELETED_PRODUCT_IDS: "vanshra_clothing_deleted_prod_ids_v2"
};

const getDeletedProductIds = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DELETED_PRODUCT_IDS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const addDeletedProductId = (id) => {
  if (!id) return;
  try {
    const current = getDeletedProductIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
};

const removeDeletedProductId = (id) => {
  if (!id) return;
  try {
    const current = getDeletedProductIds();
    const updated = current.filter((x) => x !== id);
    localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

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
    // If an order has 0 items and 0 total, repair it with a catalog product
    const fallbackProd = INITIAL_PRODUCTS[0];
    items = [
      {
        productId: fallbackProd.id,
        name: fallbackProd.name,
        image: fallbackProd.images[0],
        size: "M",
        color: fallbackProd.colors[0]?.name || "Standard",
        price: fallbackProd.price,
        quantity: 1
      }
    ];
    subtotal = fallbackProd.price;
    shippingFee = 0;
    total = fallbackProd.price;
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

export const StoreProvider = ({ children }) => {
  // 1. Core State with LocalStorage initialization
  const [products, setProducts] = useState(() => {
    try {
      const deletedSet = new Set(getDeletedProductIds());
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => p && p.id && !deletedSet.has(p.id));
        }
      }
      return INITIAL_PRODUCTS.filter((p) => p && p.id && !deletedSet.has(p.id));
    } catch {
      return INITIAL_PRODUCTS;
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

  // Admin PIN Authentication & Privacy
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem("vanshra_admin_auth") === "true";
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

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
    if (window.location.hash === "#admin" && currentView !== "admin") {
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

  // Real-time Cloud Synchronization (Products, Orders, Settings)
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let isMounted = true;
    const syncWithCloud = async () => {
      try {
        const [cloudProducts, cloudOrders, cloudSettings] = await Promise.all([
          fetchCloudProducts(),
          fetchCloudOrders(),
          fetchCloudSettings()
        ]);

        if (!isMounted) return;

        if (cloudProducts && Array.isArray(cloudProducts)) {
          const deletedSet = new Set(getDeletedProductIds());

          // Clean up any deleted products that still exist in cloud
          cloudProducts.forEach((p) => {
            if (p && p.id && deletedSet.has(p.id)) {
              deleteProductFromCloud(p.id);
            }
          });

          const activeCloud = cloudProducts.filter((p) => p && p.id && !deletedSet.has(p.id));

          setProducts((prev) => {
            const prodMap = new Map();
            // 1. Put all valid cloud products
            activeCloud.forEach((p) => prodMap.set(p.id, p));
            // 2. Put local products that are not deleted and not in cloud yet
            prev.forEach((p) => {
              if (p && p.id && !deletedSet.has(p.id) && !prodMap.has(p.id)) {
                prodMap.set(p.id, p);
                saveProductToCloud(p);
              }
            });
            const merged = Array.from(prodMap.values());
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            safeSetStorage(STORAGE_KEYS.PRODUCTS, merged);
            return merged;
          });
        }

        if (cloudOrders && Array.isArray(cloudOrders)) {
          const normalizedCloud = cloudOrders
            .filter((o) => o && o.id && !DEMO_ORDER_IDS.has(o.id))
            .map(normalizeOrder)
            .filter(Boolean);
          setOrders((prev) => {
            const orderMap = new Map();
            // 1. Put all clean cloud orders
            normalizedCloud.forEach((o) => orderMap.set(o.id, o));
            // 2. Put local orders (preserve any local new orders not yet in cloud, excluding demo orders)
            prev.forEach((o) => {
              if (o && o.id && !DEMO_ORDER_IDS.has(o.id) && !orderMap.has(o.id)) {
                orderMap.set(o.id, o);
              }
            });
            const merged = Array.from(orderMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            return merged;
          });
        }



        if (cloudSettings && Object.keys(cloudSettings).length > 0) {
          setSettings((prev) => {
            const merged = { ...prev, ...cloudSettings };
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            return merged;
          });
        }
      } catch (err) {
        console.warn("[VANSHRA Cloud Sync]", err);
      }
    };

    syncWithCloud();
    const interval = setInterval(syncWithCloud, 20000); // 20s polling interval
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ==================== PRODUCT ACTIONS ====================

  const addProduct = (productData) => {
    const cleanedImages = Array.isArray(productData.images)
      ? productData.images.map(normalizeImageUrl).filter(Boolean)
      : [];

    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      images: cleanedImages.length > 0 ? cleanedImages : [FALLBACK_PRODUCT_IMAGE],
      createdAt: new Date().toISOString()
    };

    removeDeletedProductId(newProduct.id);

    setProducts((prev) => {
      const next = [newProduct, ...prev];
      safeSetStorage(STORAGE_KEYS.PRODUCTS, next);
      return next;
    });
    if (isFirebaseConfigured()) {
      saveProductToCloud(newProduct);
    }
    showToast(`Product "${newProduct.name}" created successfully!`, "success");
    return newProduct;
  };

  const updateProduct = (productId, updatedFields) => {
    let fields = { ...updatedFields };
    if (Array.isArray(fields.images)) {
      const cleaned = fields.images.map(normalizeImageUrl).filter(Boolean);
      fields.images = cleaned.length > 0 ? cleaned : [FALLBACK_PRODUCT_IMAGE];
    }

    setProducts((prev) => {
      const next = prev.map((prod) => (prod.id === productId ? { ...prod, ...fields } : prod));
      safeSetStorage(STORAGE_KEYS.PRODUCTS, next);
      const updated = next.find((p) => p.id === productId);
      if (updated && isFirebaseConfigured()) {
        saveProductToCloud(updated);
      }
      return next;
    });
    showToast("Product updated successfully!", "success");
  };

  const deleteProduct = (productId) => {
    addDeletedProductId(productId);
    setProducts((prev) => {
      const next = prev.filter((prod) => prod.id !== productId);
      safeSetStorage(STORAGE_KEYS.PRODUCTS, next);
      return next;
    });
    if (isFirebaseConfigured()) {
      deleteProductFromCloud(productId);
    }
    showToast("Product removed from catalog", "info");
  };

  const updateSizeStock = (productId, sizeKey, newCount) => {
    const count = Math.max(0, parseInt(newCount, 10) || 0);
    setProducts((prev) => {
      const next = prev.map((prod) => {
        if (prod.id === productId) {
          return {
            ...prod,
            sizes: {
              ...prod.sizes,
              [sizeKey]: count
            }
          };
        }
        return prod;
      });
      const updated = next.find((p) => p.id === productId);
      if (updated && isFirebaseConfigured()) {
        saveProductToCloud(updated);
      }
      return next;
    });
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

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0;
  const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee;
  const cartTotal = cartSubtotal + shippingFee;
  const totalCartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ==================== ORDER ACTIONS ====================

  const placeOrder = (customerData) => {
    if (cart.length === 0) {
      showToast("Your bag is empty", "error");
      return null;
    }

    const orderId = generateOrderId("VAN");

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "New", // "New" | "Confirmed" | "Dispatched" | "Delivered" | "Cancelled"
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
      shippingFee,
      total: cartTotal,
      paymentMethod: "Direct WhatsApp / Advance UPI Confirmation",
      dispatchInfo: {
        courierPartner: "",
        trackingNumber: "",
        dispatchDate: "",
        notes: ""
      }
    };

    // 1. Decrement stock for ordered sizes
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const orderItem = cart.find((item) => item.productId === prod.id);
        if (orderItem) {
          const currentSizeStock = prod.sizes?.[orderItem.size] ?? 0;
          const newSizeStock = Math.max(0, currentSizeStock - orderItem.quantity);
          return {
            ...prod,
            sizes: {
              ...prod.sizes,
              [orderItem.size]: newSizeStock
            }
          };
        }
        return prod;
      })
    );

    // 2. Save order
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

    // 3. Clear cart and set latest order for success screen
    clearCart();
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

  const updateOrderStatus = (orderId, newStatus, dispatchData = {}) => {
    let updatedOrderObj = null;
    setOrders((prev) => {
      const next = prev.map((order) => {
        if (order.id === orderId) {
          updatedOrderObj = normalizeOrder({
            ...order,
            status: newStatus,
            dispatchInfo: {
              ...(order.dispatchInfo || {}),
              ...dispatchData
            }
          });
          return updatedOrderObj;
        }
        return order;
      });
      safeSetStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });

    if (updatedOrderObj && isFirebaseConfigured()) {
      saveOrderToCloud(updatedOrderObj);
    }
    showToast(`Order #${orderId} marked as ${newStatus}`, "success");
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      safeSetStorage(STORAGE_KEYS.ORDERS, next);
      return next;
    });
    if (isFirebaseConfigured()) {
      deleteOrderFromCloud(orderId);
    }
    if (selectedOrderForDetail?.id === orderId) {
      setSelectedOrderForDetail(null);
    }
    showToast(`Order #${orderId} removed`, "info");
  };

  const clearAllOrders = () => {
    orders.forEach((o) => {
      if (isFirebaseConfigured() && o.id) {
        deleteOrderFromCloud(o.id);
      }
    });
    setOrders([]);
    safeSetStorage(STORAGE_KEYS.ORDERS, []);
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
      setCurrentView("admin");
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
    setSettings((prev) => {
      const updated = { ...prev, adminPin: cleanPin };
      safeSetStorage(STORAGE_KEYS.SETTINGS, updated);
      if (isFirebaseConfigured()) {
        saveSettingsToCloud(updated);
      }
      return updated;
    });
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
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (isFirebaseConfigured()) {
        saveSettingsToCloud(merged);
      }
      return merged;
    });
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
      }
      if (jsonData.orders && Array.isArray(jsonData.orders)) {
        setOrders(jsonData.orders);
      }
      if (jsonData.settings && typeof jsonData.settings === "object") {
        setSettings(jsonData.settings);
      }
      showToast("Store data successfully imported & restored!", "success");
      return true;
    } catch (err) {
      showToast("Failed to parse backup JSON file", "error");
      return false;
    }
  };

  const resetToDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DELETED_PRODUCT_IDS);
    } catch {}
    setProducts(INITIAL_PRODUCTS);
    safeSetStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (isFirebaseConfigured()) {
      INITIAL_PRODUCTS.forEach((p) => saveProductToCloud(p));
    }
    setOrders(INITIAL_ORDERS);
    safeSetStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    safeSetStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setCart([]);
    showToast("Reset store to official demo catalog & sample orders!", "info");
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
        // Cart values
        cartSubtotal,
        shippingFee,
        cartTotal,
        totalCartItemCount,
        isFreeShipping,
        // Actions
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
