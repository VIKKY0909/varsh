// src/components/Admin/OrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Package, Calendar, DollarSign, CreditCard } from 'lucide-react';

interface OrderItem {
  order_item_id: string;
  quantity: number;
  size: string;
  item_price: string;
  product_id: string;
  product_name: string;
  product_images: string[];
  product_current_price: string;
}

interface OrderDetails {
  idx: number;
  order_id: string;
  order_number: string;
  total_amount: string;
  status: string;
  created_at: string;
  payment_status: string;
  shipping_cost: string;
  tax_amount: string;
  discount_amount: string;
  notes: string;
  estimated_delivery: string;
  tracking_number: string | null;
  canceled: boolean;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_address: string; // JSON string
  user_id: string;
  order_item_id: string | null;
  quantity: number | null;
  size: string | null;
  item_price: string | null;
  product_id: string | null;
  product_name: string | null;
  product_images: string[] | null;
  product_current_price: string | null;
  user_email: string;
  user_full_name: string | null;
  user_phone: string | null;
  user_gender: string | null;
  user_date_of_birth: string | null;
  payment_timestamp: string | null;
  estimated_delivery_day: string | null;
  days_until_delivery: number | null;
}

interface GroupedOrder extends OrderDetails {
  items: OrderItem[];
}

interface OrderManagementProps {
  orders?: OrderDetails[];
  onUpdateStatus?: (orderId: string, newStatus: string) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

const OrderManagement = ({ orders: propOrders, onUpdateStatus, onDeleteOrder }: OrderManagementProps) => {
  const [orders, setOrders] = useState<OrderDetails[]>(propOrders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<GroupedOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders from the admin_orders_flat_view
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('admin_orders_flat_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      setOrders(ordersData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount if not provided as props
  useEffect(() => {
    if (!propOrders) {
      fetchOrders();
    }
  }, [propOrders]);

  // Update orders when props change
  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    }
  }, [propOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);

      // If onUpdateStatus prop is provided, use it
      if (onUpdateStatus) {
        await onUpdateStatus(orderId, newStatus);
      } else {
        // Otherwise, update directly
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', orderId);

        if (error) throw error;

        // Add tracking entry
        await supabase
          .from('order_tracking')
          .insert({
            order_id: orderId,
            status: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            message: `Order status updated to ${newStatus} by admin.`
          });
      }

      // Update local state
      setOrders((prevOrders: OrderDetails[]) => 
        prevOrders.map((order: OrderDetails) => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder((prev: GroupedOrder | null) => prev ? { ...prev, status: newStatus } : null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!onDeleteOrder) return;
    
    try {
      setLoading(true);
      setError(null);
      await onDeleteOrder(orderId);
      
      // Remove from local state
      setOrders((prevOrders: OrderDetails[]) => 
        prevOrders.filter((order: OrderDetails) => order.order_id !== orderId)
      );
      
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Group orders by order_id to handle multiple items per order
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.order_id]) {
      acc[order.order_id] = {
        ...order,
        items: []
      } as GroupedOrder;
    }
    
    if (order.order_item_id && order.product_name) {
      acc[order.order_id].items.push({
        order_item_id: order.order_item_id,
        quantity: order.quantity || 0,
        size: order.size || '',
        item_price: order.item_price || '0',
        product_id: order.product_id || '',
        product_name: order.product_name,
        product_images: order.product_images || [],
        product_current_price: order.product_current_price || '0'
      });
    }
    
    return acc;
  }, {} as Record<string, GroupedOrder>);

