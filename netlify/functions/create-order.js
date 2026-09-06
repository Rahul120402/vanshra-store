import Razorpay from "razorpay";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TYmleybSB2FVsF";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "w3344JIQnQ9HgcaldDhoxugr";

  if (!key_id || !key_secret) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Razorpay credentials not configured" })
    };
  }

  try {
    const { amount, currency = "INR", receipt, notes = {} } = JSON.parse(event.body || "{}");
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid amount. Minimum 100 paise required." })
      };
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const orderOptions = {
      amount: Math.round(numericAmount),
      currency,
      receipt: receipt || `rec_${Date.now()}`,
      notes
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Failed to create order" })
    };
  }
};
