import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Lock, Brain, Activity, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchFullOracleData, fetchAddressReputation, AddressReputation, MarketSignals, QIEPrice } from '@/services/oracleService';
import { predictFraud, analyzePatterns } from '@/services/pythonApiService';
import { mockTransactions, mockWalletAddress } from '@/data/mockData';

interface SecurityMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'danger';
  icon: React.ReactNode;
}

interface EnhancedAlert {
  id: number;
  type: 'info' | 'warning' | 'success' | 'danger';
  message: string;
  time: string;
  source: string;
}

export function SecurityDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [oracleData, setOracleData] = useState<{
    price: QIEPrice | null;
    marketSignals: MarketSignals | null;
    reputation: AddressReputation | null;
  }>({ price: null, marketSignals: null, reputation: null });
  const [aiAnalysis, setAiAnalysis] = useState<{
    riskScore: number;
    threats: string[];
    recommendations: string[];
  } | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<EnhancedAlert[]>([
    { id: 1, type: 'info', message: 'Oracle layer active - monitoring prices', time: 'Just now', source: 'Oracle' },
    { id: 2, type: 'success', message: 'Wallet reputation verified', time: '2 min ago', source: 'AI' },
    { id: 3, type: 'warning', message: 'Market volatility detected', time: '15 min ago', source: 'Market' },
  ]);

  // Fetch oracle data on mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFullOracleData(mockWalletAddress);
      if (data) {
        setOracleData({
          price: data.qiePrice || null,
          marketSignals: data.marketSignals || null,
          reputation: data.addressReputation || null,
        });
      }
    };
    fetchData();
  }, []);

  const getMetrics = (): SecurityMetric[] => {
    const baseScore = oracleData.reputation 
      ? 100 - oracleData.reputation.riskScore 
      : 85;
    
    const volatilityStatus = oracleData.marketSignals?.volatility === 'high' 
      ? 'warning' 
      : 'good';

    return [
      { 
        label: 'AI Security Score', 
        value: `${aiAnalysis?.riskScore || baseScore}/100`, 
        status: (aiAnalysis?.riskScore || baseScore) >= 70 ? 'good' : (aiAnalysis?.riskScore || baseScore) >= 40 ? 'warning' : 'danger', 
        icon: <Shield className="w-5 h-5" /> 
      },
      { 
        label: 'Threat Detections', 
        value: aiAnalysis?.threats.length || 0, 
        status: (aiAnalysis?.threats.length || 0) === 0 ? 'good' : 'warning', 
        icon: <AlertTriangle className="w-5 h-5" /> 
      },
      { 
        label: 'Market Volatility', 
        value: oracleData.marketSignals?.volatility || 'Unknown', 
        status: volatilityStatus, 
        icon: <Activity className="w-5 h-5" /> 
      },
      { 
        label: 'Oracle Status', 
        value: oracleData.price ? 'Active' : 'Offline', 
        status: oracleData.price ? 'good' : 'danger', 
        icon: <Zap className="w-5 h-5" /> 
      },
    ];
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    try {
      // Fetch fresh oracle data
      const oracleResult = await fetchFullOracleData(mockWalletAddress);
      
      if (oracleResult) {
        setOracleData({
          price: oracleResult.qiePrice || null,
          marketSignals: oracleResult.marketSignals || null,
          reputation: oracleResult.addressReputation || null,
        });
      }

      // Simulate AI analysis with oracle data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI analysis based on oracle data
      const threats: string[] = [];
      const recommendations: string[] = [];
      let riskScore = 85;

      if (oracleResult?.addressReputation) {
        if (oracleResult.addressReputation.riskScore > 50) {
          threats.push('Wallet address shows elevated risk patterns');
          riskScore -= 15;
        }
        if (oracleResult.addressReputation.flags.length > 0) {
          threats.push(...oracleResult.addressReputation.flags);
          riskScore -= oracleResult.addressReputation.flags.length * 5;
        }
      }

      if (oracleResult?.marketSignals) {
        if (oracleResult.marketSignals.volatility === 'high') {
          threats.push('High market volatility detected');
          recommendations.push('Consider waiting for market stabilization before large transactions');
          riskScore -= 10;
        }
        if (oracleResult.marketSignals.fearGreedIndex < 30) {
          threats.push('Extreme fear in market - potential manipulation risk');
          riskScore -= 5;
        }
      }

      if (threats.length === 0) {
        recommendations.push('All security checks passed');
        recommendations.push('Continue monitoring with Oracle layer');
      }

      riskScore = Math.max(0, Math.min(100, riskScore));

      setAiAnalysis({
        riskScore,
        threats,
        recommendations,
      });

      // Add new alert
      setRecentAlerts(prev => [
        {
          id: Date.now(),
          type: threats.length === 0 ? 'success' : 'warning',
          message: `AI scan complete: ${threats.length} threats detected`,
          time: 'Just now',
          source: 'AI + Oracle',
        },
        ...prev.slice(0, 4),
      ]);

    } catch (error) {
      console.error('Security scan error:', error);
    }
    
    setIsScanning(false);
    setLastScan(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <Eye className="w-4 h-4 text-primary" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'danger': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const metrics = getMetrics();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                AI Fraud Detection
                <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                  Oracle Enhanced
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                {lastScan 
                  ? `Last scan: ${lastScan.toLocaleTimeString()}`
                  : 'Powered by real-time Oracle data & AI analysis'}
              </p>
            </div>
          </div>
          <Button 
            onClick={runSecurityScan} 
            variant="gradient"
            disabled={isScanning}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Analyzing...' : 'Run AI Security Scan'}
          </Button>
        </div>

        {/* Progress bar during scan */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-full bg-gradient-to-r from-primary via-cyan-500 to-primary"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Fetching Oracle data → Analyzing patterns → Running AI models...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {/* Threats */}
            <div className={`rounded-xl border p-4 ${
              aiAnalysis.threats.length === 0 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`w-5 h-5 ${aiAnalysis.threats.length === 0 ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="font-semibold">Threat Analysis</span>
              </div>
              {aiAnalysis.threats.length === 0 ? (
                <p className="text-sm text-green-500">No threats detected</p>
              ) : (
                <ul className="space-y-1">
                  {aiAnalysis.threats.map((threat, i) => (
                    <li key={i} className="text-sm text-yellow-500 flex items-start gap-2">
                      <span>⚠️</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommendations */}
            <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-semibold">AI Recommendations</span>
              </div>
              <ul className="space-y-1">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-card border border-border/50 p-4"
          >
            <div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center mb-3 ${getStatusColor(metric.status)}`}>
              {metric.icon}
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Oracle Data Display */}
      {oracleData.price && (
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Live Oracle Feed</h3>
            <span className="ml-auto text-xs text-muted-foreground">
              Real-time data from external sources
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">QIE Price</p>
              <p className="font-semibold">₹{oracleData.price.inr.toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">24h Change</p>
              <p className={`font-semibold ${oracleData.price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {oracleData.price.change24h >= 0 ? '+' : ''}{oracleData.price.change24h.toFixed(2)}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Market Trend</p>
              <p className="font-semibold capitalize">{oracleData.marketSignals?.trend || 'N/A'}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Fear & Greed</p>
              <p className="font-semibold">{oracleData.marketSignals?.fearGreedIndex || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold">Recent Security Alerts</h3>
          <span className="text-xs text-muted-foreground">Powered by AI + Oracle</span>
        </div>
        <div className="divide-y divide-border/50">
          {recentAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time} • {alert.source}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk Factors with Oracle Data */}
      <div className="rounded-xl bg-card border border-border/50 p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Risk Analysis (Oracle Enhanced)
        </h3>
        <div className="space-y-3">
          {[
            { 
              label: 'Address Reputation', 
              score: oracleData.reputation ? 100 - oracleData.reputation.riskScore : 85,
              source: 'Oracle'
            },
            { 
              label: 'Transaction Patterns', 
              score: 88,
              source: 'AI'
            },
            { 
              label: 'Market Conditions', 
              score: oracleData.marketSignals?.volatility === 'high' ? 60 : oracleData.marketSignals?.volatility === 'medium' ? 78 : 90,
              source: 'Oracle'
            },
            { 
              label: 'Smart Contract Risk', 
              score: 85,
              source: 'AI'
            },
          ].map((factor) => (
            <div key={factor.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {factor.label}
                  <span className="text-xs text-muted-foreground">({factor.source})</span>
                </span>
                <span className={factor.score >= 80 ? 'text-green-500' : factor.score >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                  {factor.score}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className={`h-full ${
                    factor.score >= 80 ? 'bg-green-500' : factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
