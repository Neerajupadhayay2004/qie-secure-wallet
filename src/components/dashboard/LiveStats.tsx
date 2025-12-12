import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Activity, Users, Zap, Globe } from 'lucide-react';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ from, to, duration = 2, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const [displayValue, setDisplayValue] = useState(from.toLocaleString());

  useEffect(() => {
    const controls = animate(count, to, { duration });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to, count, rounded, duration]);

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

const stats = [
  {
    label: 'Total Volume',
    value: 2456789,
    prefix: '$',
    suffix: '',
    icon: Activity,
    color: 'from-primary to-cyan-500',
    bgColor: 'bg-primary/10',
  },
  {
    label: 'Active Users',
    value: 12847,
    prefix: '',
    suffix: '+',
    icon: Users,
    color: 'from-success to-emerald-600',
    bgColor: 'bg-success/10',
  },
  {
    label: 'Transactions/sec',
    value: 1250,
    prefix: '',
    suffix: '',
    icon: Zap,
    color: 'from-warning to-orange-500',
    bgColor: 'bg-warning/10',
  },
  {
    label: 'Countries',
    value: 156,
    prefix: '',
    suffix: '+',
    icon: Globe,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
  },
];

export function LiveStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden rounded-xl bg-card border border-border/50 p-4"
        >
          {/* Animated background glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
            className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} blur-2xl`}
          />
          
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ stroke: 'url(#gradient)' }} />
            </div>
            <p className="text-2xl font-bold mb-1">
              <AnimatedCounter from={0} to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
