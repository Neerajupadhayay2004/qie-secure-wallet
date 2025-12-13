import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  togglePriceAlert,
  PriceAlert,
  requestNotificationPermission,
  getLastCheckedPrice,
} from '@/services/priceAlertService';

interface PriceAlertManagerProps {
  compact?: boolean;
}

const PriceAlertManager: React.FC<PriceAlertManagerProps> = ({ compact = false }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [currency, setCurrency] = useState<'usd' | 'inr'>('inr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAlerts(getPriceAlerts());
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
    
    // Refresh alerts periodically
    const interval = setInterval(() => {
      setAlerts(getPriceAlerts());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You'll receive alerts when prices hit your targets",
      });
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
    }
  };

  const handleCreateAlert = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid target price",
        variant: "destructive",
      });
      return;
    }

    const alert = createPriceAlert(price, condition, currency);
    setAlerts(getPriceAlerts());
    setTargetPrice('');
    setShowForm(false);
    
    toast({
      title: "Alert created",
      description: `You'll be notified when QIE goes ${condition} ${currency === 'usd' ? '$' : '₹'}${price}`,
    });
  };

  const handleDeleteAlert = (id: string) => {
    deletePriceAlert(id);
    setAlerts(getPriceAlerts());
    toast({
      title: "Alert deleted",
    });
  };

  const handleToggleAlert = (id: string) => {
    togglePriceAlert(id);
    setAlerts(getPriceAlerts());
  };

  const lastPrice = getLastCheckedPrice();

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="relative p-2 rounded-lg bg-card/50 border border-border/50 hover:bg-muted transition-colors"
      >
        <BellRing className="w-5 h-5 text-primary" />
        {alerts.filter(a => a.isActive).length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
            {alerts.filter(a => a.isActive).length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Price Alerts</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Alert
        </Button>
      </div>

      {/* Notification Permission */}
      {!notificationsEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500">Enable browser notifications</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
              Enable
            </Button>
          </div>
        </motion.div>
      )}

      {/* Create Alert Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-4 bg-muted/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Create Price Alert</span>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Condition Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCondition('above')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  condition === 'above'
                    ? 'bg-green-500/20 border border-green-500 text-green-500'
                    : 'bg-muted border border-transparent hover:border-border'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Above
              </button>
              <button
                onClick={() => setCondition('below')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  condition === 'below'
                    ? 'bg-red-500/20 border border-red-500 text-red-500'
                    : 'bg-muted border border-transparent hover:border-border'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Below
              </button>
            </div>

            {/* Price Input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder={currency === 'usd' ? '0.0000' : '0.00'}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setCurrency('inr')}
                  className={`px-3 py-2 text-sm ${currency === 'inr' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('usd')}
                  className={`px-3 py-2 text-sm ${currency === 'usd' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Current Price Reference */}
            {lastPrice && (
              <p className="text-xs text-muted-foreground">
                Current price: {currency === 'usd' ? `$${lastPrice.usd.toFixed(4)}` : `₹${lastPrice.inr.toFixed(2)}`}
              </p>
            )}

            <Button onClick={handleCreateAlert} className="w-full">
              Create Alert
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alerts */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No price alerts set. Create one to get notified!
          </p>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                alert.triggeredAt
                  ? 'bg-green-500/10 border-green-500/30'
                  : alert.isActive
                  ? 'bg-muted/50 border-border/50'
                  : 'bg-muted/20 border-border/20 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.condition === 'above' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {alert.condition === 'above' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {alert.condition === 'above' ? 'Above' : 'Below'}{' '}
                    {alert.currency === 'usd' ? '$' : '₹'}
                    {alert.targetPrice.toFixed(alert.currency === 'usd' ? 4 : 2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.triggeredAt
                      ? `Triggered ${new Date(alert.triggeredAt).toLocaleString()}`
                      : alert.isActive
                      ? 'Active'
                      : 'Paused'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!alert.triggeredAt && (
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      alert.isActive ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default PriceAlertManager;
