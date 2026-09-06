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
  razorpayKeyId: "rzp_test_TYmleybSB2FVsF",
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

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Gulabi Chanderi Silk Embroidered Kurti",
    category: "Kurtis",
    price: 1899,
    originalPrice: 2499,
    sku: "VAN-KT-001",
    description: "Straight-cut festive kurti woven in fine Chanderi silk with delicate Zari thread yoke embroidery, Mandarin collar, and three-quarter sleeves with organza lace detailing.",
    fabricCare: "Pure Chanderi Silk with Mulmul Lining. Gentle hand wash in cold water or dry clean.",
    isNew: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Gulabi Rose", hex: "#d87080" },
      { name: "Powder Blue", hex: "#94b0c2" },
      { name: "Haldi Yellow", hex: "#e5a93c" }
    ],
    sizes: {
      S: 6,
      M: 10,
      L: 5,
      XL: 3,
      XXL: 2
    },
    createdAt: "2026-08-20T10:00:00.000Z"
  },
  {
    id: "prod-2",
    name: "Indigo Block-Print Pure Cotton A-Line Kurti",
    category: "Kurtis",
    price: 1299,
    originalPrice: 1699,
    sku: "VAN-KT-002",
    description: "Breathable 60s count pure cotton A-line daily wear kurti featuring traditional Dabu indigo hand block print, front wooden buttons, and a comfortable side slit silhouette.",
    fabricCare: "100% Premium Cotton. Colorfast cold machine wash.",
    isNew: false,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Royal Indigo", hex: "#1e3a8a" },
      { name: "Earthy Rust", hex: "#9a3412" }
    ],
    sizes: {
      S: 8,
      M: 12,
      L: 8,
      XL: 4,
      XXL: 1
    },
    createdAt: "2026-08-21T11:30:00.000Z"
  },
  {
    id: "prod-3",
    name: "Floral Embroidered Peplum Short Top",
    category: "Tops",
    price: 999,
    originalPrice: 1399,
    sku: "VAN-TP-003",
    description: "Chic contemporary short kurti / peplum top with fine floral thread embroidery on the neckline, elasticated waist flare, and breathable linen-cotton blend.",
    fabricCare: "Linen-Cotton Blend. Easy hand wash.",
    isNew: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Ivory Floral", hex: "#fcfaf7" },
      { name: "Sage Mint", hex: "#a3b899" }
    ],
    sizes: {
      S: 5,
      M: 8,
      L: 2,
      XL: 0,
      XXL: 0
    },
    createdAt: "2026-08-22T09:15:00.000Z"
  },
  {
    id: "prod-4",
    name: "Mulberry Silk Angrakha Kurti Set with Pant",
    category: "Co-ords",
    price: 2699,
    originalPrice: 3499,
    sku: "VAN-KS-004",
    description: "Flattering Angrakha crossover kurti set with handcrafted tassel tie-ups, paired with matching ankle-length straight cigarette pants with comfortable elasticated waistband.",
    fabricCare: "Silk Cotton with Cotton Voile Lining. Dry clean recommended.",
    isNew: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Emerald Bottle Green", hex: "#064e3b" },
      { name: "Maroon Crimson", hex: "#881337" },
      { name: "Mustard Gold", hex: "#ca8a04" }
    ],
    sizes: {
      S: 4,
      M: 7,
      L: 6,
      XL: 3,
      XXL: 2
    },
    createdAt: "2026-08-23T14:20:00.000Z"
  },
  {
    id: "prod-5",
    name: "Boho Pleated Muslin Tunic Top",
    category: "Tops",
    price: 1149,
    originalPrice: 1499,
    sku: "VAN-TP-005",
    description: "Effortless casual tunic top in soft organic muslin featuring pin-tuck front detailing, bishop sleeves with elastic cuffs, and a relaxed everyday silhouette.",
    fabricCare: "100% Pure Organic Muslin. Machine wash cold.",
    isNew: false,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Alabaster White", hex: "#f8f6f0" },
      { name: "Blush Peach", hex: "#fed7aa" }
    ],
    sizes: {
      S: 7,
      M: 9,
      L: 5,
      XL: 2,
      XXL: 0
    },
    createdAt: "2026-08-24T08:45:00.000Z"
  },
  {
    id: "prod-6",
    name: "Zari Buta Festive Anarkali Kurti",
    category: "Ethnic Wear",
    price: 2299,
    originalPrice: 2999,
    sku: "VAN-KT-006",
    description: "Flowing 32-kali flared Anarkali festive kurti embellished with woven golden Zari butas, sweetheart neck, and rich border flair for festive poojas and family occasions.",
    fabricCare: "Art Silk Jacquard. Dry clean recommended.",
    isNew: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: [
      { name: "Peacock Royal Teal", hex: "#0f766e" },
      { name: "Rani Magenta", hex: "#be185d" }
    ],
    sizes: {
      S: 5,
      M: 8,
      L: 4,
      XL: 2,
      XXL: 1
    },
    createdAt: "2026-08-24T16:10:00.000Z"
  }
];

export const INITIAL_ORDERS = [];

export const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];
