// Razorpay configuration and utilities
import { supabase } from './supabase';

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'placeholder_secret'
};

// Validate Razorpay configuration
export const validateRazorpayConfig = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  if (!supabaseUrl || !supabaseKey || !razorpayKey) {
    return false;
  }
  
  return true;
};

// Create Razorpay order via Supabase Edge Function
export const createRazorpayOrder = async (paymentDetails: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<any> => {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid. Please check your environment variables.');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(paymentDetails),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || 'Failed to create Razorpay order';
      throw new Error(errorMessage);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create Razorpay order');
    }

    return data.order;
  } catch (error) {
    // Fallback: try direct Supabase function call
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('create-razorpay-order', {
        body: paymentDetails
      });

      if (supabaseError) {
        throw new Error(`Failed to create Razorpay order: ${supabaseError.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to create Razorpay order');
      }

      return data.order;
    } catch (fallbackError) {
      throw new Error(`Failed to create Razorpay order: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
};

// Verify payment with Razorpay
export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }

    return data.success && data.isValid;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Initialize Razorpay checkout with enhanced error handling
export const initializeRazorpayCheckout = async (paymentDetails: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}, onSuccess: (response: any) => void, onError: (error: any) => void) => {
  try {
    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(paymentDetails);

    // Initialize Razorpay checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Varsh Fashion',
      description: 'Fashion Purchase',
      order_id: razorpayOrder.id,
      handler: function (response: any) {
        // Verify payment before calling success handler
        verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: paymentDetails.notes?.order_id || ''
        }).then(isValid => {
          if (isValid) {
            onSuccess(response);
          } else {
            onError('Payment verification failed. Please try again.');
          }
        }).catch(verificationError => {
          onError(`Payment verification failed: ${verificationError}`);
        });
      },
      prefill: {
        name: paymentDetails.notes?.customer_name || '',
        email: paymentDetails.notes?.customer_email || '',
        contact: paymentDetails.notes?.customer_phone || ''
      },
      notes: paymentDetails.notes,
      theme: {
        color: '#B76E79'
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi"
                }
              ]
            },
            cards: {
              name: "Credit/Debit Cards",
              instruments: [
                {
                  method: "card"
                }
              ]
            },
            netbanking: {
              name: "Net Banking",
              instruments: [
                {
                  method: "netbanking"
                }
              ]
            }
          },
          sequence: ["block.upi", "block.cards", "block.netbanking"],
          preferences: {
            show_default_blocks: false
          }
        }
      },
      modal: {
        ondismiss: function() {
          // Handle modal dismissal (user closed payment window)
          onError('Payment was cancelled by user.');
        }
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    
    razorpay.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      onError(`Payment failed: ${response.error.description || 'Unknown error'}`);
    });

    razorpay.on('payment.cancelled', function (response: any) {
      console.log('Payment cancelled by user');
      onError('Payment was cancelled.');
    });

    razorpay.open();
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    onError(error instanceof Error ? error.message : 'Failed to initialize payment');
  }
}; 