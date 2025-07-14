// src/components/Admin/OrderManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_status: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  notes: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
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
    product: {
      name: string;
      images: string[];
    };
  }[];
  user: {
    email: string;
    user_profiles: {
      full_name: string;
      phone: string;
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
      ordersMap[row.order_id] = {
        id: row.order_id,
        order_number: row.order_id.slice(0, 8).toUpperCase(), // Use order_id as order_number
        total_amount: Number(row.total_amount),
        status: row.status,
        created_at: row.created_at,
        payment_status: '', // Not present in SQL, leave blank
        shipping_cost: 0,   // Not present in SQL, leave 0
        tax_amount: 0,      // Not present in SQL, leave 0
        discount_amount: 0, // Not present in SQL, leave 0
        notes: '',          // Not present in SQL, leave blank
        shipping_address: {
          full_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
        },
        order_items: [],
        user: {
          email: '', // Not present in SQL
          user_profiles: {
            full_name: row.user_id || '', // Use user_id as fallback for display
            phone: '',
          }
        }
      };
    }
    // Only add item if it exists
    if (row.order_item_id) {
      ordersMap[row.order_id].order_items.push({
        id: row.order_item_id,
        quantity: row.quantity || 0,
        size: '', // Not present in SQL
        price: 0, // Not present in SQL
        product: {
          name: row.product_name || '',
          images: Array.isArray(row.product_images) ? row.product_images : (row.product_images ? [row.product_images] : []),
        }
      });
    }
  });

  return Object.values(ordersMap);
}

const OrderManagement = ({ orders: propOrders, onUpdateStatus, onDeleteOrder }: OrderManagementProps) => {
  const [orders, setOrders] = useState<OrderDetails[]>(propOrders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  // Fetch orders with proper grouping from flat SQL result
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the flat array (adjust table/view name as needed)
      const { data: flatOrders, error: ordersError } = await supabase
        .from('admin_orders_flat') // <-- Use your new view name
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!flatOrders || flatOrders.length === 0) {
        setOrders([]);
        return;
      }

      // Group and normalize
      const grouped = groupOrders(flatOrders);
      setOrders(grouped);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
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
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) throw error;
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      setLoading(true);
      setError(null);

      if (onDeleteOrder) {
        await onDeleteOrder(orderId);
      } else {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;
      }

      // Remove from local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Close modal if deleted order was selected
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-500 text-lg">No orders found</p>
          <button 
            onClick={fetchOrders}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Order Management</h2>
        <button 
          onClick={fetchOrders}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Order #</th>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Items</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{order.order_number}</td>
                <td className="py-2">
                  {order.user?.user_profiles?.full_name || order.user?.email || 'N/A'}
                </td>
                <td className="py-2">₹{order.total_amount.toLocaleString()}</td>
                <td className="py-2">
                  {(() => {
                    
                    if (!order.order_items || order.order_items.length === 0) {
                      return <span className="text-xs text-gray-400">No items</span>;
                    }

                    return (
                      <div className="text-sm text-gray-700">
                        {order.order_items.slice(0, 2).map((item, index) => {
                          // 'products' does not exist on item, so only use 'product'
                          const productName = item.product?.name || 'Unknown Product';
                          return (
                            <div key={item.id || index}>
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
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={loading}
                    className="border rounded px-2 py-1 text-sm"
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setSelectedOrder(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-3">Order Information</h4>
                <div className="space-y-2">
                  <p><strong>Order #:</strong> {selectedOrder.order_number}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.user?.user_profiles?.full_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.user?.user_profiles?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Shipping Address</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                <p>{selectedOrder.shipping_address.address_line1}</p>
                {selectedOrder.shipping_address.address_line2 && (
                  <p>{selectedOrder.shipping_address.address_line2}</p>
                )}
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                <p>{selectedOrder.shipping_address.country}</p>
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
                          <p className="font-medium">{productName}</p>
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

export default OrderManagement;