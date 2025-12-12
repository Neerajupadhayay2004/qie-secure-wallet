import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type TransactionStatus = 'pending' | 'success' | 'failed';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TransactionStatus;
  txHash?: string;
  amount?: string;
  token?: string;
  recipient?: string;
  errorMessage?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  status,
  txHash = '0x1234567890abcdef1234567890abcdef12345678',
  amount = '100',
  token = 'QIE',
  recipient = '0x9876...4321',
  errorMessage = 'Transaction failed. Please try again.',
}: TransactionModalProps) {
  const [copied, setCopied] = useState(false);

  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#00D4FF', '#7C3AED', '#10B981'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#00D4FF', '#7C3AED', '#10B981'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#00D4FF', '#7C3AED', '#10B981'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#00D4FF', '#7C3AED', '#10B981'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#00D4FF', '#7C3AED', '#10B981'],
    });
  }, []);

  useEffect(() => {
    if (isOpen && status === 'success') {
      const timer = setTimeout(fireConfetti, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status, fireConfetti]);

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Transaction Status</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <AnimatePresence mode="wait">
            {status === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mb-4"
                >
                  <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Processing Transaction</h3>
                <p className="text-muted-foreground text-center">
                  Please wait while we confirm your transaction...
                </p>
                <motion.div
                  className="mt-4 h-1 w-48 bg-muted rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-cyan-500"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-emerald-600/20 flex items-center justify-center mb-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="w-10 h-10 text-success" />
                  </motion.div>
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-2 text-success"
                >
                  Transaction Successful!
                </motion.h3>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-muted/50 rounded-xl p-4 w-full space-y-3 mt-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-semibold">{amount} {token}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">To</span>
                    <span className="font-mono text-sm">{recipient}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tx Hash</span>
                    <button
                      onClick={copyTxHash}
                      className="flex items-center gap-1 font-mono text-sm text-primary hover:underline"
                    >
                      {truncateHash(txHash)}
                      {copied ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 mt-6 w-full"
                >
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => window.open(`https://explorer.qie.network/tx/${txHash}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Explorer
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-cyan-500" onClick={onClose}>
                    Done
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <XCircle className="w-10 h-10 text-destructive" />
                  </motion.div>
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-2 text-destructive"
                >
                  Transaction Failed
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-center mb-6"
                >
                  {errorMessage}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 w-full"
                >
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-destructive to-red-600" onClick={onClose}>
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
