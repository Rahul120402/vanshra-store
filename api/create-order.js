import Razorpay from "razorpay";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(401).json({
      error: "Razorpay credentials not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables."
    });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { amount, currency = "INR", receipt, notes = {} } = body || {};

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 100) {
      return res.status(400).json({
        error: "Invalid amount. Minimum transaction amount is 100 paise (₹1.00)."
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret
    });

    const receiptStr = String(receipt || `rcpt_${Date.now()}`).slice(0, 39);

    const orderOptions = {
      amount: Math.round(numericAmount), // in paise
      currency: currency || "INR",
      receipt: receiptStr,
      notes: typeof notes === "object" && notes !== null ? notes : {}
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    });
  } catch (err) {
    console.error("[Razorpay API Error - create-order]:", err);
    return res.status(500).json({
      error: err.message || "Failed to create Razorpay order",
      details: err.description || err
    });
  }
}
