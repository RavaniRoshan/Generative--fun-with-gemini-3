import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Eye, FileText, Pencil, 
  Bold, Italic, List, Heading, Code, Link as LinkIcon, Image as ImageIcon, Upload, 
  Type
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from './Button';
import { Message } from '../types';

interface CanvasModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
  onSave: (id: string, newText: string) => void;
}

const CanvasModal: React.FC<CanvasModalProps> = ({ isOpen, message, onClose, onSave }) => {
  const [text, setText] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message) setText(message.text);
  }, [message]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const newText = previousText.substring(0, start) + before + selectedText + after + previousText.substring(end);
    setText(newText);
    
    // Defer cursor update to next tick to ensure state update has rendered
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleFormat = (type: string) => {
    switch (type) {
      case 'bold': insertText('**', '**'); break;
      case 'italic': insertText('*', '*'); break;
      case 'list': insertText('- '); break;
      case 'heading': insertText('### '); break;
      case 'code': insertText('`', '`'); break;
      case 'block-code': insertText('```\n', '\n```'); break;
      case 'link': insertText('[', '](url)'); break;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        insertText(`\n![${file.name}](${base64})\n`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        insertText(content);
      };
      reader.readAsText(file);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, rotate: -1, opacity: 0, y: 20 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, rotate: 1, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-6xl h-[90vh] bg-neo-bg border-4 border-black shadow-neo-lg flex flex-col relative overflow-hidden rounded-xl"
          >
            {/* Header */}
            <div className="bg-neo-blue text-white p-3 md:p-4 border-b-4 border-black flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-black p-2 rounded-lg shadow-[2px_2px_0px_0px_white] hidden sm:block">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-black text-xl md:text-3xl tracking-tighter leading-none italic">CANVAS_STUDIO</h2>
                    <p className="font-mono text-[10px] md:text-xs font-bold opacity-80 tracking-widest mt-1">ADVANCED MARKDOWN EDITOR</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="hover:rotate-90 transition-transform bg-white text-black border-2 border-black p-1.5 shadow-neo-sm hover:shadow-none translate-x-[2px] translate-y-[2px] rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-neo-white border-b-4 border-black p-2 flex flex-col md:flex-row gap-2 justify-between items-center shrink-0 overflow-x-auto">
               <div className="flex gap-1 md:gap-2 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <div className="flex items-center gap-1 pr-2 border-r-2 border-black/10 mr-2">
                    <ToolbarBtn onClick={() => handleFormat('bold')} icon={<Bold size={16} />} tooltip="Bold" />
                    <ToolbarBtn onClick={() => handleFormat('italic')} icon={<Italic size={16} />} tooltip="Italic" />
                    <ToolbarBtn onClick={() => handleFormat('heading')} icon={<Heading size={16} />} tooltip="Heading" />
                  </div>
                  
                  <div className="flex items-center gap-1 pr-2 border-r-2 border-black/10 mr-2">
                    <ToolbarBtn onClick={() => handleFormat('list')} icon={<List size={16} />} tooltip="List" />
                    <ToolbarBtn onClick={() => handleFormat('code')} icon={<Code size={16} />} tooltip="Inline Code" />
                    <ToolbarBtn onClick={() => handleFormat('block-code')} icon={<Type size={16} />} tooltip="Code Block" />
                  </div>

                  <div className="flex items-center gap-1">
                    <ToolbarBtn onClick={() => handleFormat('link')} icon={<LinkIcon size={16} />} tooltip="Link" />
                    <ToolbarBtn onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />} tooltip="Upload File/Image" />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="image/*,.txt,.md"
                    />
                  </div>
               </div>

               <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`
                    w-full md:w-auto
                    flex items-center justify-center gap-2 px-4 py-2 font-black text-sm uppercase border-2 border-black rounded-lg
                    transition-all shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]
                    ${isPreview ? 'bg-neo-yellow text-black' : 'bg-black text-white'}
                  `}
               >
                  {isPreview ? <Pencil size={16} /> : <Eye size={16} />}
                  {isPreview ? 'Back to Edit' : 'View Preview'}
               </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative bg-[#fffff0] overflow-hidden">
              {/* Dot Grid Background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                   style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
              />

              {isPreview ? (
                 <div className="absolute inset-0 p-8 overflow-y-auto prose prose-lg max-w-none prose-headings:font-black prose-p:font-medium prose-img:rounded-xl prose-img:border-2 prose-img:border-black prose-img:shadow-neo">
                    <ReactMarkdown>{text}</ReactMarkdown>
                 </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-full p-6 md:p-8 resize-none outline-none font-mono text-sm md:text-base bg-transparent text-black leading-relaxed relative z-10"
                  placeholder="Start creating..."
                  spellCheck={false}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 bg-neo-white border-t-4 border-black flex flex-col md:flex-row justify-between items-center shrink-0 gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-black/50">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  READY TO EDIT
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="secondary" onClick={onClose} className="text-sm flex-1 md:flex-none justify-center">CANCEL</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onSave(message.id, text);
                    onClose();
                  }}
                  className="bg-neo-green hover:bg-[#00cc76] text-black text-sm flex-1 md:flex-none justify-center"
                >
                  <Save size={18} className="mr-2 inline" /> SAVE CHANGES
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ToolbarBtn: React.FC<{ onClick: () => void; icon: React.ReactNode; tooltip: string }> = ({ onClick, icon, tooltip }) => (
  <button
    onClick={onClick}
    className="p-2 hover:bg-black hover:text-white border border-transparent hover:border-black rounded transition-colors"
    title={tooltip}
  >
    {icon}
  </button>
);

export default CanvasModal;