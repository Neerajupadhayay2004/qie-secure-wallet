import { Token, Transaction, Contact, EscrowDeal } from '@/types/wallet';

export const mockTokens: Token[] = [
  {
    id: '1',
    symbol: 'QIE',
    name: 'QIE Token',
    balance: 15420.50,
    usdValue: 23130.75,
    change24h: 5.23,
    icon: '💎',
    color: '#14b8a6',
  },
  {
    id: '2',
    symbol: 'USDT',
    name: 'Tether USD',
    balance: 8500.00,
    usdValue: 8500.00,
    change24h: 0.01,
    icon: '💵',
    color: '#26a17b',
  },
  {
    id: '3',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 5250.00,
    usdValue: 5250.00,
    change24h: -0.02,
    icon: '🪙',
    color: '#2775ca',
  },
  {
    id: '4',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    balance: 2800.00,
    usdValue: 2800.00,
    change24h: 0.03,
    icon: '🔶',
    color: '#f5ac37',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    token: 'QIE',
    amount: 500,
    usdValue: 750,
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f1dE21',
    to: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'confirmed',
    txHash: '0xabc123def456...',
    riskScore: 12,
  },
  {
    id: '2',
    type: 'send',
    token: 'USDT',
    amount: 1200,
    usdValue: 1200,
    from: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    to: '0x456def789abc012345678901234567890abcdef1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'confirmed',
    txHash: '0xdef456abc789...',
    riskScore: 8,
  },
  {
    id: '3',
    type: 'escrow',
    token: 'USDC',
    amount: 2500,
    usdValue: 2500,
    from: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    to: 'Escrow Contract',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'pending',
    txHash: '0x789abc012def...',
    riskScore: 5,
  },
  {
    id: '4',
    type: 'receive',
    token: 'DAI',
    amount: 800,
    usdValue: 800,
    from: '0x123abc456def789012345678901234567890abcd',
    to: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'confirmed',
    txHash: '0x012abc345def...',
    riskScore: 15,
  },
];

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Chen',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f1dE21',
    avatar: 'A',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    name: 'Bob Smith',
    address: '0x456def789abc012345678901234567890abcdef1',
    avatar: 'B',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '3',
    name: 'Carol Davis',
    address: '0x123abc456def789012345678901234567890abcd',
    avatar: 'C',
  },
];

export const mockEscrowDeals: EscrowDeal[] = [
  {
    id: '1',
    title: 'Website Development',
    description: 'Full-stack website development with React and Node.js',
    amount: 5000,
    token: 'USDC',
    buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f1dE21',
    seller: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    status: 'funded',
    milestones: [
      { id: '1', title: 'Design Approval', amount: 1000, status: 'completed' },
      { id: '2', title: 'Frontend Development', amount: 2000, status: 'pending' },
      { id: '3', title: 'Backend & Deployment', amount: 2000, status: 'pending' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: '2',
    title: 'Logo Design',
    description: 'Professional logo design with 3 revisions',
    amount: 500,
    token: 'USDT',
    buyer: '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc',
    seller: '0x456def789abc012345678901234567890abcdef1',
    status: 'delivered',
    milestones: [
      { id: '1', title: 'Initial Concepts', amount: 200, status: 'released' },
      { id: '2', title: 'Final Delivery', amount: 300, status: 'completed' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
];

export const mockWalletAddress = '0x8Ba1f109551bD432803012645Hj67Gh8976NbVc';

export const calculatePortfolioValue = () => {
  return mockTokens.reduce((total, token) => total + token.usdValue, 0);
};

export const getPortfolioChange = () => {
  const totalValue = calculatePortfolioValue();
  const weightedChange = mockTokens.reduce((sum, token) => {
    return sum + (token.change24h * token.usdValue) / totalValue;
  }, 0);
  return weightedChange;
};
