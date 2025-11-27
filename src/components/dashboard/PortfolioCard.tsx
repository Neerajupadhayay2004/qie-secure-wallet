import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { calculatePortfolioValue, getPortfolioChange } from '@/data/mockData';

export function PortfolioCard() {
  const [isVisible, setIsVisible] = useState(true);
  const totalValue = calculatePortfolioValue();
  const change = getPortfolioChange();
  const isPositive = change >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {isVisible ? (
              <Eye className="w-4 h-4 text-muted-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <motion.div
          key={isVisible ? 'visible' : 'hidden'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isVisible ? formatCurrency(totalValue) : '••••••••'}
          </h2>
        </motion.div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
            isPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </div>
          <span className="text-sm text-muted-foreground">Last 24h</span>
        </div>
      </div>
    </motion.div>
  );
}
