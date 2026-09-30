import React, { useState } from 'react';
import { Mic, MicOff, CheckCircle, Store, User, Phone, MapPin, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, PackageId, BusinessCategory, Vendor } from '../types';
import { translations, districtsList } from '../translations';
import { growthPackages } from '../data/packages';
import { startSpeechToText, stopSpeechToText, isSpeechRecognitionSupported } from '../utils/speech';
import { addVendor } from '../db/indexedDB';
import { IndianFlag } from './IndianFlag';

interface VendorFormProps {
  lang: Language;
  selectedPackageId: PackageId;
  onSelectPackage: (pkgId: PackageId) => void;
  onVendorRegistered: (vendor: Vendor) => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({
  lang,
  selectedPackageId,
  onSelectPackage,
  onVendorRegistered,
}) => {
  const t = translations[lang];

  // Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('kirana');
  const [district, setDistrict] = useState<string>(districtsList[0]);
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMicField, setActiveMicField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMicSupported = isSpeechRecognitionSupported();

  const handleVoiceInput = (fieldName: string, setter: (val: string) => void) => {
    if (activeMicField === fieldName) {
      stopSpeechToText();
      setActiveMicField(null);
      return;
    }

    setActiveMicField(fieldName);
    startSpeechToText(
      lang,
      (transcript) => {
        setter(transcript);
        setActiveMicField(null);
      },
      () => {
        setActiveMicField(null);
      },
      (err) => {
        console.warn('Voice input notice:', err);
        setActiveMicField(null);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!shopName.trim()) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया दुकानाचे नाव प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया दुकान का नाम दर्ज करें।'
          : 'Please enter shop/stall name.'
      );
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया मालकाचे नाव प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया मालिक का नाम दर्ज करें।'
          : 'Please enter owner name.'
      );
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया सही १० अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    if (!area.trim()) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया परिसर किंवा पेठेचा पत्ता प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया इलाके या पेठ का पता दर्ज करें।'
          : 'Please enter area or ward.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPkg =
        growthPackages.find((p) => p.id === selectedPackageId) ||
        growthPackages[0];

      const newVendor = await addVendor({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        phone: cleanPhone,
        category,
        district,
        area: area.trim(),
        pincode: pincode.trim(),
        packageId: selectedPackageId,
        packageName: selectedPkg.name[lang],
        packagePrice: selectedPkg.price,
      });

      // Celebration Confetti in Kesari, Haldi, Maroon, and Kashti Green
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#f59e0b', '#7c2d12', '#047857'],
        });
      } catch (err) {
        // ignore
      }

      // Reset Form fields
      setShopName('');
      setOwnerName('');
      setPhone('');
      setArea('');
      setPincode('');

      onVendorRegistered(newVendor);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage(
        lang === 'mr'
          ? 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
          : lang === 'hi'
          ? 'पंजीकरण करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error while submitting. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPkg =
    growthPackages.find((p) => p.id === selectedPackageId) || growthPackages[0];

  return (
    <section id="registration-form-section" className="py-12 sm:py-16 px-4 sm:px-6 bg-[#FAF5EC]">
      <div className="max-w-4xl mx-auto">
        {/* Header Badge */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-200/90 text-[#4A0E17] border border-amber-400 text-xs sm:text-sm font-black mb-2 shadow-xs">
            <IndianFlag size="xs" />
            <span>
              {lang === 'mr'
                ? 'अधिकृत प्रायव्हेट लिमिटेड नोंदणी • फील्ड ऑफिसर: ९१३७७८६५०६'
                : lang === 'hi'
                ? 'आधिकारिक प्राइवेट लिमिटेड पंजीकरण • फील्ड ऑफिसर: ९१३७७८६५०६'
                : 'Official Private Limited Registration • Field Officer: +91 9137786506'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A0E17] tracking-tight font-heading">
            {t.formHeading}
          </h2>
          <p className="text-[#5C2B14] text-sm sm:text-base mt-1.5 font-semibold">
            {t.formSub}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#FFFDF7] border-2 border-amber-800/25 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-amber-950/10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-[#881337] text-sm font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#881337] shrink-0" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Package Banner Summary in Royal Maratha Maroon & Gold */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#4A0E17] via-[#6B1D2F] to-[#3B1C10] text-amber-100 flex flex-wrap items-center justify-between gap-3 shadow-md border-2 border-amber-500/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-[#2B0E14] flex items-center justify-center font-black text-xl shrink-0 shadow-sm border border-amber-300">
                  ₹{selectedPkg.price}
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-black uppercase tracking-wider">
                    {t.selectedPackageLabel}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-100 font-heading">
                    {selectedPkg.name[lang]}
                  </div>
                </div>
              </div>

              {/* Package Switcher Pills inside form */}
              <div className="flex items-center gap-1.5 bg-[#2B0E14]/80 p-1.5 rounded-xl border border-amber-500/30">
                {growthPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                      selectedPackageId === pkg.id
                        ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs border border-amber-300'
                        : 'text-amber-200 hover:bg-white/10'
                    }`}
                  >
                    ₹{pkg.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Shop Name & Owner Name with STT Mic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Shop Name */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#3B1C10]">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#EA580C]" />
                    {t.shopNameLabel} <span className="text-rose-600">*</span>
                  </span>
                  {activeMicField === 'shopName' && (
                    <span className="text-[11px] text-[#EA580C] font-bold animate-pulse">
                      {t.voiceListening}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder={t.shopNamePlaceholder}
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-semibold"
                  />
                  {isMicSupported && (
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('shopName', setShopName)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                        activeMicField === 'shopName'
                          ? 'bg-[#EA580C] text-amber-950 mic-recording'
                          : 'bg-amber-100 text-[#7C2D12] hover:bg-amber-200'
                      }`}
                      title={t.voiceMicTooltip}
                    >
                      {activeMicField === 'shopName' ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4 text-[#EA580C]" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#3B1C10]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#EA580C]" />
                    {t.ownerNameLabel} <span className="text-rose-600">*</span>
                  </span>
                  {activeMicField === 'ownerName' && (
                    <span className="text-[11px] text-[#EA580C] font-bold animate-pulse">
                      {t.voiceListening}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={t.ownerNamePlaceholder}
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-semibold"
                  />
                  {isMicSupported && (
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('ownerName', setOwnerName)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                        activeMicField === 'ownerName'
                          ? 'bg-[#EA580C] text-amber-950 mic-recording'
                          : 'bg-amber-100 text-[#7C2D12] hover:bg-amber-200'
                      }`}
                      title={t.voiceMicTooltip}
                    >
                      {activeMicField === 'ownerName' ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4 text-[#EA580C]" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: WhatsApp Number & Business Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#3B1C10] flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#047857]" />
                  {t.phoneLabel} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#7C2D12]">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-bold"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#3B1C10] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#C2410C]" />
                  {t.categoryLabel} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-bold"
                >
                  <option value="kirana">{t.catKirana}</option>
                  <option value="food">{t.catFood}</option>
                  <option value="vegetable">{t.catVegetable}</option>
                  <option value="retail">{t.catRetail}</option>
                  <option value="artisan">{t.catArtisan}</option>
                </select>
              </div>
            </div>

            {/* Row 3: District, Area/Peth, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#3B1C10] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#881337]" />
                  {t.districtLabel} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-bold"
                >
                  {districtsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area / Peth with STT Mic */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#3B1C10]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EA580C]" />
                    {t.areaLabel} <span className="text-rose-600">*</span>
                  </span>
                  {activeMicField === 'area' && (
                    <span className="text-[11px] text-[#EA580C] font-bold animate-pulse">
                      {t.voiceListening}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder={t.areaPlaceholder}
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-semibold"
                  />
                  {isMicSupported && (
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('area', setArea)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                        activeMicField === 'area'
                          ? 'bg-[#EA580C] text-amber-950 mic-recording'
                          : 'bg-amber-100 text-[#7C2D12] hover:bg-amber-200'
                      }`}
                      title={t.voiceMicTooltip}
                    >
                      {activeMicField === 'area' ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4 text-[#EA580C]" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#3B1C10] flex items-center gap-1.5">
                  {t.pincodeLabel}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.pincodePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-[#2B0E14] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] shadow-inner font-bold"
                />
              </div>
            </div>

            {/* 2 Trust & Field Verification Photographs */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-center justify-between text-xs font-black text-[#4A0E17] mb-2.5">
                <span className="flex items-center gap-1.5">
                  <IndianFlag size="xs" />
                  <span>
                    {lang === 'mr'
                      ? 'प्रत्यक्ष ऑनबोर्डिंग व फील्ड ऑफिसर पडताळणी'
                      : lang === 'hi'
                      ? 'प्रत्यक्ष ऑनबोर्डिंग व फील्ड ऑफिसर सत्यापन'
                      : 'Physical Field Officer Verification & Setup'}
                  </span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  24-Hr Service
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-amber-200/80">
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-amber-100">
                    <img
                      src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=300&q=80"
                      alt="Field Officer Verification"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[11px] text-[#5C2B14] leading-snug">
                    <strong className="block text-[#4A0E17] font-black">
                      {lang === 'mr'
                        ? 'फील्ड ऑफिसर भेट'
                        : lang === 'hi'
                        ? 'फील्ड ऑफिसर दौरा'
                        : 'On-Site Field Visit'}
                    </strong>
                    <span>
                      {lang === 'mr'
                        ? 'प्रतिनिधी स्वतः दुकानात येऊन Google Maps वर लोकेशन पिन करतील.'
                        : lang === 'hi'
                        ? 'प्रतिनिधि स्वयं दुकान पर आकर Google Maps पर लोकेशन पिन करेंगे।'
                        : 'Officer visits shop to pin precise location on Google Maps.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-amber-200/80">
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-amber-100">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                      alt="Merchant Receiving Kit"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[11px] text-[#5C2B14] leading-snug">
                    <strong className="block text-[#4A0E17] font-black">
                      {lang === 'mr'
                        ? '५-स्टार स्टँडी व पावती'
                        : lang === 'hi'
                        ? '५-स्टार स्टेंडी व रसीद'
                        : 'Standee & Official Receipt'}
                    </strong>
                    <span>
                      {lang === 'mr'
                        ? 'नोंदणी पूर्ण झाल्यावर लगेच अधिकृत पावती व स्टँडी दिली जाईल.'
                        : lang === 'hi'
                        ? 'पंजीकरण पूरा होते ही अधिकृत रसीद और स्टेंडी दी जाएगी।'
                        : 'Official onboarding receipt and review standee handover.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Declaration in Warm Haldi box */}
            <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-[#4A0E17] leading-relaxed font-bold flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
              <span>{t.termsNote}</span>
            </div>

            {/* Bold Guidance Disclaimer Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-500 text-xs text-[#7C2D12] leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
              <div>
                <strong className="font-black text-[#4A0E17] block text-xs sm:text-sm">
                  {lang === 'mr'
                    ? 'महत्त्वाची सूचना (Guidance Notice):'
                    : lang === 'hi'
                    ? 'महत्वपूर्ण सूचना (Guidance Notice):'
                    : 'Important Notice (Guidance Only):'}
                </strong>
                <strong className="font-extrabold text-[#7C2D12] block mt-0.5">
                  {lang === 'mr'
                    ? 'आपण करत असलेले किंवा करणार असलेले हे पेमेंट केवळ व्यवसाय मार्गदर्शनासाठी (Guidance Only) आहे.'
                    : lang === 'hi'
                    ? 'आप जो भुगतान कर रहे हैं या करने जा रहे हैं, वह केवल व्यवसाय मार्गदर्शन (Guidance Only) के लिए है।'
                    : 'The payment you made or are going to pay is strictly for business guidance only.'}
                </strong>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#C2410C] hover:from-[#FBBF24] hover:to-[#EA580C] text-[#2B0E14] font-black text-base sm:text-lg shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-75 cursor-pointer border-2 border-amber-300"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#2B0E14] border-t-transparent rounded-full animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <span>{t.submitBtn}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
