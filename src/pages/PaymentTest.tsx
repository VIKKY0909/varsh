import React, { useState } from 'react';
import { testRazorpayIntegration } from '../lib/razorpay-test';

const PaymentTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setTestResult('Testing Razorpay integration...');
    
    try {
      const result = await testRazorpayIntegration();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-mahogany mb-6">Razorpay Integration Test</h1>
          
          <div className="mb-6">
            <button
              onClick={handleTest}
              disabled={loading}
              className="bg-rose-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Razorpay Integration'}
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm overflow-auto">{testResult}</pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Click the test button to verify Razorpay is loaded</li>
              <li>• Check the browser console for detailed logs</li>
              <li>• The test will attempt to open the Razorpay checkout</li>
              <li>• You can cancel the payment to test the flow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest; 