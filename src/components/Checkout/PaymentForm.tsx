import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, CreditCard, Smartphone, Globe, Lock, Shield } from 'lucide-react';
import { initializeRazorpayCheckout } from '../../lib/razorpay';

interface PaymentFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  total: number;
  orderId?: string | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
  onPaymentCancellation: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  total,
  orderId,
  customerInfo,
  orderItems,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancellation
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = async () => {
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Razorpay');
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Secure Payment Gateway',
      icon: Globe,
      description: 'Credit/Debit Cards, UPI, Net Banking'
    }
  ];

  const handlePayment = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to proceed');
      return;
    }

    if (!razorpayLoaded) {
      setError('Payment gateway is not ready. Please wait a moment and try again.');
      return;
    }

    // Validate customer information
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError('Please ensure all customer information is complete');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the provided order ID or generate a fallback
      const finalOrderId = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentDetails = {
        amount: total,
        currency: 'INR',
        receipt: finalOrderId,
        notes: {
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          items: JSON.stringify(orderItems)
        }
      };

      // Initialize Razorpay checkout
      await initializeRazorpayCheckout(
        paymentDetails,
        (response) => {
          // Payment successful
          setLoading(false);
          onPaymentSuccess(response.razorpay_payment_id);
        },
        (error) => {
          // Payment failed or cancelled
          setError(error);
          setLoading(false);
          if (error.includes('cancelled') || error.includes('closed')) {
            onPaymentCancellation();
          } else {
            onPaymentFailure(error);
          }
        }
      );

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const retryPayment = () => {
    setError(null);
    handlePayment();
  };

  return (
    <div>
      {/* <h2 className="text-2xl font-bold text-mahogany mb-6">Payment Method</h2> */}

      {/* Payment Method Selection */}
      {/* <div className="space-y-4 mb-8">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              paymentMethod === method.id
                ? 'border-rose-gold bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onPaymentMethodChange(method.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                paymentMethod === method.id ? 'bg-rose-gold text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <method.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-mahogany">{method.name}</h3>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                paymentMethod === method.id
                  ? 'border-rose-gold bg-rose-gold'
                  : 'border-gray-300'
              }`}>
                {paymentMethod === method.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-mahogany mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold text-lg">₹{total.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>• Secure payment powered by Razorpay</p>
            <p>• Multiple payment options available</p>
            <p>• Instant payment confirmation</p>
          </div>
        </div>
      </div>

      {/* Customer Information Validation */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Customer Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${customerInfo.name ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={customerInfo.name ? 'text-blue-700' : 'text-gray-500'}>
              Name: {customerInfo.name || 'Not provided'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${customerInfo.email ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={customerInfo.email ? 'text-blue-700' : 'text-gray-500'}>
              Email: {customerInfo.email || 'Not provided'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${customerInfo.phone ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={customerInfo.phone ? 'text-blue-700' : 'text-gray-500'}>
              Phone: {customerInfo.phone || 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-rose-gold focus:ring-rose-gold border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-rose-gold hover:underline">
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" className="text-rose-gold hover:underline">
              Privacy Policy
            </a>
            . I understand that all sales are final and no returns/exchanges are available.
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">Payment Error</h4>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={retryPayment}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Secure Payment</h4>
            <p className="text-green-700 text-sm">
              Your payment is processed securely by Razorpay. We never store your payment details.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !termsAccepted || !razorpayLoaded}
        className="w-full bg-rose-gold text-white py-4 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing Payment...
          </>
        ) : !razorpayLoaded ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Loading Payment Gateway...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Pay ₹{total.toLocaleString()} Securely
          </>
        )}
      </button>

      {/* Payment Methods Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Accepted: Credit/Debit Cards • UPI • Net Banking
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;