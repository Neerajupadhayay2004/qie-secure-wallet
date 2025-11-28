import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PythonAPIRequest {
  action: 'analyze_wallet' | 'predict_fraud' | 'ml_scoring' | 'pattern_analysis' | 'custom';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PYTHON_API_URL = Deno.env.get('PYTHON_API_URL');
    const PYTHON_API_KEY = Deno.env.get('PYTHON_API_KEY');
    
    if (!PYTHON_API_URL) {
      throw new Error('PYTHON_API_URL is not configured');
    }

    const { action, data }: PythonAPIRequest = await req.json();
    
    console.log(`Calling Python API: ${action}`);
    
    // Build the endpoint based on action
    const endpoint = `${PYTHON_API_URL}/${action}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if configured
    if (PYTHON_API_KEY) {
      headers['X-API-Key'] = PYTHON_API_KEY;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python API error:', response.status, errorText);
      throw new Error(`Python API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log(`Python API ${action} completed successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      response: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error calling Python API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
