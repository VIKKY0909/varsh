import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/checkout" 
            className="inline-flex items-center text-rose-gold hover:text-opacity-80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Checkout
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-mahogany" />
            <h1 className="text-3xl font-bold text-mahogany">Terms and Conditions</h1>
          </div>
          <p className="text-gray-600 mt-2">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Important Notice */}
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Important Notice</h3>
                  <p className="text-red-700">
                    <strong>ALL SALES ARE FINAL.</strong> Due to the nature of ethnic wear and hygiene considerations, 
                    we do not accept returns, exchanges, or refunds. Please ensure you have selected the correct size, 
                    color, and style before placing your order.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-mahogany mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using Varsh Ethnic Wears ("we," "our," or "us"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">2. Product Information</h2>
            <p className="mb-6">
              We strive to display accurate product information, including prices, descriptions, and images. However, 
              we do not warrant that product descriptions or other content is accurate, complete, reliable, current, 
              or error-free. If a product offered by us is not as described, your sole remedy is to contact us.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">3. Pricing and Payment</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>All prices are in Indian Rupees (INR) and include applicable taxes.</li>
              <li>Payment is processed securely through Razorpay payment gateway.</li>
              <li>Orders are confirmed only after successful payment processing.</li>
              <li>We reserve the right to modify prices at any time without prior notice.</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">4. Order Processing and Shipping</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Orders are typically processed within 1-2 business days.</li>
              <li>Shipping is available throughout India via reliable courier partners.</li>
              <li>Delivery timeframes are estimates and may vary based on location and courier service.</li>
              <li>Shipping costs are calculated based on order value and destination.</li>
              <li>Free shipping is available on orders above ₹999.</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">5. Return and Refund Policy</h2>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">NO RETURNS, EXCHANGES, OR REFUNDS</h3>
              <ul className="list-disc pl-6 text-yellow-700 space-y-1">
                <li>All sales are final due to hygiene and product nature considerations.</li>
                <li>We do not accept returns, exchanges, or provide refunds for any reason.</li>
                <li>Please carefully review size charts, product descriptions, and images before ordering.</li>
                <li>Contact us for size guidance if needed before placing your order.</li>
                <li>Damaged or defective items will be replaced only if reported within 24 hours of delivery.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-mahogany mb-4">6. Product Care and Maintenance</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Follow care instructions provided with each product.</li>
              <li>Ethnic wear requires special care to maintain quality and appearance.</li>
              <li>We are not responsible for damage caused by improper care or washing.</li>
              <li>Store products in a cool, dry place away from direct sunlight.</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">7. Privacy and Data Protection</h2>
            <p className="mb-6">
              Your privacy is important to us. We collect, use, and protect your personal information in accordance 
              with our Privacy Policy. By using our service, you consent to our collection and use of information 
              as described in our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">8. Security</h2>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Secure Transactions</h3>
                  <p className="text-green-700">
                    All payments are processed securely through Razorpay. We do not store your payment card details 
                    on our servers. Your financial information is encrypted and protected using industry-standard 
                    security measures.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-mahogany mb-4">9. Limitation of Liability</h2>
            <p className="mb-6">
              In no event shall Varsh Ethnic Wears be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your use of our service.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">10. Intellectual Property</h2>
            <p className="mb-6">
              All content on this website, including but not limited to text, graphics, logos, images, and software, 
              is the property of Varsh Ethnic Wears and is protected by copyright and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">11. Governing Law</h2>
            <p className="mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of India. 
              Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts 
              in Mumbai, Maharashtra.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">12. Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to modify these terms and conditions at any time. Changes will be effective 
              immediately upon posting on the website. Your continued use of the service constitutes acceptance 
              of the modified terms.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">13. Contact Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><strong>Varsh Ethnic Wears</strong></p>
              <p className="mb-2">Email: support@varsh.com</p>
              <p className="mb-2">Phone: +91-9876543210</p>
              <p>Address: Mumbai, Maharashtra, India</p>
            </div>

            {/* Acknowledgment */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Acknowledgment</h3>
              <p className="text-blue-700">
                By placing an order, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms and Conditions, including the no-return policy. You also confirm that you are of legal age 
                to enter into this agreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 