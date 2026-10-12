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
  Download,
  Check,
  Loader2,
  Award,
  FileCheck,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, Vendor, OnboardingStage } from '../types';
import { getVendorStage, searchVendorByQuery, getAllVendors, updateVendorStage } from '../db/indexedDB';
import { IndianFlag } from './IndianFlag';
import { generateCompletionPdf } from '../utils/generateCompletionPdf';

interface StatusTrackerModalProps {
  lang: Language;
  initialQuery?: string;
  initialVendor?: Vendor | null;
  onClose: () => void;
  onOpenCertificateModal: (vendor: Vendor, tab: 'receipt' | 'shoplink' | 'standee' | 'status') => void;
  isAdmin?: boolean;
  onVendorUpdated?: (updated: Vendor) => void;
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  lang,
  initialQuery = '',
  initialVendor = null,
  onClose,
  onOpenCertificateModal,
  isAdmin = false,
  onVendorUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialVendor?.phone || initialVendor?.regNumber || initialQuery);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(initialVendor);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentVendors, setRecentVendors] = useState<Vendor[]>([]);

  // Admin Direct Login & Power State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return isAdmin || sessionStorage.getItem('mahavypaar_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminLoginBox, setShowAdminLoginBox] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

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
        if (onVendorUpdated) onVendorUpdated(updated);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleDirectAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    const cleanId = adminIdInput.trim().toLowerCase();
    const cleanPass = adminPassInput.trim();

    // Flexible matching for admin credentials
    const validIds = ['is', 'admin', 'admin name', 'is1590174', 'is1590174@gmail.com', 'ismail', 'faraz'];
    const isIdValid = validIds.includes(cleanId) || cleanId.startsWith('admin') || cleanId.startsWith('is');
    const validPasswords = ['123', 'password 123', 'password123', 'pass 123', 'admin 123', 'admin123', '1234'];
    const isPassValid = validPasswords.includes(cleanPass) || cleanPass.endsWith('123');

    if (isIdValid && isPassValid) {
      try {
        sessionStorage.setItem('mahavypaar_admin_authenticated', 'true');
        sessionStorage.setItem('mahavypaar_admin_user', cleanId || 'is');
      } catch {}
      setIsAdminAuthenticated(true);
      setShowAdminLoginBox(false);
      setAdminIdInput('');
      setAdminPassInput('');
    } else {
      setAdminLoginError(
        lang === 'mr'
          ? 'अवैध ॲडमिन क्रेडेंशियल्स (ID: is / admin, Password: 123)'
          : lang === 'hi'
          ? 'अमान्य एडमिन क्रेडेंशियल्स (ID: is / admin, Password: 123)'
          : 'Invalid admin credentials (ID: is / admin, Password: 123)'
      );
    }
  };

  const handleDownloadCompletionPdf = async (vendorToUse?: Vendor) => {
    const v = vendorToUse || activeVendor;
    if (!v) return;
    setIsGeneratingPdf(true);
    try {
      await generateCompletionPdf(v, lang);
    } catch (err) {
      console.error('Error generating completion PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleAdvanceStage = async (targetStage?: OnboardingStage) => {
    if (!activeVendor || isUpdatingStage) return;
    setIsUpdatingStage(true);
    setCompletionNotice(null);

    const nextStage = targetStage || (
      currentStage === 'submitted' ? 'doc_verification' :
      currentStage === 'doc_verification' ? 'kit_preparation' :
      'completed'
    );

    try {
      const updated = await updateVendorStage(
        activeVendor.id,
        nextStage,
        nextStage === 'completed'
          ? 'डिजिटल किट वितरण व Google Business ऑनबोर्डिंग १००% यशस्वीरीत्या पूर्ण झाले.'
          : undefined
      );

      if (updated) {
        setActiveVendor(updated);
        if (onVendorUpdated) onVendorUpdated(updated);

        if (nextStage === 'completed') {
          // Celebration confetti
          try {
            confetti({
              particleCount: 110,
              spread: 85,
              origin: { y: 0.6 },
              colors: ['#ea580c', '#f59e0b', '#7c2d12', '#10b981'],
            });
          } catch {}

          setCompletionNotice(
            lang === 'mr'
              ? '✓ ऑनबोर्डिंग १००% यशस्वीरीत्या पूर्ण झाले! पूर्तता प्रमाणपत्र PDF तयार होत आहे...'
              : lang === 'hi'
              ? '✓ ऑनबोर्डिंग १००% सफलतापूर्वक पूर्ण हुआ! पूर्णता प्रमाण-पत्र PDF तैयार हो रहा है...'
              : '✓ Onboarding 100% completed! Generating completion certificate PDF...'
          );

          // Automatically trigger download of completion PDF
          await handleDownloadCompletionPdf(updated);
        }
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleFinishOnboarding = async () => {
    await handleAdvanceStage('completed');
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
      adminModeActive: 'ॲडमिन नियंत्रण कक्ष (Admin Mode)',
      adminUnlockBtn: 'ॲडमिन लॉगिन / टप्पा पुढे न्या',
      advanceNextStage: 'पुढील टप्प्यावर जा ➔',
      finishOnboarding: '⚡ ऑनबोर्डिंग पूर्ण करा (Finish & PDF)',
      downloadCompletionPdf: 'पूर्तता प्रमाणपत्र PDF डाऊनलोड करा',
      completionPdfBtn: 'पूर्तता PDF (Certificate)',
      completedBadge: '✓ १००% ऑनबोर्डिंग पूर्ण व किट वाटप संपन्न',
      completionSuccess: 'अभिनंदन! या दुकानाचे डिजिटल ऑनबोर्डिंग १००% यशस्वीरीत्या पूर्ण झाले आहे.',
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
      adminModeActive: 'एडमिन नियंत्रण कक्ष (Admin Mode)',
      adminUnlockBtn: 'एडमिन लॉगिन / चरण आगे बढ़ाएं',
      advanceNextStage: 'अगले चरण पर बढ़ें ➔',
      finishOnboarding: '⚡ ऑनबोर्डिंग पूर्ण करें (Finish & PDF)',
      downloadCompletionPdf: 'पूर्णता प्रमाण-पत्र PDF डाउनलोड करें',
      completionPdfBtn: 'पूर्णता PDF (Certificate)',
      completedBadge: '✓ १००% ऑनबोर्डिंग पूर्ण व किट वितरण संपन्न',
      completionSuccess: 'बधाई! इस दुकान का डिजिटल ऑनबोर्डिंग १००% सफलतापूर्वक पूर्ण हो चुका है।',
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
      adminModeActive: 'Admin Control Center (Active)',
      adminUnlockBtn: 'Admin Login / Advance Track',
      advanceNextStage: 'Advance Next Stage ➔',
      finishOnboarding: '⚡ Finish Onboarding (Finish & PDF)',
      downloadCompletionPdf: 'Download Completion Certificate PDF',
      completionPdfBtn: 'Completion PDF',
      completedBadge: '✓ 100% Onboarding Completed & Dispatched',
      completionSuccess: 'Congratulations! Merchant onboarding is 100% complete.',
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
            {/* Admin Toggle / Status Button */}
            <button
              type="button"
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setShowAdminLoginBox((prev) => !prev);
                }
              }}
              title={isAdminAuthenticated ? 'Admin Mode Active' : 'Admin Login to Advance Track'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                isAdminAuthenticated
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-[#3B1C10] text-amber-200 border-amber-600/50 hover:bg-amber-900'
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Admin Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Login</span>
                </>
              )}
            </button>

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
          {/* Direct Admin Login Drawer (if requested and not authenticated) */}
          {showAdminLoginBox && !isAdminAuthenticated && (
            <div className="bg-gradient-to-r from-[#4A0E17] to-[#2B0E14] text-white p-4 rounded-xl border-2 border-amber-400 shadow-lg space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center font-black">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-100 font-heading">
                      {lang === 'mr'
                        ? 'प्रशासक थेट लॉगिन (Admin Direct Login to Advance Tracker)'
                        : lang === 'hi'
                        ? 'प्रशासक सीधा लॉगिन (Admin Direct Login to Advance Tracker)'
                        : 'Admin Direct Login to Advance Tracker'}
                    </h4>
                    <p className="text-[10px] text-amber-200/80">
                      {lang === 'mr'
                        ? 'थेट येथून ऑनबोर्डिंग टप्पे पुढे नेण्यासाठी व पूर्ण करण्यासाठी लॉगिन करा'
                        : lang === 'hi'
                        ? 'सीधे यहां से ऑनबोर्डिंग चरण आगे बढ़ाने व पूर्ण करने हेतु लॉगिन करें'
                        : 'Login to advance milestones and finish onboarding directly'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminLoginBox(false)}
                  className="text-amber-300 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDirectAdminLogin} className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Admin ID (is / admin)"
                  value={adminIdInput}
                  onChange={(e) => setAdminIdInput(e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-1.5 text-xs rounded-lg bg-[#3B1C10] border border-amber-400/60 text-amber-100 placeholder:text-amber-300/40 focus:outline-hidden font-bold"
                />
                <input
                  type="password"
                  required
                  placeholder="Password (123)"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  className="flex-1 min-w-[100px] px-3 py-1.5 text-xs rounded-lg bg-[#3B1C10] border border-amber-400/60 text-amber-100 placeholder:text-amber-300/40 focus:outline-hidden font-bold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-[#EA580C] text-amber-950 font-black text-xs rounded-lg shadow-sm border border-amber-300 hover:from-amber-400 hover:to-amber-500 cursor-pointer shrink-0"
                >
                  {lang === 'mr' ? 'अनलॉक करा' : lang === 'hi' ? 'अनलॉक करें' : 'Unlock Admin'}
                </button>
              </form>

              {adminLoginError && (
                <p className="text-[11px] text-rose-300 font-bold bg-rose-950/60 p-2 rounded border border-rose-600/50">
                  {adminLoginError}
                </p>
              )}
            </div>
          )}

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
              <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex flex-wrap items-center gap-1.5 text-xs text-[#7C2D12]">
                <span className="font-bold text-[11px]">{t.recentVendors}</span>
                {recentVendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setActiveVendor(v);
                      setSearchQuery(v.phone);
                      setSearchError(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
                      activeVendor?.id === v.id
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-amber-100/60 hover:bg-amber-200 text-[#4A0E17] border-amber-300'
                    }`}
                  >
                    {v.shopName}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Active Vendor Detail Card and Stepper */}
          {activeVendor ? (
            <div className="space-y-6">
              {/* Notice Banner when completed */}
              {completionNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{completionNotice}</span>
                </div>
              )}

              {/* Merchant Details Bar */}
              <div className="bg-[#FFFDF7] rounded-xl p-4 sm:p-5 border-2 border-amber-800/20 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold mb-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>{activeVendor.category.toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#4A0E17] font-heading">
                      {activeVendor.shopName}
                    </h3>
                    <p className="text-xs text-[#5C2B14] font-semibold mt-0.5 flex items-center gap-1">
                      <span>{activeVendor.ownerName}</span>
                      <span>•</span>
                      <span className="font-mono">{activeVendor.phone}</span>
                    </p>
                    <p className="text-[11px] text-[#7C2D12] mt-1 flex items-center gap-1">
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
                      {new Date(activeVendor.createdAt || Date.now()).toLocaleString(
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

              {/* Admin Direct Power Panel (Active when Admin Authenticated) */}
              {isAdminAuthenticated && (
                <div className="bg-gradient-to-r from-[#4A0E17] via-[#3B1C10] to-[#2B0E14] text-amber-100 p-4 sm:p-5 rounded-2xl border-2 border-amber-400 shadow-lg flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center font-black shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                        <span>{t.adminModeActive}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="text-[11px] text-amber-300/90 font-medium">
                        {lang === 'mr'
                          ? `सध्याचा टप्पा: ${t.stages[currentStage].title.split('(')[0]}`
                          : lang === 'hi'
                          ? `वर्तमान चरण: ${t.stages[currentStage].title.split('(')[0]}`
                          : `Current Stage: ${t.stages[currentStage].title.split('(')[0]}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {currentStage !== 'completed' && (
                      <button
                        type="button"
                        disabled={isUpdatingStage}
                        onClick={() => handleAdvanceStage()}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 border border-amber-300"
                      >
                        {isUpdatingStage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>{t.advanceNextStage}</span>
                      </button>
                    )}

                    {/* Finish Onboarding Button */}
                    <button
                      type="button"
                      disabled={isUpdatingStage || isGeneratingPdf}
                      onClick={handleFinishOnboarding}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md border border-emerald-300 active:scale-95 disabled:opacity-50"
                    >
                      {isUpdatingStage || isGeneratingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>
                        {currentStage === 'completed'
                          ? (isGeneratingPdf ? 'PDF तयार होत आहे...' : t.downloadCompletionPdf)
                          : t.finishOnboarding}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Prompt for Non-Admin to Unlock Admin Mode */}
              {!isAdminAuthenticated && (
                <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#7C2D12]">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#EA580C]" />
                    <span className="font-bold">
                      {lang === 'mr'
                        ? 'प्रशासक आहात का? टप्पे पुढे नेण्यासाठी व पूर्ण करण्यासाठी लॉगिन करा'
                        : lang === 'hi'
                        ? 'प्रशासक हैं? चरण आगे बढ़ाने व पूर्ण करने हेतु लॉगिन करें'
                        : 'Are you an admin? Login to proceed milestones & finish'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginBox(true)}
                    className="px-3 py-1 rounded-lg bg-[#4A0E17] hover:bg-[#3B1C10] text-amber-200 font-extrabold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 border border-amber-600/50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.adminUnlockBtn}</span>
                  </button>
                </div>
              )}

              {/* 100% Completion Celebration Banner & PDF Download Card */}
              {currentStage === 'completed' && (
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#1B4332] text-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-400 shadow-xl space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center justify-center font-black shrink-0">
                        <Award className="w-6 h-6 text-amber-300" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-black uppercase">
                          <CheckCircle className="w-3 h-3 text-emerald-300" />
                          <span>{t.completedBadge}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-amber-100 font-heading">
                          {t.completionSuccess}
                        </h4>
                        <p className="text-[11px] text-emerald-200/90 font-medium">
                          {lang === 'mr'
                            ? 'Google Maps पिन, ५-स्टार ॲक्रेलिक स्टँडी व व्हॉईस साऊंडबॉक्स वाटप १००% पूर्ण झाले आहे.'
                            : lang === 'hi'
                            ? 'Google Maps पिन, ५-स्टार एक्रेलिक स्टेंडी व वॉइस साउंडबॉक्स आवंटन १००% पूर्ण हो चुका है।'
                            : 'Google Maps pin, 5-Star acrylic standee and voice soundbox setup 100% completed.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={() => handleDownloadCompletionPdf()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#EA580C] hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg border border-amber-300 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                      ) : (
                        <Download className="w-4 h-4 text-amber-950" />
                      )}
                      <span>
                        {isGeneratingPdf
                          ? (lang === 'mr' ? 'PDF तयार होत आहे...' : 'Generating PDF...')
                          : t.downloadCompletionPdf}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4 Real-Time Onboarding Stages Stepper */}
              <div className="bg-[#FFFDF7] rounded-xl p-4 sm:p-6 border-2 border-amber-800/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-sm font-black text-[#4A0E17] uppercase tracking-wide">
                    {t.progressTitle}
                  </h4>
                  {isAdminAuthenticated && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Admin Click-to-Advance Active
                    </span>
                  )}
                </div>

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

                            <div className="flex items-center gap-1.5">
                              {/* Admin Direct Stage Advance Action */}
                              {isAdminAuthenticated && status !== 'done' && (
                                <button
                                  type="button"
                                  disabled={isUpdatingStage}
                                  onClick={() => {
                                    if (stageKey === 'completed') {
                                      handleFinishOnboarding();
                                    } else {
                                      handleAdvanceStage(stageKey);
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer flex items-center gap-1 shadow-xs border ${
                                    stageKey === 'completed'
                                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-300'
                                      : 'bg-amber-200 hover:bg-amber-300 text-[#4A0E17] border-amber-400'
                                  }`}
                                >
                                  {stageKey === 'completed' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>{lang === 'mr' ? 'पूर्ण करा (Finish)' : 'Finish'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>{lang === 'mr' ? 'हा टप्पा करा' : 'Mark Step'}</span>
                                    </>
                                  )}
                                </button>
                              )}

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
                {/* Completion PDF button if completed */}
                {currentStage === 'completed' && (
                  <button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={() => handleDownloadCompletionPdf()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 border border-emerald-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileCheck className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>{t.completionPdfBtn}</span>
                  </button>
                )}

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
