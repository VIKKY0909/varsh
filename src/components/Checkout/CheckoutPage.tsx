import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, CreditCard, Truck, MapPin, User, X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ShippingForm from './ShippingForm';
import OrderReview from './OrderReview';
import PaymentForm from './PaymentForm';

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
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const { items, getTotalPrice, getTotalItems, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 999 ? 0 : 99;
  const total = subtotal + shippingCost;

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck, completed: currentStep > 1 },
    { id: 2, name: 'Review', icon: Check, completed: currentStep > 2 },
    { id: 3, name: 'Payment', icon: CreditCard, completed: false }
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

  // Clean up abandoned orders on component mount
  useEffect(() => {
    const cleanupAbandonedOrders = async () => {
      if (!user) return;

      try {
        // Find orders that are pending for more than 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const { data: abandonedOrders, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('payment_status', 'pending')
          .eq('status', 'pending')
          .lt('created_at', thirtyMinutesAgo.toISOString());

        if (error) throw error;

        // Cancel abandoned orders
        if (abandonedOrders && abandonedOrders.length > 0) {
          for (const order of abandonedOrders) {
            await supabase
              .from('orders')
              .update({
                payment_status: 'cancelled',
                status: 'cancelled'
              })
              .eq('id', order.id);

            // Create tracking entry
            await supabase
              .from('order_tracking')
              .insert({
                order_id: order.id,
                status: 'Order Cancelled',
                message: 'Order was automatically cancelled due to incomplete payment.',
                estimated_delivery: null
              });
          }
        }
      } catch (error) {
        // Handle error silently
      }
    };

    cleanupAbandonedOrders();
  }, [user]);

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
      // Handle error silently
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
      // Handle error silently
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
      // Handle error silently
    }
  };

  // Step 1: Create order and proceed to payment
  const handleProceedToPayment = async () => {
    if (!user || !selectedAddress) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order in database
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
          estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
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

      // Create order tracking
      await supabase
        .from('order_tracking')
        .insert({
          order_id: order.id,
          status: 'Order Placed',
          message: 'Your order has been placed and is awaiting payment.',
          estimated_delivery: order.estimated_delivery
        });

      // Store the created order ID
      setCreatedOrderId(order.id);

      // Move to payment step
      setCurrentStep(3);

    } catch (error) {
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentId: string) => {
    if (!user || !createdOrderId) {
      setError('Order information missing. Please try again.');
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      // Update order with payment information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: paymentId,
          status: 'confirmed'
        })
        .eq('id', createdOrderId);

      if (updateError) throw updateError;

      // Deduct stock from products
      for (const item of items) {
        const newStock = item.product.stock_quantity - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        if (stockError) {
          // Log stock update error but don't fail the order
        }
      }

      // Create order tracking entry
      await supabase
        .from('order_tracking')
        .insert({
          order_id: createdOrderId,
          status: 'Payment Confirmed',
          message: 'Payment has been confirmed. Your order is being processed.',
          estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Order Confirmed',
          message: `Your order #${createdOrderId} has been confirmed and payment received.`,
          type: 'order_confirmation',
          read: false
        });

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${createdOrderId}`);

    } catch (error) {
      setError('Payment processed but there was an issue updating your order. Please contact support.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setProcessingPayment(false);
      setPaymentCompleted(true);
    }
  };

  // Handle payment failure or cancellation
  const handlePaymentFailure = async (error: string) => {
    if (!createdOrderId) {
      setError(`Payment failed: ${error}`);
      return;
    }

    try {
      // Update order status to failed
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('id', createdOrderId);

      // Create order tracking entry for failed payment
      await supabase
        .from('order_tracking')
        .insert({
          order_id: createdOrderId,
          status: 'Payment Failed',
          message: `Payment failed: ${error}. Order has been cancelled.`,
          estimated_delivery: null
        });

      // Create notification for failed payment
      if (user) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Payment Failed',
            message: `Payment for order #${createdOrderId} failed. Your order has been cancelled.`,
            type: 'payment_failed',
            read: false
          });
      }

      setError(`Payment failed: ${error}. Your order has been cancelled.`);
      
      // Reset the checkout state
      setCreatedOrderId(null);
      setCurrentStep(2); // Go back to review step
      
    } catch (cleanupError) {
      setError(`Payment failed: ${error}. Please contact support for assistance.`);
    }
  };

  // Handle payment cancellation (user closed Razorpay)
  const handlePaymentCancellation = async () => {
    if (!createdOrderId) {
      setError('Payment was cancelled.');
      return;
    }

    try {
      // Update order status to cancelled
      await supabase
        .from('orders')
        .update({
          payment_status: 'cancelled',
          status: 'cancelled'
        })
        .eq('id', createdOrderId);

      // Create order tracking entry for cancelled payment
      await supabase
        .from('order_tracking')
        .insert({
          order_id: createdOrderId,
          status: 'Payment Cancelled',
          message: 'Payment was cancelled by the user. Order has been cancelled.',
          estimated_delivery: null
        });

      // Create notification for cancelled payment
      if (user) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Payment Cancelled',
            message: `Payment for order #${createdOrderId} was cancelled. Your order has been cancelled.`,
            type: 'payment_cancelled',
            read: false
          });
      }

      setError('Payment was cancelled. Your order has been cancelled.');
      
      // Reset the checkout state
      setCreatedOrderId(null);
      setCurrentStep(2); // Go back to review step
      
    } catch (cleanupError) {
      setError('Payment was cancelled. Please try again.');
    }
  };

  // Handle browser close/navigation during payment
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (createdOrderId && !paymentCompleted) {
        // User is trying to leave during payment
        event.preventDefault();
        event.returnValue = 'Payment is in progress. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && createdOrderId && !paymentCompleted) {
        // User switched tabs or minimized browser during payment
        // We'll handle this in the payment callbacks
      }
    };

    if (createdOrderId && !paymentCompleted) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [createdOrderId, paymentCompleted]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedAddress !== null;
      case 2:
        // For Review step, we only need address and items
        return selectedAddress !== null && items.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep === 2) {
      handleProceedToPayment();
    } else if (currentStep < 3 && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show success/processing screen
  if (showSuccess || processingPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-mahogany mb-2">
            {processingPayment ? 'Processing Payment...' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {processingPayment 
              ? 'Please wait while we process your payment and create your order.'
              : 'Your order has been placed successfully and is being processed.'
            }
          </p>
          {processingPayment && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold mx-auto"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-30">
        <button
          onClick={() => setShowOrderSummary(!showOrderSummary)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-rose-gold" />
            <span className="font-medium">
              {showOrderSummary ? 'Hide order summary' : 'Show order summary'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold text-rose-gold mr-2">₹{total.toLocaleString()}</span>
            <ChevronRight className={`w-5 h-5 transition-transform ${showOrderSummary ? 'rotate-90' : ''}`} />
          </div>
        </button>
        
        {/* Mobile Order Summary Dropdown */}
        {showOrderSummary && (
          <div className="border-t bg-gray-50 p-4">
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-white p-3 rounded-lg">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-mahogany text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-rose-gold">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-mahogany mb-2">Checkout</h1>
            <p className="text-gray-600 text-sm sm:text-base">{getTotalItems()} items in your order</p>
        </div>

          {/* Progress Steps - Responsive */}
          <div className="mb-6 sm:mb-8">
            {/* Desktop Progress */}
            <div className="hidden sm:flex items-center justify-between">
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
                    <div className={`w-12 lg:w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm font-medium text-mahogany">
                  {steps[currentStep - 1].name}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-rose-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
        </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 mb-1">Error</h4>
                  <p className="text-red-700 text-sm mb-3">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {currentStep === 1 && (
                <ShippingForm
                  addresses={addresses as any}
                  selectedAddress={selectedAddress as any}
                  onAddressSelect={setSelectedAddress}
                  onAddressesUpdate={fetchAddresses}
                />
              )}

              {currentStep === 2 && (
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

                {currentStep === 3 && createdOrderId && (
                  <PaymentForm
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    total={total}
                    orderId={createdOrderId}
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
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFailure={handlePaymentFailure}
                    onPaymentCancellation={handlePaymentCancellation}
                  />
                )}

                {/* Navigation Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                      disabled={!canProceedToNext() || loading}
                      className="flex items-center justify-center px-6 py-3 bg-rose-gold text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                  >
                      {loading ? 'Processing...' : currentStep === 1 ? 'Review Order' : 'Proceed to Payment'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                  ) : null}
                </div>
            </div>
          </div>

            {/* Desktop Order Summary Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-mahogany mb-6">Order Summary</h3>

              {/* Items with removal and quantity controls */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg relative group">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
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
                    
                      <div className="text-right flex-shrink-0">
                      <p className="font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

                {/* Totals */}
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

          {/* Mobile Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-rose-gold">₹{total.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceedToNext() || loading}
                  className="flex-1 px-4 py-3 bg-rose-gold text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? 'Processing...' : currentStep === 1 ? 'Review Order' : 'Proceed to Payment'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile Bottom Spacing */}
          <div className="lg:hidden h-32"></div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;