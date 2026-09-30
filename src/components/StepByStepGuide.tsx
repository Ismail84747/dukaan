import React from 'react';
import { FileText, UserCheck, MapPin, Award } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface StepByStepGuideProps {
  lang: Language;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ lang }) => {
  const t = translations[lang];

  const getStepNumber = (index: number) => {
    if (lang === 'mr' || lang === 'hi') {
      return ['१', '२', '३', '४'][index] || String(index + 1);
    }
    return String(index + 1);
  };

  const steps = [
    {
      icon: FileText,
      num: getStepNumber(0),
      title: t.step1Title,
      desc: t.step1Desc,
      color: 'from-[#EA580C] to-[#D97706]',
      badge: `${t.stepNumberLabel} ${getStepNumber(0)}`,
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=500&q=80',
      imageAlt: 'Online Merchant Application',
    },
    {
      icon: UserCheck,
      num: getStepNumber(1),
      title: t.step2Title,
      desc: t.step2Desc,
      color: 'from-[#D97706] to-[#B45309]',
      badge: `${t.stepNumberLabel} ${getStepNumber(1)}`,
      image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=500&q=80',
      imageAlt: 'Setu Mitra Officer Verification',
    },
    {
      icon: MapPin,
      num: getStepNumber(2),
      title: t.step3Title,
      desc: t.step3Desc,
      color: 'from-[#B45309] to-[#7C2D12]',
      badge: `${t.stepNumberLabel} ${getStepNumber(2)}`,
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=80',
      imageAlt: 'Google Maps Pin & Standee Setup',
    },
    {
      icon: Award,
      num: getStepNumber(3),
      title: t.step4Title,
      desc: t.step4Desc,
      color: 'from-[#7C2D12] to-[#4A0E17]',
      badge: `${t.stepNumberLabel} ${getStepNumber(3)}`,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
      imageAlt: 'Digital Storefront Growth & 5-Star Reviews',
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#FAF5EC] border-b border-amber-800/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-[#4A0E17] border border-amber-400 text-xs font-black mb-2 shadow-xs">
            <span>{t.stepsBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A0E17] tracking-tight font-heading">
            {t.stepsHeading}
          </h2>
          <p className="text-[#5C2B14] text-sm sm:text-base mt-2 font-semibold">
            {t.stepsSub}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#FFFDF7] rounded-2xl p-6 border-2 border-amber-800/20 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md border border-amber-300`}
                    >
                      <Icon className="w-6 h-6 text-amber-100" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-[#4A0E17] border border-amber-300">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#4A0E17] mb-2 font-heading">
                    {step.title}
                  </h3>

                  {/* Step Representative Image */}
                  <div className="my-2.5 rounded-xl overflow-hidden relative border border-amber-300/80 shadow-xs h-28 bg-amber-950 group">
                    <img
                      src={step.image}
                      alt={step.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C2B14] leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] font-black text-[#EA580C] flex items-center gap-1">
                  <span>{t.stepQuickTurnaround}</span>
                  <span className="text-amber-500">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
