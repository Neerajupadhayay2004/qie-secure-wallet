import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, Users, QrCode, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTokens, mockContacts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { checkFraud } from '@/services/aiService';
import { notifyTransaction, notifySecurityAlert } from '@/services/notificationService';
import { TransactionModal, TransactionStatus } from '@/components/modals/TransactionModal';

interface SendFormProps {
  onScanQR: () => void;
}

interface FraudResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendation: 'allow' | 'review' | 'block';
}

export function SendForm({ onScanQR }: SendFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(mockTokens[0]);
  const [showContacts, setShowContacts] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('pending');
  const [txHash, setTxHash] = useState('');
  const { toast } = useToast();

  const gasEstimate = 0.002;
  const gasFeeUSD = 0.15;

  const analyzeRisk = async () => {
    if (!recipient || recipient.length < 10) return;
    
    setIsAnalyzing(true);
    try {
      const result = await checkFraud({
        amount: amount || '0',
        token: selectedToken.symbol,
        recipient,
        senderBalance: selectedToken.balance.toString(),
        isNewAddress: !mockContacts.find(c => c.address === recipient),
        transactionCount: Math.floor(Math.random() * 50) + 5,
      });

      if (result) {
        setFraudResult(result);
        
        // Send Telegram alert for high-risk transactions
        if (result.risk_level === 'high' || result.risk_level === 'critical') {
          await notifySecurityAlert(
            'High Risk Transaction Detected',
            `A transaction of ${amount} ${selectedToken.symbol} to ${recipient.slice(0, 10)}... has been flagged.\n\nRisk Score: ${result.risk_score}/100\nWarnings: ${result.warnings?.join(', ') || 'None'}`
          );
        }
      }
    } catch (error) {
      console.error('Error analyzing risk:', error);
      // Fallback to mock score
      setFraudResult({
        risk_score: Math.floor(Math.random() * 40) + 5,
        risk_level: 'low',
        warnings: [],
        recommendation: 'allow'
      });
    }
    setIsAnalyzing(false);
  };

  const getRiskLevel = (result: FraudResult) => {
    const levelMap = {
      low: { level: 'Low', color: 'text-success', bg: 'bg-success/20' },
      medium: { level: 'Medium', color: 'text-warning', bg: 'bg-warning/20' },
      high: { level: 'High', color: 'text-destructive', bg: 'bg-destructive/20' },
      critical: { level: 'Critical', color: 'text-destructive', bg: 'bg-destructive/20' },
    };
    return levelMap[result.risk_level] || levelMap.low;
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    if (fraudResult && fraudResult.recommendation === 'block') {
      toast({
        title: "Transaction Blocked",
        description: "This transaction has been blocked due to high risk",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setShowTxModal(true);
    setTxStatus('pending');
    
    try {
      // Send transaction notification to Telegram
      await notifyTransaction(
        '💸 Transaction Sent',
        amount,
        selectedToken.symbol,
        recipient,
        `Transaction initiated from QIE Wallet`,
        'Pending'
      );

      // Simulate blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate transaction hash
      const generatedTxHash = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
      setTxHash(generatedTxHash);

      // Randomly succeed or fail (90% success rate for demo)
      if (Math.random() > 0.1) {
        setTxStatus('success');
        
        await notifyTransaction(
          '✅ Transaction Confirmed',
          amount,
          selectedToken.symbol,
          recipient,
          `Your transaction has been confirmed on the blockchain`,
          'Confirmed'
        );
        
        toast({
          title: "Transaction Confirmed",
          description: "Your transaction has been confirmed on the blockchain",
        });

        // Reset form after success
        setRecipient('');
        setAmount('');
        setFraudResult(null);
      } else {
        setTxStatus('failed');
        toast({
          title: "Transaction Failed",
          description: "Transaction could not be completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      setTxStatus('failed');
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSending(false);
  };

  const closeTxModal = () => {
    setShowTxModal(false);
  };

  const selectContact = (address: string) => {
    setRecipient(address);
    setShowContacts(false);
    setTimeout(analyzeRisk, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Send Crypto</h2>
          <div className="flex items-center gap-1 text-xs text-primary">
            <Bell className="w-3 h-3" />
            <span>Telegram alerts active</span>
          </div>
        </div>

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
                if (e.target.value.length > 10) {
                  setTimeout(analyzeRisk, 1000);
                }
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
        {(isAnalyzing || fraudResult !== null) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 rounded-xl bg-secondary/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">AI Fraud Detection (Gemini)</span>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Analyzing transaction with AI...
              </div>
            ) : fraudResult !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevel(fraudResult).bg} ${getRiskLevel(fraudResult).color}`}>
                    {fraudResult.risk_score}/100 - {getRiskLevel(fraudResult).level} Risk
                  </div>
                </div>
                {fraudResult.warnings && fraudResult.warnings.length > 0 && (
                  <div className="text-xs text-warning">
                    ⚠️ {fraudResult.warnings.join(' • ')}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Recommendation: <span className="font-medium capitalize">{fraudResult.recommendation}</span>
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
          disabled={!recipient || !amount || isSending || (fraudResult !== null && fraudResult.recommendation === 'block')}
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send {selectedToken.symbol}
            </>
          )}
        </Button>

        {fraudResult !== null && fraudResult.recommendation === 'block' && (
          <p className="text-center text-sm text-destructive mt-3">
            Transaction blocked due to high risk score
          </p>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={closeTxModal}
        status={txStatus}
        txHash={txHash}
        amount={amount}
        token={selectedToken.symbol}
        recipient={recipient.slice(0, 6) + '...' + recipient.slice(-4)}
        errorMessage="Network congestion. Please try again later."
      />
    </motion.div>
  );
}
