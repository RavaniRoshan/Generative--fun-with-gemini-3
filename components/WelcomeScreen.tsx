import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Plane, Atom } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { icon: <Atom size={20} />, text: "Explain quantum computing", color: "bg-neo-yellow" },
  { icon: <Terminal size={20} />, text: "Write a tweet about space", color: "bg-neo-pink" },
  { icon: <Plane size={20} />, text: "Plan a trip to Japan", color: "bg-[#00FF94]" },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center z-10">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="bg-black text-white p-4 inline-block transform -rotate-2 shadow-neo-lg border-2 border-black">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-sans">
            Hello<span className="text-neo-pink">.</span>
          </h1>
        </div>
        <div className="mt-4 bg-white border-2 border-black p-2 inline-block transform rotate-1 shadow-neo-sm">
           <h2 className="text-xl md:text-2xl font-bold font-mono text-black">How can I help?</h2>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
        {suggestions.map((item, index) => (
          <motion.button
            key={item.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            onClick={() => onSuggestionClick(item.text)}
            className={`
              flex items-center gap-3 px-6 py-4 
              border-2 border-black 
              shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-opacity-80
              transition-all duration-200
              ${item.color} rounded-lg
              text-black font-bold text-sm md:text-base
            `}
          >
            <span className="bg-white border-2 border-black p-1 rounded-full">{item.icon}</span>
            {item.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
