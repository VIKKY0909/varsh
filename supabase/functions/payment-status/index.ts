import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
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

    // Get payment ID from URL
    const url = new URL(req.url)
    const paymentId = url.searchParams.get('payment_id')

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

    // Fetch payment status from Razorpay
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
      
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

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch payment status',
          details: errorData
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paymentData = await response.json()

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