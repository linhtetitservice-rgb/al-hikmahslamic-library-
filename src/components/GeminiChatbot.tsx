import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
  BookOpen, 
  Scale, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Zap,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getScholarlyAnswer } from '../utils/islamicKnowledgeEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  initialPrompt?: string;
  onClose?: () => void;
  isWidget?: boolean;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  initialPrompt,
  onClose,
  isWidget = false,
}) => {
  const { user } = useAuth();

  // Model & Role configurations
  const [modelRole, setModelRole] = useState<'general' | 'complex' | 'fast'>('general');
  const [activePersona, setActivePersona] = useState<string>('scholar');

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `အဿလာမု အလိုင်ကုမ် ဝရဟ်မသုလ္လာဟိ ဝဗရကားသုဟု (السلام عليكم ورحمة الله وبركاته)။\n\nကျွန်ုပ်သည် **အစ္စလာမ့် သာသနာ့ အမေးအဖြေနှင့် ဗဟုသုတ AI လက်ထောက်** ဖြစ်ပါသည်။ ကျမ်းမြတ်ကုရ်အာန်၊ ဆွဟီးဟ် ဟဒီးဆ်တော်များ၊ နမားဇ်၊ ဥပုသ်၊ ဇကားသ်၊ ကုရ်ဘာနီ၊ ဖိကာဟ် ဓမ္မသတ်များနှင့် နေ့စဉ်လူနေမှုဘဝဆိုင်ရာ သာသနာ့မေးခွန်းများကို မေးမြန်းနိုင်ပါသည်။`,
        timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggested questions
  const sampleQuestions = [
    'နမားဇ် ဝူဇူပြုလုပ်နည်းနှင့် ဖရဇ် (၄) ရပ်ကို ရှင်းပြပါ',
    'ကုရ်ဘာနီ နိဆွာဗ် သတ်မှတ်ချက်နှင့် သားကောင် ရွေးချယ်ပုံ',
    'ဇကားသ် ခံယူထိုက်သူ (၈) မျိုးအကြောင်း ရှင်းပြပါ',
    'နေ့စဉ် ဖတ်ရမည့် အရေးကြီးသော ဒိုအာများနှင့် ဇိကိရ်များ',
    'ခရီးသွား (မုဆွာဖိရ်) နမားဇ် ကဆွရ် ဖတ်နည်း ဓမ္မသတ်',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    // Persona-based custom instruction
    let personaInstruction = '';
    if (activePersona === 'scholar') {
      personaInstruction = 'သင်သည် ဟနဖီ/ရှာဖိအီ မဇ်ဟဗ်နှင့် ကျမ်းကိုး (ဒလီးလ်) များကို ညွှန်းဆိုရှင်းပြပေးသော သာသနာ့ဓမ္မသတ်ပညာရှင် (Alim/Mufti) ဖြစ်ပါသည်။';
    } else if (activePersona === 'teacher') {
      personaInstruction = 'သင်သည် လူငယ်များနှင့် စတင်လေ့လာသူများအတွက် အစ္စလာမ်အခြေခံများကို ရှင်းလင်းလွယ်ကူစွာ သင်ကြားပေးသော သာသနာ့ဆရာဖြစ်ပါသည်။';
    } else {
      personaInstruction = 'သင်သည် ကုရ်အာန်နှင့် ဟဒီးဆ်တော် အထောက်အထားများကို တိုက်ရိုက်ကိုးကားရှင်းပြပေးသော သုတေသီဖြစ်ပါသည်။';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelRole,
          customSystemInstruction: `${personaInstruction} မေးခွန်းများကို ပြေပြစ်ယဉ်ကျေးသော မြန်မာစာဖြင့် ရေးသားပါ။ သာသနာ့အထောက်အထား (ကုရ်အာန်ဆူရဟ်၊ အာယသ်နံပါတ်၊ ဟဒီးဆ်ကျမ်းများ) ကို ထည့်သွင်းဖော်ပြပါ။`,
        }),
      });

      let botContent = '';
      let botModelUsed = '';

      if (response.ok) {
        const data = await response.json();
        botContent = data.reply;
        botModelUsed = data.modelUsed || 'Gemini 3.8 Flash';
      }

      if (!botContent || !botContent.trim()) {
        const fallback = getScholarlyAnswer(text, activePersona);
        botContent = fallback.reply;
        botModelUsed = fallback.source;
      }
      
      const botReply: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        content: botContent,
        timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: botModelUsed,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.warn('Chat request failed, utilizing local knowledge engine:', err);
      const fallback = getScholarlyAnswer(text, activePersona);
      const botReply: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        content: fallback.reply,
        timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: fallback.source,
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    if (confirm('စကားပြောမှတ်တမ်း အားလုံးကို ရှင်းလင်းပြီး ပြန်လည်စတင်လိုပါသလား။')) {
      setMessages([
        {
          id: 'msg-welcome-reset',
          role: 'model',
          content: 'စကားပြောမှတ်တမ်းကို ပြန်လည်စတင်လိုက်ပါပြီ။ သာသနာ့အကြောင်းအရာ မည်သည့်မေးခွန်းကိုမဆို မေးမြန်းနိုင်ပါသည်။',
          timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-colors duration-200 ${
      isWidget ? 'h-[600px] max-h-[85vh]' : 'min-h-[650px] h-[78vh]'
    }`}>
      
      {/* Top Chat Header */}
      <div className="bg-emerald-950 dark:bg-emerald-950 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900 dark:border-emerald-900 shrink-0">
        
        {/* Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                အစ္စလာမ်သာသနာ့ အမေးအဖြေ AI လက်ထောက်
              </h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-800 text-emerald-200 font-medium">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-emerald-300">
              ကုရ်အာန်၊ ဟဒီးဆ်တော်များ၊ နမားဇ်၊ ဇကားသ်၊ ကုရ်ဘာနီနှင့် ဓမ္မသတ်အမေးအဖြေ
            </p>
          </div>
        </div>

        {/* Model & Role Controls */}
        <div className="flex items-center gap-2">
          
          {/* Model Selector based on task requirements */}
          <select
            value={modelRole}
            onChange={(e) => setModelRole(e.target.value as any)}
            className="bg-emerald-900 border border-emerald-700 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            title="Gemini Model ရွေးချယ်မှု"
          >
            <option value="general" className="bg-emerald-950 text-white">
              🌟 အထွေထွေ ဗဟုသုတ (Gemini 3.5 Flash)
            </option>
            <option value="complex" className="bg-emerald-950 text-white">
              📖 ဓမ္မသတ် သုတေသန (Gemini 3.1 Pro Preview)
            </option>
            <option value="fast" className="bg-emerald-950 text-white">
              ⚡ မြန်ဆန်သော အမေးအဖြေ (Gemini 3.1 Flash Lite)
            </option>
          </select>

          {/* Reset button */}
          <button
            onClick={handleResetChat}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded transition-colors cursor-pointer"
            title="အစမှ ပြန်လည်စတင်ရန်"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded transition-colors"
            >
              ပိတ်ရန်
            </button>
          )}
        </div>
      </div>

      {/* Persona Sub-header */}
      <div className="px-4 py-2 bg-stone-50 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-300 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-700 dark:text-stone-300">AI အခန်းကဏ္ဍ (Persona):</span>
          <div className="inline-flex rounded-md p-0.5 bg-stone-200/60 dark:bg-stone-800 text-[11px]">
            <button
              onClick={() => setActivePersona('scholar')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activePersona === 'scholar' ? 'bg-white dark:bg-stone-700 font-bold text-emerald-900 dark:text-emerald-300 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              ဓမ္မသတ်ပညာရှင် (Mufti)
            </button>
            <button
              onClick={() => setActivePersona('teacher')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activePersona === 'teacher' ? 'bg-white dark:bg-stone-700 font-bold text-emerald-900 dark:text-emerald-300 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              အခြေခံသင်ကြားသူ
            </button>
            <button
              onClick={() => setActivePersona('researcher')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activePersona === 'researcher' ? 'bg-white dark:bg-stone-700 font-bold text-emerald-900 dark:text-emerald-300 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              ကုရ်အာန်/ဟဒီးဆ် သုတေသီ
            </button>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
          စကားပြောမှတ်တမ်း: {messages.length} ခု
        </div>
      </div>

      {/* Scrollable Chat Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40 dark:bg-stone-950">
        {messages.map((m) => {
          const isBot = m.role === 'model';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs ${
                isBot 
                  ? 'bg-emerald-900 text-amber-300' 
                  : 'bg-emerald-700 text-white'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 shadow-2xs ${
                isBot
                  ? 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100'
                  : 'bg-emerald-800 dark:bg-emerald-700 text-white rounded-tr-xs'
              }`}>
                
                {/* Header inside bubble */}
                <div className="flex items-center justify-between gap-2 border-b pb-1 text-[11px] opacity-75 border-black/10 dark:border-white/10">
                  <span className="font-bold">
                    {isBot ? 'သာသနာ့ AI လက်ထောက်' : (user?.name || 'သင်')}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                {/* Content */}
                <div className="whitespace-pre-line font-myanmar selection:bg-amber-300 selection:text-black">
                  {m.content}
                </div>

                {/* Bottom info for bot */}
                {isBot && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                    <span className="font-mono">
                      {m.modelUsed || 'Gemini'}
                    </span>
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      title="စာသား ကူးယူရန်"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">ကူးယူပြီး</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>ကူးယူမည်</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Message Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-xs text-stone-600 dark:text-stone-300 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span>ကျမ်းကိုးနှင့် အထောက်အထားများ စိစစ်တွေးခေါ်နေပါသည်...</span>
              </div>
              <p className="text-[11px] text-stone-400">
                ကျေးဇူးပြု၍ ခေတ္တစောင့်ဆိုင်းပေးပါ
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Quick Questions (when conversation is short) */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <span className="text-stone-500 dark:text-stone-400 font-medium whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>နမူနာ မေးခွန်းများ:</span>
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="အစ္စလာမ်သာသနာ့ အမေးအဖြေ၊ ကုရ်အာန်၊ ဟဒီးဆ်၊ နမားဇ်၊ ဇကားသ်၊ ကုရ်ဘာနီ မေးခွန်းများ မေးမြန်းရန်..."
            className="flex-1 px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold transition-colors flex items-center justify-center cursor-pointer ${
              !inputPrompt.trim() || isLoading
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-xs'
            }`}
            title="ပေးပို့ရန်"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-stone-400 dark:text-stone-500 text-center mt-1.5">
          AI ၏ ဖြေကြားချက်များသည် အသိပညာဗဟုသုတအတွက်ဖြစ်ပြီး အရေးကြီးသော ဓမ္မသတ်များအတွက် ဒေသခံ မုဖ်သီဆရာတော်ကြီးများနှင့် တိုင်ပင်ဆွေးနွေးရန် အကြံပြုအပ်ပါသည်။
        </div>
      </div>

    </div>
  );
};
