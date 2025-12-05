export interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'escrow';
  token: string;
  amount: number;
  usdValue: number;
  from: string;
  to: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  riskScore?: number;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  lastTransaction?: Date;
}

export interface EscrowDeal {
  id: string;
  title: string;
  description: string;
  amount: number;
  token: string;
  buyer: string;
  seller: string;
  status: 'pending' | 'funded' | 'delivered' | 'released' | 'disputed';
  milestones: Milestone[];
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'completed' | 'released';
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: string;
}
