// src/components/Admin/AdminOrders.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Package, Calendar, DollarSign, CreditCard, Search } from 'lucide-react';
import { formatDate, formatDateTime, getDaysUntilDelivery, formatDeliveryStatus, getDeliveryStatusColor } from '../../lib/dateUtils';

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

// --- GROUPING FUNCTION FOR FLAT SQL DATA (MATCHING SQL FIELDS) ---
function groupOrders(flatOrders: any[]): OrderDetails[] {
  const ordersMap: { [orderId: string]: OrderDetails } = {};

  flatOrders.forEach(row => {
    if (!ordersMap[row.order_id]) {
      // Parse shipping address from JSONB
      let shippingAddress = {
        full_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
      };
      
      try {
        if (row.shipping_address) {
          const parsed = typeof row.shipping_address === 'string' 
            ? JSON.parse(row.shipping_address) 
            : row.shipping_address;
          shippingAddress = {
            full_name: parsed.full_name || '',
            phone: parsed.phone || '',
            address_line_1: parsed.address_line_1 || parsed.address_line1 || '',
            address_line_2: parsed.address_line_2 || parsed.address_line2 || '',
            city: parsed.city || '',
            state: parsed.state || '',
            postal_code: parsed.postal_code || '',
            country: parsed.country || 'India'
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
        created_at: row.created_at,
        user_id: row.user_id,
        payment_status: row.payment_status || 'pending',
        shipping_cost: Number(row.shipping_cost) || 0,
        tax_amount: Number(row.tax_amount) || 0,
        discount_amount: Number(row.discount_amount) || 0,
        notes: row.notes || '',
        estimated_delivery: row.estimated_delivery || '',
        tracking_number: row.tracking_number || '',
        canceled: Boolean(row.canceled),
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
        quantity: row.quantity || 0,
        size: row.size || '',
        price: Number(row.item_price) || 0,
        product_id: row.product_id,
        product: {
          name: row.product_name || 'Unknown Product',
          images: Array.isArray(row.product_images) ? row.product_images : (row.product_images ? [row.product_images] : []),
          price: Number(row.product_current_price) || 0
        }
      });
    }
  });

  return Object.values(ordersMap);
}

const AdminOrders = ({ orders: propOrders, onUpdateStatus, onDeleteOrder }: OrderManagementProps) => {
  const [orders, setOrders] = useState<OrderDetails[]>(propOrders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Parse shipping address safely
  const parseShippingAddress = (address: any) => {
    try {
      if (typeof address === 'string') {
        return JSON.parse(address);
      }
      return address || {};
    } catch (e) {
      // Return empty object if parsing fails
      return {};
    }
  };

  // Fetch orders using the admin_orders_flat view
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if Supabase is properly configured
        if (!supabase) {
          throw new Error('Supabase client is not properly configured');
        }
        
        // Use the admin_orders_flat view to fetch all data in one query
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

        const { data: flatOrdersData, error: ordersError } = await query;

        if (ordersError) {
          console.error('Orders fetch error:', ordersError);
          throw ordersError;
        }

        if (!flatOrdersData || flatOrdersData.length === 0) {
          setOrders([]);
          return;
        }

        // Group the flat data into structured orders using the existing function
        const groupedOrders = groupOrders(flatOrdersData);
        setOrders(groupedOrders);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders. Please check your Supabase configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, searchTerm]);

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
      // Handle error silently
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
      // Handle error silently
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.order_number?.toLowerCase() || '').includes(searchLower) ||
      (order.user?.user_profiles?.full_name?.toLowerCase() || '').includes(searchLower) ||
      (order.user?.email?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
                 <button
           onClick={() => {
             // Re-fetch orders on retry
             const fetchOrders = async () => {
               try {
                 setLoading(true);
                 setError(null);
                 let query = supabase
                   .from('admin_orders_flat')
                   .select('*')
                   .order('created_at', { ascending: false });

                 if (statusFilter !== 'all') {
                   query = query.eq('status', statusFilter);
                 }

                 if (searchTerm) {
                   query = query.or(`order_number.ilike.%${searchTerm}%,user_full_name.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%`);
                 }

                 const { data: flatOrdersData, error: ordersError } = await query;

                 if (ordersError) throw ordersError;

                 const groupedOrders = groupOrders(flatOrdersData || []);
                 setOrders(groupedOrders);
               } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to fetch orders');
               } finally {
                 setLoading(false);
               }
             };
             fetchOrders();
           }}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Order Management</h2>
                 <button
           onClick={() => {
             const fetchOrders = async () => {
               try {
                 setLoading(true);
                 setError(null);
                 
                 // Use the admin_orders_flat view to fetch all data in one query
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

                 const { data: flatOrdersData, error: ordersError } = await query;

                 if (ordersError) {
                   console.error('Orders fetch error:', ordersError);
                   throw ordersError;
                 }

                 if (!flatOrdersData || flatOrdersData.length === 0) {
                   setOrders([]);
                   return;
                 }

                 // Group the flat data into structured orders
                 const groupedOrders = groupOrders(flatOrdersData);
                 setOrders(groupedOrders);
               } catch (err) {
                 console.error('Fetch orders error:', err);
                 setError(err instanceof Error ? err.message : 'Failed to fetch orders');
               } finally {
                 setLoading(false);
               }
             };
             fetchOrders();
           }}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {orders.length === 0 ? 'No orders found' : 'No orders match your search criteria'}
          </p>
                     <button
             onClick={() => {
               const fetchOrders = async () => {
                 try {
                   setLoading(true);
                   setError(null);
                   let query = supabase
                     .from('admin_orders_flat')
                     .select('*')
                     .order('created_at', { ascending: false });

                   if (statusFilter !== 'all') {
                     query = query.eq('status', statusFilter);
                   }

                   if (searchTerm) {
                     query = query.or(`order_number.ilike.%${searchTerm}%,user_full_name.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%`);
                   }

                   const { data: flatOrdersData, error: ordersError } = await query;

                   if (ordersError) throw ordersError;

                   const groupedOrders = groupOrders(flatOrdersData || []);
                   setOrders(groupedOrders);
                 } catch (err) {
                   setError(err instanceof Error ? err.message : 'Failed to fetch orders');
                 } finally {
                   setLoading(false);
                 }
               };
               fetchOrders();
             }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Orders
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm md:text-base">Order #</th>
                <th className="text-left py-2 text-sm md:text-base">Customer</th>
                <th className="text-left py-2 text-sm md:text-base">Amount</th>
                <th className="text-left py-2 text-sm md:text-base">Items</th>
                <th className="text-left py-2 text-sm md:text-base">Status</th>
                <th className="text-left py-2 text-sm md:text-base">Payment</th>
                <th className="text-left py-2 text-sm md:text-base">Delivery</th>
                <th className="text-left py-2 text-sm md:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const daysUntilDelivery = getDaysUntilDelivery(order.estimated_delivery_day);
                
                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <div className="font-medium text-sm md:text-base">{order.order_number}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="font-medium text-sm md:text-base">
                        {order.user?.user_profiles?.full_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="py-2 text-sm md:text-base">₹{order.total_amount.toLocaleString()}</td>
                    <td className="py-2">
                      {(() => {
                        if (!order.order_items || order.order_items.length === 0) {
                          return <span className="text-xs text-gray-400">No items</span>;
                        }

                        return (
                          <div className="text-sm text-gray-700">
                            {order.order_items.slice(0, 2).map((item, index) => {
                              const productName = item.product?.name || 'Unknown Product';
                              return (
                                <div key={item.id || index} className="text-xs md:text-sm">
                                  {productName} x{item.quantity || 0}
                                </div>
                              );
                            })}
                            {order.order_items.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{order.order_items.length - 2} more
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={loading}
                        className="border rounded px-2 py-1 text-xs md:text-sm"
                      >
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
                        <div className={`inline-block px-2 py-1 rounded text-xs ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_status?.toUpperCase() || 'PENDING'}
                        </div>
                        {order.razorpay_order_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Razorpay: {order.razorpay_order_id.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="text-sm">
                        {order.estimated_delivery_day ? (
                          <div>
                            <div className="font-medium text-xs md:text-sm">{order.estimated_delivery_day}</div>
                            <div className={`text-xs px-1 py-0.5 rounded ${getDeliveryStatusColor(daysUntilDelivery)}`}>
                              {formatDeliveryStatus(daysUntilDelivery)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Not set</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Order"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

             {/* Order Detail Modal */}
       {selectedOrder && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl relative">
             <button
               className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
               onClick={() => setSelectedOrder(null)}
             >
               <X className="w-6 h-6" />
             </button>

             <h3 className="text-xl md:text-2xl font-bold mb-6">
               Order Details - {selectedOrder.order_number || 'Unknown Order'}
             </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                 <h4 className="font-semibold mb-3">Order Information</h4>
                 <div className="space-y-2">
                   <p><strong>Order #:</strong> {selectedOrder.order_number || 'N/A'}</p>
                   <p><strong>Date:</strong> {selectedOrder.created_at ? formatDate(selectedOrder.created_at) : 'N/A'}</p>
                   <p><strong>Status:</strong>
                     <span className={`ml-2 px-2 py-1 rounded text-xs ${
                       selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                       selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                       selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800'
                     }`}>
                       {(selectedOrder.status || 'PENDING').toUpperCase()}
                     </span>
                   </p>
                   <p><strong>Payment Status:</strong> 
                     <span className={`ml-2 px-2 py-1 rounded text-xs ${
                       selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                       selectedOrder.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800'
                     }`}>
                       {(selectedOrder.payment_status || 'PENDING').toUpperCase()}
                     </span>
                   </p>
                   {selectedOrder.razorpay_order_id && (
                     <p><strong>Razorpay Order ID:</strong> {selectedOrder.razorpay_order_id}</p>
                   )}
                   {selectedOrder.razorpay_payment_id && (
                     <p><strong>Razorpay Payment ID:</strong> {selectedOrder.razorpay_payment_id}</p>
                   )}
                   {selectedOrder.payment_timestamp && (
                     <p><strong>Payment Time:</strong> {formatDateTime(selectedOrder.payment_timestamp)}</p>
                   )}
                   {selectedOrder.estimated_delivery_day && (
                     <p><strong>Estimated Delivery:</strong> {selectedOrder.estimated_delivery_day}</p>
                   )}
                   {selectedOrder.days_until_delivery !== undefined && (
                     <p><strong>Days Until Delivery:</strong> 
                       <span className={`ml-2 px-2 py-1 rounded text-xs ${getDeliveryStatusColor(selectedOrder.days_until_delivery)}`}>
                         {formatDeliveryStatus(selectedOrder.days_until_delivery)}
                       </span>
                     </p>
                   )}
                 </div>
               </div>

              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.user?.user_profiles?.full_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.user?.user_profiles?.phone || 'N/A'}</p>
                  {selectedOrder.user?.user_profiles?.gender && (
                    <p><strong>Gender:</strong> {selectedOrder.user.user_profiles.gender}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Shipping Address</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                <p>{selectedOrder.shipping_address.address_line_1}</p>
                {selectedOrder.shipping_address.address_line_2 && (
                  <p>{selectedOrder.shipping_address.address_line_2}</p>
                )}
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                <p>{selectedOrder.shipping_address.country}</p>
                {selectedOrder.shipping_address.phone && (
                  <p className="mt-2 text-sm text-gray-600">📞 {selectedOrder.shipping_address.phone}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Order Items ({selectedOrder.order_items?.length || 0})</h4>
              <div className="space-y-3">
                {(() => {
                  if (!selectedOrder.order_items || selectedOrder.order_items.length === 0) {
                    return <p className="text-gray-500 text-center py-4">No items found for this order</p>;
                  }

                  return selectedOrder.order_items.map((item, index) => {
                    const productName = item.product?.name || 'Product not found';
                    const productImages = item.product?.images || [];

                    return (
                      <div key={item.id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                        {productImages && productImages.length > 0 && (
                          <img
                            src={productImages[0]}
                            alt={productName}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm md:text-base">{productName}</p>
                          <p className="text-sm text-gray-600">Size: {item.size || 'N/A'} | Quantity: {item.quantity || 0}</p>
                        </div>
                        <p className="font-semibold text-lg">₹{(item.price || 0).toLocaleString()}</p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>
              {selectedOrder.shipping_cost > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span>Shipping Cost:</span>
                  <span>₹{selectedOrder.shipping_cost.toLocaleString()}</span>
                </div>
              )}
              {selectedOrder.tax_amount > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span>Tax Amount:</span>
                  <span>₹{selectedOrder.tax_amount.toLocaleString()}</span>
                </div>
              )}
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span>Discount:</span>
                  <span className="text-red-600">-₹{selectedOrder.discount_amount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {selectedOrder.notes && (
              <div className="mt-4 p-3 bg-yellow-50 rounded">
                <h5 className="font-medium mb-2">Notes:</h5>
                <p className="text-sm">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 