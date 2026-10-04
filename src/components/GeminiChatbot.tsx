import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Compass,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Lightbulb,
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingLinks?: Array<{ title: string; uri: string; sourceType?: string }>;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      text: 'Hello! I am **CivicFix AI Assistant**, powered by Google Gemini. I can assist you with campus issue diagnosis, maintenance procedures, and finding nearby facilities using real-time Google Maps data.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [botRole, setBotRole] = useState<'facilities_advisor' | 'maintenance_copilot' | 'campus_navigator'>('facilities_advisor');
  const [modelType, setModelType] = useState<'general' | 'fast' | 'complex'>('general');
  const [enableMaps, setEnableMaps] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Request browser geolocation for Maps Grounding
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Default to university quad coordinates
          setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Map messages for server
      const payloadMessages = newHistory
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          botRole,
          modelType,
          enableMaps,
          userLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive response from Gemini');
      }

      const botMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'model',
        text: data.text || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingLinks: data.groundingLinks,
        modelUsed: data.model,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'model',
        text: `⚠️ **Error communicating with Gemini**: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        role: 'model',
        text: 'Conversation history reset. How can I help you with campus maintenance today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    {
      label: '📍 Nearest Hardware Store',
      prompt: 'Find the nearest hardware and plumbing supply stores near campus with Google Maps.',
    },
    {
      label: '💧 Pipe Rupture Protocol',
      prompt: 'What are the immediate emergency shut-off steps for a high-pressure water pipe burst in a science lab?',
    },
    {
      label: '⚡ Ballast Humming Diagnostic',
      prompt: 'Diagnose why a fluorescent light fixture is buzzing loudly and flickering in a library study hall.',
    },
    {
      label: '📝 Draft Repair Ticket',
      prompt: 'Help me write a concise, actionable maintenance complaint for an AC unit leaking condensation onto student desks.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-2 sm:inset-6 md:inset-10'
          : 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-3xl'
      } flex flex-col bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95`}
    >
      {/* Top Header */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-3 sm:p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/20 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-sm sm:text-base leading-tight">CivicFix AI Copilot</h3>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                Gemini
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-100 flex items-center gap-1">
              {enableMaps && <Globe className="w-3 h-3 text-emerald-300 shrink-0" />}
              <span>{enableMaps ? 'Google Maps Grounding' : 'Standard AI Mode'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex"
            title={isExpanded ? 'Restore Size' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Role & Model Controls Ribbon */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        {/* Role Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium text-[11px]">Role:</span>
          <select
            value={botRole}
            onChange={(e) => setBotRole(e.target.value as any)}
            className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-[11px] focus:ring-1 focus:ring-blue-500"
          >
            <option value="facilities_advisor">Facilities Advisor</option>
            <option value="maintenance_copilot">Maintenance Copilot</option>
            <option value="campus_navigator">Campus Navigator</option>
          </select>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium text-[11px]">Model:</span>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as any)}
            className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-[11px] focus:ring-1 focus:ring-blue-500"
          >
            <option value="general">gemini-3.5-flash (General)</option>
            <option value="fast">gemini-3.1-flash-lite (Fast)</option>
            <option value="complex">gemini-3.1-pro-preview (Complex)</option>
          </select>
        </div>

        {/* Maps Grounding Toggle */}
        <button
          onClick={() => setEnableMaps(!enableMaps)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold text-[11px] transition-colors ${
            enableMaps
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}
          title="Toggle Google Maps Grounding with gemini-3.5-flash"
        >
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span>Maps Grounding: {enableMaps ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs rounded-tl-none'
                }`}
              >
                {/* Message Text with simple formatting */}
                <div className="whitespace-pre-wrap font-normal">
                  {m.text}
                </div>

                {/* Google Maps Grounding Links */}
                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Grounded Places on Google Maps:
                    </p>
                    <div className="flex flex-col gap-1">
                      {m.groundingLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 transition-colors text-[11px] font-semibold"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate flex-1">{link.title}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] opacity-60">
                  <span>{m.timestamp}</span>
                  {m.modelUsed && <span>{m.modelUsed}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>
                {enableMaps
                  ? 'Retrieving live Google Maps data & reasoning...'
                  : 'Gemini is formulating response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2.5 bg-slate-100/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            enableMaps
              ? 'Ask about campus issues, locations, or nearest suppliers...'
              : 'Ask a question about maintenance, safety, or procedures...'
          }
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
