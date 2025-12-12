import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const marketData = [
  { symbol: 'QIE', price: 2.45, change: 5.67, color: 'from-primary to-cyan-500' },
  { symbol: 'USDT', price: 1.00, change: 0.01, color: 'from-success to-emerald-600' },
  { symbol: 'USDC', price: 1.00, change: -0.02, color: 'from-blue-500 to-indigo-600' },
  { symbol: 'DAI', price: 1.00, change: 0.03, color: 'from-warning to-orange-500' },
  { symbol: 'ETH', price: 3456.78, change: 2.34, color: 'from-purple-500 to-pink-600' },
  { symbol: 'BTC', price: 67890.12, change: -1.23, color: 'from-amber-500 to-orange-600' },
];

export function MarketTicker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-success"
        />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Market</span>
      </div>
      
      <motion.div
        animate={{ x: [0, -50 * marketData.length] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex gap-6"
      >
        {[...marketData, ...marketData].map((coin, index) => (
          <div key={index} className="flex items-center gap-3 min-w-fit">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${coin.color} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{coin.symbol.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{coin.symbol}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  ${coin.price.toLocaleString()}
                </span>
                <span className={`flex items-center text-xs ${coin.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {coin.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(coin.change)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
