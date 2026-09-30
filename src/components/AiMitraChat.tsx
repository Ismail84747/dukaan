import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Bot } from 'lucide-react';
import { Language, ChatMessage } from '../types';
import { translations } from '../translations';
import { queryAiAssistant } from '../data/aiKnowledge';
import { speakText, stopSpeaking, isSpeaking, startSpeechToText, stopSpeechToText, isSpeechRecognitionSupported } from '../utils/speech';
import { IndianFlag } from './IndianFlag';

interface AiMitraChatProps {
  lang: Language;
}

export const AiMitraChat: React.FC<AiMitraChatProps> = ({ lang }) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const getWelcomeText = (selectedLang: Language) => {
    if (selectedLang === 'mr') {
      return 'जय महाराष्ट्र! मी आपला महाव्यापार सहाय्यक मित्र आहे. डिजिटल दुकान नोंदणी, Google Maps पिन किंवा कंपनी पॅकेजबद्दल काय जाणून घ्यायचे आहे?';
    }
    if (selectedLang === 'hi') {
      return 'नमस्ते! मैं आपका महाव्यापार सहायक मित्र हूँ। डिजिटल दुकान, Google Maps लिस्टिंग या कंपनी पैकेज के बारे में क्या पूछना चाहते हैं?';
    }
    return 'Hello! I am your MahaVyapaar AI Mitra. How can I help you regarding Google Maps listing, UPI Soundbox, or company onboarding packages?';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'bot',
      text: getWelcomeText(lang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [quickReplies, setQuickReplies] = useState<string[]>([
    t.aiSuggestedPrompt1,
    t.aiSuggestedPrompt2,
    t.aiSuggestedPrompt3,
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMicSupported = isSpeechRecognitionSupported();

  const chatLabels = {
    mr: {
      activeStatus: 'सक्रिय',
      muteVoice: 'आवाज बंद करा',
      unmuteVoice: 'आवाज सुरू करा',
      listen: 'ऐका',
      stop: 'थांबवा',
      listenTooltip: 'आवाज ऐका (Listen Voice)',
      speakTooltip: 'बोलून विचारा (Voice Input)',
    },
    hi: {
      activeStatus: 'सक्रिय',
      muteVoice: 'आवाज़ बंद करें',
      unmuteVoice: 'आवाज़ शुरू करें',
      listen: 'सुनें',
      stop: 'रोकें',
      listenTooltip: 'आवाज़ सुनें (Listen Voice)',
      speakTooltip: 'बोलकर पूछें (Voice Input)',
    },
    en: {
      activeStatus: 'Active',
      muteVoice: 'Mute Voice',
      unmuteVoice: 'Unmute Voice',
      listen: 'Listen',
      stop: 'Stop',
      listenTooltip: 'Listen to message voice',
      speakTooltip: 'Speak voice question',
    },
  }[lang];

  useEffect(() => {
    setQuickReplies([t.aiSuggestedPrompt1, t.aiSuggestedPrompt2, t.aiSuggestedPrompt3]);
    // If user has not chatted yet, refresh welcome greeting in new language
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm-init') {
        return [
          {
            id: 'm-init',
            sender: 'bot',
            text: getWelcomeText(lang),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
    // Stop any ongoing speech if language changes
    stopSpeaking();
    setSpeakingMsgId(null);
  }, [lang, t]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      const response = queryAiAssistant(text, lang);
      const botMsgId = 'bot_' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (response.quickReplies && response.quickReplies.length > 0) {
        setQuickReplies(response.quickReplies);
      }

      if (!isMuted) {
        setSpeakingMsgId(botMsgId);
        speakText(
          response.audioText || response.text,
          lang,
          undefined,
          () => setSpeakingMsgId(null),
          () => setSpeakingMsgId(null)
        );
      }
    }, 400);
  };

  const handleListenMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId && isSpeaking()) {
      stopSpeaking();
      setSpeakingMsgId(null);
      return;
    }
    setSpeakingMsgId(msgId);
    speakText(
      text,
      lang,
      undefined,
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    );
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopSpeechToText();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startSpeechToText(
      lang,
      (transcript) => {
        setIsListening(false);
        handleSend(transcript);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
      setSpeakingMsgId(null);
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Floating Trigger Button in Saffron & Gold */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-[#EA580C] via-[#D97706] to-[#C2410C] text-[#2B0E14] font-black text-sm shadow-2xl hover:shadow-amber-500/50 flex items-center gap-2.5 transition-all transform hover:scale-105 border-2 border-amber-300 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#2B0E14]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-700 animate-ping" />
          </div>
          <span>{t.aiTitle}</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[560px] h-[500px] bg-[#FAF5EC] rounded-2xl shadow-2xl border-2 border-amber-800/40 flex flex-col overflow-hidden text-[#2B0E14]">
          {/* Header in Maratha Maroon */}
          <div className="bg-[#4A0E17] text-amber-100 p-3.5 flex items-center justify-between border-b-2 border-amber-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#D97706] flex items-center justify-center text-[#2B0E14] font-black shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-200 flex items-center gap-1.5">
                  <span>{t.aiTitle}</span>
                  <IndianFlag size="xs" />
                  <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded-full font-bold">
                    {chatLabels.activeStatus}
                  </span>
                </h4>
                <p className="text-[10px] text-amber-300/80 font-medium">
                  {t.aiSub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-amber-200 hover:bg-white/10 transition-colors"
                title={isMuted ? chatLabels.unmuteVoice : chatLabels.muteVoice}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setSpeakingMsgId(null);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-amber-200 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="bg-[#FFFDF7] p-2 border-b border-amber-200 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickReplies.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-[#4A0E17] font-bold shrink-0 border border-amber-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FAF5EC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#4A0E17] text-amber-300 flex items-center justify-center shrink-0 text-xs font-black mt-1">
                    MH
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] text-xs leading-relaxed font-semibold shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 rounded-tr-none font-bold'
                      : 'bg-[#FFFDF7] text-[#2B0E14] border border-amber-700/20 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-amber-200/50">
                    <span className="text-[9px] opacity-70 font-mono">
                      {msg.timestamp}
                    </span>
                    {msg.sender === 'bot' && (
                      <button
                        type="button"
                        onClick={() => handleListenMessage(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                          speakingMsgId === msg.id
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-[#EA580C] hover:bg-amber-100'
                        }`}
                        title={chatLabels.listenTooltip}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{speakingMsgId === msg.id ? chatLabels.stop : chatLabels.listen}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-2.5 bg-[#FFFDF7] border-t border-amber-200 flex items-center gap-2">
            {isMicSupported && (
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-amber-500 text-slate-950 mic-recording'
                    : 'bg-amber-100 text-[#7C2D12] hover:bg-amber-200'
                }`}
                title={chatLabels.speakTooltip}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4 text-[#EA580C]" />
                )}
              </button>
            )}

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.aiPlaceholder}
              className="flex-1 px-3 py-2 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-xs text-[#2B0E14] focus:outline-none focus:ring-2 focus:ring-[#EA580C] font-semibold"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              className="p-2 rounded-xl bg-[#4A0E17] hover:bg-[#6B1D2F] text-amber-200 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
