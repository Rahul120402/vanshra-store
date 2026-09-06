import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpayApiPlugin = () => ({
  name: 'razorpay-api-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0];

      if (req.method === 'POST' && (url === '/api/create-order' || url === '/api/verify-payment')) {
        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          let body = {};
          try {
            if (bodyStr) body = JSON.parse(bodyStr);
          } catch (e) {
            // ignore
          }

          const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
          const key_id = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TYmleybSB2FVsF';
          const key_secret = env.RAZORPAY_KEY_SECRET || 'w3344JIQnQ9HgcaldDhoxugr';

          res.setHeader('Content-Type', 'application/json');

          if (url === '/api/create-order') {
            try {
              const { amount, currency = 'INR', receipt, notes = {} } = body;
              const numericAmount = Number(amount);
              if (!numericAmount || numericAmount < 100) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid amount. Minimum 100 paise required.' }));
                return;
              }

              const razorpay = new Razorpay({ key_id, key_secret });
              const order = await razorpay.orders.create({
                amount: Math.round(numericAmount),
                currency,
                receipt: receipt || `rec_${Date.now()}`,
                notes
              });

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
              }));
            } catch (err) {
              console.error('[Vite Dev API] Razorpay create-order error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Failed to create Razorpay order' }));
            }
          } else if (url === '/api/verify-payment') {
            try {
              const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
              if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Missing required parameters' }));
                return;
              }

              const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
              const expectedSignature = crypto
                .createHmac('sha256', key_secret)
                .update(bodyString)
                .digest('hex');

              if (expectedSignature === razorpay_signature) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  message: 'Payment verified successfully',
                  order_id: razorpay_order_id,
                  payment_id: razorpay_payment_id
                }));
              } else {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Signature mismatch' }));
              }
            } catch (err) {
              console.error('[Vite Dev API] verify-payment error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), razorpayApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
