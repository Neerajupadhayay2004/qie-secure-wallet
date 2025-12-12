import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PortfolioCard } from '@/components/dashboard/PortfolioCard';
import { TokenList } from '@/components/dashboard/TokenList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { SendForm } from '@/components/send/SendForm';
import { ReceiveQR } from '@/components/receive/ReceiveQR';
import { TransactionHistory } from '@/components/history/TransactionHistory';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { EscrowList } from '@/components/escrow/EscrowList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { WalletView } from '@/components/wallet/WalletView';
import { MarketTicker } from '@/components/dashboard/MarketTicker';
import { LiveStats } from '@/components/dashboard/LiveStats';
import { FloatingParticles } from '@/components/dashboard/FloatingParticles';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { SwapPage } from '@/components/swap/SwapPage';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const { play } = useSoundEffects();

  const handleConnect = () => {
    setIsConnected(true);
    play('success');
  };

  const handleTabChange = (tab: string) => {
    play('click');
    setActiveTab(tab);
  };

  const handleQuickAction = (action: string) => {
    play('click');
    if (action === 'swap') {
      setActiveTab('swap');
    } else {
      setActiveTab(action);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-slide-up">
            <WelcomeBanner onGetStarted={() => handleTabChange('send')} />
            <MarketTicker />
            <LiveStats />
            <PortfolioCard />
            <QuickActions onAction={handleQuickAction} />
            <div className="grid lg:grid-cols-2 gap-6">
              <TokenList />
              <PortfolioChart />
            </div>
            <RecentTransactions />
          </div>
        );
      case 'wallet':
        return <WalletView onSend={() => handleTabChange('send')} onReceive={() => handleTabChange('receive')} />;
      case 'send':
        return <SendForm onScanQR={() => {}} />;
      case 'receive':
        return <ReceiveQR />;
      case 'swap':
        return <SwapPage />;
      case 'history':
        return <TransactionHistory />;
      case 'security':
        return <SecurityDashboard />;
      case 'escrow':
        return <EscrowList />;
      case 'chat':
        return <ChatInterface />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="lg:pl-64 relative z-10">
        <Header isConnected={isConnected} onConnect={handleConnect} />
        
        <main className="p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
