import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  MessageSquare,
  FileText,
  QrCode,
  Store,
  MapPin,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Language, Vendor, OnboardingStage } from '../types';
import { getVendorStage, searchVendorByQuery, getAllVendors } from '../db/indexedDB';
import { IndianFlag } from './IndianFlag';

interface StatusTrackerModalProps {
  lang: Language;
  initialQuery?: string;
  initialVendor?: Vendor | null;
  onClose: () => void;
  onOpenCertificateModal: (vendor: Vendor, tab: 'receipt' | 'shoplink' | 'standee' | 'status') => void;
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  lang,
  initialQuery = '',
  initialVendor = null,
  onClose,
  onOpenCertificateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialVendor?.phone || initialVendor?.regNumber || initialQuery);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(initialVendor);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentVendors, setRecentVendors] = useState<Vendor[]>([]);

  // Load recent vendors for quick selection
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const list = await getAllVendors();
        setRecentVendors(list.slice(0, 5));
        if (!activeVendor && list.length > 0 && !initialQuery) {
          setActiveVendor(list[0]);
          setSearchQuery(list[0].phone);
        }
      } catch (err) {
        console.error('Error loading recent vendors:', err);
      }
    };
    loadRecent();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError(
        lang === 'mr'
          ? 'कृपया आपला १० अंकी मोबाईल नंबर किंवा नोंदणी क्रमांक टाका'
          : lang === 'hi'
          ? 'कृपया अपना १० अंकों का मोबाइल नंबर या पंजीकरण संख्या दर्ज करें'
          : 'Please enter your 10-digit mobile number or registration ID'
      );
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const found = await searchVendorByQuery(searchQuery.trim());
      if (found) {
        setActiveVendor(found);
      } else {
        setActiveVendor(null);
        setSearchError(
          lang === 'mr'
            ? 'या नंबर किंवा क्रमांकावर कोणतीही नोंदणी आढळली नाही. कृपया तपासून पुन्हा प्रयत्न करा.'
            : lang === 'hi'
            ? 'इस नंबर या आईडी पर कोई पंजीकरण नहीं मिला। कृपया जांच कर पुनः प्रयास करें।'
            : 'No registered vendor found for this query. Please check and try again.'
        );
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Error looking up record');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (!activeVendor) return;
    try {
      const list = await getAllVendors();
      const updated = list.find((v) => v.id === activeVendor.id);
      if (updated) {
        setActiveVendor(updated);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const stageOrder: OnboardingStage[] = ['submitted', 'doc_verification', 'kit_preparation', 'completed'];

  const currentStage: OnboardingStage = activeVendor ? getVendorStage(activeVendor) : 'doc_verification';
  const currentStageIndex = stageOrder.indexOf(currentStage);

  const getStageStatus = (stage: OnboardingStage) => {
    const idx = stageOrder.indexOf(stage);
    if (idx < currentStageIndex) return 'done';
    if (idx === currentStageIndex) return 'active';
    return 'pending';
  };

  const progressPercent = Math.round(((currentStageIndex + 1) / stageOrder.length) * 100);

  const t = {
    mr: {
      modalTitle: 'थेट डिजिटल ऑनबोर्डिंग प्रगती ट्रॅकर',
      modalSubtitle: 'आपल्या दुकानाच्या डिजिटल सेतू प्रक्रियेची खरी वेळ स्थिती',
      searchPlaceholder: 'आपला १०-अंकी मोबाईल किंवा नोंदणी क्र. (उदा. 9822... किंवा MH-SETU...)',
      btnSearch: 'स्थिती तपासा',
      recentVendors: 'नुकतेच नोंदणीकृत व्यवसाय:',
      regId: 'नोंदणी क्रमांक',
      date: 'नोंदणी तारीख',
      package: 'निवडलेले पॅकेज',
      assignedOfficer: 'नियुक्त डिजिटल सेतू मित्र',
      officerSub: 'थेट ऑन-साईट पडताळणी व किट वितरणासाठी जबाबदार',
      callOfficer: 'थेट कॉल करा',
      waOfficer: 'WhatsApp मेसेज पाठवा',
      progressTitle: 'ऑनबोर्डिंग टप्पे व प्रगती',
      viewReceipt: 'पावती पहा (Slip)',
      viewStandee: '५★ स्टँडी पहा',
      stages: {
        submitted: {
          title: 'अर्ज नोंदणी प्राप्त (Application Received)',
          desc: 'नोंदणी अर्ज पोर्टलवर यशस्वीरीत्या नोंदवला गेला आहे.',
          eta: 'पूर्ण',
        },
        doc_verification: {
          title: 'कागदपत्र पडताळणी (Document Verification)',
          desc: 'नियुक्त प्रतिनिधीकडून दुकानाची माहिती व पत्ता पडताळणी प्रक्रियेत आहे.',
          eta: '१ ते २ तास',
        },
        kit_preparation: {
          title: 'डिजिटल किट तयारी (Digital Kit Preparation)',
          desc: 'Google Maps पिन, अधिकृत UPI QR स्टँडी व साऊंडबॉक्स कॉन्फिगरेशन तयार होत आहे.',
          eta: '६ ते १२ तास',
        },
        completed: {
          title: 'ऑनबोर्डिंग पूर्ण (Onboarding Complete)',
          desc: 'दुकान Google वर लाइव्ह झाले आहे आणि अधिकृत डिजिटल सेतू किट तयार आहे.',
          eta: 'यशस्वी',
        },
      },
    },
    hi: {
      modalTitle: 'रियल-टाइम डिजिटल ऑनबोर्डिंग प्रगति ट्रैकर',
      modalSubtitle: 'आपकी दुकान की डिजिटल सेतु प्रक्रिया की वास्तविक स्थिति',
      searchPlaceholder: 'अपना १०-अंकों का मोबाइल या रजिस्ट्रेशन नं. (उदा. 9822... या MH-SETU...)',
      btnSearch: 'स्थिति जांचें',
      recentVendors: 'हाल ही में पंजीकृत व्यापारी:',
      regId: 'पंजीकरण संख्या',
      date: 'पंजीकरण तिथि',
      package: 'चुना हुआ पैकेज',
      assignedOfficer: 'नियुक्त डिजिटल सेतु मित्र',
      officerSub: 'ऑन-साइट सत्यापन व किट वितरण हेतु अधिकृत',
      callOfficer: 'कॉल करें',
      waOfficer: 'WhatsApp भेजें',
      progressTitle: 'ऑनबोर्डिंग चरण व प्रगति',
      viewReceipt: 'रसीद देखें (Slip)',
      viewStandee: '५★ स्टेंडी देखें',
      stages: {
        submitted: {
          title: 'आवेदन प्राप्त (Application Received)',
          desc: 'आवेदन पोर्टल पर सफलतापूर्वक दर्ज कर लिया गया है।',
          eta: 'पूर्ण',
        },
        doc_verification: {
          title: 'दस्तावेज़ सत्यापन (Document Verification)',
          desc: 'प्रतिनिधि द्वारा दुकान के विवरण व पते का सत्यापन किया जा रहा है।',
          eta: '१ से २ घंटे',
        },
        kit_preparation: {
          title: 'डिजिटल किट निर्माण (Digital Kit Preparation)',
          desc: 'Google Maps पिन, UPI QR स्टेंडी व साउंडबॉक्स मैपिंग तैयार हो रही है।',
          eta: '६ से १२ घंटे',
        },
        completed: {
          title: 'ऑनबोर्डिंग पूर्ण (Onboarding Complete)',
          desc: 'दुकान Google पर लाइव हो चुकी है और डिजिटल किट तैयार है।',
          eta: 'सफल',
        },
      },
    },
    en: {
      modalTitle: 'Live Digital Onboarding Status Tracker',
      modalSubtitle: 'Real-time progress of your merchant digital setu setup',
      searchPlaceholder: 'Enter 10-digit mobile or Application ID (e.g. 9822... or MH-SETU...)',
      btnSearch: 'Track Status',
      recentVendors: 'Recently Registered Businesses:',
      regId: 'Application ID',
      date: 'Registration Date',
      package: 'Selected Package',
      assignedOfficer: 'Assigned Digital Setu Mitra',
      officerSub: 'Designated field specialist for on-site verification & physical kit delivery',
      callOfficer: 'Call Specialist',
      waOfficer: 'Send WhatsApp',
      progressTitle: 'Onboarding Milestones & Progress',
      viewReceipt: 'View Slip',
      viewStandee: 'View 5★ Standee',
      stages: {
        submitted: {
          title: 'Application Received',
          desc: 'Onboarding application successfully registered on the portal.',
          eta: 'Done',
        },
        doc_verification: {
          title: 'Document Verification',
          desc: 'Designated officer verifying shop category, contact, and address.',
          eta: '1 to 2 hrs',
        },
        kit_preparation: {
          title: 'Digital Kit Preparation',
          desc: 'Google Maps pin, acrylic QR standee, and voice soundbox setup in progress.',
          eta: '6 to 12 hrs',
        },
        completed: {
          title: 'Onboarding Complete',
          desc: 'Business profile active on Google Maps and physical kit ready for delivery.',
          eta: 'Live',
        },
      },
    },
  }[lang];

  const assignedOfficer = activeVendor?.assignedTo || 'Ismail';
  const assignedPhone = activeVendor?.assignedPhone || '9137786506';

  const officerWhatsAppUrl = activeVendor
    ? `https://wa.me/91${assignedPhone}?text=${encodeURIComponent(
        `नमस्कार ${assignedOfficer} सर, मी ${activeVendor.ownerName} बोलत आहे. माझ्या दुकानाचा (${activeVendor.shopName}, अर्ज क्र. ${activeVendor.regNumber}) ऑनबोर्डिंग स्टेटस जाणून घ्यायचा आहे.`
      )}`
    : `https://wa.me/91${assignedPhone}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-[#FAF5EC] rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-800/40 text-[#2B0E14] my-4">
        {/* Header Bar */}
        <div className="bg-[#4A0E17] text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-[#4A0E17] flex items-center justify-center font-black shadow-md border border-amber-300">
              <Clock className="w-5 h-5 text-[#4A0E17]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-100 font-heading">
                  {t.modalTitle}
                </h2>
                <IndianFlag size="xs" />
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeVendor && (
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Status"
                className="p-1.5 rounded-lg bg-[#3B1C10] text-amber-300 hover:text-white hover:bg-amber-900 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#3B1C10] text-amber-200 hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Lookup Input Form */}
          <form
            onSubmit={handleSearch}
            className="bg-[#FFFDF7] p-3.5 sm:p-4 rounded-xl border-2 border-amber-800/20 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-amber-50/50 border border-amber-300 focus:outline-hidden focus:border-[#EA580C] focus:bg-white font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-amber-600 hover:to-amber-700 text-amber-950 font-black text-xs sm:text-sm rounded-lg shadow-sm border border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.btnSearch}</span>
              </button>
            </div>

            {searchError && (
              <p className="mt-2 text-xs text-rose-700 font-bold bg-rose-50 p-2 rounded border border-rose-200">
                {searchError}
              </p>
            )}

            {/* Quick switcher buttons if recent registered vendors exist */}
            {recentVendors.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-[#7C2D12] font-bold">{t.recentVendors}</span>
                {recentVendors.map((rv) => (
                  <button
                    key={rv.id}
                    type="button"
                    onClick={() => {
                      setActiveVendor(rv);
                      setSearchQuery(rv.phone);
                    }}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-bold cursor-pointer transition ${
                      activeVendor?.id === rv.id
                        ? 'bg-[#4A0E17] text-amber-200 border-amber-700'
                        : 'bg-amber-100 text-[#4A0E17] hover:bg-amber-200 border-amber-300'
                    }`}
                  >
                    {rv.shopName} ({rv.phone})
                  </button>
                ))}
              </div>
            )}
          </form>

          {activeVendor ? (
            <div className="space-y-6">
              {/* Active Vendor Summary Card */}
              <div className="bg-[#FFFDF7] rounded-xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#4A0E17] border border-amber-300 text-xs font-black mb-1">
                      <Store className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{activeVendor.shopName}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#4A0E17] font-heading">
                      {activeVendor.ownerName}
                    </h3>
                    <p className="text-xs text-[#5C2B14] flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-[#EA580C]" />
                      <span>
                        {activeVendor.area}, {activeVendor.district} - {activeVendor.pincode}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#7C2D12] block">
                      {t.regId}:
                    </span>
                    <span className="font-mono font-black text-sm text-[#EA580C] bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 inline-block">
                      {activeVendor.regNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">
                      {new Date(activeVendor.createdAt).toLocaleString(
                        lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN'
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual header */}
                <div className="mt-4 pt-3 border-t border-amber-200">
                  <div className="flex items-center justify-between text-xs font-black text-[#4A0E17] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t.progressTitle}</span>
                    </span>
                    <span className="text-[#EA580C] font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-amber-200/80 rounded-full overflow-hidden border border-amber-400 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-[#EA580C] to-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Real-Time Onboarding Stages Stepper */}
              <div className="bg-[#FFFDF7] rounded-xl p-4 sm:p-6 border-2 border-amber-800/15 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-[#4A0E17] uppercase tracking-wide border-b border-amber-200 pb-2">
                  {t.progressTitle}
                </h4>

                <div className="space-y-4">
                  {stageOrder.map((stageKey, idx) => {
                    const status = getStageStatus(stageKey);
                    const stageInfo = t.stages[stageKey];
                    const isLast = idx === stageOrder.length - 1;

                    return (
                      <div key={stageKey} className="relative flex items-start gap-3 sm:gap-4">
                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-4.5 sm:left-5 top-10 bottom--3 w-0.5 transition-colors ${
                              status === 'done' ? 'bg-emerald-500' : 'bg-amber-200'
                            }`}
                          />
                        )}

                        {/* Stage Circle Icon */}
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all font-black text-xs shadow-xs border-2 ${
                            status === 'done'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : status === 'active'
                              ? 'bg-amber-500 text-[#4A0E17] border-amber-300 animate-pulse ring-4 ring-amber-200'
                              : 'bg-amber-100 text-amber-700 border-amber-300'
                          }`}
                        >
                          {status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : status === 'active' ? (
                            <Clock className="w-5 h-5 text-[#4A0E17]" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        {/* Stage Content Card */}
                        <div
                          className={`flex-1 p-3 sm:p-3.5 rounded-xl border transition-all ${
                            status === 'active'
                              ? 'bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300'
                              : status === 'done'
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : 'bg-slate-50/50 border-slate-200 opacity-70'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <h5
                              className={`text-xs sm:text-sm font-extrabold ${
                                status === 'active'
                                  ? 'text-[#4A0E17]'
                                  : status === 'done'
                                  ? 'text-emerald-900'
                                  : 'text-slate-700'
                              }`}
                            >
                              {stageInfo.title}
                            </h5>

                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                status === 'done'
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : status === 'active'
                                  ? 'bg-amber-200 text-[#4A0E17] border border-amber-400'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {status === 'done'
                                ? '✓ पूर्ण'
                                : status === 'active'
                                ? 'प्रक्रियेत (In Progress)'
                                : 'प्रलंबित (Pending)'}
                            </span>
                          </div>

                          <p className="text-xs text-[#5C2B14] font-medium leading-relaxed">
                            {stageInfo.desc}
                          </p>

                          {/* Stage Milestone History Note */}
                          {activeVendor.stageHistory?.find((h) => h.stage === stageKey) && (
                            <div className="mt-2 pt-1.5 border-t border-amber-200/60 text-[11px] text-[#7C2D12] flex items-center justify-between">
                              <span className="font-semibold italic">
                                {activeVendor.stageHistory.find((h) => h.stage === stageKey)?.note}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {new Date(
                                  activeVendor.stageHistory.find((h) => h.stage === stageKey)!.timestamp
                                ).toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Designated Digital Mitra Officer Card */}
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl p-4 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black text-[#7C2D12] uppercase tracking-wide block">
                    {t.assignedOfficer}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-sm text-[#4A0E17]">
                      {assignedOfficer} • MahaVyapaar Setu Mitra
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C2B14] mt-0.5 font-medium">
                    {t.officerSub}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${assignedPhone}`}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#4A0E17] hover:bg-[#3B1C10] text-amber-200 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.callOfficer}</span>
                  </a>

                  <a
                    href={officerWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.waOfficer}</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons to View Documents */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCertificateModal(activeVendor, 'receipt');
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#4A0E17] font-bold text-xs flex items-center gap-1.5 border border-amber-300 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t.viewReceipt}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCertificateModal(activeVendor, 'standee');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#4A0E17] font-bold text-xs flex items-center gap-1.5 border border-amber-300 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t.viewStandee}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#7C2D12]">
              <Search className="w-10 h-10 mx-auto text-amber-400 mb-2" />
              <p className="font-bold text-sm">
                {lang === 'mr'
                  ? 'आपला मोबाईल नंबर किंवा नोंदणी क्रमांक टाकून प्रगती तपासा'
                  : 'Enter your mobile number or Registration ID to track live progress'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
