import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Razorpay configuration
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_KcjoPhlso7v6VN'
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || 'G0LXpG4OVQidER2Yy0seBq6q'

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

    // Get payment ID from URL
    const url = new URL(req.url)
    const paymentId = url.pathname.split('/').pop()

    if (!paymentId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment ID is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch payment details from Razorpay
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Payment not found' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const errorData = await response.text()
      console.error('❌ Razorpay API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to fetch payment status',
          details: errorData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const paymentData = await response.json()

    console.log('✅ Payment status fetched:', {
      payment_id: paymentId,
      status: paymentData.status
    })

    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error fetching payment status:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to fetch payment status',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 