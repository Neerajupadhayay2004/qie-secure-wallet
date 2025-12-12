import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Sun,
  Volume2, 
  VolumeX,
  Globe,
  Key,
  Smartphone,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useToast } from '@/hooks/use-toast';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY'];
const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'];

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  
  const { play } = useSoundEffects();
  const { toast } = useToast();

  const handleToggle = (setter: (value: boolean) => void, value: boolean, label: string) => {
    setter(!value);
    if (soundEnabled) play('click');
    toast({
      title: `${label} ${!value ? 'enabled' : 'disabled'}`,
      description: `Your preference has been saved`,
    });
  };

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    description, 
    children,
    onClick
  }: { 
    icon: any; 
    label: string; 
    description?: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 ${onClick ? 'cursor-pointer hover:border-primary/30' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Preferences</h2>
        
        <SettingItem 
          icon={Bell} 
          label="Push Notifications" 
          description="Receive transaction alerts"
        >
          <Switch 
            checked={notifications} 
            onCheckedChange={() => handleToggle(setNotifications, notifications, 'Notifications')}
          />
        </SettingItem>

        <SettingItem 
          icon={soundEnabled ? Volume2 : VolumeX} 
          label="Sound Effects" 
          description="Play sounds for actions"
        >
          <Switch 
            checked={soundEnabled} 
            onCheckedChange={() => handleToggle(setSoundEnabled, soundEnabled, 'Sound effects')}
          />
        </SettingItem>

        <SettingItem 
          icon={darkMode ? Moon : Sun} 
          label="Dark Mode" 
          description="Toggle dark theme"
        >
          <Switch 
            checked={darkMode} 
            onCheckedChange={() => handleToggle(setDarkMode, darkMode, 'Dark mode')}
          />
        </SettingItem>
      </div>

      {/* Security Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Security</h2>
        
        <SettingItem 
          icon={Smartphone} 
          label="Biometric Authentication" 
          description="Use fingerprint or Face ID"
        >
          <Switch 
            checked={biometrics} 
            onCheckedChange={() => handleToggle(setBiometrics, biometrics, 'Biometrics')}
          />
        </SettingItem>

        <SettingItem 
          icon={Key} 
          label="Change PIN" 
          description="Update your security PIN"
          onClick={() => {
            if (soundEnabled) play('click');
            toast({ title: "PIN Change", description: "PIN change feature coming soon" });
          }}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>

        <SettingItem 
          icon={Shield} 
          label="Two-Factor Auth" 
          description="Add extra security layer"
          onClick={() => {
            if (soundEnabled) play('click');
            toast({ title: "2FA Setup", description: "2FA setup coming soon" });
          }}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </SettingItem>
      </div>

      {/* Regional Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Regional</h2>
        
        <div className="relative">
          <SettingItem 
            icon={Globe} 
            label="Currency" 
            description={selectedCurrency}
            onClick={() => {
              setShowCurrencySelect(!showCurrencySelect);
              setShowLanguageSelect(false);
              if (soundEnabled) play('click');
            }}
          >
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showCurrencySelect ? 'rotate-90' : ''}`} />
          </SettingItem>
          
          {showCurrencySelect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 rounded-xl bg-card border border-border/50 grid grid-cols-3 gap-2"
            >
              {currencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => {
                    setSelectedCurrency(currency);
                    setShowCurrencySelect(false);
                    if (soundEnabled) play('success');
                    toast({ title: "Currency Updated", description: `Currency set to ${currency}` });
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedCurrency === currency 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {selectedCurrency === currency && <Check className="w-4 h-4" />}
                  {currency}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="relative">
          <SettingItem 
            icon={Globe} 
            label="Language" 
            description={selectedLanguage}
            onClick={() => {
              setShowLanguageSelect(!showLanguageSelect);
              setShowCurrencySelect(false);
              if (soundEnabled) play('click');
            }}
          >
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showLanguageSelect ? 'rotate-90' : ''}`} />
          </SettingItem>
          
          {showLanguageSelect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 rounded-xl bg-card border border-border/50 grid grid-cols-2 gap-2"
            >
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setShowLanguageSelect(false);
                    if (soundEnabled) play('success');
                    toast({ title: "Language Updated", description: `Language set to ${lang}` });
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedLanguage === lang 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {selectedLanguage === lang && <Check className="w-4 h-4" />}
                  {lang}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={() => {
          if (soundEnabled) play('warning');
          toast({ title: "Logged Out", description: "You have been logged out successfully" });
        }}
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        QIE Wallet v1.0.0 • Built with ❤️
      </p>
    </motion.div>
  );
}
