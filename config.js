// Configuration file for Razorpay and other settings
// In production, use environment variables instead of hardcoded values

const config = {
  // Razorpay Configuration
  razorpay: {
    // Test mode keys (replace with your actual test keys)
    test: {
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_KcjoPhlso7v6VN',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'G0LXpG4OVQidER2Yy0seBq6q'
    },
    // Production keys (set these in environment variables)
    live: {
      key_id: process.env.RAZORPAY_LIVE_KEY_ID || '',
      key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET || ''
    },
    // Frontend key (public key only)
    frontend_key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_KcjoPhlso7v6VN'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  },

  // Payment Configuration
  payment: {
    currency: 'INR',
    auto_capture: true,
    timeout: 10000 // 10 seconds
  },

  // Get current Razorpay configuration based on environment
  getRazorpayConfig() {
    const isProduction = this.server.environment === 'production';
    return isProduction ? this.razorpay.live : this.razorpay.test;
  },

  // Validate configuration
  validate() {
    const razorpayConfig = this.getRazorpayConfig();
    
    if (!razorpayConfig.key_id || !razorpayConfig.key_secret) {
      throw new Error('Razorpay configuration is incomplete. Please check your environment variables.');
    }

    console.log('✅ Configuration validated successfully');
    console.log(`🔧 Environment: ${this.server.environment}`);
    console.log(`💰 Razorpay Mode: ${razorpayConfig.key_id.includes('test') ? 'TEST' : 'LIVE'}`);
    
    return true;
  }
};

export default config;