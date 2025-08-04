import React from 'react';
import { MapPin, CreditCard, Package, MessageSquare } from 'lucide-react';

interface OrderReviewProps {
  items: any[];
  selectedAddress: any;
  paymentMethod: string;
  orderNotes: string;
  onOrderNotesChange: (notes: string) => void;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  items,
  selectedAddress,
  paymentMethod,
  orderNotes,
  onOrderNotesChange,
  subtotal,
  shippingCost,
  taxAmount,
  total
}) => {
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      case 'wallet':
        return 'Digital Wallet';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-mahogany mb-6">Review Your Order</h2>

      <div className="space-y-8">
        {/* Order Items */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-rose-gold" />
            <h3 className="text-lg font-semibold text-mahogany">Order Items</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-mahogany">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">₹{item.product.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-rose-gold" />
            <h3 className="text-lg font-semibold text-mahogany">Shipping Address</h3>
          </div>
          {selectedAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-mahogany mb-2">{selectedAddress.full_name}</h4>
              <p className="text-gray-700">{selectedAddress.phone}</p>
              <p className="text-gray-700">
                {selectedAddress.address_line_1}
                {selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}
              </p>
              <p className="text-gray-700">
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
              </p>
              <p className="text-gray-700">{selectedAddress.country}</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        {/* <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-rose-gold" />
            <h3 className="text-lg font-semibold text-mahogany">Payment Method</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-mahogany">{getPaymentMethodName(paymentMethod)}</p>
            {paymentMethod === 'cod' && (
              <p className="text-sm text-gray-600 mt-1">
                You will pay ₹{total.toLocaleString()} when your order is delivered
              </p>
            )}
          </div>
        </div> */}

        {/* Order Notes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-rose-gold" />
            <h3 className="text-lg font-semibold text-mahogany">Order Notes (Optional)</h3>
          </div>
          <textarea
            value={orderNotes}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            placeholder="Any special instructions for your order..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent resize-none"
          />
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-mahogany mb-4">Order Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE (Expected delivery: 13-14 days)' : `₹${shippingCost} (Expected delivery: 13-14 days)`}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-rose-gold">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Important Information</h4>
              <p className="text-blue-700 text-sm mt-1">
                Please review your order details carefully. You'll be able to select your payment method and complete the purchase in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;