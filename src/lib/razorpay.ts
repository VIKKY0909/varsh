// Razorpay Integration for Varsh E-commerce
// Using Supabase Edge Functions for backend

import { supabase } from './supabase';

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_KcjoPhlso7v6VN',
  currency: 'INR',
  name: 'Varsh Ethnic Wears',
  description: 'Ethnic Wear Purchase',
  image: '/logo.png', // Add your logo path
  prefill: {
    name: '',
    email: '',
    contact: ''
  },
  notes: {
    address: 'Varsh Ethnic Wears'
  },
  theme: {
    color: '#B76E79' // Rose gold color matching your theme
  }
};

// Payment interface
export interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Payment response interface
export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Supabase Edge Functions URLs
const SUPABASE_FUNCTIONS = {
  createOrder: 'https://qajswgkrjldtugyymydg.supabase.co/functions/v1/create-razorpay-order',
  verifyPayment: 'https://qajswgkrjldtugyymydg.supabase.co/functions/v1/verify-razorpay-payment',
  getPaymentStatus: 'https://qajswgkrjldtugyymydg.supabase.co/functions/v1/get-razorpay-payment-status'
};

// Get Supabase anon key from environment
const getSupabaseKey = () => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
};

// Create Razorpay order using Supabase Edge Function
export const createRazorpayOrder = async (paymentDetails: PaymentDetails) => {
  try {
    // Validate payment details
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      throw new Error('Customer email and phone are required');
    }

    // Call Supabase Edge Function to create Razorpay order
    const response = await fetch(SUPABASE_FUNCTIONS.createOrder, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseKey()}`,
        'apikey': getSupabaseKey()
      },
      body: JSON.stringify({
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        receipt: paymentDetails.orderId,
        orderId: paymentDetails.orderId,
        customerInfo: {
          email: paymentDetails.customerEmail,
          phone: paymentDetails.customerPhone
        },
        notes: {
          order_id: paymentDetails.orderId,
          customer_address: paymentDetails.customerAddress,
          customer_email: paymentDetails.customerEmail,
          customer_phone: paymentDetails.customerPhone,
          items: JSON.stringify(paymentDetails.items)
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create order`);
    }

    const data = await response.json();

    if (!data.success || !data.order) {
      throw new Error('Invalid response from server');
    }

    console.log('✅ Razorpay order created:', data.order);
    return data.order;
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature using Supabase Edge Function
export const verifyPaymentSignature = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  orderId?: string
): Promise<boolean> => {
  try {
    // Call Supabase Edge Function to verify signature
    const response = await fetch(SUPABASE_FUNCTIONS.verifyPayment, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseKey()}`,
        'apikey': getSupabaseKey()
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Verification failed`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Verification failed');
    }

    console.log('✅ Payment verification result:', data);
    return data.isValid;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return false;
  }
};

// Get payment status using Supabase Edge Function
export const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`${SUPABASE_FUNCTIONS.getPaymentStatus}/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${getSupabaseKey()}`,
        'apikey': getSupabaseKey()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch payment status`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch payment status');
    }

    return data.payment;
  } catch (error) {
    console.error('❌ Error fetching payment status:', error);
    throw error;
  }
};

// Format amount for display
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Initialize Razorpay checkout following official documentation
export const initializeRazorpayCheckout = async (
  paymentDetails: PaymentDetails,
  onSuccess: (response: PaymentResponse) => void,
  onFailure: (error: string) => void
) => {
  try {
    // Check if Razorpay is loaded
    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
    }

    // Create Razorpay order first
    const razorpayOrder = await createRazorpayOrder(paymentDetails);
    
    // Following Razorpay's official documentation
    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image: RAZORPAY_CONFIG.image,
      order_id: razorpayOrder.id,
      prefill: {
        name: paymentDetails.customerName,
        email: paymentDetails.customerEmail,
        contact: paymentDetails.customerPhone
      },
      notes: {
        address: paymentDetails.customerAddress,
        order_id: paymentDetails.orderId
      },
      theme: RAZORPAY_CONFIG.theme,
      handler: async function (response: PaymentResponse) {
        try {
          console.log('💰 Payment successful:', response);
          
          // Verify payment signature
          const isValid = await verifyPaymentSignature(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            paymentDetails.orderId
          );

          if (isValid) {
            console.log('✅ Payment verified successfully');
            onSuccess(response);
          } else {
            console.error('❌ Payment verification failed');
            onFailure('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          console.error('❌ Error in payment handler:', error);
          onFailure('Payment verification failed. Please contact support.');
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          onFailure('Payment was cancelled');
        }
      },
      // Additional options for better compatibility
      config: {
        display: {
          blocks: {
            utib: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi"
                }
              ]
            },
            other: {
              name: "Other Payment methods",
              instruments: [
                {
                  method: "card"
                },
                {
                  method: "netbanking"
                }
              ]
            }
          },
          sequence: ["block.utib", "block.other"],
          preferences: {
            show_default_blocks: false
          }
        }
      }
    };

    console.log('🚀 Opening Razorpay checkout with options:', {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id
    });

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('❌ Error initializing Razorpay checkout:', error);
    onFailure(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.');
  }
}; 