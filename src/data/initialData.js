// Initial default data for VANSHRA - Kurtis, Tops & Ethnic Silhouettes

export const INITIAL_SETTINGS = {
  brandName: "VANSHRA",
  tagline: "Crafted for Comfort, Worn with Grace",
  logoUrl: "/vanshra-logo.png",
  currencySymbol: "₹",
  adminPhone: "+91 98765 43210",
  adminWhatsApp: "919876543210",
  adminUpiId: "918769102796@paytm",
  adminEmail: "support@vanshra.com",
  storeAddress: "Vanshra Studio & Boutique, 102 Heritage Lane, Jaipur, Rajasthan - 302001",
  adminAddress: "Vanshra Studio & Boutique, 102 Heritage Lane, Jaipur, Rajasthan - 302001",
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbyoKZe4OO-FpZuE4dsqVSfctOtlZply2UGH4y5QgTm7FnVLOzmBU9QL64DC4vojxvFJSQ/exec",
  adminPin: "1234",
  razorpayKeyId: "rzp_live_TYnxFeonLIDmVJ",
  enableRazorpay: true,
  freeShippingThreshold: 1999,
  standardShippingFee: 100,
  announcementText: "",
  categories: ["All", "Kurtis", "Tops", "Co-ords", "Dresses", "Bottoms", "Ethnic Wear", "New Arrivals"],
  instagramHandle: "@_VANSHRA_",
  hero: {
    badge: "Official Brand Showroom • Handcrafted Apparel",
    title: "Thoughtfully Crafted,\nWorn With Grace",
    subtitle: "Explore our exclusive collection of comfortable silhouettes and handcrafted clothing. Connect directly on WhatsApp for personalized fit assistance and order confirmation.",
    primaryBtnText: "Explore All Products",
    secondaryBtnText: "Browse Categories",
    bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
  }
};

export const INITIAL_PRODUCTS = [];

export const INITIAL_ORDERS = [];

export const STANDARD_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const INITIAL_COUPONS = [
  {
    id: "cpn-1",
    code: "VANSHRA10",
    discountType: "percentage",
    value: 10,
    minOrder: 999,
    maxDiscount: 500,
    isActive: true,
    description: "10% Instant Discount on handcrafted silhouettes (Orders above ₹999)"
  },
  {
    id: "cpn-2",
    code: "FESTIVE200",
    discountType: "flat",
    value: 200,
    minOrder: 1499,
    maxDiscount: 200,
    isActive: true,
    description: "Flat ₹200 OFF on festive kurtis & co-ord sets (Orders above ₹1,499)"
  },
  {
    id: "cpn-3",
    code: "FIRSTBUY",
    discountType: "flat",
    value: 150,
    minOrder: 799,
    maxDiscount: 150,
    isActive: true,
    description: "Welcome Offer: Flat ₹150 OFF on first purchase (Orders above ₹799)"
  },
  {
    id: "cpn-4",
    code: "ROYAL500",
    discountType: "flat",
    value: 500,
    minOrder: 2999,
    maxDiscount: 500,
    isActive: true,
    description: "Royal Tier: Flat ₹500 OFF on grand boutique orders above ₹2,999"
  }
];
