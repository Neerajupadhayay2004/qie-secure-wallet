import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockWalletAddress, mockTokens } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export function ReceiveQR() {
  const [selectedToken, setSelectedToken] = useState(mockTokens[0]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const qrValue = `qie:${mockWalletAddress}?token=${selectedToken.symbol}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWalletAddress);
    setCopied(true);
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My QIE Wallet Address',
          text: `Send ${selectedToken.symbol} to: ${mockWalletAddress}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyAddress();
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        ctx?.fillStyle && (ctx.fillStyle = '#0f172a');
        ctx?.fillRect(0, 0, 300, 300);
        ctx?.drawImage(img, 25, 25, 250, 250);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qie-wallet-qr-${selectedToken.symbol}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been saved",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <h2 className="text-xl font-semibold mb-6 text-center">Receive Crypto</h2>

        {/* Token Selection */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block text-center">Select Token to Receive</label>
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
        </div>

        {/* QR Code */}
        <motion.div
          key={selectedToken.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG
              id="qr-code"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>
        </motion.div>

        {/* Address Display */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block text-center">Your {selectedToken.symbol} Address</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
            <code className="flex-1 text-sm font-mono text-center break-all">
              {mockWalletAddress}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={copyAddress} variant="outline" className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={shareAddress} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button onClick={downloadQR} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Save QR
          </Button>
        </div>

        {/* Warning */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Only send {selectedToken.name} ({selectedToken.symbol}) to this address.
          Sending other tokens may result in permanent loss.
        </p>
      </div>
    </motion.div>
  );
}
