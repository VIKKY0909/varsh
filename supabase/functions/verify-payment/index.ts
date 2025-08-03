import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Razorpay configuration
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

    // Get request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify signature using crypto
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    )
    
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const isValid = expectedSignature === razorpay_signature

    console.log('🔍 Payment verification:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isValid: isValid
    })

    // If payment is valid and orderId is provided, update the order in Supabase
    if (isValid && orderId) {
      try {
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ 
            razorpay_payment_id: razorpay_payment_id,
            payment_status: 'paid',
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('❌ Error updating order payment status:', updateError)
        } else {
          console.log('✅ Order payment status updated successfully')
        }
      } catch (updateError) {
        console.error('❌ Error updating order:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        isValid: isValid,
        message: isValid ? 'Payment verified successfully' : 'Invalid payment signature'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to verify payment',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 