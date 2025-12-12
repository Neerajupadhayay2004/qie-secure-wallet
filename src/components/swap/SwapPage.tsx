import { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, ArrowDownUp, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTokens } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { TransactionModal, TransactionStatus } from '@/components/modals/TransactionModal';

export function SwapPage() {
  const [fromToken, setFromToken] = useState(mockTokens[0]);
  const [toToken, setToToken] = useState(mockTokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('pending');
  
  const { toast } = useToast();
  const { play } = useSoundEffects();

  // Mock exchange rate
  const exchangeRate = 2.45;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * exchangeRate).toFixed(4) : '';
  const priceImpact = 0.12;
  const minReceived = toAmount ? (parseFloat(toAmount) * 0.995).toFixed(4) : '';

  const handleSwapTokens = () => {
    play('click');
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      });
      return;
    }

    play('send');
    setIsSwapping(true);
    setShowTxModal(true);
    setTxStatus('pending');

    // Simulate swap
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (Math.random() > 0.1) {
      setTxStatus('success');
      play('success');
      toast({
        title: "Swap Successful!",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      setFromAmount('');
    } else {
      setTxStatus('failed');
      play('error');
    }

    setIsSwapping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Swap Tokens</h2>
          <div className="flex items-center gap-1 text-xs text-primary">
            <Zap className="w-3 h-3" />
            <span>Best Rate</span>
          </div>
        </div>

        {/* From Token */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: {fromToken.balance.toLocaleString()} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/50">
              <span className="text-xl">{fromToken.icon}</span>
              <span className="font-semibold">{fromToken.symbol}</span>
            </div>
          </div>
          <button
            onClick={() => setFromAmount(fromToken.balance.toString())}
            className="text-xs text-primary mt-2 hover:underline"
          >
            Use Max
          </button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapTokens}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <ArrowDownUp className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>

        {/* To Token */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">To</span>
            <span className="text-sm text-muted-foreground">
              Balance: {toToken.balance.toLocaleString()} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold flex-1">
              {toAmount || '0.00'}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/50">
              <span className="text-xl">{toToken.icon}</span>
              <span className="font-semibold">{toToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {fromAmount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Rate
              </span>
              <span>1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price Impact</span>
              <span className="text-success">{priceImpact}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minimum Received</span>
              <span>{minReceived} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~$0.15</span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          variant="gradient"
          size="xl"
          className="w-full mt-6"
          disabled={!fromAmount || isSwapping}
        >
          {isSwapping ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Swapping...
            </>
          ) : (
            <>
              <Repeat className="w-5 h-5" />
              Swap
            </>
          )}
        </Button>
      </div>

      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        status={txStatus}
        amount={`${fromAmount} → ${toAmount}`}
        token={`${fromToken.symbol}/${toToken.symbol}`}
        recipient="Swap"
      />
    </motion.div>
  );
}
