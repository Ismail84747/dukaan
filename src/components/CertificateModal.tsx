import React, { useState } from 'react';
import { X, Printer, Star, CheckCircle, MessageSquare, PhoneCall, Copy, Check, UserCheck, MapPin, Store, Clock, QrCode, Sparkles, Download, FileText, Loader2 } from 'lucide-react';
import { Vendor, Language, OnboardingStage } from '../types';
import { translations } from '../translations';
import { generateQRCodeSVG, getVendorShopUrl } from '../utils/qrCode';
import { getVendorStage } from '../db/indexedDB';
import { IndianFlag } from './IndianFlag';
import { DigitalShopQRGenerator } from './DigitalShopQRGenerator';
import { generateReceiptPDF } from '../utils/generateReceiptPdf';
import {
  ASSIGNED_PHONE_FORMATTED,
  getAssignedOfficer,
  getWhatsAppNotificationUrl,
  getSMSNotificationUrl,
  getVendorSMSReceiptUrl,
  buildAssignmentWhatsAppMessage,
  buildVendorSMSReceipt,
  formatOfficerName,
} from '../utils/assignment';

interface CertificateModalProps {
  vendor: Vendor;
  lang: Language;
  initialTab?: 'receipt' | 'shoplink' | 'standee' | 'status';
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  vendor,
  lang,
  initialTab = 'receipt',
  onClose,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'receipt' | 'shoplink' | 'standee' | 'status'>(
    initialTab === 'status'
      ? 'status'
      : initialTab === 'standee'
      ? 'standee'
      : initialTab === 'shoplink'
      ? 'shoplink'
      : 'receipt'
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isShopUrlCopied, setIsShopUrlCopied] = useState(false);
  const [notified, setNotified] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const assignedOfficer = vendor.assignedTo || getAssignedOfficer(vendor);
  const assignedPhone = ASSIGNED_PHONE_FORMATTED;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateReceiptPDF(vendor, lang);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF receipt:', err);
      // Fallback to browser print/save as PDF
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const standeeQrSvg = generateQRCodeSVG(
    `https://search.google.com/local/writereview?placeid=${vendor.id}`,
    {
      size: 180,
      color: '#4A0E17',
      bgColor: '#FAF5EC',
      centerLabel: '5★',
    }
  );

  const whatsappUrl = getWhatsAppNotificationUrl(vendor, assignedOfficer, lang);
  const smsUrl = getSMSNotificationUrl(vendor, assignedOfficer, lang);
  const vendorSmsUrl = getVendorSMSReceiptUrl(vendor, assignedOfficer, lang);
  const messagePreview = buildAssignmentWhatsAppMessage(vendor, assignedOfficer, lang);

