import { supabase } from "@/integrations/supabase/client";

interface TransactionNotification {
  type: 'transaction';
  title: string;
  message: string;
  amount: string;
  token: string;
  recipient: string;
  status?: string;
}

interface SecurityNotification {
  type: 'security';
  title: string;
  message: string;
}

interface EscrowNotification {
  type: 'escrow';
  title: string;
  message: string;
  amount: string;
  token: string;
  status: string;
}

interface GeneralNotification {
  type: 'general';
  title: string;
  message: string;
}

type NotificationPayload = TransactionNotification | SecurityNotification | EscrowNotification | GeneralNotification;

export const sendTelegramNotification = async (payload: NotificationPayload): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-telegram', {
      body: payload,
    });

    if (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }

    console.log('Telegram notification sent:', data);
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
};

// Convenience functions
export const notifyTransaction = async (
  title: string,
  amount: string,
  token: string,
  recipient: string,
  message: string = '',
  status: string = 'Completed'
) => {
  return sendTelegramNotification({
    type: 'transaction',
    title,
    message,
    amount,
    token,
    recipient,
    status,
  });
};

export const notifySecurityAlert = async (title: string, message: string) => {
  return sendTelegramNotification({
    type: 'security',
    title,
    message,
  });
};

export const notifyEscrowUpdate = async (
  title: string,
  amount: string,
  token: string,
  status: string,
  message: string = ''
) => {
  return sendTelegramNotification({
    type: 'escrow',
    title,
    message,
    amount,
    token,
    status,
  });
};

export const notifyGeneral = async (title: string, message: string) => {
  return sendTelegramNotification({
    type: 'general',
    title,
    message,
  });
};
