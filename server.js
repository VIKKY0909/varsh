import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import config from './config.js';

const app = express();

// Validate configuration on startup
try {
  config.validate();
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Get Razorpay configuration
const razorpayConfig = config.getRazorpayConfig();

console.log('✅ Razorpay configured with:', {
  key_id: razorpayConfig.key_id,
  mode: razorpayConfig.key_id.includes('test') ? 'TEST' : 'LIVE'
});

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
    if (currency !== config.payment.currency) {
      return res.status(400).json({
        success: false,
        error: `Only ${config.payment.currency} currency is supported`
      });
    }

    // Create Razorpay order using their API
    const response = await axios.post('https://api.razorpay.com/v1/orders', {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
      payment_capture: config.payment.auto_capture ? 1 : 0
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${razorpayConfig.key_id}:${razorpayConfig.key_secret}`).toString('base64')}`
      },
      timeout: config.payment.timeout
    });

    console.log('✅ Razorpay order created:', {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency
    });

    res.json({
      success: true,
      order: response.data
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error.response?.data || error.message);
    
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
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order',
      details: error.response?.data || error.message
    });
  }
});

// Verify payment signature endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature'
      });
    }

    // Verify signature using crypto
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    console.log('🔍 Payment verification:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isValid: isValid
    });

    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Payment verified successfully' : 'Invalid payment signature'
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
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

    // Fetch payment details from Razorpay
    const response = await axios.get(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${razorpayConfig.key_id}:${razorpayConfig.key_secret}`).toString('base64')}`
      }
    });

    console.log('✅ Payment status fetched:', {
      payment_id: payment_id,
      status: response.data.status
    });

    res.json({
      success: true,
      payment: response.data
    });

  } catch (error) {
    console.error('❌ Error fetching payment status:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    razorpay: {
      configured: !!razorpayConfig.key_id && !!razorpayConfig.key_secret,
      mode: razorpayConfig.key_id?.includes('test') ? 'TEST' : 'LIVE'
    },
    environment: config.server.environment
  });
});

// Start server
app.listen(config.server.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.server.port}`);
  console.log('📋 Razorpay API endpoints:');
  console.log(`  POST /api/create-razorpay-order`);
  console.log(`  POST /api/verify-payment`);
  console.log(`  GET  /api/payment-status/:payment_id`);
  console.log(`  GET  /api/health`);
  console.log(`🔧 Environment: ${config.server.environment}`);
}); 