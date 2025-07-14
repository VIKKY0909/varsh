import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Shield, Lock } from 'lucide-react';

interface PaymentFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  total: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  total
}) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [upiId, setUpiId] = useState('');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay securely with your card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using UPI ID or QR code'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Paytm, PhonePe, Google Pay'
    }
  ];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-mahogany mb-6">Payment Method</h2>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-8">
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
      </div>

      {/* Payment Details Forms */}
      {paymentMethod === 'card' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-mahogany mb-4">Card Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mahogany mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => handleCardInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mahogany mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mahogany mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mahogany mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => handleCardInputChange('name', e.target.value)}
                placeholder="Enter cardholder name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-mahogany mb-4">UPI Payment</h3>
          <div>
            <label className="block text-sm font-medium text-mahogany mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
            />
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              You will be redirected to your UPI app to complete the payment of ₹{total.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {paymentMethod === 'wallet' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-mahogany mb-4">Digital Wallet</h3>
          <div className="grid grid-cols-3 gap-4">
            {['Paytm', 'PhonePe', 'Google Pay'].map((wallet) => (
              <button
                key={wallet}
                className="p-4 border border-gray-300 rounded-lg hover:border-rose-gold hover:bg-rose-50 transition-colors"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-medium">{wallet}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Secure Payment</h4>
            <p className="text-green-700 text-sm">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;