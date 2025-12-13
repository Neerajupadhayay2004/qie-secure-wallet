import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3, Gauge, Brain, RefreshCw } from 'lucide-react';
import { fetchMarketSignals, MarketSignals } from '@/services/oracleService';

interface MarketSignalsWidgetProps {
  compact?: boolean;
}

const MarketSignalsWidget: React.FC<MarketSignalsWidgetProps> = ({ compact = false }) => {
  const [signals, setSignals] = useState<MarketSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const data = await fetchMarketSignals();
      if (data) setSignals(data);
    } catch (error) {
      console.error('Error fetching market signals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getTrendConfig = () => {
    if (!signals) return null;
    
    switch (signals.trend) {
      case 'bullish':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          label: 'Bullish',
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          label: 'Bearish',
        };
      case 'neutral':
        return {
          icon: Minus,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          label: 'Neutral',
        };
    }
  };

  const getVolatilityConfig = () => {
    if (!signals) return null;
    
    switch (signals.volatility) {
      case 'low':
        return { color: 'text-green-500', bg: 'bg-green-500', label: 'Low' };
      case 'medium':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Medium' };
      case 'high':
        return { color: 'text-red-500', bg: 'bg-red-500', label: 'High' };
    }
  };

  const getFearGreedLabel = (value: number) => {
    if (value <= 25) return { label: 'Extreme Fear', color: 'text-red-500' };
    if (value <= 45) return { label: 'Fear', color: 'text-orange-500' };
    if (value <= 55) return { label: 'Neutral', color: 'text-yellow-500' };
    if (value <= 75) return { label: 'Greed', color: 'text-green-400' };
    return { label: 'Extreme Greed', color: 'text-green-500' };
  };

  if (loading) {
    return (
      <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!signals) return null;

  const trendConfig = getTrendConfig()!;
  const volatilityConfig = getVolatilityConfig()!;
  const fgConfig = getFearGreedLabel(signals.fearGreedIndex);
  const TrendIcon = trendConfig.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${trendConfig.bg} flex items-center justify-center`}>
              <TrendIcon className={`w-5 h-5 ${trendConfig.color}`} />
            </div>
            <div>
              <span className={`font-semibold ${trendConfig.color}`}>{trendConfig.label}</span>
              <p className="text-xs text-muted-foreground">
                Fear & Greed: {signals.fearGreedIndex}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full ${volatilityConfig.bg}/20 ${volatilityConfig.color} text-xs`}>
            {volatilityConfig.label} Vol
          </div>
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
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Market Intelligence</span>
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

      {/* Market Trend */}
      <div className={`${trendConfig.bg} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center`}>
              <TrendIcon className={`w-6 h-6 ${trendConfig.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Trend</p>
              <p className={`text-xl font-bold ${trendConfig.color}`}>{trendConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Sentiment</p>
            <p className="text-xl font-bold text-foreground">{signals.sentiment}%</p>
          </div>
        </div>
      </div>

      {/* Fear & Greed Index */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
          </div>
          <span className={`font-semibold ${fgConfig.color}`}>{fgConfig.label}</span>
        </div>
        
        <div className="relative h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${signals.fearGreedIndex}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-background"
            style={{ left: `${signals.fearGreedIndex}%` }}
          >
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground">
              {signals.fearGreedIndex}
            </span>
          </motion.div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground pt-4">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>

      {/* Volatility */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Market Volatility</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${volatilityConfig.bg} animate-pulse`} />
          <span className={`font-semibold ${volatilityConfig.color}`}>{volatilityConfig.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketSignalsWidget;
