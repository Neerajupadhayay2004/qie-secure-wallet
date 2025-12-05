import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockTokens, mockWalletAddress } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface WalletViewProps {
  onSend: () => void;
  onReceive: () => void;
}

export function WalletView({ onSend, onReceive }: WalletViewProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const totalValue = mockTokens.reduce((sum, token) => sum + token.usdValue, 0);

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWalletAddress);
    setCopied(true);
    toast({ title: "Address copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-card to-cyan-500/20 border border-primary/30 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Main Wallet</p>
                <button 
                  onClick={copyAddress}
                  className="flex items-center gap-2 text-sm font-mono hover:text-primary transition-colors"
                >
                  {mockWalletAddress.slice(0, 8)}...{mockWalletAddress.slice(-6)}
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <button onClick={() => setIsVisible(!isVisible)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <motion.h2 
              key={isVisible ? 'visible' : 'hidden'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl md:text-5xl font-bold"
            >
              {isVisible ? formatCurrency(totalValue) : '••••••••'}
            </motion.h2>
          </div>

          <div className="flex gap-3">
            <Button onClick={onSend} variant="gradient" className="flex-1 gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Send
            </Button>
            <Button onClick={onReceive} variant="outline" className="flex-1 gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              Receive
            </Button>
            <Button variant="outline" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tokens List */}
      <div className="rounded-xl bg-card border border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold">Assets</h3>
          <Button variant="ghost" size="sm">Manage</Button>
        </div>

        <div className="divide-y divide-border/50">
          {mockTokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${token.color}20` }}
                >
                  {token.icon}
                </div>
                <div>
                  <p className="font-semibold">{token.name}</p>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {isVisible ? token.balance.toLocaleString() : '••••'} {token.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isVisible ? formatCurrency(token.usdValue) : '••••'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
