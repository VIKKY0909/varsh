import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, CreditCard, Truck, MapPin, User, X, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderReview from './OrderReview';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { items, getTotalPrice, getTotalItems, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Remove all taxes - only subtotal and shipping
  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 999 ? 0 : 99;
  const total = subtotal + shippingCost;

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck, completed: currentStep > 1 },
    { id: 2, name: 'Payment', icon: CreditCard, completed: currentStep > 2 },
    { id: 3, name: 'Review', icon: Check, completed: false }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [user, items, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
      
      // Auto-select default address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      // If cart becomes empty after removal, redirect to cart page
      if (items.length <= 1) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || !paymentMethod) return;

    setLoading(true);
    try {
      // Create order in Supabase first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_cost: shippingCost,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: selectedAddress,
          notes: orderNotes,
          estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create initial order tracking
      await supabase
        .from('order_tracking')
        .insert({
          order_id: order.id,
          status: 'Order Placed',
          message: 'Your order has been successfully placed and is being processed.',
          estimated_delivery: order.estimated_delivery
        });

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'order',
          title: 'Order Placed Successfully',
          message: `Your order ${order.order_number} has been placed successfully.`,
          action_url: `/orders/${order.id}`
        });

      // Clear cart
      await clearCart();

      // Show success message
      setShowSuccess(true);
      
      // Redirect to order confirmation after a delay
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedAddress !== null;
      case 2:
        return paymentMethod !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceedToNext() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-mahogany mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase. You will be redirected to the order confirmation page.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mahogany mb-2">Checkout</h1>
          <p className="text-gray-600">{getTotalItems()} items in your order</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id
                    ? 'bg-rose-gold border-rose-gold text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 font-medium ${
                  step.completed || currentStep === step.id ? 'text-mahogany' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentStep === 1 && (
                <ShippingForm
                  addresses={addresses as any}
                  selectedAddress={selectedAddress as any}
                  onAddressSelect={setSelectedAddress}
                  onAddressesUpdate={fetchAddresses}
                />
              )}

              {currentStep === 2 && (
                <PaymentForm
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  total={total}
                  customerInfo={{
                    name: selectedAddress?.full_name || '',
                    email: user?.email || '',
                    phone: selectedAddress?.phone || '',
                    address: selectedAddress ? `${selectedAddress.address_line_1}, ${selectedAddress.city}, ${selectedAddress.state}` : ''
                  }}
                  orderItems={items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price
                  }))}
                  onPaymentSuccess={async (paymentId, orderId) => {
                    try {
                      // Update order with payment information
                      const { error } = await supabase
                        .rpc('update_order_payment_status', {
                          order_uuid: orderId,
                          razorpay_order_id_param: orderId,
                          razorpay_payment_id_param: paymentId,
                          payment_method_param: paymentMethod,
                          payment_status_param: 'paid'
                        });

                      if (error) {
                        console.error('Error updating payment status:', error);
                      }

                      // Continue to next step
                      nextStep();
                    } catch (error) {
                      console.error('Payment success handling error:', error);
                      nextStep(); // Continue anyway
                    }
                  }}
                  onPaymentFailure={(error) => {
                    alert(`Payment failed: ${error}`);
                  }}
                />
              )}

              {currentStep === 3 && (
                <OrderReview
                  items={items}
                  selectedAddress={selectedAddress}
                  paymentMethod={paymentMethod}
                  orderNotes={orderNotes}
                  onOrderNotesChange={setOrderNotes}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  taxAmount={0}
                  total={total}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceedToNext()}
                    className="flex items-center px-6 py-3 bg-rose-gold text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !canProceedToNext()}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-rose-gold to-copper text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Order Summary Sidebar with Item Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-mahogany mb-6">Order Summary</h3>

              {/* Items with removal and quantity controls */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg relative group">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-mahogany truncate pr-8">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="text-right">
                      <p className="font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals - No tax/GST calculations */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                {subtotal > 999 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Free shipping applied!</span>
                    <span>-₹99</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-rose-gold">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full text-sm text-gray-600 hover:text-mahogany transition-colors"
                >
                  Edit cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;