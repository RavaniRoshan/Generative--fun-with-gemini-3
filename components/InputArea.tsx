import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square, Radio, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

// Augment window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        // We only care about final results to avoid jitter in the textarea
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => {
            const needsSpace = prev.length > 0 && !prev.endsWith(' ');
            return prev + (needsSpace ? ' ' : '') + finalTranscript;
          });
          
          // Auto-resize textarea
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            // We set it after a brief delay to ensure value render
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
            }, 0);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError("Mic access denied. Check browser permissions.");
        } else if (event.error === 'no-speech') {
            // Ignore no-speech errors, just restart or let it end
            return;
        } else {
            setPermissionError("Voice input error. Try again.");
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    setPermissionError(null);
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        // If it fails to start (e.g. already started), just stop it to reset state
        recognitionRef.current.stop();
      }
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 md:p-6 bg-transparent pointer-events-none z-40">
      <div className="max-w-4xl mx-auto pointer-events-auto relative">
        {/* Listening Indicator Badge */}
        {isListening && (
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black font-mono text-xs py-1 px-3 rounded-full border-2 border-black shadow-neo-sm animate-bounce flex items-center gap-2">
              <Radio size={12} className="animate-pulse" />
              RECORDING...
           </div>
        )}

        {/* Permission Error Badge */}
        {permissionError && (
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neo-yellow text-black font-bold font-mono text-xs py-1 px-3 rounded-lg border-2 border-black shadow-neo-sm flex items-center gap-2 whitespace-nowrap">
              <AlertTriangle size={14} />
              {permissionError}
           </div>
        )}

        <div className={`
          bg-neo-white border-2 border-black shadow-neo rounded-2xl p-2 flex items-end gap-2 transition-all 
          focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 focus-within:ring-offset-neo-yellow
          ${isListening ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-red-200' : ''}
          ${permissionError ? 'ring-2 ring-neo-yellow ring-offset-2' : ''}
        `}>
          
          <button 
            onClick={toggleListening}
            className={`
              p-3 rounded-xl transition-all duration-200 hidden sm:flex items-center justify-center
              ${isListening 
                ? 'bg-red-500 text-white border-2 border-black animate-pulse shadow-none' 
                : 'text-black/40 hover:text-black hover:bg-black/5'
              }
              ${permissionError ? 'text-red-500' : ''}
            `}
            title={isListening ? "Stop Recording" : "Start Voice Input"}
          >
            {isListening ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Message Gemini..."}
            className="flex-1 max-h-[200px] py-3 px-2 bg-transparent border-none resize-none outline-none text-black font-medium placeholder:text-black/30 font-sans"
            style={{ minHeight: '48px' }}
          />
          
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!input.trim() || isLoading}
            className={`!p-3 !rounded-xl ${!input.trim() ? 'bg-gray-300 border-gray-400 text-gray-500 shadow-none' : ''}`}
          >
             <ArrowUp size={24} strokeWidth={3} />
          </Button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] font-mono text-black/50 font-bold uppercase tracking-widest">
                Gemini may display inaccurate info
            </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;