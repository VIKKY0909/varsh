// src/components/Admin/OrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Package, Calendar, DollarSign, CreditCard } from 'lucide-react';

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
      id: string;
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

const OrderManagement = ({ orders: propOrders, onUpdateStatus, onDeleteOrder }: OrderManagementProps) => {
  const [orders, setOrders] = useState<OrderDetails[]>(propOrders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders with complete data
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            size,
            price,
            product_id,
            products!order_items_product_id_fkey(
              id,
              name,
              images
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(ordersData.map(order => order.user_id))];

      // Get user emails using the database function
      let userEmailsMap = new Map();
      
      try {
        const { data: userEmailsData, error: userEmailsError } = await supabase
          .rpc('get_user_emails_for_admin', { user_ids: userIds });

        if (!userEmailsError && userEmailsData) {
          userEmailsData.forEach((user: any) => {
            userEmailsMap.set(user.user_id, user.email || 'N/A');
          });
        }
      } catch (error) {
        // Continue with empty map if function fails
      }

      // Get user profiles for additional information
      let userProfilesMap = new Map();
      
      try {
        const { data: userProfilesData, error: userProfilesError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, phone, gender, date_of_birth')
          .in('user_id', userIds);

        if (!userProfilesError && userProfilesData) {
          userProfilesData.forEach(profile => {
            userProfilesMap.set(profile.user_id, profile);
          });
        }
      } catch (error) {
        // Continue with empty map if query fails
      }

      // Merge orders with user data
      const completeOrders = ordersData.map(order => {
        const userEmail = userEmailsMap.get(order.user_id) || 'N/A';
        const userProfile = userProfilesMap.get(order.user_id);
        
        return {
          ...order,
          user: {
            email: userEmail,
            user_profiles: {
              full_name: userProfile?.full_name || 'N/A',
              phone: userProfile?.phone || 'N/A',
              gender: userProfile?.gender || 'N/A',
              date_of_birth: userProfile?.date_of_birth || 'N/A'
            }
          }
        };
      });

      setOrders(completeOrders);

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
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: OrderDetails | null) => prev ? { ...prev, status: newStatus } : null);
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
        prevOrders.filter((order: OrderDetails) => order.id !== orderId)
      );
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order: OrderDetails) => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-mahogany">{order.order_number || order.id.slice(0, 8).toUpperCase()}</div>
                  {order.razorpay_order_id && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {order.razorpay_order_id.slice(0, 8)}...
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{order.user?.user_profiles?.full_name || order.shipping_address?.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{order.user?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-3 h-3" />
                      {order.user?.user_profiles?.phone || order.shipping_address?.phone || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold">₹{order.total_amount.toLocaleString()}</div>
                  {order.shipping_cost > 0 && (
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
                    {order.order_items && order.order_items.length > 0 ? (
                      <div>
                        <div className="font-medium">{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</div>
                        <div className="text-gray-600">
                                                     {order.order_items.slice(0, 2).map((item, index) => (
                             <div key={item.id || index}>
                               {item.products?.name || 'Unknown Product'} x{item.quantity}
                             </div>
                           ))}
                          {order.order_items.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{order.order_items.length - 2} more
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
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
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
                        onClick={() => handleDeleteOrder(order.id)}
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
                    <div><span className="font-medium">Order ID:</span> {selectedOrder.id}</div>
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.order_number || 'N/A'}</div>
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
                    <div><span className="font-medium">Total Amount:</span> ₹{selectedOrder.total_amount.toLocaleString()}</div>
                    <div><span className="font-medium">Shipping Cost:</span> ₹{selectedOrder.shipping_cost}</div>
                    <div><span className="font-medium">Tax Amount:</span> ₹{selectedOrder.tax_amount}</div>
                    <div><span className="font-medium">Discount:</span> ₹{selectedOrder.discount_amount}</div>
                    <div><span className="font-medium">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    {selectedOrder.estimated_delivery && (
                      <div><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</div>
                    )}
                    {selectedOrder.tracking_number && (
                      <div><span className="font-medium">Tracking Number:</span> {selectedOrder.tracking_number}</div>
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
                    <div><span className="font-medium">Name:</span> {selectedOrder.user?.user_profiles?.full_name || selectedOrder.shipping_address?.full_name || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'N/A'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.user?.user_profiles?.phone || selectedOrder.shipping_address?.phone || 'N/A'}</div>
                    {selectedOrder.user?.user_profiles?.gender && (
                      <div><span className="font-medium">Gender:</span> {selectedOrder.user.user_profiles.gender}</div>
                    )}
                    {selectedOrder.user?.user_profiles?.date_of_birth && (
                      <div><span className="font-medium">Date of Birth:</span> {selectedOrder.user.user_profiles.date_of_birth}</div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>{selectedOrder.shipping_address?.full_name}</div>
                      <div>{selectedOrder.shipping_address?.address_line_1}</div>
                      {selectedOrder.shipping_address?.address_line_2 && (
                        <div>{selectedOrder.shipping_address.address_line_2}</div>
                      )}
                      <div>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</div>
                      <div>{selectedOrder.shipping_address?.country}</div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3 h-3" />
                        {selectedOrder.shipping_address?.phone}
                      </div>
                    </div>
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
                      {selectedOrder.order_items?.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-4">
                                                         <div className="flex items-center gap-3">
                               {item.products?.images && item.products.images.length > 0 && (
                                 <img 
                                   src={item.products.images[0]} 
                                   alt={item.products.name}
                                   className="w-12 h-12 object-cover rounded"
                                 />
                               )}
                               <div>
                                 <div className="font-medium">{item.products?.name || 'Unknown Product'}</div>
                               </div>
                             </div>
                          </td>
                          <td className="py-2 px-4">{item.size}</td>
                          <td className="py-2 px-4">{item.quantity}</td>
                          <td className="py-2 px-4">₹{item.price}</td>
                          <td className="py-2 px-4 font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
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