import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Razorpay credentials not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
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

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const encoder = new TextEncoder()
    const key = encoder.encode(RAZORPAY_KEY_SECRET)
    const message = encoder.encode(text)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const isValid = expectedSignature === razorpay_signature

    // Update order in database if provided
    if (orderId && isValid) {
      try {
        // Update order payment status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            status: 'confirmed'
          })
          .eq('id', orderId)

        if (updateError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Payment verified but failed to update order'
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      } catch (dbError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Payment verified but failed to update order'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        isValid: isValid,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 