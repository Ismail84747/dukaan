import React from 'react';
import { PhoneCall, VolumeX, Users, Globe, Eye, Landmark, Clock, PlayCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { IndianFlag } from './IndianFlag';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onOpenDirectory: () => void;
  onOpenStatusTracker: () => void;
  onOpenVideoGuides?: () => void;
  vendorCount: number;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  fontSizeScale: number;
  onFontSizeChange: (scale: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenDirectory,
  onOpenStatusTracker,
  onOpenVideoGuides,
  vendorCount,
  isAudioPlaying,
  onStopAudio,
  fontSizeScale,
  onFontSizeChange,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Helpline Ribbon in Maratha Maroon & Saffron */}
      <div className="bg-[#3B1C10] text-amber-100 text-xs px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          {/* Authentic Indian Tricolor Flag with Ashoka Chakra */}
          <IndianFlag size="xs" />
          <span className="hidden sm:inline font-bold tracking-wide text-amber-200">
            {lang === 'mr'
              ? 'महाव्यापार • डिजिटल सेतू उपक्रम'
              : lang === 'hi'
              ? 'महाव्यापार • डिजिटल सेतु पहल'
              : 'MahaVyapaar • Digital Setu Initiative'}
          </span>
          <span className="sm:hidden font-bold text-amber-200">
            {lang === 'mr'
              ? 'महाव्यापार डिजिटल सेतू'
              : lang === 'hi'
              ? 'महाव्यापार डिजिटल सेतु'
              : 'MahaVyapaar Setu'}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Helpline with Ismail / Faraz */}
          <a
            href="tel:9137786506"
            className="flex items-center gap-1.5 text-amber-300 font-bold hover:text-amber-200 transition-colors"
            title="थेट संपर्क: इस्माईल / फराझ"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="font-mono font-black">+91 9137786506</span>
            <span className="hidden md:inline text-[11px] text-amber-200 font-normal">
              {lang === 'mr'
                ? '(इस्माईल / फराझ)'
                : lang === 'hi'
                ? '(इस्माईल / फ़राज़)'
                : '(Ismail / Faraz)'}
            </span>
          </a>

          {/* Accessibility Font Size Toggle (A- / A / A+) */}
          <div className="flex items-center gap-0.5 bg-[#2A1608] px-1.5 py-0.5 rounded border border-amber-700/50">
            <Eye className="w-3 h-3 text-amber-400 mr-1" />
            <button
              onClick={() => onFontSizeChange(0.9)}
              title="लहान फॉन्ट (Small Text)"
              className={`px-1 rounded text-[11px] font-bold ${
                fontSizeScale === 0.9 ? 'bg-[#EA580C] text-amber-950 font-black' : 'text-amber-300 hover:text-white'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => onFontSizeChange(1.0)}
              title="मूळ फॉन्ट (Normal Text)"
              className={`px-1 rounded text-[11px] font-bold ${
                fontSizeScale === 1.0 ? 'bg-[#EA580C] text-amber-950 font-black' : 'text-amber-300 hover:text-white'
              }`}
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange(1.15)}
              title="मोठा फॉन्ट (Large Text)"
              className={`px-1 rounded text-[11px] font-bold ${
                fontSizeScale === 1.15 ? 'bg-[#EA580C] text-amber-950 font-black' : 'text-amber-300 hover:text-white'
              }`}
            >
              A+
            </button>
          </div>

          {/* Stop Audio Button if speaking */}
          {isAudioPlaying && (
            <button
              onClick={onStopAudio}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 hover:bg-rose-800 text-[11px] font-bold animate-pulse"
              title={t.stopAudio}
            >
              <VolumeX className="w-3 h-3" />
              <span>{t.stopAudio}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Banner & Navigation */}
      <div className="bg-[#4A0E17] text-[#FFFDF7] px-3 sm:px-6 py-3 border-b-2 border-[#D97706]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Seal */}
          <div className="flex items-center gap-3">
            {/* Traditional Rajmudra Saffron & Gold Emblem */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-[#EA580C] via-[#D97706] to-[#7C2D12] p-1 flex items-center justify-center shadow-lg border-2 border-amber-300 shrink-0">
              <div className="w-full h-full rounded-lg bg-[#3B1C10] flex flex-col items-center justify-center text-center p-0.5">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span className="text-[8px] font-black text-amber-300 uppercase tracking-tighter leading-none">
                  महा
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100 font-heading">
                  {t.portalTitle}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-extrabold rounded-md bg-[#EA580C] text-amber-950 border border-amber-300">
                  {t.portalSubTitle}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Action Buttons & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#3B1C10] border border-amber-500/40 rounded-lg p-0.5">
              <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1 hidden sm:inline" />
              {([
                { code: 'mr', label: '🚩 मराठी', title: 'मराठी' },
                { code: 'hi', label: 'हिंदी', title: 'हिंदी' },
                { code: 'en', label: 'Eng', title: 'English' },
              ] as const).map(({ code, label, title }) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code)}
                  title={title}
                  className={`px-2 py-1 rounded text-xs font-black transition-all cursor-pointer ${
                    lang === code
                      ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Video Guides Button */}
            {onOpenVideoGuides && (
              <button
                onClick={onOpenVideoGuides}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-emerald-500/60 cursor-pointer"
                title="डिजिटल किट व्हिडिओ मार्गदर्शक (Digital Kit Video Tutorials)"
              >
                <PlayCircle className="w-4 h-4 text-emerald-300" />
                <span className="hidden lg:inline">
                  {lang === 'mr' ? 'किट व्हिडिओ' : lang === 'hi' ? 'किट वीडियो' : 'Kit Videos'}
                </span>
                <span className="lg:hidden">
                  {lang === 'mr' ? 'व्हिडिओ' : lang === 'hi' ? 'वीडियो' : 'Video'}
                </span>
              </button>
            )}

            {/* Real-time Status Tracker Button */}
            <button
              onClick={onOpenStatusTracker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#F59E0B] hover:to-[#EA580C] text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-amber-300 cursor-pointer"
              title="ऑनबोर्डिंग प्रगती ट्रॅक करा (Track Digital Onboarding Status)"
            >
              <Clock className="w-4 h-4 text-amber-950" />
              <span className="hidden sm:inline">
                {lang === 'mr' ? 'स्थिती ट्रॅकर' : lang === 'hi' ? 'स्थिति ट्रैकर' : 'Track Status'}
              </span>
              <span className="sm:hidden">
                {lang === 'mr' ? 'ट्रॅक' : lang === 'hi' ? 'ट्रैक' : 'Track'}
              </span>
            </button>

            {/* Admin Desk / Registered Directory Trigger */}
            <button
              onClick={onOpenDirectory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#3B1C10] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-amber-300 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#4A0E17]" />
              <span className="hidden md:inline">{t.adminDesk}</span>
              <span className="md:hidden">{lang === 'mr' ? 'यादी' : lang === 'hi' ? 'सूची' : 'List'}</span>
              <span className="bg-[#4A0E17] text-amber-300 text-[11px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                {vendorCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
