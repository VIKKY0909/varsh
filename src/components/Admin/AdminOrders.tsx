// src/components/Admin/AdminOrders.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Calendar, Package, User, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatDateTime } from '../../lib/dateUtils';

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  payment_status: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  notes: string;
  estimated_delivery: string;
  tracking_number: string;
  canceled: boolean;
  // Razorpay fields
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  // Payment and delivery fields
  payment_timestamp?: string;
  estimated_delivery_day?: string;
  days_until_delivery?: number;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  order_items: {
    id: string;
    quantity: number;
    size: string;
    price: number;
    product_id: string;
    product: {
      name: string;
      images: string[];
      price: number;
    };
  }[];
  user: {
    email: string;
    user_profiles: {
      full_name: string;
      phone: string;
      gender: string;
      date_of_birth: string;
    };
  };
}

interface OrderManagementProps {
  orders?: OrderDetails[];
  onUpdateStatus?: (orderId: string, newStatus: string) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

// Helper function to get delivery status from days
function getDeliveryStatusFromDays(days: number): string {
  if (days < 0) return 'Delivered';
  if (days === 0) return 'Delivering Today';
  if (days === 1) return 'Delivering Tomorrow';
  if (days <= 3) return 'Delivering Soon';
  return 'In Transit';
}

// Helper function to get delivery color from days
function getDeliveryColorFromDays(days: number): string {
  if (days < 0) return 'text-green-600 bg-green-100';
  if (days <= 1) return 'text-blue-600 bg-blue-100';
  if (days <= 3) return 'text-blue-600 bg-blue-100';
  return 'text-yellow-600 bg-yellow-100';
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600 bg-green-100';
    case 'shipped':
      return 'text-blue-600 bg-blue-100';
    case 'delivered':
      return 'text-purple-600 bg-purple-100';
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Helper function to get payment status color
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Helper function to format status for display
const formatStatus = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending':
      return 'Pending (Draft)'; // Show pending orders as drafts for clarity
    case 'confirmed':
      return 'Confirmed';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// --- GROUPING FUNCTION FOR FLAT SQL DATA (MATCHING SQL FIELDS) ---
function groupOrders(flatOrders: any[]): OrderDetails[] {
  const ordersMap: { [orderId: string]: OrderDetails } = {};

  flatOrders.forEach(row => {
    if (!ordersMap[row.order_id]) {
      // Parse shipping address from JSONB
      let shippingAddress = {
        full_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: ''
      };
      
      try {
        if (row.shipping_address) {
          const parsed = typeof row.shipping_address === 'string' 
            ? JSON.parse(row.shipping_address) 
            : row.shipping_address;
          shippingAddress = {
            full_name: parsed.full_name || '',
            address_line_1: parsed.address_line_1 || '',
            address_line_2: parsed.address_line_2 || '',
            city: parsed.city || '',
            state: parsed.state || '',
            postal_code: parsed.postal_code || '',
            country: parsed.country || 'India',
            phone: parsed.phone || ''
          };
        }
      } catch (e) {
        // Return empty object if parsing fails
      }

      ordersMap[row.order_id] = {
        id: row.order_id,
        order_number: row.order_number || row.order_id.slice(0, 8).toUpperCase(),
        total_amount: Number(row.total_amount) || 0,
        status: row.status || 'pending',
        created_at: row.created_at || new Date().toISOString(),
        user_id: row.user_id,
        payment_status: row.payment_status || 'pending',
        shipping_cost: Number(row.shipping_cost) || 0,
        tax_amount: Number(row.tax_amount) || 0,
        discount_amount: Number(row.discount_amount) || 0,
        notes: row.notes || '',
        estimated_delivery: row.estimated_delivery || '',
        tracking_number: row.tracking_number || '',
        canceled: row.canceled || false,
        razorpay_order_id: row.razorpay_order_id,
        razorpay_payment_id: row.razorpay_payment_id,
        payment_timestamp: row.payment_timestamp,
        estimated_delivery_day: row.estimated_delivery_day,
        days_until_delivery: row.days_until_delivery ? Number(row.days_until_delivery) : undefined,
        shipping_address: shippingAddress,
        order_items: [],
        user: {
          email: row.user_email || '',
          user_profiles: {
            full_name: row.user_full_name || '',
            phone: row.user_phone || '',
            gender: row.user_gender || '',
            date_of_birth: row.user_date_of_birth || ''
          }
        }
      };
    }
    
    // Only add item if it exists
    if (row.order_item_id) {
      ordersMap[row.order_id].order_items.push({
        id: row.order_item_id,
        quantity: Number(row.quantity) || 0,
        size: String(row.size || ''),
        price: Number(row.item_price) || 0,
        product_id: row.product_id,
        product: {
          name: row.product_name || 'Unknown Product',
          images: Array.isArray(row.product_images) ? row.product_images : (row.product_images ? [row.product_images] : []),
          price: Number(row.item_price) || 0
        }
      });
    }
  });

  return Object.values(ordersMap);
}

const AdminOrders = ({ orders: propOrders, onUpdateStatus, onDeleteOrder }: OrderManagementProps) => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch orders from admin_orders_flat view
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('admin_orders_flat')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,user_full_name.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%`);
      }

      const { data, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      // Group the flat data into structured orders
      const groupedOrders = groupOrders(data || []);
      setOrders(groupedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    if (!propOrders) {
      fetchOrders();
    }
  }, [propOrders]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Remove from local state
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate days until delivery
  const getDaysUntilDelivery = (estimatedDelivery: string) => {
    if (!estimatedDelivery) return null;
    const deliveryDate = new Date(estimatedDelivery);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">⚠️</div>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-mahogany">Order Management</h2>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-gold focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-gold focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const daysUntilDelivery = order.estimated_delivery_day ? getDaysUntilDelivery(order.estimated_delivery_day) : null;
                const deliveryStatus = daysUntilDelivery !== null ? getDeliveryStatusFromDays(daysUntilDelivery) : 'Not Set';
                const deliveryColor = daysUntilDelivery !== null ? getDeliveryColorFromDays(daysUntilDelivery) : 'text-gray-600 bg-gray-100';

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user?.user_profiles?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.total_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-2">
                       <div className="text-sm">
                         <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                           {formatStatus(order.status)}
                         </div>
                       </div>
                       <select
                         value={order.status}
                         onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                         disabled={loading}
                         className="mt-1 border rounded px-2 py-1 text-xs w-full"
                       >
                         <option value="draft">Draft</option>
                         <option value="pending">Pending</option>
                         <option value="confirmed">Confirmed</option>
                         <option value="processing">Processing</option>
                         <option value="shipped">Shipped</option>
                         <option value="delivered">Delivered</option>
                         <option value="cancelled">Cancelled</option>
                       </select>
                     </td>
                     <td className="py-2">
                       <div className="text-sm">
                         <div className={`inline-block px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.payment_status)}`}>
                           {order.payment_status?.toUpperCase() || 'PENDING'}
                         </div>
                         {order.razorpay_order_id && (
                           <div className="text-xs text-gray-500 mt-1">
                             ID: {order.razorpay_order_id.slice(-8)}
                           </div>
                         )}
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className={`text-sm px-2 py-1 rounded ${deliveryColor}`}>
                            {deliveryStatus}
                          </div>
                          {daysUntilDelivery !== null && daysUntilDelivery >= 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {daysUntilDelivery} day{daysUntilDelivery !== 1 ? 's' : ''} left
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-rose-gold hover:text-rose-gold/80 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-mahogany">
                    Order #{selectedOrder.order_number}
                  </h3>
                  <p className="text-gray-600">Order Details</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-mahogany mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {formatStatus(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Payment Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                    {selectedOrder.razorpay_order_id && (
                      <p><strong>Razorpay Order ID:</strong> {selectedOrder.razorpay_order_id}</p>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <p><strong>Razorpay Payment ID:</strong> {selectedOrder.razorpay_payment_id}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-mahogany mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.user?.user_profiles?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.user?.user_profiles?.phone || 'N/A'}</p>
                    <p><strong>Gender:</strong> {selectedOrder.user?.user_profiles?.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold text-mahogany mb-3">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p><strong>{selectedOrder.shipping_address.full_name}</strong></p>
                  <p>{selectedOrder.shipping_address.address_line_1}</p>
                  {selectedOrder.shipping_address.address_line_2 && (
                    <p>{selectedOrder.shipping_address.address_line_2}</p>
                  )}
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                  <p>{selectedOrder.shipping_address.country}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shipping_address.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-mahogany mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-mahogany">{item.product.name}</h5>
                        <p className="text-sm text-gray-600">Size: {item.size} | Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-mahogany mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{(selectedOrder.total_amount - selectedOrder.shipping_cost - selectedOrder.tax_amount + selectedOrder.discount_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shipping_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax_amount.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold text-mahogany mb-3">Order Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;