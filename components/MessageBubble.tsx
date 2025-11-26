import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Copy, Check, Pencil, Maximize2 } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (message: Message) => void;
}

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
       <span className="text-xs font-black font-mono tracking-[0.2em] animate-pulse">COOKING</span>
       <div className="flex gap-2">
        <motion.div
          className="w-3 h-3 bg-neo-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="w-3 h-3 bg-neo-pink border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full"
          animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.div
          className="w-3 h-3 bg-neo-blue border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onEdit }) => {
  const isUser = message.role === 'user';
  const showTypingIndicator = !isUser && message.text.length === 0 && message.isStreaming;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3, rotate: isUser ? 5 : -5 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, mass: 0.8 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group`}
    >
      <div
        className={`
          max-w-[90%] md:max-w-[75%] 
          p-4 md:p-6 
          border-2 border-black 
          shadow-neo
          text-sm md:text-base
          break-words
          relative
          transition-all duration-200
          ${isUser 
            ? 'bg-neo-blue text-white rounded-l-2xl rounded-tr-2xl rounded-br-sm' 
            : 'bg-neo-white text-black rounded-r-2xl rounded-tl-2xl rounded-bl-sm'}
        `}
      >
        {/* Decorative corner accent */}
        <div className={`absolute w-3 h-3 border-2 border-black bg-neo-yellow top-[-6px] ${isUser ? 'left-[-6px]' : 'right-[-6px]'} shadow-sm`} />

        <div className={`prose ${isUser ? 'prose-invert' : ''} prose-p:my-1 prose-pre:bg-black/10 max-w-none font-sans font-medium`}>
          {showTypingIndicator ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown>
              {message.text + (message.isStreaming ? ' ▉' : '')}
            </ReactMarkdown>
          )}
        </div>
        
        {!showTypingIndicator && (
          <div className="flex items-end justify-between mt-4 border-t-2 border-black/10 pt-2 gap-4">
             <div className={`text-[10px] font-mono opacity-60 font-bold ${isUser ? 'text-white' : 'text-black'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            {!isUser && !message.isStreaming && (
              <div className="flex gap-2">
                 {onEdit && (
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(message)}
                      className="p-1.5 bg-neo-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all rounded-md flex items-center gap-1.5"
                      title="Canvas Mode"
                    >
                      <Maximize2 size={14} className="text-black" />
                      <span className="text-[10px] font-bold text-black font-mono hidden sm:inline">CANVAS</span>
                    </motion.button>
                 )}
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className={`
                    p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all rounded-md flex items-center gap-1.5
                    ${copied ? 'bg-neo-green' : 'bg-white'}
                  `}
                  title="Copy to Clipboard"
                >
                  {copied ? <Check size={14} className="text-black" /> : <Copy size={14} className="text-black" />}
                  <span className="text-[10px] font-bold text-black font-mono hidden sm:inline">
                    {copied ? 'COPIED' : 'COPY'}
                  </span>
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;