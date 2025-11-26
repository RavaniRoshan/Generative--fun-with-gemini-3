import React, { useState, useRef, useEffect } from 'react';
import { Plus, Menu, X } from 'lucide-react';
import { Chat } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

import WelcomeScreen from './components/WelcomeScreen';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import CanvasModal from './components/CanvasModal';
import { Message, ModelType } from './types';
import { createChatSession, sendMessageStream } from './services/geminiService';

const App: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    const chat = createChatSession(ModelType.FLASH);
    setChatSession(chat);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!chatSession) return;

    const userMsgId = uuidv4();
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    const aiMsgId = uuidv4();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage, aiPlaceholder]);
    setIsLoading(true);

    try {
      await sendMessageStream(chatSession, text, (chunk) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          )
        );
      });
      
      // Finalize the message (stop blinking cursor)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to generate response", error);
      setMessages(prev => [
        ...prev, 
        { 
          id: uuidv4(), 
          role: 'model', 
          text: "⚠️ Oops! Something went wrong. Please try again.", 
          timestamp: Date.now() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    const chat = createChatSession(ModelType.FLASH);
    setChatSession(chat);
    setIsSidebarOpen(false);
  };

  const handleUpdateMessage = (id: string, newText: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, text: newText } : msg
      )
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neo-bg relative selection:bg-neo-pink selection:text-white">
      
      <CanvasModal 
        isOpen={!!editingMessage}
        message={editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={handleUpdateMessage}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-neo-white border-r-4 border-black z-50 p-4 md:hidden shadow-neo"
            >
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black uppercase">Menu</h2>
                  <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
               </div>
               <button 
                  onClick={clearChat}
                  className="flex items-center gap-2 w-full p-3 border-2 border-black bg-neo-yellow shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
                >
                  <Plus size={20} /> New Chat
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto relative">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 border-b-2 border-black bg-neo-white/80 backdrop-blur-sm z-30 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors text-black md:hidden"
          >
            <Menu size={28} />
          </button>
          
          <div className="flex-1 text-center md:text-left md:pl-4">
            <span className="font-black text-2xl tracking-tighter italic">GEMINI_UI<span className="text-neo-blue">.v2</span></span>
          </div>

          <button 
            onClick={clearChat}
            className="hidden md:flex size-10 items-center justify-center bg-neo-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-full"
            title="New Chat"
          >
            <Plus size={24} />
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto relative p-4 pb-0 scroll-smooth">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto pt-4 pb-32">
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onEdit={(m) => setEditingMessage(m)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <InputArea onSend={handleSend} isLoading={isLoading} />
        
      </div>
    </div>
  );
};

export default App;