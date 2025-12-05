import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Image, Bot, MoreVertical, Check, CheckCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockContacts } from '@/data/mockData';
import { format } from 'date-fns';
import { chatWithAI, getPricePrediction } from '@/services/aiService';

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'other' | 'ai';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isAI?: boolean;
}

export function ChatInterface() {
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | 'ai'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '0', 
      content: "👋 Hi! I'm your QIE Wallet AI assistant powered by Gemini. I can help you with:\n\n• Understanding crypto transactions\n• Security tips and best practices\n• Token information (QIE, USDT, USDC, DAI)\n• Escrow and smart contracts\n• Market insights\n\nHow can I assist you today?", 
      sender: 'ai', 
      timestamp: new Date(Date.now() - 1000 * 60), 
      status: 'read',
      isAI: true 
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');

    // Update status
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'delivered' } : m));
    }, 500);

    // If AI assistant is selected, get AI response
    if (selectedContact === 'ai') {
      setIsAITyping(true);
      
      try {
        let response: string | null = null;
        
        // Check for price-related queries
        if (messageText.toLowerCase().includes('price') || messageText.toLowerCase().includes('market')) {
          const tokenMatch = messageText.match(/\b(QIE|USDT|USDC|DAI|BTC|ETH)\b/i);
          if (tokenMatch) {
            response = await getPricePrediction(tokenMatch[1].toUpperCase());
          }
        }
        
        // Default to chat
        if (!response) {
          response = await chatWithAI(messageText);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response || "I apologize, but I'm having trouble processing your request. Please try again.",
          sender: 'ai',
          timestamp: new Date(),
          status: 'read',
          isAI: true,
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('AI chat error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm experiencing technical difficulties. Please try again in a moment.",
          sender: 'ai',
          timestamp: new Date(),
          status: 'read',
          isAI: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
      setIsAITyping(false);
    } else {
      // Simulate peer response for demo
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'read' } : m));
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-primary" />;
      default: return null;
    }
  };

  const quickPrompts = [
    "What is QIE token?",
    "How do escrow payments work?",
    "Security tips for my wallet",
    "Explain gas fees",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-12rem)] rounded-xl bg-card border border-border/50 overflow-hidden flex"
    >
      {/* Contacts Sidebar */}
      <div className="w-72 border-r border-border/50 hidden md:flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* AI Assistant */}
          <button
            onClick={() => setSelectedContact('ai')}
            className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
              selectedContact === 'ai' ? 'bg-secondary/50' : ''
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-1">
                <p className="font-medium text-sm">AI Assistant</p>
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Powered by Gemini
              </p>
            </div>
          </button>
          
          {/* Contacts */}
          {mockContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                selectedContact !== 'ai' && selectedContact.id === contact.id ? 'bg-secondary/50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  {contact.avatar}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {contact.address.slice(0, 12)}...
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedContact === 'ai' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium">AI Assistant</p>
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-xs text-success">Always available</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  {selectedContact.avatar}
                </div>
                <div>
                  <p className="font-medium">{selectedContact.name}</p>
                  <p className="text-xs text-success">Online</p>
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : ''}`}>
                  <div className={`p-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : message.isAI 
                        ? 'bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-foreground rounded-bl-md'
                        : 'bg-secondary text-foreground rounded-bl-md'
                  }`}>
                    {message.isAI && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-primary">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Response</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${message.sender === 'me' ? 'justify-end' : ''}`}>
                    <span className="text-xs text-muted-foreground">
                      {format(message.timestamp, 'HH:mm')}
                    </span>
                    {message.sender === 'me' && getStatusIcon(message.status)}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isAITyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {selectedContact === 'ai' && messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(prompt)}
                  className="px-3 py-1.5 text-xs bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Image className="w-5 h-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isAITyping && sendMessage()}
              placeholder={selectedContact === 'ai' ? "Ask the AI assistant..." : "Type a message..."}
              className="flex-1"
              disabled={isAITyping}
            />
            <Button 
              onClick={sendMessage}
              variant="gradient" 
              size="icon" 
              className="shrink-0"
              disabled={!inputValue.trim() || isAITyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
