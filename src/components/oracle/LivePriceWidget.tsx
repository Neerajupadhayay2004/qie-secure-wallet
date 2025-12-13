import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Fuel, RefreshCw } from 'lucide-react';
import { fetchQIEPrice, fetchGasEstimate, QIEPrice, GasEstimate } from '@/services/oracleService';

interface LivePriceWidgetProps {
  compact?: boolean;
  showGas?: boolean;
}

const LivePriceWidget: React.FC<LivePriceWidgetProps> = ({ compact = false, showGas = true }) => {
  const [price, setPrice] = useState<QIEPrice | null>(null);
  const [gas, setGas] = useState<GasEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const [priceData, gasData] = await Promise.all([
        fetchQIEPrice(),
        showGas ? fetchGasEstimate() : null,
      ]);
      
      if (priceData) setPrice(priceData);
      if (gasData) setGas(gasData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching oracle data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    
    return () => clearInterval(interval);
  }, [showGas]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-20 animate-pulse mb-1" />
            <div className="h-3 bg-muted rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (compact && price) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">QIE</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">${price.usd.toFixed(4)}</span>
                <motion.span
                  key={price.change24h}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs flex items-center ${
                    price.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {price.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(price.change24h).toFixed(2)}%
                </motion.span>
              </div>
              <span className="text-xs text-muted-foreground">₹{price.inr.toFixed(2)}</span>
            </div>
          </div>
          
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Live Oracle Data</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
          </span>
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Price Section */}
      {price && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-sm font-bold text-primary-foreground">QIE</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">${price.usd.toFixed(4)}</h3>
                <p className="text-muted-foreground">₹{price.inr.toFixed(2)} INR</p>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={price.change24h}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                  price.change24h >= 0 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}
              >
                {price.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">{Math.abs(price.change24h).toFixed(2)}%</span>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="font-semibold text-foreground">${formatNumber(price.volume24h)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="font-semibold text-foreground">${formatNumber(price.marketCap)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gas Section */}
      {showGas && gas && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fuel className="w-4 h-4" />
            <span className="text-sm">Gas Estimates</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-muted/50 rounded-lg p-3 text-center cursor-pointer hover:bg-muted transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">🐢 Slow</p>
              <p className="font-semibold text-foreground">{gas.slow} Gwei</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center cursor-pointer"
            >
              <p className="text-xs text-primary mb-1">⚡ Standard</p>
              <p className="font-semibold text-foreground">{gas.standard} Gwei</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-muted/50 rounded-lg p-3 text-center cursor-pointer hover:bg-muted transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">🚀 Fast</p>
              <p className="font-semibold text-foreground">{gas.fast} Gwei</p>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LivePriceWidget;
