import { motion } from 'framer-motion';
import { Send, ArrowDownLeft, Repeat, Shield } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const actions = [
  { id: 'send', label: 'Send', icon: Send, color: 'from-primary to-cyan-500' },
  { id: 'receive', label: 'Receive', icon: ArrowDownLeft, color: 'from-success to-emerald-600' },
  { id: 'swap', label: 'Swap', icon: Repeat, color: 'from-warning to-orange-500' },
  { id: 'security', label: 'Security', icon: Shield, color: 'from-blue-500 to-indigo-600' },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-3"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          onClick={() => onAction(action.id)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-200"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
