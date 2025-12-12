import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  onGetStarted: () => void;
}

export function WelcomeBanner({ onGetStarted }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-purple-500/20 border border-border/50 p-6 lg:p-8"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/30 blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 justify-center lg:justify-start mb-3"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">DeFi Without Borders</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl lg:text-4xl font-bold mb-3"
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
              Welcome to Your
            </span>
            <br />
            <span className="text-foreground">Secure Wallet</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-md mx-auto lg:mx-0 mb-4"
          >
            Fast, secure & borderless transactions. Manage your crypto assets with confidence.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
          >
            <Button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white px-6"
            >
              Get Started
              <motion.span
                className="ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-success" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-warning" />
                <span>Fast</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="relative w-48 h-48 lg:w-64 lg:h-64"
        >
          {/* Rotating rings */}
          <motion.div
            className="absolute inset-0 border-2 border-primary/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 border-2 border-cyan-500/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-8 border-2 border-purple-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Center logo */}
          <motion.div
            className="absolute inset-12 flex items-center justify-center bg-gradient-to-br from-primary to-cyan-500 rounded-full shadow-lg shadow-primary/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl font-bold text-white">QIE</span>
          </motion.div>
          
          {/* Floating dots */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{
                left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 90}px)`,
                top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 90}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
