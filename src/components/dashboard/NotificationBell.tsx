import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Transaction Complete',
    message: 'You received 500 QIE from 0x1234...5678',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Security Alert',
    message: 'New device login detected from India',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'info',
    title: 'Escrow Update',
    message: 'Your escrow payment is ready for release',
    time: '3 hours ago',
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="relative p-2 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full"
          >
            <motion.span
              className="absolute inset-0 bg-destructive rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-3 border-t border-border/50">
                <Button variant="ghost" className="w-full text-primary text-sm">
                  View All Notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
