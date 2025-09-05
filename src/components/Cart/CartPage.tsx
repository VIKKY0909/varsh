import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartPage = () => {
  const { items, loading, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, getDeliveryCharges } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const deliveryCharges = getDeliveryCharges();
  const total = subtotal + deliveryCharges;
  
  // Calculate remaining amount for free delivery
  const hasDeliveryCharges = items.some(item => item.product.has_delivery_charge);
  const highestFreeDeliveryThreshold = hasDeliveryCharges 
    ? Math.max(...items.map(item => item.product.free_delivery_threshold))
    : 999;
  const remainingForFreeShipping = Math.max(0, highestFreeDeliveryThreshold - subtotal);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="bg-gray-200 h-24 w-24 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-mahogany mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you haven't added any kurtis to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mahogany">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{getTotalItems()} items in your cart</p>
          </div>
          <Link
            to="/products"
            className="flex items-center text-rose-gold hover:text-rose-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Banner */}
            {remainingForFreeShipping > 0 && hasDeliveryCharges && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">
                      Add ₹{remainingForFreeShipping.toLocaleString()} more for FREE shipping!
                    </p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / highestFreeDeliveryThreshold) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-mahogany mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">Size: {item.size}</p>
                    <p className="text-xl font-bold text-rose-gold">
                      ₹{item.product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-lg font-semibold text-mahogany">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-mahogany mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {deliveryCharges === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryCharges}`
                    )}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-rose-gold">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-rose-gold to-copper text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 mb-4"
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Secure Checkout</p>
                <div className="flex justify-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">SSL Encrypted</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Safe Payment</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>
                      {hasDeliveryCharges 
                        ? `Free shipping on orders above ₹${highestFreeDeliveryThreshold} (Expected delivery: 13-14 days)`
                        : 'Free shipping on all orders (Expected delivery: 13-14 days)'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Easy returns within 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;