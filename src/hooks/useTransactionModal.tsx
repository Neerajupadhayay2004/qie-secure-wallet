import { useState, useCallback } from 'react';
import { TransactionStatus } from '@/components/modals/TransactionModal';

interface TransactionDetails {
  txHash?: string;
  amount?: string;
  token?: string;
  recipient?: string;
  errorMessage?: string;
}

export function useTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [details, setDetails] = useState<TransactionDetails>({});

  const showPending = useCallback((transactionDetails?: TransactionDetails) => {
    setDetails(transactionDetails || {});
    setStatus('pending');
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((transactionDetails?: TransactionDetails) => {
    setDetails((prev) => ({ ...prev, ...transactionDetails }));
    setStatus('success');
  }, []);

  const showFailed = useCallback((errorMessage?: string) => {
    setDetails((prev) => ({ ...prev, errorMessage }));
    setStatus('failed');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Simulate a transaction flow
  const simulateTransaction = useCallback(async (transactionDetails: TransactionDetails) => {
    showPending(transactionDetails);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Randomly succeed or fail (80% success rate)
    if (Math.random() > 0.2) {
      showSuccess({
        ...transactionDetails,
        txHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      });
    } else {
      showFailed('Network congestion. Please try again later.');
    }
  }, [showPending, showSuccess, showFailed]);

  return {
    isOpen,
    status,
    details,
    showPending,
    showSuccess,
    showFailed,
    close,
    simulateTransaction,
  };
}
