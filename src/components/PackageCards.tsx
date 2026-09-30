import React, { useState } from 'react';
import { Check, Sparkles, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Language, PackageId } from '../types';
import { growthPackages } from '../data/packages';
import { translations } from '../translations';
import { speakText, isSpeaking, stopSpeaking } from '../utils/speech';
import { IndianFlag } from './IndianFlag';

interface PackageCardsProps {
  lang: Language;
  selectedPackageId: PackageId;
  onSelectPackage: (pkgId: PackageId) => void;
  onContinueToForm: () => void;
}

export const PackageCards: React.FC<PackageCardsProps> = ({
  lang,
  selectedPackageId,
  onSelectPackage,
  onContinueToForm,
}) => {
  const t = translations[lang];
  const [playingPkgId, setPlayingPkgId] = useState<PackageId | null>(null);

  const handleListenPackage = (e: React.MouseEvent, pkgId: PackageId) => {
    e.stopPropagation();
    if (playingPkgId === pkgId && isSpeaking()) {
      stopSpeaking();
      setPlayingPkgId(null);
      return;
    }
    stopSpeaking();
    const pkg = growthPackages.find((p) => p.id === pkgId);
    if (pkg) {
      setPlayingPkgId(pkgId);
      speakText(
        pkg.audioText[lang],
        lang,
        undefined,
        () => setPlayingPkgId(null),
        () => setPlayingPkgId(null)
      );
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#FAF2DF] border-b border-amber-800/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200 text-[#4A0E17] border border-amber-400 text-xs font-black mb-2 shadow-xs">
            <IndianFlag size="xs" />
            <span>
              {lang === 'mr'
                ? 'थेट खाजगी मर्यादित कंपनी दरपत्रक (Pvt Ltd Rates)'
                : lang === 'hi'
                ? 'प्रत्यक्ष प्राइवेट लिमिटेड कंपनी दर तालिका (Pvt Ltd Rates)'
                : 'Direct Private Limited Company Rate Card (Pvt Ltd)'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A0E17] tracking-tight font-heading">
            {t.schemeHeading}
          </h2>
          <p className="text-[#5C2B14] text-sm sm:text-base mt-2 font-semibold">
            {t.schemeSub}
          </p>
        </div>

        {/* 3 Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {growthPackages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const isPopular = pkg.id === 'growth';

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`relative rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFFDF7] border-3 border-[#EA580C] shadow-2xl scale-[1.02] ring-4 ring-amber-500/20'
                    : isPopular
                    ? 'bg-[#FFFDF7] border-2 border-amber-500 shadow-xl'
                    : 'bg-[#FAF5EC] border-2 border-amber-800/20 shadow-md hover:shadow-lg'
                } p-6 sm:p-7`}
              >
                {/* Popular or Feature Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 font-black text-xs shadow-md border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#4A0E17]" />
                    <span>{pkg.badge[lang]}</span>
                  </div>
                )}

                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#4A0E17] font-heading">
                        {pkg.name[lang]}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#7C2D12] font-semibold mt-0.5">
                        {pkg.subtitle[lang]}
                      </p>
                    </div>

                    {/* Audio Listen Pill */}
                    <button
                      type="button"
                      onClick={(e) => handleListenPackage(e, pkg.id)}
                      className={`p-2 rounded-xl transition-all shrink-0 border cursor-pointer ${
                        playingPkgId === pkg.id
                          ? 'bg-[#EA580C] text-amber-950 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                          : 'bg-amber-100 text-[#7C2D12] hover:bg-amber-200 border-amber-300'
                      }`}
                      title={playingPkgId === pkg.id ? t.stopAudio : t.listenDetails}
                    >
                      {playingPkgId === pkg.id ? (
                        <VolumeX className="w-4 h-4 text-amber-950" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#EA580C]" />
                      )}
                    </button>
                  </div>

                  {/* Package Representative Photo */}
                  {pkg.image && (
                    <div className="my-3 rounded-xl overflow-hidden relative border-2 border-amber-300/80 shadow-xs group bg-amber-950">
                      <img
                        src={pkg.image}
                        alt={pkg.name[lang]}
                        className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105 opacity-95"
                        referrerPolicy="no-referrer"
                      />
                      {pkg.imageCaption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2.5 py-1.5 text-amber-100 text-[11px] font-semibold leading-snug">
                          {pkg.imageCaption[lang]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Block */}
                  <div className="my-5 p-4 rounded-xl bg-[#FAF5EC] border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-[#EA580C]">
                          ₹{pkg.price}
                        </span>
                        <span className="text-xs sm:text-sm text-[#7C2D12] line-through font-semibold">
                          ₹{pkg.originalPrice}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5C2B14] font-bold">
                        {t.oneTimeFee}
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-amber-200 text-[#4A0E17] border border-amber-400 text-xs font-black">
                      {pkg.companyDiscount || pkg.subsidyDiscount}% {t.companyDiscountCovered || t.govSubsidyCovered}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 my-4">
                    {pkg.features[lang].map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2B0E14] font-semibold">
                        <div className="w-4 h-4 rounded-full bg-amber-200 text-[#4A0E17] flex items-center justify-center shrink-0 mt-0.5 border border-amber-400">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <div className="mt-6 pt-4 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPackage(pkg.id);
                      onContinueToForm();
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#4A0E17] text-amber-100 shadow-md border border-amber-400'
                        : 'bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#C2410C] hover:from-[#FBBF24] hover:to-[#EA580C] text-[#2B0E14] border border-amber-300'
                    }`}
                  >
                    <span>{isSelected ? t.selected : t.selectPlan}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bold Guidance Disclaimer Banner */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-xl bg-amber-100/90 border-2 border-amber-600/60 shadow-sm text-center">
          <p className="text-xs sm:text-sm text-[#4A0E17] font-extrabold leading-relaxed">
            <strong>
              {lang === 'mr'
                ? 'महत्त्वाची सूचना: या सर्व डिजिटल योजनांसाठी आपण केलेले किंवा करणार असलेले पेमेंट हे केवळ डिजिटल व्यवसाय मार्गदर्शनासाठी (Guidance Only) आहे.'
                : lang === 'hi'
                ? 'महत्वपूर्ण सूचना: इन सभी डिजिटल योजनाओं हेतु आप जो भुगतान करने जा रहे हैं या किया है, वह केवल डिजिटल व्यवसाय मार्गदर्शन (Guidance Only) के लिए है।'
                : 'Important Notice: Any payment you are going to pay or have made for these digital plans is strictly for digital business guidance only.'}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
};
