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
        <div>
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
        </div>

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
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (GST)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
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

        {/* Terms and Conditions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 text-rose-gold focus:ring-rose-gold border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="text-sm text-blue-800">
              I agree to the{' '}
              <a href="/terms" className="underline hover:text-blue-900">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-blue-900">
                Privacy Policy
              </a>
              . I understand that this order is final and cannot be cancelled once placed.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;