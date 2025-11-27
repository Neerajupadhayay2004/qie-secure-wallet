import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Repeat, Shield, Clock, CheckCircle, XCircle, Search, Filter, ExternalLink } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch = tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.token.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4" />;
      case 'swap': return <Repeat className="w-4 h-4" />;
      case 'escrow': return <Shield className="w-4 h-4" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'send': return 'bg-destructive/20 text-destructive';
      case 'receive': return 'bg-success/20 text-success';
      case 'swap': return 'bg-warning/20 text-warning';
      case 'escrow': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const truncateAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hash or token..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['send', 'receive', 'swap', 'escrow'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(filterType === type ? null : type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-secondary/30 text-sm font-medium text-muted-foreground">
          <span>Type</span>
          <span>Amount</span>
          <span>Address</span>
          <span>Status</span>
          <span>Date</span>
          <span>Risk</span>
        </div>

        <div className="divide-y divide-border/50">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <span className="font-medium capitalize">{tx.type}</span>
                  </div>
                  <span className={`font-medium ${tx.type === 'receive' ? 'text-success' : ''}`}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-mono">{truncateAddress(tx.type === 'receive' ? tx.from : tx.to)}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span>{format(tx.timestamp, 'MMM d, HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <span className="font-medium capitalize">{tx.type}</span>
                </div>
                <div>
                  <span className={`font-medium ${tx.type === 'receive' ? 'text-success' : ''}`}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                  </span>
                  <p className="text-sm text-muted-foreground">${tx.usdValue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{truncateAddress(tx.type === 'receive' ? tx.from : tx.to)}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tx.status)}
                  <span className="capitalize text-sm">{tx.status}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(tx.timestamp, 'MMM d, yyyy HH:mm')}
                </span>
                <div>
                  {tx.riskScore !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.riskScore < 20 ? 'bg-success/20 text-success' :
                      tx.riskScore < 50 ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {tx.riskScore}/100
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
