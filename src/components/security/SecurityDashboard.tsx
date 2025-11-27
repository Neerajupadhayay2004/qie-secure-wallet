import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/data/mockData';

interface SecurityMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'danger';
  icon: React.ReactNode;
}

export function SecurityDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const metrics: SecurityMetric[] = [
    { label: 'Overall Security Score', value: '85/100', status: 'good', icon: <Shield className="w-5 h-5" /> },
    { label: 'Suspicious Transactions', value: 0, status: 'good', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Verified Contacts', value: '3/3', status: 'good', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'High Risk Blocked', value: 2, status: 'warning', icon: <XCircle className="w-5 h-5" /> },
  ];

  const recentAlerts = [
    { id: 1, type: 'info', message: 'New address detected in transaction', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'Large transaction amount detected', time: '2 hours ago' },
    { id: 3, type: 'success', message: 'All contacts verified successfully', time: '1 day ago' },
  ];

  const runSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScan(new Date());
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <Eye className="w-4 h-4 text-primary" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

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
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Fraud Detection</h2>
              <p className="text-sm text-muted-foreground">
                {lastScan 
                  ? `Last scan: ${lastScan.toLocaleTimeString()}`
                  : 'Run a security scan to check your wallet'}
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
            {isScanning ? 'Scanning...' : 'Run Security Scan'}
          </Button>
        </div>

        {/* Progress bar during scan */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="h-full bg-gradient-to-r from-primary to-cyan-500"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Analyzing transaction patterns...</p>
          </motion.div>
        )}
      </div>

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

      {/* Recent Alerts */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold">Recent Security Alerts</h3>
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
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className="rounded-xl bg-card border border-border/50 p-4">
        <h3 className="font-semibold mb-4">Risk Analysis Factors</h3>
        <div className="space-y-3">
          {[
            { label: 'Address Reputation', score: 92 },
            { label: 'Transaction Patterns', score: 88 },
            { label: 'Network Activity', score: 78 },
            { label: 'Smart Contract Interactions', score: 85 },
          ].map((factor) => (
            <div key={factor.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{factor.label}</span>
                <span className={factor.score >= 80 ? 'text-success' : factor.score >= 60 ? 'text-warning' : 'text-destructive'}>
                  {factor.score}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className={`h-full ${
                    factor.score >= 80 ? 'bg-success' : factor.score >= 60 ? 'bg-warning' : 'bg-destructive'
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
