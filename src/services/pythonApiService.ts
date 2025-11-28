import { supabase } from "@/integrations/supabase/client";

interface WalletAnalysis {
  risk_score: number;
  transaction_patterns: string[];
  recommendations: string[];
  anomalies: any[];
}

interface FraudPrediction {
  is_fraud: boolean;
  confidence: number;
  risk_factors: string[];
  ml_model_version: string;
}

interface MLScoring {
  credit_score: number;
  trust_score: number;
  activity_score: number;
  overall_rating: string;
}

interface PatternAnalysis {
  patterns: {
    type: string;
    frequency: number;
    description: string;
  }[];
  insights: string[];
  predictions: string[];
}

export const analyzeWallet = async (walletAddress: string, transactions: any[]): Promise<WalletAnalysis | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('python-api', {
      body: {
        action: 'analyze_wallet',
        data: { wallet_address: walletAddress, transactions },
      },
    });

    if (error) {
      console.error('Error analyzing wallet:', error);
      return null;
    }

    return result.response as WalletAnalysis;
  } catch (error) {
    console.error('Failed to analyze wallet:', error);
    return null;
  }
};

export const predictFraud = async (transactionData: {
  amount: number;
  token: string;
  recipient: string;
  sender: string;
  timestamp: string;
  historical_data?: any[];
}): Promise<FraudPrediction | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('python-api', {
      body: {
        action: 'predict_fraud',
        data: transactionData,
      },
    });

    if (error) {
      console.error('Error predicting fraud:', error);
      return null;
    }

    return result.response as FraudPrediction;
  } catch (error) {
    console.error('Failed to predict fraud:', error);
    return null;
  }
};

export const getMLScoring = async (walletAddress: string): Promise<MLScoring | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('python-api', {
      body: {
        action: 'ml_scoring',
        data: { wallet_address: walletAddress },
      },
    });

    if (error) {
      console.error('Error getting ML scoring:', error);
      return null;
    }

    return result.response as MLScoring;
  } catch (error) {
    console.error('Failed to get ML scoring:', error);
    return null;
  }
};

export const analyzePatterns = async (transactions: any[]): Promise<PatternAnalysis | null> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('python-api', {
      body: {
        action: 'pattern_analysis',
        data: { transactions },
      },
    });

    if (error) {
      console.error('Error analyzing patterns:', error);
      return null;
    }

    return result.response as PatternAnalysis;
  } catch (error) {
    console.error('Failed to analyze patterns:', error);
    return null;
  }
};

export const callCustomEndpoint = async (endpoint: string, data: any): Promise<any> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('python-api', {
      body: {
        action: 'custom',
        data: { endpoint, ...data },
      },
    });

    if (error) {
      console.error('Error calling custom endpoint:', error);
      return null;
    }

    return result.response;
  } catch (error) {
    console.error('Failed to call custom endpoint:', error);
    return null;
  }
};
