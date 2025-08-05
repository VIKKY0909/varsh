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
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { amount, currency, receipt, notes } = body;

    console.log('Received request:', { amount, currency, receipt, notes });

    // Validate required fields
    if (!amount || !currency || !receipt) {
      console.error('Missing required fields:', { amount, currency, receipt });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: amount, currency, receipt' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Amount must be a positive number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate currency
    if (currency !== 'INR') {
      console.error('Invalid currency:', currency);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Only INR currency is supported' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasRazorpayKeyId: !!RAZORPAY_KEY_ID,
      hasRazorpayKeySecret: !!RAZORPAY_KEY_SECRET
    });

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Supabase configuration missing' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
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

    console.log('Creating Razorpay order with amount:', amount * 100);

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
        notes: notes || {}
      })
    });

    console.log('Razorpay response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create Razorpay order',
          details: errorData
        }),
        { 
          status: razorpayResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const orderData = await razorpayResponse.json();
    console.log('Razorpay order created successfully:', orderData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: orderData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}) 