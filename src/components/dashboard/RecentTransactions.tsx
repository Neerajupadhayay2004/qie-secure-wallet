import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Repeat, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

export function RecentTransactions() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'swap':
        return <Repeat className="w-4 h-4" />;
      case 'escrow':
        return <Shield className="w-4 h-4" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'bg-destructive/20 text-destructive';
      case 'receive':
        return 'bg-success/20 text-success';
      case 'swap':
        return 'bg-warning/20 text-warning';
      case 'escrow':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold">Recent Transactions</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="divide-y divide-border/50">
        {mockTransactions.slice(0, 4).map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                {getTypeIcon(tx.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">{tx.type}</p>
                  {getStatusIcon(tx.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tx.type === 'receive' ? 'From: ' : 'To: '}
                  {truncateAddress(tx.type === 'receive' ? tx.from : tx.to)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-medium ${tx.type === 'receive' ? 'text-success' : ''}`}>
                {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
