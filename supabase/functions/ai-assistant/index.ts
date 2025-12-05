import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  action: 'fraud_check' | 'chat' | 'analyze_transaction' | 'price_prediction';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { action, data }: AIRequest = await req.json();
    
    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'fraud_check':
        systemPrompt = `You are an advanced AI fraud detection system for a cryptocurrency wallet. 
        Analyze transactions and flag suspicious activities. 
        Consider factors like: unusual amounts, new addresses, rapid successive transactions, 
        amounts that are round numbers, transactions to known scam addresses.
        Return a JSON response with: risk_score (0-100), risk_level (low/medium/high/critical), 
        warnings (array of strings), and recommendation (allow/review/block).
        IMPORTANT: Return ONLY valid JSON, no markdown or extra text.`;
        
        userPrompt = `Analyze this transaction for fraud:
        Amount: ${data.amount} ${data.token}
        Recipient: ${data.recipient}
        Sender Balance: ${data.senderBalance}
        Is New Address: ${data.isNewAddress}
        Transaction History: ${data.transactionCount} previous transactions
        Time: ${new Date().toISOString()}`;
        break;

      case 'analyze_transaction':
        systemPrompt = `You are a cryptocurrency transaction analyst. Provide insights about transactions 
        including gas optimization, timing suggestions, and market conditions.`;
        
        userPrompt = `Analyze this transaction:
        ${JSON.stringify(data, null, 2)}
        
        Provide insights on: optimal timing, gas fees, and any recommendations.`;
        break;

      case 'price_prediction':
        systemPrompt = `You are a cryptocurrency market analyst. Provide brief, realistic market insights.
        Always include disclaimers about market volatility and that this is not financial advice.`;
        
        userPrompt = `Provide a brief market analysis for ${data.token}. 
        Current price trends and general sentiment. Keep it concise.`;
        break;

      case 'chat':
      default:
        systemPrompt = `You are QIE Wallet's AI assistant. You help users with:
        - Understanding cryptocurrency transactions
        - Explaining wallet features
        - Providing security tips
        - Answering questions about stablecoins (USDT, USDC, DAI) and QIE token
        - Explaining escrow and smart contracts
        
        Be helpful, concise, and security-conscious. Never ask for private keys or seed phrases.`;
        
        userPrompt = data.message || data.prompt;
        break;
    }

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: action === 'fraud_check' ? 0.1 : 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || 'No response generated';
    
    // For fraud check, try to parse JSON response
    let parsedResponse = aiResponse;
    if (action === 'fraud_check') {
      try {
        // Extract JSON from response if wrapped in markdown
        const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                          aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
      } catch {
        // If parsing fails, return structured response
        parsedResponse = {
          risk_score: 25,
          risk_level: 'low',
          warnings: [],
          recommendation: 'allow',
          raw_analysis: aiResponse
        };
      }
    }

    console.log(`AI ${action} completed successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      response: parsedResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in AI assistant:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
