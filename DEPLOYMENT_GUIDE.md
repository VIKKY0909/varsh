# Supabase Edge Functions Deployment Guide

This guide will help you deploy the Razorpay integration using Supabase Edge Functions.

## 🚀 Prerequisites

1. **Supabase CLI** installed
2. **Supabase Project** created
3. **Razorpay Account** with API keys
4. **Node.js** (v16 or higher)

## 📋 Setup Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables

In your Supabase dashboard, go to **Settings > Edge Functions** and add these environment variables:

```env
RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_test_secret_here
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
supabase functions deploy payment-status
```

### 6. Run Database Migration

```bash
supabase db push
```

This will apply the migration that adds Razorpay fields to the orders table.

## 🧪 Testing Deployment

### 1. Test Edge Functions

```bash
node test-supabase-api.js
```

### 2. Test Frontend Integration

1. Start your frontend application:
   ```bash
   npm run dev
   ```

2. Navigate to the checkout page
3. Test the payment flow with Razorpay test cards

## 🔧 Configuration

### Frontend Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_here
```

### Supabase Configuration

Ensure your `src/lib/supabase.ts` is properly configured:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🚀 Production Deployment

### 1. Update Environment Variables

In Supabase dashboard, update the environment variables with live keys:

```env
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
```

### 2. Deploy to Production

```bash
# Deploy functions to production
supabase functions deploy create-razorpay-order --project-ref your-production-ref
supabase functions deploy verify-payment --project-ref your-production-ref
supabase functions deploy payment-status --project-ref your-production-ref
```

### 3. Update Frontend

Update your frontend environment variables with production values:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
```

## 📊 Monitoring

### 1. Edge Function Logs

Monitor your Edge Functions in the Supabase dashboard:
- Go to **Edge Functions** in your dashboard
- Click on any function to view logs
- Check for errors and performance metrics

### 2. Database Monitoring

Monitor your orders table for payment tracking:
- Use the `orders_with_payment_info` view for admin panel
- Check payment status updates
- Monitor order completion rates

### 3. Payment Analytics

Track payment success rates and issues:
- Monitor Razorpay dashboard for payment analytics
- Check for failed payments and reasons
- Track payment method preferences

## 🔒 Security Checklist

- [ ] Environment variables are set in Supabase dashboard
- [ ] Live Razorpay keys are used in production
- [ ] HTTPS is enabled for all connections
- [ ] CORS is properly configured
- [ ] Error handling is comprehensive
- [ ] Payment verification is working
- [ ] Database indexes are created
- [ ] Admin panel can view payment information

## 🐛 Troubleshooting

### Common Issues

#### 1. "Function not found"
**Solution**: Ensure Edge Functions are deployed correctly

#### 2. "Environment variable not found"
**Solution**: Check environment variables in Supabase dashboard

#### 3. "CORS error"
**Solution**: Verify CORS headers in Edge Functions

#### 4. "Database connection error"
**Solution**: Check Supabase connection and permissions

### Debug Commands

```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs create-razorpay-order

# Test function locally
supabase functions serve create-razorpay-order --env-file .env.local
```

## 📞 Support

### Supabase Support
- **Documentation**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Community**: https://github.com/supabase/supabase/discussions

### Razorpay Support
- **Documentation**: https://razorpay.com/docs/
- **Support**: support@razorpay.com

### Project Support
- Check the console logs for errors
- Run the test suite to verify integration
- Ensure all environment variables are set correctly

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Status**: ✅ Ready for Deployment 