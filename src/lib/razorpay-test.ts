// Razorpay Integration Test
// This file is for testing the Razorpay integration

import { initializeRazorpayCheckout, PaymentDetails } from './razorpay';

// Test payment details
const testPaymentDetails: PaymentDetails = {
  amount: 1000, // ₹10.00
  currency: 'INR',
  orderId: 'test_order_123',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+919876543210',
  customerAddress: 'Test Address, Mumbai, Maharashtra',
  items: [
    {
      name: 'Test Product',
      quantity: 1,
      price: 1000
    }
  ]
};

// Test function to verify integration
export const testRazorpayIntegration = async () => {
  try {
    console.log('Testing Razorpay integration...');
    
    // Test checkout initialization
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      console.log('Razorpay is loaded and ready');
      
      // Test checkout initialization
      await initializeRazorpayCheckout(
        testPaymentDetails,
        (response) => {
          console.log('Payment successful:', response);
        },
        (error) => {
          console.log('Payment failed:', error);
        }
      );
      
      return { success: true, message: 'Razorpay integration test completed' };
    } else {
      console.log('Razorpay not loaded yet');
      return { success: false, message: 'Razorpay not loaded' };
    }
  } catch (error) {
    console.error('Razorpay integration test failed:', error);
    return { success: false, error };
  }
};

// Export test data for use in components
export { testPaymentDetails }; 