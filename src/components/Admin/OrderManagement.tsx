// src/components/Admin/OrderManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders with all related data
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            size,
            price,
            products (
              name,
              images
            )
          ),
          user:user_id (
            email,
            user_profiles (
              full_name,
              phone
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(page * ordersPerPage, (page + 1) * ordersPerPage - 1);

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Order #</th>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{order.order_number}</td>
                <td className="py-2">
                  {order.user?.user_profiles?.full_name || 'N/A'}
                </td>
                <td className="py-2">₹{order.total_amount.toLocaleString()}</td>
                <td className="py-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={loading}
                    className="border rounded px-2 py-1"
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
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {page * ordersPerPage + 1} to{' '}
          {Math.min((page + 1) * ordersPerPage, totalOrders)} of {totalOrders} orders
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={(page + 1) * ordersPerPage >= totalOrders}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details #{selectedOrder.order_number}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>Name: {selectedOrder.user.user_profiles.full_name}</p>
                <p>Email: {selectedOrder.user.email}</p>
                <p>Phone: {selectedOrder.user.user_profiles.phone}</p>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>{selectedOrder.shipping_address.full_name}</p>
                <p>{selectedOrder.shipping_address.address_line1}</p>
                {selectedOrder.shipping_address.address_line2 && (
                  <p>{selectedOrder.shipping_address.address_line2}</p>
                )}
                <p>
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                </p>
                <p>{selectedOrder.shipping_address.postal_code}</p>
                <p>{selectedOrder.shipping_address.country}</p>
              </div>

              {/* Order Items */}
              <div className="col-span-full">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">Size</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.product.name}</td>
                        <td className="py-2">{item.size}</td>
                        <td className="py-2 text-right">₹{item.price.toLocaleString()}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="col-span-full bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
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
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;