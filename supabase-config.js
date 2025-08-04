// Supabase Configuration for Razorpay Integration
// Environment variables should be set in your Supabase project

const supabaseConfig = {
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // Razorpay Configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    frontendKey: process.env.VITE_RAZORPAY_KEY_ID || ''
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Get current Razorpay configuration based on environment
  getRazorpayConfig() {
    const isProduction = this.environment === 'production';
    return {
      keyId: this.razorpay.keyId,
      keySecret: this.razorpay.keySecret,
      mode: this.razorpay.keyId.includes('test') ? 'TEST' : 'LIVE'
    };
  },

  // Validate configuration
  validate() {
    const razorpayConfig = this.getRazorpayConfig();
    
    if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
      throw new Error('Razorpay configuration is incomplete. Please check your environment variables.');
    }

    if (!this.supabase.url || !this.supabase.anonKey) {
      throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
    }

    return true;
  }
};

export default supabaseConfig; 