  const filteredOrders = Object.values(groupedOrders).filter((order: GroupedOrder) => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const parseShippingAddress = (addressString: string) => {
    try {
      return JSON.parse(addressString);
    } catch {
      return null;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchOrders}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <button 
            onClick={fetchOrders}
            className="mt-4 bg-rose-gold text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-mahogany">Order Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
            />
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Refresh Button */}
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="bg-rose-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: GroupedOrder) => (
              <tr key={order.order_id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-mahogany">{order.order_number}</div>
                  {order.razorpay_order_id && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {order.razorpay_order_id.slice(0, 8)}...
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{order.user_full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{order.user_email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-3 h-3" />
                      {order.user_phone || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold">₹{parseFloat(order.total_amount).toLocaleString()}</div>
                  {parseFloat(order.shipping_cost) > 0 && (
                    <div className="text-xs text-gray-500">+₹{order.shipping_cost} shipping</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    {order.razorpay_payment_id && (
                      <div className="text-xs text-gray-500">
                        {order.razorpay_payment_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {order.items && order.items.length > 0 ? (
                      <div>
                        <div className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                        <div className="text-gray-600">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={item.order_item_id || index}>
                              {item.product_name || 'Unknown Product'} x{item.quantity}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No items</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{new Date(order.created_at).toLocaleDateString()}</div>
                    <div className="text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 text-gray-600 hover:text-rose-gold"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onDeleteOrder && (
                      <button
                        onClick={() => handleDeleteOrder(order.order_id)}
                        disabled={loading}
                        className="p-1 text-gray-600 hover:text-red-600 disabled:opacity-50"
                        title="Delete Order"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-mahogany">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Order ID:</span> {selectedOrder.order_id}</div>
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.order_number}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Payment Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    <div><span className="font-medium">Total Amount:</span> ₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</div>
                    <div><span className="font-medium">Shipping Cost:</span> ₹{selectedOrder.shipping_cost}</div>
                    <div><span className="font-medium">Tax Amount:</span> ₹{selectedOrder.tax_amount}</div>
                    <div><span className="font-medium">Discount:</span> ₹{selectedOrder.discount_amount}</div>
                    <div><span className="font-medium">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    {selectedOrder.estimated_delivery && (
                      <div><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</div>
                    )}
                    {selectedOrder.estimated_delivery_day && (
                      <div><span className="font-medium">Delivery Day:</span> {selectedOrder.estimated_delivery_day}</div>
                    )}
                    {selectedOrder.days_until_delivery !== null && (
                      <div><span className="font-medium">Days Until Delivery:</span> {selectedOrder.days_until_delivery}</div>
                    )}
                    {selectedOrder.tracking_number && (
                      <div><span className="font-medium">Tracking Number:</span> {selectedOrder.tracking_number}</div>
                    )}
                    {selectedOrder.payment_timestamp && (
                      <div><span className="font-medium">Payment Time:</span> {new Date(selectedOrder.payment_timestamp).toLocaleString()}</div>
                    )}
                  </div>

                  {/* Razorpay Information */}
                  {(selectedOrder.razorpay_order_id || selectedOrder.razorpay_payment_id) && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Gateway Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.razorpay_order_id && (
                          <div><span className="font-medium">Razorpay Order ID:</span> {selectedOrder.razorpay_order_id}</div>
                        )}
                        {selectedOrder.razorpay_payment_id && (
                          <div><span className="font-medium">Razorpay Payment ID:</span> {selectedOrder.razorpay_payment_id}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.user_full_name || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.user_email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.user_phone || 'N/A'}</div>
                    {selectedOrder.user_gender && (
                      <div><span className="font-medium">Gender:</span> {selectedOrder.user_gender}</div>
                    )}
                    {selectedOrder.user_date_of_birth && (
                      <div><span className="font-medium">Date of Birth:</span> {selectedOrder.user_date_of_birth}</div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    {(() => {
                      const address = parseShippingAddress(selectedOrder.shipping_address);
                      return address ? (
                        <div className="space-y-1 text-sm">
                          <div>{address.full_name}</div>
                          <div>{address.address_line_1}</div>
                          {address.address_line_2 && (
                            <div>{address.address_line_2}</div>
                          )}
                          <div>{address.city}, {address.state} {address.postal_code}</div>
                          <div>{address.country}</div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3" />
                            {address.phone}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Address not available</div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Product</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Size</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Quantity</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Price</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: OrderItem) => (
                        <tr key={item.order_item_id} className="border-b">
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-3">
                              {item.product_images && item.product_images.length > 0 && (
                                <img 
                                  src={item.product_images[0]} 
                                  alt={item.product_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.product_name || 'Unknown Product'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4">{item.size}</td>
                          <td className="py-2 px-4">{item.quantity}</td>
                          <td className="py-2 px-4">₹{item.item_price}</td>
                          <td className="py-2 px-4 font-medium">₹{(parseFloat(item.item_price || '0') * (item.quantity || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;