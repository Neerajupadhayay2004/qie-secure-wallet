import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Image, Smile, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockContacts } from '@/data/mockData';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export function ChatInterface() {
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Hey! I just sent you the payment for the logo design.', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'read' },
    { id: '2', content: 'Thanks! I received it. Working on the final revisions now.', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 25), status: 'read' },
    { id: '3', content: 'Great! Can you also add a dark mode version?', sender: 'other', timestamp: new Date(Date.now() - 1000 * 60 * 20), status: 'read' },
    { id: '4', content: 'Sure, I will include that in the final delivery. Should be ready by tomorrow.', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 15), status: 'delivered' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate status updates
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-primary" />;
      default: return null;
    }
  };

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
          {mockContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                selectedContact.id === contact.id ? 'bg-secondary/50' : ''
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
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
              {selectedContact.avatar}
            </div>
            <div>
              <p className="font-medium">{selectedContact.name}</p>
              <p className="text-xs text-success">Online</p>
            </div>
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
                      : 'bg-secondary text-foreground rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.content}</p>
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
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

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
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button variant="ghost" size="icon" className="shrink-0">
              <Smile className="w-5 h-5" />
            </Button>
            <Button 
              onClick={sendMessage}
              variant="gradient" 
              size="icon" 
              className="shrink-0"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
