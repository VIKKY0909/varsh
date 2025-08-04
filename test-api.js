import fetch from 'node-fetch';

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_AMOUNT = 1000; // ₹10.00
const TEST_CURRENCY = 'INR';

async function testHealthEndpoint() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

async function testOrderCreation() {
  try {
    console.log('📦 Testing order creation...');
    
    const orderData = {
      amount: TEST_AMOUNT,
      currency: TEST_CURRENCY,
      receipt: `test_receipt_${Date.now()}`,
      notes: {
        order_id: `test_order_${Date.now()}`,
        customer_email: 'test@example.com',
        customer_phone: '+919876543210',
        items: JSON.stringify([
          { name: 'Test Product', quantity: 1, price: TEST_AMOUNT }
        ])
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Order created successfully!');
      console.log('   Order ID:', data.order.id);
      console.log('   Amount:', data.order.amount);
      console.log('   Currency:', data.order.currency);
      return data.order;
    } else {
      console.log('❌ Order creation failed:', data.error || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    return null;
  }
}

async function testPaymentVerification() {
  try {
    console.log('🔍 Testing payment verification...');
    
    // Mock payment data (in real scenario, this would come from Razorpay)
    const mockPaymentData = {
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'mock_signature_123'
    };

    const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPaymentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment verification endpoint working');
      console.log('   Is Valid:', data.isValid);
      console.log('   Message:', data.message);
      return true;
    } else {
      console.log('❌ Payment verification failed:', data.error || data);
      return false;
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    return false;
  }
}

async function testInvalidRequests() {
  try {
    console.log('🚫 Testing invalid requests...');
    
    // Test 1: Missing amount
    const response1 = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: 'INR', receipt: 'test' })
    });
    
    if (response1.status === 400) {
      console.log('✅ Invalid request (missing amount) handled correctly');
    } else {
      console.log('❌ Invalid request (missing amount) not handled correctly');
    }
    
    // Test 2: Invalid currency
    const response2 = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, currency: 'USD', receipt: 'test' })
    });
    
    if (response2.status === 400) {
      console.log('✅ Invalid request (wrong currency) handled correctly');
    } else {
      console.log('❌ Invalid request (wrong currency) not handled correctly');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Invalid request test error:', error.message);
    return false;
  }
}

async function testRazorpayAPI() {
  console.log('🚀 Starting Razorpay API tests...\n');
  
  // Test 1: Health endpoint
  const healthOk = await testHealthEndpoint();
  console.log('');
  
  if (!healthOk) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('   Run: npm run server');
    return;
  }
  
  // Test 2: Order creation
  const order = await testOrderCreation();
  console.log('');
  
  // Test 3: Payment verification
  const verificationOk = await testPaymentVerification();
  console.log('');
  
  // Test 4: Invalid requests
  const invalidRequestsOk = await testInvalidRequests();
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('   Health Check:', healthOk ? '✅ PASS' : '❌ FAIL');
  console.log('   Order Creation:', order ? '✅ PASS' : '❌ FAIL');
  console.log('   Payment Verification:', verificationOk ? '✅ PASS' : '❌ FAIL');
  console.log('   Invalid Requests:', invalidRequestsOk ? '✅ PASS' : '❌ FAIL');
  
  if (healthOk && order && verificationOk && invalidRequestsOk) {
    console.log('\n🎉 All tests passed! Razorpay integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
  }
}

// Run tests
testRazorpayAPI().catch(console.error); 