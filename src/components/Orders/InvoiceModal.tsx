import React from 'react';
import { X, Download, Mail, FileText } from 'lucide-react';

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const invoiceNumber = `INV-${order.order_number}`;
  const subtotal = order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-rose-gold" />
            <h2 className="text-2xl font-bold text-mahogany">Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-8">
          {/* Company Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rose-gold mb-2">Varsh Kurtis</h1>
            <p className="text-gray-600">Premium Ethnic Wear</p>
            <div className="mt-4 text-2xl font-bold text-mahogany">INVOICE</div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-mahogany mb-3">Invoice Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Invoice Number:</strong> {invoiceNumber}</div>
                <div><strong>Order Number:</strong> {order.order_number}</div>
                <div><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</div>
                <div><strong>Invoice Date:</strong> {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-mahogany mb-3">Billing Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Customer Email:</strong> {order.user?.email || 'N/A'}</div>
                {order.shipping_address && (
                  <>
                    <div><strong>Name:</strong> {order.shipping_address.full_name}</div>
                    <div><strong>Phone:</strong> {order.shipping_address.phone}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="font-bold text-mahogany mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left">Item</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Size</th>
                    <th className="border border-gray-200 px-4 py-3 text-center">Qty</th>
                    <th className="border border-gray-200 px-4 py-3 text-right">Unit Price</th>
                    <th className="border border-gray-200 px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="border border-gray-200 px-4 py-3">{item.product.name}</td>
                      <td className="border border-gray-200 px-4 py-3">{item.size}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">₹{item.price.toLocaleString()}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{order.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-rose-gold">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-8">
            <h3 className="font-bold text-mahogany mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Payment Status:</strong> {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</div>
                <div><strong>Payment Method:</strong> Cash on Delivery</div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-8">
              <h3 className="font-bold text-mahogany mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div>{order.shipping_address.full_name}</div>
                <div>{order.shipping_address.address_line_1}</div>
                {order.shipping_address.address_line_2 && <div>{order.shipping_address.address_line_2}</div>}
                <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</div>
                <div>{order.shipping_address.country}</div>
                <div>Phone: {order.shipping_address.phone}</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">Thank you for shopping with Varsh Kurtis!</p>
            <p>For any queries, contact us at varshethnicwears@gmail.com</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-rose-gold text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Print/Save as PDF
          </button>
        </div>
        <div className="text-center text-red-600 text-sm font-semibold pb-6">No return or exchange policy.</div>
      </div>
    </div>
  );
};

export default InvoiceModal;