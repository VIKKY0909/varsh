import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Download, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderDetailsProps {
  order: any;
  onBack: () => void;
}

interface TrackingEvent {
  id: string;
  status: string;
  message: string;
  location?: string;
  created_at: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(true);

  useEffect(() => {
    fetchTracking();
  }, [order.id]);

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracking(data || []);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoadingTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-3xl font-bold text-mahogany">Order #{order.order_number}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-mahogany">Order Status</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Tracking Timeline */}
              {!loadingTracking && tracking.length > 0 && (
                <div className="space-y-4">
                  {tracking.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-rose-gold' : 'bg-gray-300'
                        }`}></div>
                        {index < tracking.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-mahogany">{event.status}</h4>
                        <p className="text-gray-600 text-sm">{event.message}</p>
                        {event.location && (
                          <p className="text-gray-500 text-xs">📍 {event.location}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-mahogany mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-mahogany">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">Size: {item.size}</p>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-gray-600 text-sm">Price: ₹{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-rose-gold" />
                <h2 className="text-xl font-bold text-mahogany">Shipping Address</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-mahogany">{order.shipping_address.full_name}</h3>
                <p className="text-gray-700">{order.shipping_address.phone}</p>
                <p className="text-gray-700">
                  {order.shipping_address.address_line_1}
                  {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`}
                </p>
                <p className="text-gray-700">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p className="text-gray-700">{order.shipping_address.country}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-mahogany mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{(order.total_amount - (order.shipping_cost || 0)).toLocaleString()}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₹{order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-rose-gold">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-rose-gold" />
                <h3 className="text-lg font-bold text-mahogany">Payment</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-mahogany mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-rose-gold text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  Contact Support: varshethnicwears@gmail.com
                </button>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-rose-gold" />
                <h3 className="text-lg font-bold text-mahogany">Delivery</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected</span>
                  <span>{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : new Date(new Date(order.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()} (Expected delivery: 13-14 days)</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking</span>
                    <span className="font-mono text-sm">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;