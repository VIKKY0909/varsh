import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Razorpay configuration
const RAZORPAY_KEY_ID = (typeof Deno !== "undefined" && Deno.env.get('RAZORPAY_KEY_ID')) || 'rzp_test_KcjoPhlso7v6VN'
const RAZORPAY_KEY_SECRET = (typeof Deno !== "undefined" && Deno.env.get('RAZORPAY_KEY_SECRET')) || 'G0LXpG4OVQidER2Yy0seBq6q'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get request body
    const { amount, currency, receipt, notes, orderId, customerInfo } = await req.json()

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields: amount, currency, receipt' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Amount must be greater than 0' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate currency
    if (currency !== 'INR') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Only INR currency is supported' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: receipt,
        notes: {
          ...notes,
          order_id: orderId,
          customer_email: customerInfo?.email,
          customer_phone: customerInfo?.phone
        },
        payment_capture: 1 // Auto capture payment
      })
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text()
      console.error('❌ Razorpay API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to create Razorpay order',
          details: errorData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const orderData = await razorpayResponse.json()

    // If orderId is provided, update the order in Supabase with Razorpay order ID
    if (orderId) {
      try {
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ 
            razorpay_order_id: orderData.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('❌ Error updating order with Razorpay ID:', updateError)
        } else {
          console.log('✅ Order updated with Razorpay ID:', orderData.id)
        }
      } catch (updateError) {
        console.error('❌ Error updating order:', updateError)
      }
    }

    console.log('✅ Razorpay order created:', {
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: orderData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 