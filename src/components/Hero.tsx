import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowRight, MapPin, QrCode, Award, Clock, PlayCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { speakText, isSpeaking, stopSpeaking } from '../utils/speech';
import { IndianFlag } from './IndianFlag';

interface HeroProps {
  lang: Language;
  onApplyClick: () => void;
  onTrackStatusClick?: () => void;
  onVideoGuidesClick?: () => void;
  vendorCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onApplyClick,
  onTrackStatusClick,
  onVideoGuidesClick,
  vendorCount,
}) => {
  const t = translations[lang];
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleVoiceGuide = () => {
    if (isPlayingAudio || isSpeaking()) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const fullGuideText =
      lang === 'mr'
        ? 'नमस्कार! महाव्यापार डिजिटल दुकान सेतू पोर्टलवर आपले स्वागत आहे. स्थानिक डिजिटल पुढाकाराने आता आपले दुकान, स्टॉल किंवा हातगाडी गुगल मॅप्सवर दिसेल आणि ग्राहकांना डिजिटल पेमेंट करता येईल. केवळ २९ रुपयांमध्ये आरंभ पॅकेज, ७९ रुपयांमध्ये ५-स्टार रिव्ह्यू स्टँडीसह प्रगती पॅकेज उपलब्ध आहे. खालील अर्ज भरा आणि २४ तासांत आपले डिजिटल दुकान सुरू करा.'
        : lang === 'hi'
        ? 'नमस्कार! महाव्यापार डिजिटल दुकान सेतु पोर्टल पर आपका स्वागत है। इस विशेष डिजिटल पहल से आपकी दुकान अब गूगल मैप्स पर दिखेगी और डिजिटल पेमेंट्स स्वीकार कर सकेगी। मात्र २९ रुपये से शुरू। नीचे दिए गए फॉर्म को भरें और २४ घंटे में अपनी डिजिटल दुकान शुरू करें।'
        : 'Welcome to MahaVyapaar Digital Solutions Private Limited. Empowering micro-vendors and local shops with Google Maps listing, digital UPI QR codes, and corporate enterprise discounts starting at just twenty nine rupees.';

    setIsPlayingAudio(true);
    speakText(
      fullGuideText,
      lang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const formatNumber = (num: number): string => {
    const total = num;
    if (lang === 'mr' || lang === 'hi') {
      const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return total
        .toLocaleString('en-IN')
        .split('')
        .map((ch) => (ch >= '0' && ch <= '9' ? devanagariDigits[parseInt(ch, 10)] : ch))
        .join('');
    }
    return total.toLocaleString('en-IN');
  };

  return (
    <section className="relative bg-[#4A0E17] text-white pt-8 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden border-b-4 border-[#D97706]">
      {/* Subtle Maratha Paithani Pattern Backdrop */}
      <div className="absolute inset-0 opacity-10 paithani-pattern pointer-events-none" />

      {/* Decorative Glow in Saffron & Gold */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headings & Call to Action */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Enterprise Badge with Indian Flag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-black shadow-inner">
              <IndianFlag size="xs" />
              <span>{t.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-amber-100 font-heading">
              {t.heroTitle}
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-amber-200/90 leading-relaxed font-medium">
              {t.heroSub}
            </p>

            {/* High-Impact Feature Pill Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2 bg-[#2B0E14] border border-amber-500/30 p-2.5 rounded-xl shadow-xs">
                <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span className="text-xs font-bold text-amber-100">{t.heroPillMaps}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2B0E14] border border-amber-500/30 p-2.5 rounded-xl shadow-xs">
                <QrCode className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span className="text-xs font-bold text-amber-100">{t.heroPillSoundbox}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2B0E14] border border-amber-500/30 p-2.5 rounded-xl shadow-xs col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-bold text-amber-100">{t.heroPillReview}</span>
              </div>
            </div>

            {/* Action Buttons: Apply Now & Listen Voice Guide */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onApplyClick}
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#C2410C] hover:from-[#FBBF24] hover:to-[#EA580C] text-[#2B0E14] font-black text-sm sm:text-base shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-amber-300"
              >
                <span>{t.applyNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleVoiceGuide}
                className={`px-4 sm:px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm border flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                  isPlayingAudio
                    ? 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse'
                    : 'bg-[#2B0E14] hover:bg-[#3B1C10] text-amber-200 border-amber-500/50'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>{t.stopAudio}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#F59E0B]" />
                    <span>{t.voiceGuideBtn}</span>
                  </>
                )}
              </button>

              {onTrackStatusClick && (
                <button
                  onClick={onTrackStatusClick}
                  className="px-4 sm:px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm border border-amber-400/80 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="नोंदणी अर्ज प्रगती ट्रॅक करा"
                >
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>
                    {lang === 'mr'
                      ? 'अर्ज स्थिती ट्रॅक करा'
                      : lang === 'hi'
                      ? 'आवेदन स्थिति ट्रैक करें'
                      : 'Track Status'}
                  </span>
                </button>
              )}

              {onVideoGuidesClick && (
                <button
                  onClick={onVideoGuidesClick}
                  className="px-4 sm:px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm border border-emerald-400/80 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="डिजिटल किट व्हिडिओ मार्गदर्शक पाहा (Watch Digital Kit Video Guides)"
                >
                  <PlayCircle className="w-4 h-4 text-emerald-300" />
                  <span>
                    {lang === 'mr'
                      ? 'किट व्हिडिओ'
                      : lang === 'hi'
                      ? 'किट वीडियो'
                      : 'Kit Videos'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-b from-[#FAF5EC] to-[#FFFDF7] p-5 sm:p-6 rounded-2xl border-4 border-[#D97706] shadow-2xl text-[#2B0E14]">
              {/* Top Ribbon */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4A0E17] text-amber-300 flex items-center justify-center font-black text-xs">
                    MH
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#4A0E17] uppercase tracking-wider">
                      {t.heroCardTitle}
                    </div>
                    <div className="text-[11px] text-[#7C2D12] font-semibold">
                      {t.heroCardSub}
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-amber-100 text-[#7C2D12] border border-amber-300 text-[11px] font-black">
                  {t.heroCardSubsidy}
                </div>
              </div>

              {/* Digital Kit Preview */}
              <div className="my-4 rounded-xl overflow-hidden relative shadow-md border-2 border-amber-300/60 bg-amber-950">
                <img
                  src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"
                  alt="Maharashtra Local Business Kit Setup"
                  className="w-full h-44 object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-3.5 text-white">
                  <div className="w-full">
                    <div className="text-xs font-black text-amber-300">
                      {t.heroShopSample}
                    </div>
                    <div className="text-[11px] text-slate-200">
                      {t.heroShopSampleLoc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Micro Benefits Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-[#FAF5EC] p-2.5 rounded-lg border border-amber-200">
                  <div className="font-extrabold text-[#4A0E17]">
                    {t.heroStartingPrice}
                  </div>
                  <div className="text-[11px] text-[#7C2D12]">
                    {t.heroNoHiddenFee}
                  </div>
                </div>
                <div className="bg-[#FAF5EC] p-2.5 rounded-lg border border-amber-200">
                  <div className="font-extrabold text-[#4A0E17]">
                    {t.heroApprovalTime}
                  </div>
                  <div className="text-[11px] text-[#7C2D12]">
                    {t.heroFieldOfficerSupport}
                  </div>
                </div>
              </div>

              {/* 3 Real Merchant Onboarding Photos */}
              <div className="mt-4 pt-3 border-t border-amber-200/80">
                <div className="flex items-center justify-between text-[11px] font-black text-[#4A0E17] mb-2">
                  <span className="flex items-center gap-1">
                    <IndianFlag size="xs" />
                    <span>डिजिटल सेतू ऑनबोर्डिंग किट (Setu Kit Services)</span>
                  </span>
                  <span className="text-amber-900 font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px]">
                    अधिकृत सेवा
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg overflow-hidden border border-amber-200 bg-amber-50 group">
                    <div className="h-16 w-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=400&q=80"
                        alt="QR Payment Scan"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-1 text-center text-[10px] font-bold text-[#5C2B14] leading-tight">
                      UPI QR स्कॅन
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-amber-200 bg-amber-50 group">
                    <div className="h-16 w-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80"
                        alt="Merchant Verification"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-1 text-center text-[10px] font-bold text-[#5C2B14] leading-tight">
                      दुकान नोंदणी
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-amber-200 bg-amber-50 group">
                    <div className="h-16 w-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=400&q=80"
                        alt="UPI Soundbox Desk"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-1 text-center text-[10px] font-bold text-[#5C2B14] leading-tight">
                      साऊंडबॉक्स वाटप
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Live Stats Bar in Maratha Maroon & Gold */}
        <div className="mt-8 pt-6 border-t border-amber-500/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-[#2B0E14]/80 border border-amber-500/20">
            <div className="text-2xl sm:text-3xl font-black text-[#F59E0B]">
              {formatNumber(vendorCount)}
            </div>
            <div className="text-xs text-amber-200/80 font-semibold mt-0.5">
              {t.statVendors}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#2B0E14]/80 border border-amber-500/20">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {t.statDistrictsVal}
            </div>
            <div className="text-xs text-amber-200/80 font-semibold mt-0.5">
              {t.statDistricts}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#2B0E14]/80 border border-amber-500/20">
            <div className="text-2xl sm:text-3xl font-black text-orange-400">
              {t.statSubsidyVal}
            </div>
            <div className="text-xs text-amber-200/80 font-semibold mt-0.5">
              {t.statSubsidy}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#2B0E14]/80 border border-amber-500/20">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {t.statTimeVal}
            </div>
            <div className="text-xs text-amber-200/80 font-semibold mt-0.5">
              {t.statTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
