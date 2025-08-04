import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, Download, ArrowRight, FileText, Mail, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  estimated_delivery: string;
  shipping_address: any;
  shipping_cost: number;
  tax_amount: number;
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

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                id,
                name,
                price,
                images
              )
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) return;

    const invoiceHTML = generateInvoiceHTML(order);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.order_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Order Confirmation - ${order.order_number}`,
      text: `My order from Varsh Kurtis has been confirmed! Order #${order.order_number}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  const generateInvoiceHTML = (order: Order) => {
    const subtotal = order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Confirmation - ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #B76E79; padding-bottom: 20px; }
          .company-name { font-size: 32px; font-weight: bold; color: #B76E79; margin-bottom: 10px; }
          .confirmation-title { font-size: 28px; color: #420C09; margin: 20px 0; }
          .success-message { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-details { display: flex; justify-content: space-between; margin: 30px 0; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .section { margin: 30px 0; }
          .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #420C09; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; color: #420C09; }
          .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .total-row { font-weight: bold; background-color: #B76E79; color: white; }
          .next-steps { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; border-radius: 8px; margin: 30px 0; }
          .footer { margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          .status-badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Varsh Kurtis</div>
          <div style="color: #666;">Premium Ethnic Wear</div>
          <div class="confirmation-title">ORDER CONFIRMATION</div>
        </div>
        
        <div class="success-message">
          <strong>🎉 Order Placed Successfully!</strong><br>
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </div>
        
        <div class="order-details">
          <div>
            <strong>Order Number:</strong> ${order.order_number}<br>
            <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
            <strong>Status:</strong> <span class="status-badge">${order.status.toUpperCase()}</span><br>
            <strong>Estimated Delivery:</strong> ${order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 24px; color: #B76E79;">₹${order.total_amount.toLocaleString()}</strong><br>
            <span style="color: #666;">${order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📦 Order Items</div>
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
              ${order.order_items.map(item => `
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

        <div class="total-section">
          <table style="margin: 0;">
            <tr>
              <td style="border: none; text-align: right; padding: 5px 15px;"><strong>Subtotal:</strong></td>
              <td style="border: none; text-align: right; padding: 5px 15px;"><strong>₹${subtotal.toLocaleString()}</strong></td>
            </tr>
            ${order.shipping_cost > 0 ? `
            <tr>
              <td style="border: none; text-align: right; padding: 5px 15px;">Shipping:</td>
              <td style="border: none; text-align: right; padding: 5px 15px;">₹${order.shipping_cost.toLocaleString()}</td>
            </tr>
            ` : ''}
            ${order.tax_amount > 0 ? `
            <tr>
              <td style="border: none; text-align: right; padding: 5px 15px;">Tax (GST):</td>
              <td style="border: none; text-align: right; padding: 5px 15px;">₹${order.tax_amount.toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td style="text-align: right; padding: 10px 15px;"><strong>Total Amount:</strong></td>
              <td style="text-align: right; padding: 10px 15px;"><strong>₹${order.total_amount.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>

        ${order.shipping_address ? `
        <div class="section">
          <div class="section-title">🚚 Shipping Address</div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <strong>${order.shipping_address.full_name}</strong><br>
            ${order.shipping_address.address_line_1}<br>
            ${order.shipping_address.address_line_2 ? order.shipping_address.address_line_2 + '<br>' : ''}
            ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
            ${order.shipping_address.country}<br>
            <strong>Phone:</strong> ${order.shipping_address.phone}
          </div>
        </div>
        ` : ''}

        <div class="next-steps">
          <div class="section-title">📋 What's Next?</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
            <div style="text-align: center;">
              <div style="font-size: 30px; margin-bottom: 10px;">📦</div>
              <strong>Processing</strong><br>
              <small>We're preparing your order</small>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 30px; margin-bottom: 10px;">🚛</div>
              <strong>Shipping</strong><br>
              <small>Expected delivery: 13-14 days</small>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 30px; margin-bottom: 10px;">🎉</div>
              <strong>Delivery</strong><br>
              <small>Enjoy your new kurtis!</small>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Varsh Kurtis!</strong></p>
          <p>For any questions about your order, please contact us:</p>
          <p>📧 Email: varshethnicwears@gmail.com</p>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated confirmation. Please keep this for your records.
          </p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-gold"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mahogany mb-4">Order Not Found</h2>
          <Link to="/orders" className="text-rose-gold hover:text-rose-800">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        {showSuccess && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-pulse-slow">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-mahogany mb-4">Order Confirmed! 🎉</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase! Your order has been successfully placed.
            </p>
            <p className="text-lg text-rose-gold font-semibold">
              Order #{order.order_number}
            </p>
          </div>
        )}

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-gold to-copper text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                <p className="opacity-90">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹{order.total_amount.toLocaleString()}</p>
                <p className="opacity-90">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-mahogany mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-mahogany">{item.product.name}</h4>
                      <p className="text-gray-600 text-sm">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-gray-500 text-sm">₹{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-mahogany mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold">{order.shipping_address.full_name}</p>
                  <p className="text-gray-700">{order.shipping_address.phone}</p>
                  <p className="text-gray-700">
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`}
                  </p>
                  <p className="text-gray-700">
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-mahogany mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                What's Next?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-mahogany mb-1">Processing</h4>
                  <p className="text-sm text-gray-600">We're preparing your order</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-mahogany mb-1">Shipping</h4>
                  <p className="text-sm text-gray-600">Expected delivery: 13-14 days</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-mahogany mb-1">Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Expected: {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-rose-gold text-white px-6 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            <Package className="w-5 h-5" />
            Track Order
          </Link>
          
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Invoice
          </button>

          <button
            onClick={handleShareOrder}
            className="flex items-center justify-center gap-2 border border-rose-gold text-rose-gold px-6 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Order
          </button>
          
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-mahogany mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Questions about your order? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:varshethnicwears@gmail.com"
              className="flex items-center justify-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
            >
              <Mail className="w-5 h-5" />
              varshethnicwears@gmail.com
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
            >
              📞 +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;