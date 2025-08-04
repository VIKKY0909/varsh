// Razorpay configuration and utilities
import { supabase } from './supabase';

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || ''
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

// Initialize Razorpay checkout
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
        onSuccess(response);
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
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    
    razorpay.on('payment.failed', function (response: any) {
      onError('Payment failed. Please try again.');
    });

    razorpay.on('payment.cancelled', function (response: any) {
      onError('Payment was cancelled.');
    });

    razorpay.open();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to initialize payment');
  }
}; 