  const labels = {
    mr: {
      notifyTitle: `${assignedOfficer} (${assignedPhone}) यांना व्हॉट्सॲप / SMS द्वारे सूचना`,
      notifySub: 'दुकानाच्या ऑनबोर्डिंगची त्वरित माहिती नियुक्त प्रतिनिधीला पाठवा',
      notified: '✓ सूचना पाठवली',
      smsVendor: 'मला (दुकानदाराला) SMS पाठवा',
      smsOfficer: `अधिकारी (${assignedOfficer}) यांना SMS`,
      whatsappOfficer: `व्हॉट्सॲपवर पाठवा (WhatsApp 9137786506)`,
      copied: 'कॉपी झाले!',
      copySms: 'संपूर्ण SMS कॉपी करा',
      previewTitle: 'पाठवल्या जाणाऱ्या मेसेजचा नमुना (Message Preview)',
      assignedLabel: 'नियुक्त:',
      verifiedAssigned: 'नोंदणी व नियुक्ती यशस्वी (Verified & Assigned)',
      receiptHeading: 'महाव्यापार डिजिटल सोल्युशन्स प्रा. लि. • ऑनबोर्डिंग पावती',
      appNumber: 'अर्ज क्रमांक:',
      feePaid: 'शुल्क भरणा:',
      feeNote: 'मार्गदर्शन फी (Paid)',
      importantNotice: 'महत्त्वाची सूचना (Guidance Notice):',
      importantNoticeDesc: 'आपण केलेले हे पेमेंट केवळ व्यवसाय मार्गदर्शनासाठी (Guidance Only) आहे. महाव्यापार डिजिटल सोल्युशन्स ही एक खाजगी कंपनी आहे.',
      shopName: 'दुकानाचे नाव:',
      ownerProprietor: 'मालक / चालक:',
      addressArea: 'पत्ता व परिसर:',
      selectedScheme: 'निवडलेला कंपनी प्लॅन:',
      assignedRep: 'नियुक्त डिजिटल सेतू प्रतिनिधी',
      assignedSub: '२४ तासांत गुगल मॅप्स पिन व ५-स्टार रिव्ह्यू स्टँडी वितरणासाठी नियुक्त',
      directContact: 'थेट संपर्क क्रमांक:',
      callNow: 'थेट कॉल करा',
      googleVerified: 'Google प्रमाणित व्यवसाय',
      mahaVyapaarSetu: 'महाव्यापार सेतू',
      standeeSetupPreview: 'दुकानातील काउंटरवर प्रत्यक्ष ॲक्रेलिक स्टँडी अशी दिसेल (Sample Counter Display):',
    },
    hi: {
      notifyTitle: `${assignedOfficer} (${assignedPhone}) को व्हाट्सएप / SMS द्वारा सूचना`,
      notifySub: 'दुकान ऑनबोर्डिंग की त्वरित जानकारी नियुक्त प्रतिनिधि को भेजें',
      notified: '✓ सूचना भेजी गई',
      smsVendor: 'मुझे (दुकानदार को) SMS भेजें',
      smsOfficer: `अधिकारी (${assignedOfficer}) को SMS`,
      whatsappOfficer: `व्हाट्सएप पर भेजें (WhatsApp 9137786506)`,
      copied: 'कॉपी हुआ!',
      copySms: 'पूरा SMS कॉपी करें',
      previewTitle: 'भेजे जाने वाले संदेश का प्रारूप (Message Preview)',
      assignedLabel: 'नियुक्त:',
      verifiedAssigned: 'पंजीकरण व आवंटन सफल (Verified & Assigned)',
      receiptHeading: 'महाव्यापार डिजिटल सॉल्यूशंस प्रा. लि. • ऑनबोर्डिंग रसीद',
      appNumber: 'आवेदन क्रमांक:',
      feePaid: 'शुल्क भुगतान:',
      feeNote: 'मार्गदर्शन शुल्क (भुगतान)',
      importantNotice: 'महत्वपूर्ण सूचना (Guidance Notice):',
      importantNoticeDesc: 'आपके द्वारा किया गया यह भुगतान केवल व्यवसाय मार्गदर्शन (Guidance Only) के लिए है। महाव्यापार डिजिटल सॉल्यूशंस एक प्राइवेट लिमिटेड कंपनी है।',
      shopName: 'दुकान का नाम:',
      ownerProprietor: 'मालिक / प्रोपराइटर:',
      addressArea: 'पता व क्षेत्र:',
      selectedScheme: 'चुना गया कंपनी प्लान:',
      assignedRep: 'नियुक्त डिजिटल सेतु प्रतिनिधि',
      assignedSub: '२४ घंटे में गूगल मैप्स पिन व ५-स्टार रिव्यू स्टेंडी वितरण हेतु नियुक्त',
      directContact: 'सीधा संपर्क नंबर:',
      callNow: 'तुरंत कॉल करें',
      googleVerified: 'Google सत्यापित व्यवसाय',
      mahaVyapaarSetu: 'महाव्यापार सेतु',
      standeeSetupPreview: 'दुकान के काउंटर पर वास्तविक एक्रेलिक स्टेंडी ऐसी दिखेगी (Sample Counter Display):',
    },
    en: {
      notifyTitle: `Instant WhatsApp / SMS Alert to ${assignedOfficer} (${assignedPhone})`,
      notifySub: 'Send onboarding dispatch alert to assigned field specialist',
      notified: '✓ Alert Sent',
      smsVendor: 'Send SMS to Me (Merchant)',
      smsOfficer: `Send SMS to Officer (${assignedOfficer})`,
      whatsappOfficer: `Send on WhatsApp (9137786506)`,
      copied: 'Copied!',
      copySms: 'Copy Full SMS Text',
      previewTitle: 'Message Preview Template',
      assignedLabel: 'Assigned:',
      verifiedAssigned: 'Registration & Officer Assignment Successful',
      receiptHeading: 'MahaVyapaar Digital Solutions Pvt. Ltd. • Onboarding Slip',
      appNumber: 'Application ID:',
      feePaid: 'Fee Paid:',
      feeNote: 'Guidance Fee (Paid)',
      importantNotice: 'Important Notice (Guidance Only):',
      importantNoticeDesc: 'This payment is strictly for private digital business guidance and onboarding assistance by MahaVyapaar Digital Solutions Private Limited.',
      shopName: 'Shop Name:',
      ownerProprietor: 'Owner / Proprietor:',
      addressArea: 'Address & Area:',
      selectedScheme: 'Selected Company Plan:',
      assignedRep: 'Designated Digital Setu Officer',
      assignedSub: 'Assigned for 24-hr Google Maps pin verification & 5-star review standee',
      directContact: 'Direct Contact Number:',
      callNow: 'Call Officer',
      googleVerified: 'Google Verified Business',
      mahaVyapaarSetu: 'MahaVyapaar Setu',
      standeeSetupPreview: 'How your acrylic 5-star review standee looks on your store counter:',
    },
  }[lang];

