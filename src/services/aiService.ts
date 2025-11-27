import { supabase } from "@/integrations/supabase/client";

interface FraudCheckData {
  amount: string;
  token: string;
  recipient: string;
  senderBalance: string;
  isNewAddress: boolean;
  transactionCount: number;
}

interface FraudCheckResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendation: 'allow' | 'review' | 'block';
  raw_analysis?: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
}

export const checkFraud = async (data: FraudCheckData): Promise<FraudCheckResult | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'fraud_check',
        data,
      },
    });

    if (error) {
      console.error('Error checking fraud:', error);
      return null;
    }

    return result.response as FraudCheckResult;
  } catch (error) {
    console.error('Failed to check fraud:', error);
    return null;
  }
};

export const chatWithAI = async (message: string): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'chat',
        data: { message },
      },
    });

    if (error) {
      console.error('Error chatting with AI:', error);
      return null;
    }

    return result.response as string;
  } catch (error) {
    console.error('Failed to chat with AI:', error);
    return null;
  }
};

export const analyzeTransaction = async (transactionData: any): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'analyze_transaction',
        data: transactionData,
      },
    });

    if (error) {
      console.error('Error analyzing transaction:', error);
      return null;
    }

    return result.response as string;
  } catch (error) {
    console.error('Failed to analyze transaction:', error);
    return null;
  }
};

export const getPricePrediction = async (token: string): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'price_prediction',
        data: { token },
      },
    });

    if (error) {
      console.error('Error getting price prediction:', error);
      return null;
    }

    return result.response as string;
  } catch (error) {
    console.error('Failed to get price prediction:', error);
    return null;
  }
};
