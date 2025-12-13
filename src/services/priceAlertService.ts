import { supabase } from "@/integrations/supabase/client";
import { fetchQIEPrice, QIEPrice } from "./oracleService";

export interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currency: 'usd' | 'inr';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

// Store alerts in memory (in production, use database)
let alerts: PriceAlert[] = [];
let lastCheckedPrice: QIEPrice | null = null;
let checkInterval: NodeJS.Timeout | null = null;

export const createPriceAlert = (
  targetPrice: number,
  condition: 'above' | 'below',
  currency: 'usd' | 'inr' = 'inr'
): PriceAlert => {
  const alert: PriceAlert = {
    id: `alert_${Date.now()}`,
    targetPrice,
    condition,
    currency,
    isActive: true,
    createdAt: new Date(),
  };
  
  alerts.push(alert);
  
  // Start monitoring if not already
  if (!checkInterval) {
    startPriceMonitoring();
  }
  
  return alert;
};

export const getPriceAlerts = (): PriceAlert[] => {
  return [...alerts];
};

export const deletePriceAlert = (id: string): boolean => {
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts.splice(index, 1);
    return true;
  }
  return false;
};

export const togglePriceAlert = (id: string): PriceAlert | null => {
  const alert = alerts.find(a => a.id === id);
  if (alert) {
    alert.isActive = !alert.isActive;
    return alert;
  }
  return null;
};

const checkAlerts = async () => {
  const price = await fetchQIEPrice();
  if (!price) return;
  
  lastCheckedPrice = price;
  
  for (const alert of alerts) {
    if (!alert.isActive || alert.triggeredAt) continue;
    
    const currentPrice = alert.currency === 'usd' ? price.usd : price.inr;
    const shouldTrigger = 
      (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
      (alert.condition === 'below' && currentPrice <= alert.targetPrice);
    
    if (shouldTrigger) {
      alert.triggeredAt = new Date();
      alert.isActive = false;
      
      // Send notification
      await sendPriceAlertNotification(alert, currentPrice, alert.currency);
    }
  }
};

const sendPriceAlertNotification = async (
  alert: PriceAlert,
  currentPrice: number,
  currency: string
) => {
  const symbol = currency === 'usd' ? '$' : '₹';
  const message = `🔔 *Price Alert Triggered!*\n\nQIE is now ${alert.condition} ${symbol}${alert.targetPrice.toFixed(currency === 'usd' ? 4 : 2)}\n\nCurrent Price: ${symbol}${currentPrice.toFixed(currency === 'usd' ? 4 : 2)}`;
  
  try {
    await supabase.functions.invoke('send-telegram', {
      body: {
        message,
        parse_mode: 'Markdown',
      },
    });
  } catch (error) {
    console.error('Failed to send price alert notification:', error);
  }
  
  // Also show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('QIE Price Alert', {
      body: `QIE is now ${alert.condition} ${symbol}${alert.targetPrice}. Current: ${symbol}${currentPrice.toFixed(2)}`,
      icon: '/favicon.ico',
    });
  }
};

export const startPriceMonitoring = () => {
  if (checkInterval) return;
  
  // Check immediately
  checkAlerts();
  
  // Then check every 30 seconds
  checkInterval = setInterval(checkAlerts, 30000);
};

export const stopPriceMonitoring = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

export const getLastCheckedPrice = (): QIEPrice | null => lastCheckedPrice;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};
