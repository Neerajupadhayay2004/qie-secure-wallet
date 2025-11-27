import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockTokens } from '@/data/mockData';

export function TokenList() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (value: number) => {
    if (value >= 1000) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
    return value.toFixed(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden"
    >
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold">Your Assets</h3>
      </div>

      <div className="divide-y divide-border/50">
        {mockTokens.map((token, index) => (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: `${token.color}20` }}
              >
                {token.icon}
              </div>
              <div>
                <p className="font-medium">{token.symbol}</p>
                <p className="text-sm text-muted-foreground">{token.name}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">{formatBalance(token.balance)} {token.symbol}</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(token.usdValue)}
                </span>
                <span className={`flex items-center text-xs ${
                  token.change24h >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {token.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
