import React, { useState, useRef, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Send, Sparkles, MessageSquare, Bot, User, Trash2, ArrowRight } from 'lucide-react';

interface AiChatViewProps {
  token: string | null;
  lang: string;
}

const CHAT_PROMPTS = [
  { ta: 'எனது மாதாந்திர சேமிப்பை எப்படி அதிகரிப்பது?', en: 'How do I optimize my monthly savings rate?' },
  { ta: 'தங்கத்தில் முதலீடு செய்யலாமா அல்லது பங்குகளில் செய்யலாமா?', en: 'Should I buy gold or increase mutual fund SIPs?' },
  { ta: 'அவசரகால நிதியை எங்கே வைப்பது?', en: 'Where should I hold my active Emergency Fund?' },
  { ta: 'பணக் கசிவுகள் என்றால் என்ன? அவற்றை எப்படி தடுப்பது?', en: 'How to block unmonitored money leaks?' }
];

export default function AiChatView({ token, lang }: AiChatViewProps) {
  const isTa = lang === 'ta';
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: isTa 
        ? 'வணக்கம்! நான் உங்களின் வெல்த்ஸென்ஸ் AI நிதி ஆலோசகர். உங்களின் தற்போதைய வருமானம், செலவுகள் மற்றும் நிதி இலக்குகள் அடிப்படையிலான ஆலோசனைகளை என்னிடம் கேட்கலாம்!'
        : 'Hello! I am your WealthSense AI Copilot. Ask me about budget allocations, stock psychology, mutual fund splits, or ways to increase your active savings!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg];
      const data = await fetchWithAuth('/api/chat', token, {
        method: 'POST',
        body: JSON.stringify({
          messages: chatHistory,
          lang
        })
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please ensure your GEMINI_API_KEY is configured.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: isTa 
          ? 'வரலாறு அழிக்கப்பட்டது. மீண்டும் உங்களின் கேள்விகளை என்னிடம் கேட்கலாம்!'
          : 'Chat history cleared. How can I assist you with your active investments today?'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md overflow-hidden relative">
      {/* Chat header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              WealthSense AI Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">{isTa ? 'தமிழ் / English அரட்டை' : 'Context-aware Financial Assistant'}</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div key={idx} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                isUser 
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.content}
              </div>
              {isUser && (
                <div className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg shrink-0 mt-0.5 font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 justify-center">
          {CHAT_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(isTa ? prompt.ta : prompt.en)}
              className="text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-slate-300 transition flex items-center gap-1.5"
            >
              <span>{isTa ? prompt.ta : prompt.en}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isTa ? 'கேள்விகளை இங்கே டைப் செய்யவும்...' : 'Ask AI Copilot about your budget or investments...'}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
