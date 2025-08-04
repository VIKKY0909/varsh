import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';

const app = express();

// Environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required');
}

// Middleware
app.use(cors());
app.use(express.json());

// Create Razorpay order endpoint
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency, receipt'
      });
    }

    // Validate amount (must be positive and in paise)
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Validate currency
    if (currency !== 'INR') {
      return res.status(400).json({
        success: false,
        error: 'Only INR currency is supported'
      });
    }

    // Create Razorpay order using their API
    const response = await axios.post('https://api.razorpay.com/v1/orders', {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
      payment_capture: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      timeout: 10000
    });

    res.json({
      success: true,
      order: response.data
    });

  } catch (error) {
    // Handle specific Razorpay errors
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.response.data
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Razorpay credentials'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature'
      });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = signature === razorpay_signature;

    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get payment status endpoint
app.get('/api/payment-status/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    // Fetch payment status from Razorpay
    const response = await axios.get(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      }
    });

    res.json({
      success: true,
      payment: response.data
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  // Server started successfully
}); 