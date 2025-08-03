# Razorpay Integration Guide - Supabase Edition

This document provides a comprehensive guide for the Razorpay payment gateway integration in the Varsh E-commerce project using Supabase as the backend.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v16 or higher)
- Supabase project with Edge Functions enabled
- Razorpay account with API keys
- Test mode enabled for development

### 2. Configuration

#### Environment Variables
Set these environment variables in your Supabase project dashboard:

```env
# Supabase Configuration (already configured in your project)
SUPABASE_URL=https://qajswgkrjldtugyymydg.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_test_secret_here

# Frontend Razorpay Key (public key only)
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Current Test Configuration
The project is currently configured with test keys:
- **Key ID**: `rzp_test_KcjoPhlso7v6VN`
- **Key Secret**: `G0LXpG4OVQidER2Yy0seBq6q`
- **Supabase URL**: `https://qajswgkrjldtugyymydg.supabase.co`

⚠️ **Important**: These are test keys. For production, replace with your live keys.

### 3. Running the Application

#### Start the Frontend
```bash
npm run dev
```

#### Live Edge Functions (Already Deployed)
The following Edge Functions are live and ready to use:
- ✅ `https://qajswgkrjldtugyymydg.supabase.co/functions/v1/create-razorpay-order`
- ✅ `https://qajswgkrjldtugyymydg.supabase.co/functions/v1/verify-razorpay-payment`
- ✅ `https://qajswgkrjldtugyymydg.supabase.co/functions/v1/get-razorpay-payment-status`

## 🧪 Testing

### 1. Live Supabase Edge Functions Testing
Run the comprehensive test suite:

```bash
node test-supabase-api.js
```

This will test:
- ✅ Create Razorpay order via live Edge Function
- ✅ Payment verification via live Edge Function
- ✅ Invalid request handling

### 2. Frontend Testing
Navigate to the checkout page and test the payment flow:
1. Add items to cart
2. Proceed to checkout
3. Fill shipping information
4. Test payment with Razorpay test cards

### 3. Test Payment Methods

#### Test Cards (Razorpay Test Mode)
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

#### UPI Testing
- Use any UPI ID (e.g., `test@razorpay`)
- Amount: Any amount

## 🔧 Live Supabase Edge Functions

### 1. Create Order Function
```http
POST https://qajswgkrjldtugyymydg.supabase.co/functions/v1/create-razorpay-order
Content-Type: application/json
Authorization: Bearer your_supabase_anon_key

{
  "amount": 1000,
  "currency": "INR",
  "receipt": "order_123",
  "orderId": "supabase_order_uuid",
  "customerInfo": {
    "email": "test@example.com",
    "phone": "+919876543210"
  },
  "notes": {
    "order_id": "order_123",
    "customer_email": "test@example.com"
  }
}
```

### 2. Verify Payment Function
```http
POST https://qajswgkrjldtugyymydg.supabase.co/functions/v1/verify-razorpay-payment
Content-Type: application/json
Authorization: Bearer your_supabase_anon_key

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "orderId": "supabase_order_uuid"
}
```

### 3. Get Payment Status Function
```http
GET https://qajswgkrjldtugyymydg.supabase.co/functions/v1/get-razorpay-payment-status/:payment_id
Authorization: Bearer your_supabase_anon_key
```

## 🏗️ Architecture

### Backend (Live Supabase Edge Functions)
- **Deno runtime** with TypeScript support
- **Razorpay API** integration for order creation
- **Crypto** module for signature verification
- **Supabase client** for database operations
- **Error handling** with proper HTTP status codes

### Frontend (src/lib/razorpay.ts)
- **Razorpay Checkout** integration
- **Live Supabase Edge Functions** for backend calls
- **Payment verification** with server-side validation
- **Error handling** and user feedback
- **TypeScript** interfaces for type safety

### Database Integration
- **Supabase PostgreSQL** for order tracking
- **Payment status** updates via Edge Functions
- **Order history** management with Razorpay IDs
- **Admin panel** integration for payment tracking

## 🔒 Security Features

### 1. Signature Verification
- All payments are verified using HMAC SHA256
- Server-side signature validation in Edge Functions
- Prevents payment tampering

### 2. Environment Variables
- Sensitive keys stored in Supabase environment variables
- Separate test and production configurations
- No hardcoded secrets in code

### 3. Input Validation
- Amount validation (positive values only)
- Currency validation (INR only)
- Required field validation in Edge Functions

### 4. Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- User-friendly error display

## 🐛 Troubleshooting

### Common Issues

#### 1. "Razorpay is not loaded"
**Solution**: Refresh the page or check internet connection

#### 2. "Invalid Razorpay credentials"
**Solution**: Check your API keys in Supabase environment variables

#### 3. "Payment verification failed"
**Solution**: Ensure Edge Functions are accessible and environment variables are set

#### 4. CORS Errors
**Solution**: Check if Edge Functions are properly configured with CORS headers

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

### Logs
Check console logs for detailed error information:
- Backend: Supabase Edge Functions logs in dashboard
- Frontend: Browser developer tools

## 📱 Payment Flow

### 1. Order Creation
1. User adds items to cart
2. Proceeds to checkout
3. Frontend calls live Supabase Edge Function to create Razorpay order
4. Edge Function validates input and creates order with Razorpay
5. Order ID returned to frontend

### 2. Payment Processing
1. Frontend initializes Razorpay checkout
2. User selects payment method
3. Payment processed by Razorpay
4. Success/failure callback triggered

### 3. Payment Verification
1. Frontend receives payment response
2. Payment signature verified with live Edge Function
3. Order status updated in Supabase database
4. User redirected to success/failure page

## 🚀 Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
```

### 2. Security Checklist
- [ ] Use live Razorpay keys
- [ ] Enable HTTPS
- [ ] Edge Functions are live and accessible
- [ ] Configure environment variables in Supabase
- [ ] Test payment flow thoroughly

### 3. Monitoring
- Monitor payment success rates
- Set up error logging in Supabase
- Track order completion rates
- Monitor Edge Function response times

## 📞 Support

### Razorpay Support
- **Documentation**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-mode/
- **Support**: support@razorpay.com

### Supabase Support
- **Documentation**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Support**: https://supabase.com/support

### Project Support
- Check the console logs for errors
- Run the test suite to verify integration
- Ensure all environment variables are set correctly in Supabase

## 🔄 Updates

### Recent Changes
- ✅ Migrated to live Supabase Edge Functions
- ✅ Updated function URLs to production endpoints
- ✅ Enhanced error handling and validation
- ✅ Improved security features
- ✅ Comprehensive testing suite
- ✅ Production-ready configuration

### Future Enhancements
- [ ] Webhook integration
- [ ] Refund processing
- [ ] Subscription payments
- [ ] Multiple currency support
- [ ] Advanced analytics

---

**Last Updated**: December 2024
**Version**: 2.1.0
**Status**: ✅ Production Ready (Live Functions)
**Backend**: Live Supabase Edge Functions
**Live URLs**: ✅ Deployed and Accessible