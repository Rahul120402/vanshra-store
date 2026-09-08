import crypto from "crypto";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    return res.status(401).json({
      error: "Razorpay Key Secret not configured on the server. Please set RAZORPAY_KEY_SECRET in environment variables."
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required."
      });
    }

    // Generate expected signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(bodyString)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      return res.status(200).json({
        success: true,
        message: "Payment signature verified successfully.",
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      console.warn("[Razorpay Verification] Signature mismatch detected!", {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return res.status(400).json({
        success: false,
        error: "Payment verification failed: Signature mismatch. Do not process order."
      });
    }
  } catch (err) {
    console.error("[Razorpay API Error - verify-payment]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to verify payment signature"
    });
  }
}
