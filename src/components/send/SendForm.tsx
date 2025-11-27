import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Users, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTokens, mockContacts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface SendFormProps {
  onScanQR: () => void;
}

export function SendForm({ onScanQR }: SendFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(mockTokens[0]);
  const [showContacts, setShowContacts] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const gasEstimate = 0.002;
  const gasFeeUSD = 0.15;

  const analyzeRisk = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 5;
      setRiskScore(score);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getRiskLevel = (score: number) => {
    if (score < 20) return { level: 'Low', color: 'text-success', bg: 'bg-success/20' };
    if (score < 50) return { level: 'Medium', color: 'text-warning', bg: 'bg-warning/20' };
    return { level: 'High', color: 'text-destructive', bg: 'bg-destructive/20' };
  };

  const handleSend = () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Submitted",
      description: `Sending ${amount} ${selectedToken.symbol} to ${recipient.slice(0, 10)}...`,
    });
  };

  const selectContact = (address: string) => {
    setRecipient(address);
    setShowContacts(false);
    analyzeRisk();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <h2 className="text-xl font-semibold mb-6">Send Crypto</h2>

        {/* Token Selection */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Select Token</label>
          <div className="grid grid-cols-4 gap-2">
            {mockTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => setSelectedToken(token)}
                className={`p-3 rounded-xl border transition-all ${
                  selectedToken.id === token.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                <div className="text-xl mb-1">{token.icon}</div>
                <div className="text-xs font-medium">{token.symbol}</div>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Balance: {selectedToken.balance.toLocaleString()} {selectedToken.symbol}
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
          <div className="relative">
            <Input
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (e.target.value.length > 10) analyzeRisk();
              }}
              placeholder="0x... or select from contacts"
              className="pr-24 font-mono text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowContacts(!showContacts)}
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onScanQR}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contacts Dropdown */}
          {showContacts && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-xl bg-secondary border border-border/50 overflow-hidden"
            >
              {mockContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => selectContact(contact.address)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {contact.avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {contact.address.slice(0, 10)}...{contact.address.slice(-6)}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pr-20 text-lg"
            />
            <button
              onClick={() => setAmount(selectedToken.balance.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:underline"
            >
              MAX
            </button>
          </div>
          {amount && (
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${(parseFloat(amount) * (selectedToken.usdValue / selectedToken.balance)).toFixed(2)} USD
            </p>
          )}
        </div>

        {/* AI Risk Score */}
        {(isAnalyzing || riskScore !== null) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 rounded-xl bg-secondary/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">AI Fraud Detection</span>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Analyzing transaction...
              </div>
            ) : riskScore !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevel(riskScore).bg} ${getRiskLevel(riskScore).color}`}>
                  {riskScore}/100 - {getRiskLevel(riskScore).level} Risk
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Gas Fee */}
        <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Estimated Gas Fee</span>
            <span className="text-sm font-medium">{gasEstimate} QIE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">≈ USD</span>
            <span className="text-sm text-muted-foreground">${gasFeeUSD}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSend}
          variant="gradient" 
          size="xl" 
          className="w-full"
          disabled={!recipient || !amount || (riskScore !== null && riskScore > 70)}
        >
          <Send className="w-5 h-5" />
          Send {selectedToken.symbol}
        </Button>

        {riskScore !== null && riskScore > 70 && (
          <p className="text-center text-sm text-destructive mt-3">
            Transaction blocked due to high risk score
          </p>
        )}
      </div>
    </motion.div>
  );
}
