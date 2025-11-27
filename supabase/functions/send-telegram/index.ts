import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramMessage {
  type: 'transaction' | 'security' | 'escrow' | 'general';
  title: string;
  message: string;
  amount?: string;
  token?: string;
  recipient?: string;
  status?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = '8042388472'; // Neeraj's Telegram ID
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    const { type, title, message, amount, token, recipient, status }: TelegramMessage = await req.json();

    // Format message based on type
    let formattedMessage = '';
    
    switch (type) {
      case 'transaction':
        formattedMessage = `
🔔 *${title}*

💰 Amount: \`${amount} ${token}\`
📤 To: \`${recipient}\`
📊 Status: ${status || 'Pending'}

${message}
        `;
        break;
      case 'security':
        formattedMessage = `
🚨 *SECURITY ALERT*

⚠️ ${title}

${message}

🕐 Time: ${new Date().toLocaleString()}
        `;
        break;
      case 'escrow':
        formattedMessage = `
📝 *ESCROW UPDATE*

${title}

💰 Amount: \`${amount} ${token}\`
📊 Status: ${status}

${message}
        `;
        break;
      default:
        formattedMessage = `
📬 *${title}*

${message}
        `;
    }

    // Send message via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('Telegram API error:', result);
      throw new Error(result.description || 'Failed to send Telegram message');
    }

    console.log('Telegram notification sent successfully:', result);

    return new Response(JSON.stringify({ success: true, message_id: result.result.message_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending Telegram notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
