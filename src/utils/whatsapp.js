// Clean, professional WhatsApp message generators for Vanshra Store

export const cleanPhone = (phone) => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^0-9]/g, "");
  // Strip any leading zeros (e.g. 07665740403 -> 7665740403, 0091... -> 91...)
  while (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  // If Indian 10-digit number without country code, add 91
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  // If starts with 910 and has 13 digits, remove the redundant 0
  if (cleaned.startsWith("910") && cleaned.length === 13) {
    cleaned = "91" + cleaned.slice(3);
  }
  return cleaned;
};

/**
 * Format order details for CUSTOMER to send to Vanshra Team
 */
export const createCustomerOrderMessage = (order, settings) => {
  const itemsList = (order?.items || [])
    .map((item, idx) => `${idx + 1}. ${item.name} - Size: ${item.size} (Qty: ${item.quantity}) - ${settings?.currencySymbol || "₹"}${(item.price || 0) * (item.quantity || 1)}`)
    .join("\n");

  const brand = settings?.brandName || "VANSHRA";
  const custName = order?.customer?.fullName || "Customer";
  const custPhone = order?.customer?.phone || "";
  const custAddr = order?.customer?.address || "";
  const custCity = order?.customer?.city || "";
  const custState = order?.customer?.state || "";
  const custPin = order?.customer?.pincode || "";
  const custNotes = order?.customer?.notes || "";

  const text = `Hello ${brand} Team,

I have placed an order on your website (Order #${order?.id || ""}).

Order Summary:
${itemsList}

Total Amount: ${settings?.currencySymbol || "₹"}${order?.total || 0}

Delivery Address:
Name: ${custName}
Phone: ${custPhone}
Address: ${custAddr}, ${custCity}, ${custState} - ${custPin}
${custNotes ? `Note: ${custNotes}\n` : ""}
Please verify my order and confirm dispatch. Thank you!`;

  const adminPhone = cleanPhone(settings?.adminWhatsApp || "918769102796");
  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Admin sending Order Confirmation & UPI Payment details to customer
 */
export const createAdminConfirmMessage = (order, settings) => {
  const customerPhone = cleanPhone(order?.customer?.phone);
  const custName = order?.customer?.fullName || "Valued Customer";
  const itemsList = (order?.items || [])
    .map((item) => `- ${item.name} (Size: ${item.size}, Qty: ${item.quantity})`)
    .join("\n");

  const brand = settings?.brandName || "VANSHRA";
  const upiId = settings?.adminUpiId || "918769102796@paytm";

  const text = `Hello ${custName},

Thank you for placing order #${order?.id || ""} with ${brand}.

Order Summary:
${itemsList}
Total Amount: ${settings?.currencySymbol || "₹"}${order?.total || 0}

Delivery Address:
${order?.customer?.address || ""}, ${order?.customer?.city || ""}, ${order?.customer?.state || ""} - ${order?.customer?.pincode || ""}

To confirm your order and initiate same-day dispatch, please complete the payment via UPI:
UPI ID: ${upiId}
Total Amount: ${settings?.currencySymbol || "₹"}${order?.total || 0}

Please reply with a payment screenshot once completed so our team can immediately pack and dispatch your parcel. Thank you!

- Team ${brand}`;

  if (customerPhone) {
    return `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/**
 * Admin sending Dispatch notification with Courier tracking
 */
export const createAdminDispatchMessage = (order, settings) => {
  const customerPhone = cleanPhone(order?.customer?.phone);
  const custName = order?.customer?.fullName || "Valued Customer";
  const brand = settings?.brandName || "VANSHRA";

  const text = `Hello ${custName},

Your order #${order?.id || ""} from ${brand} has been dispatched.

Dispatch Details:
Courier Partner: ${order?.dispatchInfo?.courierPartner || "Express Courier"}
Tracking Number: ${order?.dispatchInfo?.trackingNumber || "Assigned"}
Dispatch Date: ${order?.dispatchInfo?.dispatchDate || new Date().toISOString().slice(0, 10)}
${order?.dispatchInfo?.notes ? `Note: ${order.dispatchInfo.notes}\n` : ""}
Please feel free to message us here if you have any questions regarding your delivery.

- Team ${brand}`;

  if (customerPhone) {
    return `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/**
 * General product inquiry
 */
export const createProductInquiryUrl = (product, phone, settings) => {
  const brand = settings?.brandName || "VANSHRA";
  const text = `Hello ${brand} Team,

I am interested in ${product.name} (${settings?.currencySymbol || "₹"}${product.price}).
Could you please share details regarding fabric, size availability, and payment?`;

  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
};

/**
 * General customer support inquiry
 */
export const createGeneralInquiryUrl = (phone, subject, settings) => {
  const brand = settings?.brandName || "VANSHRA";
  const text = `Hello ${brand} Team,

I would like assistance regarding ${subject}.`;

  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
};

/**
 * Exported aliases for backwards compatibility
 */
export const createAdminToCustomerConfirmUrl = (phone, order, settings) => createAdminConfirmMessage(order, settings);
export const createAdminToCustomerDispatchUrl = (phone, order, settings) => createAdminDispatchMessage(order, settings);
export const createCustomerToAdminOrderUrl = (phone, order, settings) => createCustomerOrderMessage(order, settings);
