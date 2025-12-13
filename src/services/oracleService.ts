import { supabase } from "@/integrations/supabase/client";

export interface QIEPrice {
  usd: number;
  inr: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface GasEstimate {
  slow: number;
  standard: number;
  fast: number;
  baseFee: number;
}

export interface MarketSignals {
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
  sentiment: number;
  fearGreedIndex: number;
}

export interface AddressReputation {
  address: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  transactionCount: number;
  firstSeen: string;
  lastActive: string;
  isContract: boolean;
  isExchange: boolean;
  labels: string[];
}

export interface OracleData {
  qiePrice?: QIEPrice;
  gasEstimate?: GasEstimate;
  marketSignals?: MarketSignals;
  addressReputation?: AddressReputation;
}

export const fetchFullOracleData = async (address?: string): Promise<OracleData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('oracle', {
      body: { action: 'full', address },
    });

    if (error) {
      console.error('Error fetching oracle data:', error);
      return null;
    }

    return data.data as OracleData;
  } catch (error) {
    console.error('Failed to fetch oracle data:', error);
    return null;
  }
};

export const fetchQIEPrice = async (): Promise<QIEPrice | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('oracle', {
      body: { action: 'price' },
    });

    if (error) {
      console.error('Error fetching price:', error);
      return null;
    }

    return data.data.qiePrice as QIEPrice;
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return null;
  }
};

export const fetchGasEstimate = async (): Promise<GasEstimate | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('oracle', {
      body: { action: 'gas' },
    });

    if (error) {
      console.error('Error fetching gas:', error);
      return null;
    }

    return data.data.gasEstimate as GasEstimate;
  } catch (error) {
    console.error('Failed to fetch gas:', error);
    return null;
  }
};

export const fetchMarketSignals = async (): Promise<MarketSignals | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('oracle', {
      body: { action: 'market' },
    });

    if (error) {
      console.error('Error fetching market signals:', error);
      return null;
    }

    return data.data.marketSignals as MarketSignals;
  } catch (error) {
    console.error('Failed to fetch market signals:', error);
    return null;
  }
};

export const fetchAddressReputation = async (address: string): Promise<AddressReputation | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('oracle', {
      body: { action: 'reputation', address },
    });

    if (error) {
      console.error('Error fetching reputation:', error);
      return null;
    }

    return data.data.addressReputation as AddressReputation;
  } catch (error) {
    console.error('Failed to fetch reputation:', error);
    return null;
  }
};

// Calculate transaction fee in QIE
export const calculateTransactionFee = (
  gasEstimate: GasEstimate,
  speed: 'slow' | 'standard' | 'fast' = 'standard'
): number => {
  const gasPrice = gasEstimate[speed];
  const gasLimit = 21000; // Standard transfer
  const feeInGwei = gasPrice * gasLimit;
  const feeInQIE = feeInGwei / 1e9;
  return parseFloat(feeInQIE.toFixed(6));
};

// Convert QIE amount to INR
export const convertQIEToINR = (amount: number, price: QIEPrice): number => {
  return parseFloat((amount * price.inr).toFixed(2));
};

// Convert QIE amount to USD
export const convertQIEToUSD = (amount: number, price: QIEPrice): number => {
  return parseFloat((amount * price.usd).toFixed(4));
};
