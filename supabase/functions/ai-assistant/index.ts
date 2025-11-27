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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { action, data }: AIRequest = await req.json();
    
    let prompt = '';
    let systemPrompt = '';

    switch (action) {
      case 'fraud_check':
        systemPrompt = `You are an advanced AI fraud detection system for a cryptocurrency wallet. 
        Analyze transactions and flag suspicious activities. 
        Consider factors like: unusual amounts, new addresses, rapid successive transactions, 
        amounts that are round numbers, transactions to known scam addresses.
        Return a JSON response with: risk_score (0-100), risk_level (low/medium/high/critical), 
        warnings (array of strings), and recommendation (allow/review/block).`;
        
        prompt = `Analyze this transaction for fraud:
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
        
        prompt = `Analyze this transaction:
        ${JSON.stringify(data, null, 2)}
        
        Provide insights on: optimal timing, gas fees, and any recommendations.`;
        break;

      case 'price_prediction':
        systemPrompt = `You are a cryptocurrency market analyst. Provide brief, realistic market insights.
        Always include disclaimers about market volatility and that this is not financial advice.`;
        
        prompt = `Provide a brief market analysis for ${data.token}. 
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
        
        prompt = data.message || data.prompt;
        break;
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: action === 'fraud_check' ? 0.1 : 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('Gemini API error:', result.error);
      throw new Error(result.error.message || 'Gemini API error');
    }

    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
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
