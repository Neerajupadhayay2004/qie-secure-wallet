import { motion } from 'framer-motion';
import { Link2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { mockWalletAddress } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
}

export function Header({ isConnected, onConnect }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWalletAddress);
    setCopied(true);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
        
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <motion.span 
              className="w-2 h-2 rounded-full bg-success"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            QIE Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          {isConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-mono">{truncateAddress(mockWalletAddress)}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </motion.div>
          ) : (
            <Button onClick={onConnect} variant="gradient" className="gap-2">
              <Link2 className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
