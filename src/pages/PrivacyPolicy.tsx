import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <Shield className="w-8 h-8 text-mahogany" />
            <h1 className="text-3xl font-bold text-mahogany">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 mt-2">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Privacy Matters</h3>
                  <p className="text-blue-700">
                    At Varsh Ethnic Wears, we are committed to protecting your privacy and ensuring the security 
                    of your personal information. This Privacy Policy explains how we collect, use, and safeguard 
                    your data when you use our website and services.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-mahogany mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-mahogany mb-3">1.1 Personal Information</h3>
            <p className="mb-4">
              We collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
              <li><strong>Profile Information:</strong> Date of birth, gender, and preferences</li>
              <li><strong>Shipping Information:</strong> Delivery addresses and contact details</li>
              <li><strong>Payment Information:</strong> Payment method details (processed securely by Razorpay)</li>
              <li><strong>Order Information:</strong> Purchase history, order details, and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-mahogany mb-3">1.2 Automatically Collected Information</h3>
            <p className="mb-4">
              When you visit our website, we automatically collect certain information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Usage Information:</strong> Pages visited, time spent, links clicked</li>
              <li><strong>Cookies and Tracking:</strong> Session data, preferences, and analytics</li>
              <li><strong>Location Data:</strong> General location for shipping calculations</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Order Processing:</strong> To process and fulfill your orders</li>
              <li><strong>Customer Service:</strong> To provide support and respond to inquiries</li>
              <li><strong>Account Management:</strong> To manage your account and preferences</li>
              <li><strong>Communication:</strong> To send order updates and promotional offers (with consent)</li>
              <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
              <li><strong>Analytics:</strong> To improve our website and services</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">3. Information Sharing and Disclosure</h2>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">We Do Not Sell Your Data</h3>
                  <p className="text-green-700">
                    We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="mb-4">We may share your information in the following limited circumstances:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted partners who help us operate our business (payment processors, shipping partners)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">4. Data Security</h2>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Security Measures</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• SSL encryption for all data transmission</li>
                    <li>• Secure payment processing through Razorpay</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited access to personal information</li>
                    <li>• Secure data storage and backup systems</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-mahogany mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your browsing experience:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for website functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand website usage</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
            </ul>
            <p className="mb-6">
              You can control cookie settings through your browser preferences. However, disabling certain cookies 
              may affect website functionality.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">7. Marketing Communications</h2>
            <p className="mb-6">
              We may send you marketing communications about our products and services. You can opt out of these 
              communications at any time by:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Clicking the unsubscribe link in our emails</li>
              <li>Updating your preferences in your account settings</li>
              <li>Contacting our customer service team</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">8. Data Retention</h2>
            <p className="mb-6">
              We retain your personal information for as long as necessary to provide our services and comply 
              with legal obligations. The retention period varies based on the type of data and its purpose:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Order Information:</strong> Retained for 7 years for tax and legal purposes</li>
              <li><strong>Marketing Data:</strong> Retained until you opt out or request deletion</li>
              <li><strong>Analytics Data:</strong> Retained for 2 years for business insights</li>
            </ul>

            <h2 className="text-2xl font-bold text-mahogany mb-4">9. Third-Party Services</h2>
            <p className="mb-4">Our website may contain links to third-party services:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Payment Processing:</strong> Razorpay (payment gateway)</li>
              <li><strong>Analytics:</strong> Google Analytics (website analytics)</li>
              <li><strong>Hosting:</strong> Supabase (database and authentication)</li>
              <li><strong>Shipping:</strong> Courier partners (delivery services)</li>
            </ul>
            <p className="mb-6">
              These third-party services have their own privacy policies. We encourage you to review them 
              before providing any personal information.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">10. Children's Privacy</h2>
            <p className="mb-6">
              Our services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information from 
              a child under 13, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">11. International Data Transfers</h2>
            <p className="mb-6">
              Your personal information may be transferred to and processed in countries other than your own. 
              We ensure that such transfers comply with applicable data protection laws and implement appropriate 
              safeguards to protect your information.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">12. Changes to This Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on our website and updating the "Last updated" date. Your continued 
              use of our services after such changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-mahogany mb-4">13. Contact Us</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
              <p className="mb-2"><strong>Email:</strong> varshethnicwears@gmail.com</p>
              <p className="mb-2"><strong>Phone:</strong> +91 8511822796</p>
              <p className="mb-2"><strong>Address:</strong> Varsh Ethnic Wears, Ahmedabad, Gujarat, India</p>
            </div>

            {/* Data Protection Officer */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 