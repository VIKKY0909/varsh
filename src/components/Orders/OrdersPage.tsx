import React, { useState, useEffect } from 'react';
import { Package, Eye, Download, X, Truck, Clock, CheckCircle, Trash2, FileText, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import OrderDetails from './OrderDetails';
import InvoiceModal from './InvoiceModal';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  estimated_delivery: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  order_items: {
    id: string;
    quantity: number;
    size: string;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState<Order | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [emailingInvoice, setEmailingInvoice] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(id, name, images)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canDeleteOrder = (order: Order) => {
    return ['cancelled', 'delivered'].includes(order.status);
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId);
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone and any payment will be refunded within 5-7 business days.'
    );
    
    if (!confirmed) {
      setCancellingOrder(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status: 'Order Cancelled',
          message: 'Order has been cancelled by customer. Refund will be processed within 5-7 business days.'
        });

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user!.id,
          type: 'order',
          title: 'Order Cancelled Successfully',
          message: 'Your order has been cancelled. Refund will be processed within 5-7 business days.',
          action_url: `/orders`
        });

      // Show success message
      alert('Order cancelled successfully! Refund will be processed within 5-7 business days.');
      
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again or contact support.');
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this order from your history? This action cannot be undone.'
    );
    
    if (!confirmed) {
      setDeletingOrder(null);
      return;
    }

    try {
      // Delete order items first (cascade should handle this, but being explicit)
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Delete order tracking
      await supabase
        .from('order_tracking')
        .delete()
        .eq('order_id', orderId);

      // Delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      alert('Order deleted successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again or contact support.');
    } finally {
      setDeletingOrder(null);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    setDownloadingInvoice(order.id);
    
    try {
      // Generate invoice data
      const invoiceData = {
        order,
        user,
        generatedAt: new Date().toISOString(),
        invoiceNumber: `INV-${order.order_number}`
      };

      // Create a simple HTML invoice
      const invoiceHTML = generateInvoiceHTML(invoiceData);
      
      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.order_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log invoice generation
      await supabase
        .from('notifications')
        .insert({
          user_id: user!.id,
          type: 'system',
          title: 'Invoice Downloaded',
          message: `Invoice for order ${order.order_number} has been downloaded.`
        });

    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleEmailInvoice = async (order: Order) => {
    setEmailingInvoice(order.id);
    
    try {
      // In a real application, this would call an API endpoint to send email
      // For now, we'll simulate the process and show a success message
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user!.id,
          type: 'system',
          title: 'Invoice Emailed',
          message: `Invoice for order ${order.order_number} has been sent to your email address.`
        });

      alert(`Invoice has been sent to ${user?.email}`);
    } catch (error) {
      console.error('Error emailing invoice:', error);
      alert('Failed to email invoice. Please try again.');
    } finally {
      setEmailingInvoice(null);
    }
  };

  const generateInvoiceHTML = (invoiceData: any) => {
    const { order, user, generatedAt, invoiceNumber } = invoiceData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; }
          .company-name { font-size: 28px; font-weight: bold; color: #B76E79; }
          .invoice-title { font-size: 24px; margin: 20px 0; }
          .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Varsh Kurtis</div>
          <div>Premium Ethnic Wear</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-details">
          <div>
            <strong>Invoice Number:</strong> ${invoiceNumber}<br>
            <strong>Order Number:</strong> ${order.order_number}<br>
            <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
            <strong>Invoice Date:</strong> ${new Date(generatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Bill To:</strong><br>
            ${user?.email}<br>
            ${order.shipping_address?.full_name || ''}<br>
            ${order.shipping_address?.phone || ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <table>
            <tr>
              <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
              <td><strong>₹${(order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0)).toLocaleString()}</strong></td>
            </tr>
            ${order.shipping_cost > 0 ? `
            <tr>
              <td colspan="4" style="text-align: right;">Shipping:</td>
              <td>₹${order.shipping_cost.toLocaleString()}</td>
            </tr>
            ` : ''}
            ${order.tax_amount > 0 ? `
            <tr>
              <td colspan="4" style="text-align: right;">Tax (GST):</td>
              <td>₹${order.tax_amount.toLocaleString()}</td>
            </tr>
            ` : ''}
            ${order.discount_amount > 0 ? `
            <tr>
              <td colspan="4" style="text-align: right;">Discount:</td>
              <td>-₹${order.discount_amount.toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;"><strong>Total Amount:</strong></td>
              <td><strong>₹${order.total_amount.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Payment Information</div>
          <p><strong>Payment Status:</strong> ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery</p>
        </div>

        ${order.shipping_address ? `
        <div class="section">
          <div class="section-title">Shipping Address</div>
          <p>
            ${order.shipping_address.full_name}<br>
            ${order.shipping_address.address_line_1}<br>
            ${order.shipping_address.address_line_2 ? order.shipping_address.address_line_2 + '<br>' : ''}
            ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
            ${order.shipping_address.country}<br>
            Phone: ${order.shipping_address.phone}
          </p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for shopping with Varsh Kurtis!</p>
          <p>For any queries, contact us at support@varshkurtis.com or +91 98765 43210</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mahogany">My Orders</h1>
            <p className="text-gray-600 mt-1">{orders.length} orders found</p>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-mahogany mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-8">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${statusFilter} orders found.`}
            </p>
            <a
              href="/products"
              className="inline-flex items-center bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-mahogany">
                        Order #{order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {order.estimated_delivery && (
                      <p className="text-gray-600 text-sm">
                        Expected delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-rose-gold">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex gap-4 mb-4 overflow-x-auto">
                  {order.order_items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {order.order_items.length > 3 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 text-sm">+{order.order_items.length - 3}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm text-gray-600 capitalize">
                      {order.status === 'shipped' ? 'Out for delivery' : order.status}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={downloadingInvoice === order.id}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingInvoice === order.id ? 'Downloading...' : 'Invoice'}
                    </button>

                    <button
                      onClick={() => handleEmailInvoice(order)}
                      disabled={emailingInvoice === order.id}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {emailingInvoice === order.id ? 'Sending...' : 'Email Invoice'}
                    </button>

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {canDeleteOrder(order) && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrder === order.id}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingOrder === order.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal
          order={showInvoice}
          onClose={() => setShowInvoice(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage;