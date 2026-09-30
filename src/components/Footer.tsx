import React from 'react';
import { PhoneCall, ExternalLink, Landmark } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { IndianFlag } from './IndianFlag';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="bg-[#3B1C10] text-[#FFFDF7] border-t-4 border-[#D97706] pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Corporate Trust Strip */}
        <div className="mb-8 p-4 rounded-2xl bg-[#2A1408] border border-amber-600/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IndianFlag size="md" />
            <div>
              <div className="text-sm font-black text-amber-200 flex items-center gap-2">
                <span>MahaVyapaar Digital Solutions Private Limited</span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500 font-bold">
                  Pvt. Ltd. Registered
                </span>
              </div>
              <div className="text-xs text-amber-400/80 font-medium mt-0.5">
                {lang === 'mr'
                  ? 'स्थानिक व्यापारी व फेरीवाल्यांसाठी खाजगी कॉर्पोरेट डिजिटल पुढाकार • व्यवसाय मार्गदर्शन पोर्टल'
                  : lang === 'hi'
                  ? 'स्थानीय व्यापारियों व रेहड़ी-पटरी वालों के लिए निजी कॉर्पोरेट डिजिटल पहल • व्यवसाय मार्गदर्शन पोर्टल'
                  : 'Private Corporate Enterprise for Local Merchants • Business Guidance Portal'}
              </div>
            </div>
          </div>

          <div className="h-12 w-28 rounded-lg overflow-hidden border border-amber-500/50 shrink-0 hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=300&q=80"
              alt="Digital India Flag"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-amber-900/60">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#D97706] p-1 flex items-center justify-center border border-amber-300">
                <Landmark className="w-5 h-5 text-amber-950" />
              </div>
              <div>
                <h3 className="text-lg font-black font-heading text-amber-100 flex items-center gap-2">
                  <span>{t.portalTitle}</span>
                  <IndianFlag size="xs" />
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {t.tagline}
                </p>
              </div>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
              {t.footerAbout}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-heading">
              {t.footerLinks}
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-100 font-semibold">
              <li>
                <a
                  href="#packages-section"
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.linkPortal}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://aaplesarkar.mahaonline.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.linkMahaEsewa}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ondc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.linkOndc}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://udyamregistration.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.linkUdyam}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Helpline & Support */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-heading">
              {t.footerHelplineTitle}
            </h4>
            <div className="p-3.5 rounded-xl bg-[#2A1608] border border-amber-800/60 space-y-2 text-xs text-amber-200 font-medium">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">
                  {t.footerOfficerRole}
                </span>
                <span className="text-sm font-extrabold text-amber-100 block">
                  इस्माईल / फराझ (Ismail / Faraz)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <PhoneCall className="w-4 h-4 text-[#EA580C]" />
                <a href="tel:9137786506" className="hover:text-amber-100 underline font-mono text-sm">
                  +91 9137786506
                </a>
              </div>
              <div className="pt-1 flex gap-2">
                <a
                  href="https://wa.me/919137786506?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0%2C%20%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%B5%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%AA%E0%A4%BE%E0%A4%B0%20%E0%A4%A1%E0%A4%BF%E0%A4%9C%E0%A4%BF%E0%A4%9F%E0%A4%B2%20%E0%A4%B8%E0%A5%87%E0%A4%A4%E0%A5%82%20%E0%A4%AE%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%97%E0%A4%A6%E0%A4%B0%E0%A5%8D%E0%A4%B6%E0%A4%A8%E0%A4%BE%E0%A4%B8%E0%A4%BE%E0%A4%A0%E0%A5%80%20%E0%A4%B8%E0%A4%82%E0%A4%AA%E0%A4%B0%E0%A5%8D%E0%A4%95"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black inline-block transition"
                >
                  {t.footerWhatsAppBtn}
                </a>
                <a
                  href="tel:9137786506"
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-amber-950 text-[10px] font-black inline-block transition"
                >
                  {t.footerCallBtn}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="text-center space-y-2">
          <p className="text-[11px] text-amber-300/70 max-w-3xl mx-auto leading-relaxed">
            {t.disclaimer}
          </p>
          <div className="text-[11px] text-amber-300/90 font-bold flex flex-wrap items-center justify-center gap-2">
            <IndianFlag size="xs" />
            <span>{t.footerBottomNote}</span>
            <span className="text-amber-400/60">•</span>
            <span>MahaVyapaar Digital Solutions Pvt. Ltd.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
