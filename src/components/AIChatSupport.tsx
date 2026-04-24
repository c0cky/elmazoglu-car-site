import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse, AUTOVIBE_PROMPT } from '../services/geminiService';

export default function AIChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([
    { role: 'model', parts: [{ text: "Hello! I'm your AutoVibe Concierge. How can I assist you today? Whether you're looking for a specific model or need help with a swap offer, I'm here to help." }] }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setIsTyping(true);

    try {
      const history = [
        { role: 'user' as const, parts: [{ text: AUTOVIBE_PROMPT }] },
        ...messages
      ];
      const response = await getChatResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm having a little trouble connecting right now. Please try again or contact our human support team." }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '88px' : '640px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`glass-panel border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-500 w-[420px] max-w-[calc(100vw-4rem)]`}
          >
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-3xl p-6 flex items-center justify-between text-white border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-600/10">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tighter uppercase italic">Neutral <span className="text-blue-400">Concierge</span></h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest font-mono">Core_Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white">
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-8 bg-slate-950/20 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-5 rounded-2xl text-[11px] font-bold leading-relaxed tracking-wider transition-all ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-600/20 uppercase italic' 
                            : 'glass-panel border-white/5 text-slate-400 rounded-tl-none font-medium'
                        }`}>
                          {msg.parts[0].text}
                        </div>
                        <span className="text-[8px] uppercase font-bold text-slate-700 tracking-[0.2em] px-1 font-mono">
                          {msg.role === 'user' ? 'Transmission_End' : 'Core_Broadcast'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="glass-panel border-white/5 p-4 rounded-2xl rounded-tl-none flex space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-3xl">
                  <form onSubmit={handleSend} className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-all">
                    <input 
                      type="text"
                      placeholder="Input query for Neural_A1..."
                      className="flex-grow bg-transparent border-none py-3 px-4 text-xs outline-none font-bold text-white placeholder:text-slate-700 uppercase tracking-widest"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="bg-blue-600 text-white p-3.5 rounded-xl disabled:opacity-30 disabled:bg-slate-800 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <p className="text-center text-[8px] text-slate-700 font-bold uppercase tracking-[0.3em] mt-4">
                    End-to-End Encryption Enabled
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`shadow-2xl flex items-center justify-center transition-all duration-500 ${
          isOpen ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100'
        } glass-panel border-white/10 text-white w-20 h-20 rounded-[2rem] relative group border-blue-500/10`}
      >
        <div className="absolute inset-0 bg-blue-600/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
        <div className="bg-slate-950 w-full h-full rounded-[2rem] flex items-center justify-center relative border border-white/5">
          <MessageSquare className="h-7 w-7 text-blue-400 group-hover:scale-110 transition-transform" />
          <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </motion.button>
    </div>
  );
}
