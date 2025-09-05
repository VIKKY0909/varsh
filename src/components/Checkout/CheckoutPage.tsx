import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, CreditCard, Truck, X, ShoppingBag } from 'lucide-react';
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

  const [, setPaymentCompleted] = useState(false);
  
  const { items, getTotalPrice, getTotalItems, getDeliveryCharges, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = getTotalPrice();
  const shippingCost = getDeliveryCharges();
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

  // Enhanced cleanup for abandoned orders - REMOVED since we don't create draft orders anymore
  // useEffect(() => {
  //   const cleanupAbandonedOrders = async () => {
  //     if (!user) return;

  //     try {
  //       // Find draft orders that are pending for more than 15 minutes
  //       const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
  //       const { data: abandonedOrders, error } = await supabase
  //         .from('orders')
  //         .select('id')
  //         .eq('user_id', user.id)
  //         .in('status', ['draft', 'pending'])
  //         .eq('payment_status', 'pending')
  //         .lt('created_at', fifteenMinutesAgo.toISOString());

  //       if (error) throw error;

  //       // Cancel abandoned orders
  //       if (abandonedOrders && abandonedOrders.length > 0) {
  //         for (const order of abandonedOrders) {
  //           await supabase
  //             .from('orders')
  //             .update({
  //               payment_status: 'cancelled',
  //               status: 'cancelled'
  //             })
  //             .eq('id', order.id);

  //           // Create tracking entry
  //           await supabase
  //             .from('order_tracking')
  //             .insert({
  //               order_id: order.id,
  //               status: 'Order Cancelled',
  //               message: 'Order was automatically cancelled due to payment timeout.',
  //               estimated_delivery: null
  //             });
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error cleaning up abandoned orders:', error);
  //     }
  //   };

  //   cleanupAbandonedOrders();
  // }, [user]);

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
      // Store order data temporarily (don't create in database yet)
      const orderData = {
        user_id: user.id,
        total_amount: total,
        shipping_cost: shippingCost,
        status: 'confirmed', // Will be confirmed immediately after payment
        payment_status: 'paid', // Will be paid immediately after payment
        shipping_address: {
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          address_line_1: selectedAddress.address_line_1,
          address_line_2: selectedAddress.address_line_2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country || 'India'
        },
        notes: orderNotes,
        estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        order_items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price
        }))
      };

      console.log('Storing order data for payment:', orderData);

      // Store order data in session storage temporarily
      sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));

      // Move to payment step (no database order created yet)
      setCurrentStep(3);

    } catch (error) {
      console.error('Failed to prepare order data:', error);
      setError(`Failed to prepare order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentId: string) => {
    if (!user) {
      setError('User information missing. Please try again.');
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      // Get stored order data
      const storedOrderData = sessionStorage.getItem('pendingOrderData');
      if (!storedOrderData) {
        throw new Error('Order data not found. Please try again.');
      }

      const orderData = JSON.parse(storedOrderData);

      // Verify payment with Razorpay before creating order
      const verificationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          razorpay_order_id: paymentId,
          razorpay_payment_id: paymentId,
          razorpay_signature: '', // This will be provided by Razorpay callback
        }),
      });

      const verificationData = await verificationResponse.json();

      if (!verificationData.success) {
        throw new Error('Payment verification failed');
      }

      console.log('Payment verified successfully, creating order...');

      // Create order in database ONLY after successful payment verification
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          razorpay_payment_id: paymentId,
          razorpay_order_id: paymentId
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order);

      // Create order items
      const orderItems = orderData.order_items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Create order tracking
      await supabase
        .from('order_tracking')
        .insert({
          order_id: order.id,
          status: 'Order Confirmed',
          message: 'Payment has been successfully processed and order is confirmed.',
          estimated_delivery: order.estimated_delivery
        });

      // Deduct stock from products only after order is confirmed
      for (const item of items as any[]) {
        const newStock = item.product.stock_quantity - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        if (stockError) {
          console.error('Stock update failed for product:', item.product_id, stockError);
        }
      }

      // Create notification for successful payment
      try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
            title: 'Payment Successful',
            message: `Payment for order #${order.id} has been confirmed. Your order is being processed.`,
            type: 'order',
          read: false
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the entire process if notification fails
      }

      // Clear stored order data
      sessionStorage.removeItem('pendingOrderData');

      // Clear cart and show success
      clearCart();
      setPaymentCompleted(true);
      setShowSuccess(true);

      // Navigate to order confirmation after a short delay
      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 2000);

    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError(`Payment was successful but order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear stored order data on error
      sessionStorage.removeItem('pendingOrderData');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentFailure = async (error: string) => {
    console.error('Payment failed:', error);
      setError(`Payment failed: ${error}`);
    
    // Clear stored order data
    sessionStorage.removeItem('pendingOrderData');
      
      // Reset the checkout state
      setCurrentStep(2); // Go back to review step
  };

  // Handle payment cancellation (user closed Razorpay)
  const handlePaymentCancellation = async () => {
    console.log('Payment was cancelled by user');
      setError('Payment was cancelled.');
    
    // Clear stored order data
    sessionStorage.removeItem('pendingOrderData');
      
      // Reset the checkout state
      setCurrentStep(2); // Go back to review step
  };

  // Enhanced page unload and visibility change handlers - REMOVED since we don't create draft orders anymore
  // useEffect(() => {
  //   if (createdOrderId && currentStep === 3) {
  //     const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //       if (!paymentCompleted) {
  //         event.preventDefault();
  //         event.returnValue = 'You have a pending payment. Are you sure you want to leave?';
  //         return event.returnValue;
  //       }
  //     };

  //     const handleVisibilityChange = () => {
  //       if (document.hidden && !paymentCompleted) {
  //         // User switched tabs or minimized browser during payment
  //         console.log('User left the page during payment process');
  //         // Don't immediately cancel - give them time to return
  //       }
  //     };

  //     window.addEventListener('beforeunload', handleBeforeUnload);
  //     document.addEventListener('visibilitychange', handleVisibilityChange);

  //     return () => {
  //       window.removeEventListener('beforeunload', handleBeforeUnload);
  //       document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     };
  //   }
  // }, [createdOrderId, currentStep, paymentCompleted]);

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

                {currentStep === 3 && (
                  <PaymentForm
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    total={total}
                    orderId={null} // No order ID yet since we create it after payment
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
                {shippingCost === 0 && subtotal > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Free shipping applied!</span>
                    <span>FREE</span>
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