  const handleCopyMessage = () => {
    const textToCopy = buildVendorSMSReceipt(vendor, assignedOfficer, lang);
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const stageOrder: OnboardingStage[] = ['submitted', 'doc_verification', 'kit_preparation', 'completed'];
  const currentStage = getVendorStage(vendor);
  const currentStageIndex = stageOrder.indexOf(currentStage);
  const progressPercent = Math.round(((currentStageIndex + 1) / stageOrder.length) * 100);

  const stageTitles: Record<Language, Record<OnboardingStage, { title: string; desc: string; eta: string }>> = {
    mr: {
      submitted: { title: '१. अर्ज नोंदणी प्राप्त', desc: 'नोंदणी अर्ज पोर्टलवर यशस्वीरीत्या दाखल झाला आहे.', eta: 'पूर्ण ✓' },
      doc_verification: { title: '२. कागदपत्र पडताळणी', desc: 'नियुक्त सेतू अधिकारी दुकानाचा पत्ता व माहिती पडताळत आहेत.', eta: '१ ते २ तास' },
      kit_preparation: { title: '३. डिजिटल किट तयारी', desc: 'Google Maps पिन, ५-स्टार QR स्टँडी व व्हॉईस बॉक्स तयार होत आहे.', eta: '६ ते १२ तास' },
      completed: { title: '४. ऑनबोर्डिंग पूर्ण', desc: 'Google वर दुकान लाइव्ह झाले व अधिकृत किट वितरणासाठी सज्ज आहे.', eta: 'सफल' },
    },
    hi: {
      submitted: { title: '१. आवेदन प्राप्त', desc: 'आवेदन पोर्टल पर सफलतापूर्वक दर्ज किया गया है।', eta: 'पूर्ण ✓' },
      doc_verification: { title: '२. दस्तावेज़ सत्यापन', desc: 'नियुक्त सेतु अधिकारी दुकान का पता व विवरण सत्यापित कर रहे हैं।', eta: '१ से २ घंटे' },
      kit_preparation: { title: '३. डिजिटल किट निर्माण', desc: 'Google Maps पिन, ५-स्टार QR स्टेंडी व वॉइस बॉक्स तैयार हो रहा है।', eta: '६ से १२ घंटे' },
      completed: { title: '४. ऑनबोर्डिंग पूर्ण', desc: 'Google पर दुकान लाइव हो चुकी है और किट तैयार है।', eta: 'सफल' },
    },
    en: {
      submitted: { title: '1. Application Received', desc: 'Registration successfully received on the portal.', eta: 'Done ✓' },
      doc_verification: { title: '2. Document Verification', desc: 'Assigned specialist verifying shop address & documents.', eta: '1-2 hrs' },
      kit_preparation: { title: '3. Digital Kit Preparation', desc: 'Google Maps geopin, 5-Star QR acrylic standee being setup.', eta: '6-12 hrs' },
      completed: { title: '4. Onboarding Complete', desc: 'Shop is live on Google Maps and digital kit is ready.', eta: 'Live' },
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#FAF5EC] rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-800/40 text-[#2B0E14] my-4">
        {/* Top Control Bar */}
        <div className="bg-[#4A0E17] text-amber-100 p-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-600 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-[#2B0E14] flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base font-heading">
                {vendor.shopName}
              </div>
              <div className="text-xs text-amber-300 font-medium">
                {vendor.regNumber} • {labels.assignedLabel} {assignedOfficer} ({assignedPhone})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-[#2B0E14] p-1 rounded-lg border border-amber-500/40">
              <button
                type="button"
                onClick={() => setActiveTab('receipt')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  activeTab === 'receipt'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                {t.btnViewCert}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shoplink')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'shoplink'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'mr'
                    ? 'डिजिटल दुकान QR'
                    : lang === 'hi'
                    ? 'डिजिटल दुकान QR'
                    : 'Shop QR'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'status'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'mr'
                    ? 'प्रगती ट्रॅकर'
                    : lang === 'hi'
                    ? 'प्रगति ट्रैकर'
                    : 'Progress'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('standee')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  activeTab === 'standee'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-amber-950 shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                {t.btnReviewStandee}
              </button>
            </div>

            {/* Download PDF Receipt Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-emerald-400 disabled:opacity-60 active:scale-95"
              title={lang === 'mr' ? 'अधिकृत ऑनबोर्डिंग पावती PDF डाऊनलोड करा' : lang === 'hi' ? 'आधिकारिक ऑनबोर्डिंग रसीद PDF डाउनलोड करें' : 'Download Official Onboarding Receipt PDF'}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : pdfSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>
                {isGeneratingPdf
                  ? (lang === 'mr' ? 'PDF तयार होत आहे...' : lang === 'hi' ? 'PDF बन रही है...' : 'Generating PDF...')
                  : pdfSuccess
                  ? (lang === 'mr' ? 'PDF डाऊनलोड झाली!' : lang === 'hi' ? 'PDF डाउनलोड हुई!' : 'Downloaded!')
                  : (lang === 'mr' ? 'PDF पावती डाऊनलोड' : lang === 'hi' ? 'PDF रसीद डाउनलोड' : 'Download PDF')}
              </span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D97706] text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border border-amber-300"
            >
              <Printer className="w-4 h-4" />
              <span>{t.btnPrint}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#2B0E14] text-amber-200 hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[80vh]">
          {activeTab === 'receipt' ? (
            /* ========================================================
               DIGITAL ONBOARDING SLIP & FIELD OFFICER ASSIGNMENT
               ======================================================== */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Quick Action Download PDF Banner */}
              <div className="bg-gradient-to-r from-[#4A0E17] via-[#5C1D24] to-[#2B0E14] text-white p-4 rounded-2xl border-2 border-amber-400 shadow-lg flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-black">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-100 font-heading">
                      {lang === 'mr'
                        ? 'अधिकृत ऑनबोर्डिंग पावती (Official Receipt PDF)'
                        : lang === 'hi'
                        ? 'आधिकारिक ऑनबोर्डिंग रसीद (Official Receipt PDF)'
                        : 'Official Onboarding Receipt Document'}
                    </h4>
                    <p className="text-[11px] text-amber-200/90 font-medium">
                      {lang === 'mr'
                        ? 'कंपनी शिक्का, नोंदणी क्रमांक व प्रतिनिधी माहितीसह संपूर्ण A4 PDF सेव्ह करा'
                        : lang === 'hi'
                        ? 'कंपनी मुहर, पंजीकरण संख्या व प्रतिनिधि विवरण सहित A4 PDF सुरक्षित करें'
                        : 'Download complete official A4 slip with company seal, registration ID & officer info'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-300 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pdfSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>
                      {isGeneratingPdf
                        ? (lang === 'mr' ? 'PDF तयार होत आहे...' : 'Generating...')
                        : pdfSuccess
                        ? (lang === 'mr' ? 'PDF डाऊनलोड झाली!' : 'Downloaded!')
                        : (lang === 'mr' ? 'PDF डाऊनलोड करा' : lang === 'hi' ? 'PDF डाउनलोड करें' : 'Download PDF Slip')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs flex items-center gap-1.5 border border-amber-400/40 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.btnPrint}</span>
                  </button>
                </div>
              </div>

              {/* Main Receipt Sheet */}
              <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-800/20 pb-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{labels.verifiedAssigned}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#4A0E17] font-heading flex items-center gap-2">
                      <span>{labels.receiptHeading}</span>
                      <IndianFlag size="xs" />
                    </h3>
                    <p className="text-xs text-[#7C2D12] font-semibold">
                      {labels.appNumber} <span className="font-mono font-black text-[#EA580C]">{vendor.regNumber}</span> • {new Date(vendor.createdAt || Date.now()).toLocaleString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#7C2D12] font-bold block">{labels.feePaid}</span>
                    <span className="text-2xl font-black text-emerald-700">₹{vendor.packagePrice}</span>
                    <span className="text-[10px] text-emerald-800 font-bold block">{labels.feeNote}</span>
                  </div>
                </div>

                {/* Bold Guidance Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-500 text-xs text-[#7C2D12] leading-relaxed mb-6">
                  <strong className="font-black text-[#4A0E17] block text-xs sm:text-sm">
                    {labels.importantNotice}
                  </strong>
                  <strong className="font-extrabold text-[#7C2D12] block mt-0.5">
                    {labels.importantNoticeDesc}
                  </strong>
                </div>

                {/* Real-time Onboarding Progress Strip */}
                <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-3.5 mb-6 no-print">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#4A0E17] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>
                        {lang === 'mr'
                          ? 'थेट ऑनबोर्डिंग प्रगती स्थिती (Live Status):'
                          : lang === 'hi'
                          ? 'लाइव ऑनबोर्डिंग स्थिति (Live Status):'
                          : 'Live Onboarding Status:'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('status')}
                      className="text-[11px] font-black text-[#EA580C] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{lang === 'mr' ? 'संपूर्ण ट्रॅकर पहा →' : 'Full Tracker →'}</span>
                    </button>
                  </div>

                  {/* 4 stage mini stepper */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    {stageOrder.map((stg, i) => {
                      const isDone = i < currentStageIndex;
                      const isCurrent = i === currentStageIndex;
                      return (
                        <div
                          key={stg}
                          onClick={() => setActiveTab('status')}
                          className={`p-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : isCurrent
                              ? 'bg-amber-200 text-[#4A0E17] border-amber-400 ring-2 ring-amber-300 font-black'
                              : 'bg-white/60 text-slate-500 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {isDone ? (
                              <Check className="w-2.5 h-2.5 text-emerald-700" />
                            ) : isCurrent ? (
                              <Clock className="w-2.5 h-2.5 text-[#EA580C] animate-pulse" />
                            ) : null}
                            <span>{i + 1}</span>
                          </div>
                          <div className="truncate">
                            {stg === 'submitted'
                              ? (lang === 'mr' ? '१. अर्ज प्राप्त' : '1. Applied')
                              : stg === 'doc_verification'
                              ? (lang === 'mr' ? '२. पडताळणी' : '2. Doc Verify')
                              : stg === 'kit_preparation'
                              ? (lang === 'mr' ? '३. किट तयारी' : '3. Kit Prep')
                              : (lang === 'mr' ? '४. पूर्ण ✓' : '4. Done ✓')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vendor Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF5EC] p-4 rounded-xl border border-amber-200 text-xs mb-6">
                  <div>
                    <span className="text-[#7C2D12] font-bold flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#EA580C]" /> {labels.shopName}
                    </span>
                    <span className="font-extrabold text-sm text-[#2B0E14] block mt-0.5">
                      {vendor.shopName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#7C2D12] font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#EA580C]" /> {labels.ownerProprietor}
                    </span>
                    <span className="font-extrabold text-sm text-[#2B0E14] block mt-0.5">
                      {vendor.ownerName} ({vendor.phone})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#7C2D12] font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#EA580C]" /> {labels.addressArea}
                    </span>
                    <span className="font-bold text-[#2B0E14] block mt-0.5">
                      {vendor.area}, {vendor.district} - {vendor.pincode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#7C2D12] font-bold">{labels.selectedScheme}</span>
                    <span className="font-bold text-[#EA580C] block mt-0.5">
                      {vendor.packageName} (₹{vendor.packagePrice})
                    </span>
                  </div>
                </div>

                {/* Digital Shop Link & Generated QR Code Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-[#EA580C] rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-amber-950 flex items-center justify-center font-black shadow-xs">
                        <QrCode className="w-5 h-5 text-amber-950" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-[#4A0E17] font-heading">
                          {lang === 'mr'
                            ? 'तुमचे अधिकृत डिजिटल दुकान व QR कोड'
                            : lang === 'hi'
                            ? 'आपकी आधिकारिक डिजिटल दुकान व QR कोड'
                            : 'Official Digital Shop & QR Code'}
                        </h4>
                        <p className="text-[11px] text-[#7C2D12] font-semibold">
                          {lang === 'mr'
                            ? 'नोंदणी यशस्वी! हा QR कोड स्कॅन करून ग्राहक थेट तुमच्या ऑनलाइन दुकानात पोहोचतील.'
                            : lang === 'hi'
                            ? 'पंजीकरण सफल! यह QR कोड स्कैन करके ग्राहक सीधे आपकी ऑनलाइन दुकान में पहुंचेंगे।'
                            : 'Registration success! Customers can scan this QR code to visit your digital shop.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('shoplink')}
                      className="px-3.5 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#60131E] text-amber-200 hover:text-white font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer border border-amber-500/40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {lang === 'mr'
                          ? 'QR स्टुडिओ व डाउनलोड →'
                          : lang === 'hi'
                          ? 'QR स्टूडियो व डाउनलोड →'
                          : 'Open QR Studio & Download →'}
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    {/* Mini QR preview */}
                    <div
                      onClick={() => setActiveTab('shoplink')}
                      className="p-2.5 bg-white rounded-2xl border-2 border-amber-400 shadow-md shrink-0 cursor-pointer hover:scale-105 hover:border-[#EA580C] transition group"
                      title={lang === 'mr' ? 'QR स्टुडिओ उघडा' : 'Open QR Studio'}
                    >
                      <div
                        className="w-24 h-24 flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: generateQRCodeSVG(getVendorShopUrl(vendor), {
                            size: 96,
                            color: '#9A3412',
                            bgColor: '#FFFFFF',
                            centerLabel: 'MH',
                          }),
                        }}
                      />
                      <div className="text-[10px] text-center font-black text-[#EA580C] mt-1 group-hover:underline">
                        {lang === 'mr' ? 'कस्टमाइझ करा ↗' : 'Customize ↗'}
                      </div>
                    </div>

                    {/* URL and Copy & Share strip */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="text-xs text-[#7C2D12] font-bold">
                        {lang === 'mr'
                          ? 'तुमच्या डिजिटल दुकानाची थेट लिंक (Digital Shop URL):'
                          : 'Your Digital Storefront URL:'}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={getVendorShopUrl(vendor)}
                          className="w-full text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl px-3 py-2 text-[#4A0E17] select-all focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getVendorShopUrl(vendor));
                            setIsShopUrlCopied(true);
                            setTimeout(() => setIsShopUrlCopied(false), 2500);
                          }}
                          className="px-3 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D97706] text-amber-950 font-black text-xs shrink-0 flex items-center gap-1.5 transition shadow-xs cursor-pointer border border-amber-300"
                        >
                          {isShopUrlCopied ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isShopUrlCopied ? (lang === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (lang === 'mr' ? 'कॉपी' : 'Copy')}</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveTab('shoplink')}
                          className="font-black text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'रंग व फ्रेम बदला (QR Studio)' : 'Change Colors & Frame'}</span>
                        </button>
                        <span className="text-amber-400">•</span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            lang === 'mr'
                              ? `नमस्कार! 🙏 हे आमचे अधिकृत डिजिटल दुकान आहे: *${vendor.shopName}* (${getVendorShopUrl(vendor)}). आमची उत्पादने पहा आणि थेट ऑर्डर करा!`
                              : `नमस्ते! 🙏 यह हमारी आधिकारिक डिजिटल दुकान है: *${vendor.shopName}* (${getVendorShopUrl(vendor)}). कृपया उत्पाद देखें और आर्डर करें!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-black text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'WhatsApp वर शेअर करा' : 'Share on WhatsApp'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Field Officer Card (Ismail or Faraz) */}
                <div className="bg-gradient-to-r from-[#4A0E17] to-[#2B0E14] text-white p-5 rounded-2xl border-2 border-amber-400 shadow-lg relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          assignedOfficer === 'Ismail'
                            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={formatOfficerName(assignedOfficer, lang)}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[11px] font-black">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{labels.assignedRep}</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-amber-100 font-heading">
                          {formatOfficerName(assignedOfficer, lang)}
                        </h4>
                        <p className="text-xs text-amber-200/90 font-medium">
                          {labels.assignedSub}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-xs text-amber-300 font-bold">{labels.directContact}</div>
                      <div className="font-mono text-lg font-black text-amber-100 bg-[#3B1C10] px-3 py-1 rounded-lg border border-amber-500/40">
                        {assignedPhone}
                      </div>
                      <a
                        href={`tel:${assignedPhone.replace(/\D/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-colors shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{labels.callNow}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Instant Notification Dispatch Box for Ismail/Faraz on 9137786506 */}
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500 text-emerald-950 space-y-3 no-print">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-emerald-900">
                          {labels.notifyTitle}
                        </h5>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {labels.notifySub}
                        </p>
                      </div>
                    </div>

                    {notified && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                        {labels.notified}
                      </span>
                    )}
                  </div>

                  {/* Dispatch Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <a
                      href={vendorSmsUrl}
                      className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <MessageSquare className="w-4 h-4 text-amber-300" />
                      <span>{labels.smsVendor}</span>
                    </a>

                    <a
                      href={smsUrl}
                      className="py-2.5 px-3 rounded-xl bg-[#7C2D12] hover:bg-[#9A3412] text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <PhoneCall className="w-4 h-4 text-amber-300" />
                      <span>{labels.smsOfficer}</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setNotified(true)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{labels.whatsappOfficer}</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border-2 border-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title={labels.copySms}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? labels.copied : labels.copySms}</span>
                    </button>
                  </div>

                  {/* Message Preview Accordion */}
                  <details className="mt-2 text-[11px] text-emerald-800 bg-white p-2.5 rounded-lg border border-emerald-200">
                    <summary className="font-bold cursor-pointer text-emerald-900 select-none">
                      {labels.previewTitle}
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-50 text-slate-800 rounded font-mono text-[10px] whitespace-pre-wrap border border-slate-200">
                      {messagePreview}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          ) : activeTab === 'shoplink' ? (
            /* ========================================================
               DIGITAL SHOP LINK & QR CODE GENERATOR STUDIO
               ======================================================== */
            <DigitalShopQRGenerator
              vendor={vendor}
              lang={lang}
              onSwitchTab={setActiveTab}
            />
          ) : activeTab === 'status' ? (
            /* ========================================================
               REAL-TIME ONBOARDING STATUS TRACKER VIEW
               ======================================================== */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Progress Summary Card */}
              <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#7C2D12] border border-amber-300 text-xs font-black mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>
                        {lang === 'mr' ? 'थेट ऑनबोर्डिंग प्रगती' : lang === 'hi' ? 'लाइव ऑनबोर्डिंग प्रगति' : 'Live Onboarding Progress'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#4A0E17] font-heading">
                      {vendor.shopName}
                    </h3>
                    <p className="text-xs text-[#7C2D12] font-semibold">
                      {labels.appNumber} <span className="font-mono font-black text-[#EA580C]">{vendor.regNumber}</span> • {vendor.area}, {vendor.district}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-[#EA580C]">{progressPercent}%</span>
                    <span className="text-[10px] text-[#7C2D12] font-bold block">
                      {currentStage === 'completed'
                        ? (lang === 'mr' ? 'प्रक्रिया पूर्ण ✓' : 'Complete ✓')
                        : (lang === 'mr' ? 'प्रगती सुरू आहे' : 'In Progress')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-amber-200/60 rounded-full h-3 my-4 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#EA580C] to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Milestone Stepper */}
                <div className="space-y-4 pt-2">
                  {stageOrder.map((stageKey, idx) => {
                    const isPassed = idx < currentStageIndex;
                    const isCur = idx === currentStageIndex;
                    const info = stageTitles[lang][stageKey];

                    return (
                      <div
                        key={stageKey}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isCur
                            ? 'bg-amber-50/80 border-[#EA580C] shadow-md ring-2 ring-amber-300'
                            : isPassed
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-white/40 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                                isPassed
                                  ? 'bg-emerald-600 text-white'
                                  : isCur
                                  ? 'bg-[#EA580C] text-white animate-pulse'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#2B0E14]">{info.title}</h4>
                              <p className="text-xs text-[#7C2D12] mt-0.5">{info.desc}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isCur
                                  ? 'bg-amber-200 text-[#4A0E17]'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {info.eta}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Field Specialist Card */}
              <div className="bg-[#4A0E17] text-amber-100 rounded-2xl p-5 border-2 border-amber-500/50 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      {labels.assignedRep}
                    </span>
                    <h4 className="text-lg font-black text-white font-heading mt-0.5">
                      {assignedOfficer}
                    </h4>
                    <p className="text-xs text-amber-200">
                      {labels.assignedSub}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${assignedPhone.replace(/\s+/g, '')}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{labels.callNow}</span>
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Actions to View Receipt or Standee */}
              <div className="flex items-center justify-between gap-3 bg-[#FFFDF7] p-4 rounded-xl border border-amber-300">
                <button
                  type="button"
                  onClick={() => setActiveTab('receipt')}
                  className="px-4 py-2 rounded-lg bg-white border border-amber-400 text-xs font-bold text-[#4A0E17] hover:bg-amber-50 transition cursor-pointer"
                >
                  ← {t.btnViewCert}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('standee')}
                  className="px-4 py-2 rounded-lg bg-[#EA580C] text-amber-950 text-xs font-black hover:bg-[#D97706] transition cursor-pointer border border-amber-300"
                >
                  {t.btnReviewStandee} →
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               GOOGLE 5-STAR REVIEW COUNTER STANDEE GENERATOR
               ======================================================== */
            <div className="bg-[#FFFDF7] border-4 border-[#EA580C] p-6 sm:p-10 rounded-2xl shadow-xl max-w-md mx-auto text-center relative overflow-hidden">
              {/* Header Strip */}
              <div className="bg-[#4A0E17] text-amber-100 p-3 rounded-xl mb-5 shadow-sm border border-amber-500/40">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <h4 className="text-lg font-black font-heading">
                  {vendor.shopName}
                </h4>
                <p className="text-[11px] text-amber-200">
                  {vendor.area}, {vendor.district}
                </p>
              </div>

              <div className="text-xl sm:text-2xl font-black text-[#4A0E17] mb-2 font-heading">
                {t.standeeScanText}
              </div>
              <p className="text-xs text-[#5C2B14] font-semibold mb-4">
                {t.standeeHelp}
              </p>

              {/* Big Standee QR Code in White Box */}
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-amber-400 shadow-lg my-2">
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: standeeQrSvg }}
                />
              </div>

              {/* Realistic Store Counter Standee Display Picture */}
              <div className="mt-4 pt-4 border-t border-amber-300 text-left">
                <div className="text-[11px] font-black text-[#7C2D12] mb-1.5 text-center">
                  {labels.standeeSetupPreview}
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm relative h-36 bg-amber-950 group">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80"
                    alt="Realistic Acrylic Counter Display"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] text-amber-200 font-bold">
                      ✓ 5★ Google Review NFC + QR Acrylic Counter Unit
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-xs text-[#7C2D12] font-bold">
                <span>{labels.googleVerified}</span>
                <span className="text-[#EA580C]">{labels.mahaVyapaarSetu}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
