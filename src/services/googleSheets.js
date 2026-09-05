import { cleanPhone } from "../utils/whatsapp";

export const sendOrderToGoogleSheets = async (order, settings) => {
  const webhookUrl = settings?.googleSheetWebhookUrl || "";
  if (!webhookUrl || !webhookUrl.trim().startsWith("http")) {
    // Webhook not configured yet
    return { success: false, reason: "Webhook URL not configured" };
  }

  try {
    const payload = {
      orderId: order.id,
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || "New",
      customer: {
        fullName: order.customer?.fullName || "Guest Customer",
        phone: cleanPhone(order.customer?.phone) || order.customer?.phone || "N/A",
        email: order.customer?.email || "",
        address: order.customer?.address || "",
        city: order.customer?.city || "",
        state: order.customer?.state || "",
        pincode: order.customer?.pincode || "",
        notes: order.customer?.notes || ""
      },
      items: (order.items || []).map((item) => ({
        name: item.name,
        size: item.size,
        color: item.color || "Standard",
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      subtotal: order.subtotal || 0,
      shippingFee: order.shippingFee || 0,
      total: order.total || 0,
      paymentMethod: order.paymentMethod || "Prepaid (UPI)",
      settings: {
        brandName: settings?.brandName || "VANSHRA",
        tagline: settings?.tagline || "Crafted for Comfort, Worn with Grace",
        currencySymbol: settings?.currencySymbol || "₹",
        adminEmail: settings?.adminEmail || "support@vanshra.com",
        adminWhatsApp: settings?.adminWhatsApp || "919876543210",
        adminPhone: settings?.adminPhone || "+91 98765 43210",
        adminUpiId: settings?.adminUpiId || "918769102796@paytm",
        storeAddress: settings?.storeAddress || settings?.adminAddress || "Jaipur, Rajasthan - 302001"
      }
    };

    // Google Apps Script Web App requires standard fetch with no-cors or JSON body
    await fetch(webhookUrl.trim(), {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    console.log(`[Google Sheets] Order #${order.id} successfully dispatched to Google Sheets webhook.`);
    return { success: true };
  } catch (err) {
    console.warn("[Google Sheets] Error dispatching order to Google Sheets:", err);
    return { success: false, error: err.message };
  }
};
