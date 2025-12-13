import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Clock, Activity, Building2, FileCode } from 'lucide-react';
import { fetchAddressReputation, AddressReputation } from '@/services/oracleService';

interface AddressReputationBadgeProps {
  address: string;
  showDetails?: boolean;
  onReputationFetched?: (reputation: AddressReputation) => void;
}

const AddressReputationBadge: React.FC<AddressReputationBadgeProps> = ({
  address,
  showDetails = false,
  onReputationFetched,
}) => {
  const [reputation, setReputation] = useState<AddressReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(showDetails);

  useEffect(() => {
    const fetchReputation = async () => {
      if (!address || address.length < 10) return;
      
      setLoading(true);
      try {
        const data = await fetchAddressReputation(address);
        if (data) {
          setReputation(data);
          onReputationFetched?.(data);
        }
      } catch (error) {
        console.error('Error fetching reputation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [address, onReputationFetched]);

  if (!address || address.length < 10) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Checking address...</span>
      </div>
    );
  }

  if (!reputation) return null;

  const getRiskConfig = () => {
    switch (reputation.riskLevel) {
      case 'low':
        return {
          icon: ShieldCheck,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          label: 'Low Risk',
        };
      case 'medium':
        return {
          icon: Shield,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          label: 'Medium Risk',
        };
      case 'high':
        return {
          icon: ShieldAlert,
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          label: 'High Risk',
        };
      case 'critical':
        return {
          icon: ShieldX,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          label: 'Critical Risk',
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Compact Badge */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.border} border transition-all w-full`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div className="flex-1 text-left">
          <span className={`font-medium ${config.color}`}>{config.label}</span>
          <span className="text-muted-foreground ml-2 text-sm">
            Score: {reputation.riskScore}/100
          </span>
        </div>
        
        {/* Labels */}
        <div className="flex gap-1">
          {reputation.isExchange && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              Exchange
            </span>
          )}
          {reputation.isContract && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              Contract
            </span>
          )}
        </div>
        
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-muted-foreground"
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`${config.bg} ${config.border} border rounded-lg p-4 space-y-4`}>
              {/* Risk Score Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={config.color}>{reputation.riskScore}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reputation.riskScore}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full ${
                      reputation.riskScore < 25 ? 'bg-green-500' :
                      reputation.riskScore < 50 ? 'bg-yellow-500' :
                      reputation.riskScore < 75 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Flags */}
              {reputation.flags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Warnings
                  </span>
                  <div className="space-y-1">
                    {reputation.flags.map((flag, index) => (
                      <div key={index} className="text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs">Transactions</span>
                  </div>
                  <span className="font-semibold text-foreground">{reputation.transactionCount}</span>
                </div>
                
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">First Seen</span>
                  </div>
                  <span className="font-semibold text-foreground text-sm">{formatDate(reputation.firstSeen)}</span>
                </div>
                
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Last Active</span>
                  </div>
                  <span className="font-semibold text-foreground text-sm">{formatDate(reputation.lastActive)}</span>
                </div>
                
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {reputation.isContract ? <FileCode className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    <span className="text-xs">Type</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {reputation.isContract ? 'Contract' : reputation.isExchange ? 'Exchange' : 'Wallet'}
                  </span>
                </div>
              </div>

              {/* Labels */}
              {reputation.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reputation.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddressReputationBadge;
