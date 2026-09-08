import crypto from "crypto";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Razorpay Key Secret not configured in environment variables" })
    };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body || "{}");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Missing required parameters: order_id, payment_id, and signature"
        })
      };
    }

    const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(bodyString)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          message: "Payment verified successfully",
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Signature mismatch. Verification failed."
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message || "Failed to verify signature"
      })
    };
  }
};
