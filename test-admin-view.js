// Test script to verify admin_orders_flat view
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qajswgkrjldtugyymydg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhanN3Z2tyamxkdHVneXlteWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzI5NzAsImV4cCI6MjA1MTU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminView() {
  console.log('🧪 Testing admin_orders_flat view...\n');

  try {
    // Test 1: Check if the view exists
    console.log('1. Checking if admin_orders_flat view exists...');
    const { data: viewData, error: viewError } = await supabase
      .from('admin_orders_flat')
      .select('*')
      .limit(1);

    if (viewError) {
      console.error('❌ Error accessing admin_orders_flat view:', viewError);
      return;
    }

    console.log('✅ admin_orders_flat view exists and is accessible');
    console.log('📊 Sample data structure:', viewData?.[0] ? Object.keys(viewData[0]) : 'No data');

    // Test 2: Get all orders from the view
    console.log('\n2. Fetching all orders from admin_orders_flat...');
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('admin_orders_flat')
      .select('*')
      .order('created_at', { ascending: false });

    if (allOrdersError) {
      console.error('❌ Error fetching all orders:', allOrdersError);
      return;
    }

    console.log(`✅ Successfully fetched ${allOrders?.length || 0} rows from admin_orders_flat`);

    if (allOrders && allOrders.length > 0) {
      console.log('\n📋 Sample order data:');
      const sampleOrder = allOrders[0];
      console.log('- Order ID:', sampleOrder.order_id);
      console.log('- Order Number:', sampleOrder.order_number);
      console.log('- Total Amount:', sampleOrder.total_amount);
      console.log('- Status:', sampleOrder.status);
      console.log('- Payment Status:', sampleOrder.payment_status);
      console.log('- Razorpay Order ID:', sampleOrder.razorpay_order_id);
      console.log('- Payment Timestamp:', sampleOrder.payment_timestamp || 'Not set');
      console.log('- Estimated Delivery Day:', sampleOrder.estimated_delivery_day || 'Not set');
      console.log('- Days Until Delivery:', sampleOrder.days_until_delivery || 'Not set');
      console.log('- User Email:', sampleOrder.user_email);
      console.log('- User Full Name:', sampleOrder.user_full_name);
      console.log('- Product Name:', sampleOrder.product_name);
      console.log('- Order Item ID:', sampleOrder.order_item_id);
      console.log('- Quantity:', sampleOrder.quantity);
      console.log('- Size:', sampleOrder.size);
    }

    // Test 3: Test grouping logic (simulate frontend grouping)
    console.log('\n3. Testing grouping logic...');
    if (allOrders && allOrders.length > 0) {
      const ordersMap = {};
      
      allOrders.forEach(row => {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            id: row.order_id,
            order_number: row.order_number || row.order_id.slice(0, 8).toUpperCase(),
            total_amount: Number(row.total_amount) || 0,
            status: row.status || 'pending',
            created_at: row.created_at,
            payment_status: row.payment_status || 'pending',
            razorpay_order_id: row.razorpay_order_id,
            razorpay_payment_id: row.razorpay_payment_id,
            payment_timestamp: row.payment_timestamp,
            estimated_delivery_day: row.estimated_delivery_day,
            days_until_delivery: row.days_until_delivery ? Number(row.days_until_delivery) : undefined,
            user: {
              email: row.user_email || '',
              user_profiles: {
                full_name: row.user_full_name || '',
                phone: row.user_phone || ''
              }
            },
            order_items: []
          };
        }
        
        if (row.order_item_id) {
          ordersMap[row.order_id].order_items.push({
            id: row.order_item_id,
            quantity: row.quantity || 0,
            size: row.size || '',
            price: Number(row.item_price) || 0,
            product: {
              name: row.product_name || 'Unknown Product',
              images: Array.isArray(row.product_images) ? row.product_images : (row.product_images ? [row.product_images] : [])
            }
          });
        }
      });

      const groupedOrders = Object.values(ordersMap);
      console.log(`✅ Successfully grouped ${groupedOrders.length} orders`);
      
      if (groupedOrders.length > 0) {
        const sampleGrouped = groupedOrders[0];
        console.log('\n📦 Sample grouped order:');
        console.log('- Order ID:', sampleGrouped.id);
        console.log('- Order Number:', sampleGrouped.order_number);
        console.log('- Items Count:', sampleGrouped.order_items.length);
        console.log('- Payment Timestamp:', sampleGrouped.payment_timestamp || 'Not set');
        console.log('- Estimated Delivery Day:', sampleGrouped.estimated_delivery_day || 'Not set');
        console.log('- Days Until Delivery:', sampleGrouped.days_until_delivery || 'Not set');
        console.log('- User Email:', sampleGrouped.user.email);
        console.log('- User Name:', sampleGrouped.user.user_profiles.full_name);
        
        if (sampleGrouped.order_items.length > 0) {
          console.log('- First Item:', sampleGrouped.order_items[0].product.name);
        }
      }
    }

    console.log('\n🎉 All tests passed! The admin_orders_flat view is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminView(); 