import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  Store,
  MapPin,
  Phone,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Star,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { Vendor, Language } from '../types';
import { getVendorShopUrl, generateQRCodeDataURL, generateQRCodeSVGString } from '../utils/qrCode';
import { IndianFlag } from './IndianFlag';

interface DigitalShopQRGeneratorProps {
  vendor: Vendor;
  lang: Language;
  onSwitchTab?: (tab: 'receipt' | 'standee' | 'status') => void;
}

type ColorPreset = 'kesari' | 'green' | 'blue' | 'black' | 'maroon';
type CenterBadgeType = 'dukaan' | 'upi' | 'star' | 'seal' | 'none';
type FrameStyle = 'standee' | 'sticker' | 'minimal';

interface PresetConfig {
  id: ColorPreset;
  name: Record<Language, string>;
  darkColor: string;
  lightColor: string;
  accentColor: string;
  badgeBg: string;
}

const colorPresets: PresetConfig[] = [
  {
    id: 'kesari',
    name: {
      mr: 'केसरी महाव्यापार',
      hi: 'केसरी महाव्यापार',
      en: 'Kesari Saffron',
    },
    darkColor: '#9A3412',
    lightColor: '#FFFBEB',
    accentColor: '#EA580C',
    badgeBg: '#FEF3C7',
  },
  {
    id: 'green',
    name: {
      mr: 'काष्टी ग्रीन (UPI)',
      hi: 'काष्टी ग्रीन (UPI)',
      en: 'Emerald UPI',
    },
    darkColor: '#065F46',
    lightColor: '#F0FDF4',
    accentColor: '#059669',
    badgeBg: '#D1FAE5',
  },
  {
    id: 'maroon',
    name: {
      mr: 'हेरिटेज मरून',
      hi: 'हेरिटेज मरून',
      en: 'Heritage Maroon',
    },
    darkColor: '#4A0E17',
    lightColor: '#FAF5EC',
    accentColor: '#7C2D12',
    badgeBg: '#FEE2E2',
  },
  {
    id: 'blue',
    name: {
      mr: 'रॉयल डिजिटल सेतू',
      hi: 'रॉयल डिजिटल सेतु',
      en: 'Royal Blue',
    },
    darkColor: '#1E3A8A',
    lightColor: '#EFF6FF',
    accentColor: '#2563EB',
    badgeBg: '#DBEAFE',
  },
  {
    id: 'black',
    name: {
      mr: 'हाय-कॉन्ट्रास्ट काळा (प्रिंट)',
      hi: 'हाई-कंट्रास्ट काला (प्रिंट)',
      en: 'High-Contrast B&W',
    },
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    accentColor: '#334155',
    badgeBg: '#F1F5F9',
  },
];

// Sample category-based catalog items for the storefront preview
const sampleCatalogs: Record<string, Array<{ name: string; price: number; unit: string }>> = {
  kirana: [
    { name: 'चकचकीत बासमती तांदूळ (Basmati Rice)', price: 110, unit: '१ किलो' },
    { name: 'शुद्ध शेंगदाणा तेल (Groundnut Oil)', price: 185, unit: '१ लिटर' },
    { name: 'सेंद्रिय गूळ (Organic Jaggery)', price: 75, unit: '१ किलो' },
    { name: 'कोल्हापुरी कांदा लसूण मसाला (Spices)', price: 65, unit: '२०० ग्रॅम' },
  ],
  food: [
    { name: 'गरमागरम बटाटा वडा (Special Vada Pav)', price: 20, unit: '१ प्लेट' },
    { name: 'झणझणीत मिसळ पाव (Misal Pav Special)', price: 70, unit: '१ प्लेट' },
    { name: 'स्पेशल सुगंधी चहा (Special Masala Tea)', price: 15, unit: '१ कप' },
    { name: 'कुरकुरीत कांदा भजी (Kanda Bhaji)', price: 40, unit: '१ प्लेट' },
  ],
  vegetable: [
    { name: 'ताजी हिरवी मेथी (Fresh Fenugreek)', price: 25, unit: '१ जुडी' },
    { name: 'रानभाज्या व गावरान टोमॅटो (Farm Fresh Tomato)', price: 40, unit: '१ किलो' },
    { name: 'ताजा हिरवा वाटाणा (Green Peas)', price: 60, unit: '१ किलो' },
    { name: 'कोथिंबीर व हिरवी मिरची (Coriander Combo)', price: 20, unit: '१ जुडी' },
  ],
  retail: [
    { name: 'कॉटन कुर्ती / शर्टिंग (Cotton Apparel)', price: 499, unit: '१ नग' },
    { name: 'पारंपरिक पैठणी बॉर्डर साडी (Special Saree)', price: 1250, unit: '१ नग' },
    { name: 'दैनिक वापराचे होजिअरी साहित्य (Daily Wear)', price: 199, unit: '१ सेट' },
  ],
  artisan: [
    { name: 'हस्तनिर्मित कोल्हापुरी चप्पल (Handmade Chappal)', price: 750, unit: '१ जोड' },
    { name: 'मातीचे नक्षीदार भांडे व दिवे (Terracotta Craft)', price: 150, unit: '१ संच' },
    { name: 'तांब्या-पितळेची पूजा सामग्री (Brass Artifacts)', price: 450, unit: '१ नग' },
  ],
};

export const DigitalShopQRGenerator: React.FC<DigitalShopQRGeneratorProps> = ({
  vendor,
  lang,
  onSwitchTab,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>('kesari');
  const [selectedBadge, setSelectedBadge] = useState<CenterBadgeType>('dukaan');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('standee');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showStorePreview, setShowStorePreview] = useState<boolean>(false);

  const shopUrl = getVendorShopUrl(vendor);
  const activePreset = colorPresets.find((p) => p.id === selectedPreset) || colorPresets[0];

  // Generator translations
  const t = {
    mr: {
      badge: '✓ अधिकृत डिजिटल दुकान QR जनरेटर',
      heading: 'तुमच्या डिजिटल दुकानाचा QR कोड तयार झाला!',
      subheading: 'हा QR कोड स्कॅन करून ग्राहक थेट तुमच्या ऑनलाइन दुकानात पोहोचतील व उत्पादने पाहतील.',
      shopUrlLabel: 'तुमच्या दुकानाची अधिकृत ऑनलाइन लिंक (Digital Shop URL):',
      copyUrl: 'लिंक कॉपी करा',
      copied: 'कॉपी झाले!',
      testDukaan: 'डिजिटल दुकान थेट उघडून पहा',
      customizeTitle: 'QR कोड डिझाईन व रंग निवडा (Customize QR Style):',
      colorPresets: 'रंगसंगती (Color Theme):',
      centerBadge: 'मध्यभागी लोगो / चिन्ह (Center Emblem):',
      badgeDukaan: '🏪 दुकान',
      badgeUpi: '💳 UPI',
      badgeStar: '⭐ ५★ रिव्ह्यू',
      badgeSeal: '🇮🇳 सेतू सील',
      badgeNone: 'काही नाही (Plain)',
      frameStyle: 'फ्रेम स्टाईल (Display Layout):',
      frameStandee: 'काउंटर डिस्प्ले स्टँडी (Counter Card)',
      frameSticker: 'काचेचे स्टिकर (Door Sticker)',
      frameMinimal: 'केवळ QR कोड (Minimal)',
      downloadPng: 'PNG इमेज डाउनलोड करा (HD)',
      downloadSvg: 'SVG वेक्टर डाउनलोड करा',
      printCard: 'काउंटर डिस्प्ले प्रिंट करा',
      shareWhatsApp: 'WhatsApp वर दुकान शेअर करा',
      scanInstruction: 'स्कॅन करा • कॅटलॉग पहा • UPI द्वारे थेट पेमेंट करा',
      instantDelivery: 'थेट डिलिव्हरी व काउंटर पिकअप उपलब्ध',
      verifiedStore: 'महाराष्ट्र शासन डिजिटल सेतू प्रमाणित व्यवसाय',
      previewHeading: 'तुमचे डिजिटल दुकान ग्राहकांना असे दिसेल (Storefront Preview)',
      closePreview: 'बंद करा',
      callNow: 'कॉल करा',
      orderOnWa: 'WhatsApp वर ऑर्डर द्या',
      viewLocation: 'गुगल मॅप्स पत्ता',
      payUpi: 'UPI पेमेंट करा',
      specialProducts: 'आजची प्रमुख उत्पादने व दर (Featured Products):',
      backToSlip: '← ऑनबोर्डिंग पावती पहा',
      backToStandee: '५-स्टार स्टँडी पहा →',
    },
    hi: {
      badge: '✓ आधिकारिक डिजिटल दुकान QR जेनरेटर',
      heading: 'आपकी डिजिटल दुकान का QR कोड तैयार है!',
      subheading: 'इस QR कोड को स्कैन करके ग्राहक सीधे आपकी ऑनलाइन दुकान पर पहुँचेंगे व उत्पाद देखेंगे।',
      shopUrlLabel: 'आपकी दुकान का आधिकारिक ऑनलाइन लिंक (Digital Shop URL):',
      copyUrl: 'लिंक कॉपी करें',
      copied: 'कॉपी हुआ!',
      testDukaan: 'डिजिटल दुकान लाइव देखें',
      customizeTitle: 'QR कोड डिज़ाइन व रंग चुनें (Customize QR Style):',
      colorPresets: 'रंग विकल्प (Color Theme):',
      centerBadge: 'केंद्र में लोगो / चिह्न (Center Emblem):',
      badgeDukaan: '🏪 दुकान',
      badgeUpi: '💳 UPI',
      badgeStar: '⭐ ५★ रिव्यू',
      badgeSeal: '🇮🇳 सेतु सील',
      badgeNone: 'कोई नहीं (Plain)',
      frameStyle: 'फ्रेम स्टाइल (Display Layout):',
      frameStandee: 'काउंटर डिस्प्ले स्टेंडी (Counter Card)',
      frameSticker: 'दुकान स्टिकर (Door Sticker)',
      frameMinimal: 'केवल QR कोड (Minimal)',
      downloadPng: 'PNG इमेज डाउनलोड करें (HD)',
      downloadSvg: 'SVG वेक्टर डाउनलोड करें',
      printCard: 'काउंटर डिस्प्ले प्रिंट करें',
      shareWhatsApp: 'WhatsApp पर दुकान शेयर करें',
      scanInstruction: 'स्कैन करें • कैटलॉग देखें • UPI से सीधा भुगतान करें',
      instantDelivery: 'सीधा डिलीवरी व काउंटर पिकअप उपलब्ध',
      verifiedStore: 'डिजिटल सेतु सत्यापित व्यवसाय',
      previewHeading: 'आपकी डिजिटल दुकान ग्राहकों को ऐसी दिखेगी (Storefront Preview)',
      closePreview: 'बंद करें',
      callNow: 'कॉल करें',
      orderOnWa: 'WhatsApp पर आर्डर दें',
      viewLocation: 'गूगल मैप्स पता',
      payUpi: 'UPI भुगतान करें',
      specialProducts: 'प्रमुख उत्पाद व दर (Featured Products):',
      backToSlip: '← ऑनबोर्डिंग रसीद देखें',
      backToStandee: '५-स्टार स्टेंडी देखें →',
    },
    en: {
      badge: '✓ Official Digital Shop QR Generator',
      heading: 'Your Digital Shop QR Code is Ready!',
      subheading: 'Customers can scan this QR code with any smartphone camera to visit your digital shop instantly.',
      shopUrlLabel: 'Your Official Digital Shop URL:',
      copyUrl: 'Copy Link',
      copied: 'Copied!',
      testDukaan: 'Preview Live Digital Dukaan',
      customizeTitle: 'Customize QR Style & Brand Colors:',
      colorPresets: 'Color Theme:',
      centerBadge: 'Center Badge Emblem:',
      badgeDukaan: '🏪 Dukaan',
      badgeUpi: '💳 UPI Pay',
      badgeStar: '⭐ 5★ Review',
      badgeSeal: '🇮🇳 Setu Seal',
      badgeNone: 'Plain QR',
      frameStyle: 'Display Layout:',
      frameStandee: 'Counter Standee Card',
      frameSticker: 'Door Window Sticker',
      frameMinimal: 'Minimal QR Only',
      downloadPng: 'Download PNG (HD)',
      downloadSvg: 'Download SVG Vector',
      printCard: 'Print Counter Card',
      shareWhatsApp: 'Share Shop on WhatsApp',
      scanInstruction: 'Scan to Browse Catalog & Pay via UPI Instantly',
      instantDelivery: 'Direct Delivery & Counter Pickup Available',
      verifiedStore: 'MahaVyapaar Digital Setu Verified Business',
      previewHeading: 'Live Customer Storefront Preview',
      closePreview: 'Close Preview',
      callNow: 'Call Shop',
      orderOnWa: 'Order on WhatsApp',
      viewLocation: 'Google Maps Pin',
      payUpi: 'Pay via UPI',
      specialProducts: 'Featured Products & Daily Rates:',
      backToSlip: '← View Onboarding Slip',
      backToStandee: 'View 5-Star Standee →',
    },
  }[lang];

  // Generate QR code data URL whenever preset or badge changes
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const generateCompositeQR = async () => {
      try {
        // Base QR code with high error correction so center emblem doesn't break scannability
        const rawDataUrl = await generateQRCodeDataURL(shopUrl, {
          size: 512,
          color: activePreset.darkColor,
          bgColor: activePreset.lightColor,
          margin: 2,
        });

        if (!isMounted) return;

        if (selectedBadge === 'none') {
          setQrDataUrl(rawDataUrl);
          setIsGenerating(false);
          return;
        }

        // Draw center emblem onto an HTML canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isMounted) return;
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setQrDataUrl(rawDataUrl);
            setIsGenerating(false);
            return;
          }

          // Draw QR Code
          ctx.drawImage(img, 0, 0, 512, 512);

          // Draw center emblem box
          const badgeSize = 110;
          const x = (512 - badgeSize) / 2;
          const y = (512 - badgeSize) / 2;
          const radius = 18;

          // Outer shadow for emblem
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.25)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;

          // Emblem background rounded rectangle
          ctx.fillStyle = activePreset.badgeBg;
          ctx.beginPath();
          ctx.roundRect(x, y, badgeSize, badgeSize, radius);
          ctx.fill();

          // Emblem border
          ctx.lineWidth = 4;
          ctx.strokeStyle = activePreset.darkColor;
          ctx.stroke();
          ctx.restore();

          // Emblem Text & Icon
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (selectedBadge === 'dukaan') {
            ctx.font = '32px sans-serif';
            ctx.fillText('🏪', 256, 235);
            ctx.fillStyle = activePreset.darkColor;
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('DUKAAN', 256, 276);
          } else if (selectedBadge === 'upi') {
            ctx.font = 'bold 26px sans-serif';
            ctx.fillStyle = activePreset.darkColor;
            ctx.fillText('UPI', 256, 240);
            ctx.font = '900 12px sans-serif';
            ctx.fillStyle = activePreset.accentColor;
            ctx.fillText('PAY HERE', 256, 270);
          } else if (selectedBadge === 'star') {
            ctx.font = '28px sans-serif';
            ctx.fillText('⭐', 256, 235);
            ctx.fillStyle = activePreset.darkColor;
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('5★ STORE', 256, 275);
          } else if (selectedBadge === 'seal') {
            ctx.font = '26px sans-serif';
            ctx.fillText('🇮🇳', 256, 235);
            ctx.fillStyle = activePreset.darkColor;
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('MH SETU', 256, 275);
          }

          setQrDataUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        };
        img.src = rawDataUrl;
      } catch (err) {
        console.error('Error generating composite QR:', err);
        setIsGenerating(false);
      }
    };

    generateCompositeQR();

    return () => {
      isMounted = false;
    };
  }, [shopUrl, selectedPreset, selectedBadge, activePreset]);

  // Copy URL action
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shopUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Download PNG file
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${vendor.regNumber.toLowerCase()}-digital-shop-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download SVG file
  const handleDownloadSvg = async () => {
    const svgStr = await generateQRCodeSVGString(shopUrl, {
      size: 512,
      color: activePreset.darkColor,
      bgColor: activePreset.lightColor,
      margin: 2,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vendor.regNumber.toLowerCase()}-digital-shop-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger Print for Counter Display
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share URL
  const shareWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    lang === 'mr'
      ? `नमस्कार! 🙏 आमचे डिजिटल दुकान आता थेट इंटरनेटवर सुरू झाले आहे:\n🏪 *${vendor.shopName}*\n📍 पत्ता: ${vendor.area}, ${vendor.district}\n\nआमची सर्व उत्पादने पाहण्यासाठी व थेट घरपोच मागवण्यासाठी खालील लिंकवर क्लिक करा किंवा QR कोड स्कॅन करा:\n🔗 ${shopUrl}\n\nधन्यवाद! (महाव्यापार डिजिटल सेतू)`
      : `नमस्ते! 🙏 हमारी डिजिटल दुकान अब लाइव हो चुकी है:\n🏪 *${vendor.shopName}*\n📍 पता: ${vendor.area}, ${vendor.district}\n\nहमारी सभी उत्पाद सूची देखने व सीधे आर्डर करने के लिए यहाँ क्लिक करें:\n🔗 ${shopUrl}\n\nधन्यवाद! (महाव्यापार डिजिटल सेतु)`
  )}`;

  // Category products for the preview storefront
  const catalogItems = sampleCatalogs[vendor.category] || sampleCatalogs.kirana;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Alert celebrating new Shop Link & QR Code */}
      <div className="bg-gradient-to-r from-amber-500 via-[#EA580C] to-amber-600 text-amber-950 p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-amber-300 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#2B0E14] text-amber-300 flex items-center justify-center shadow-md shrink-0">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 text-amber-950 text-xs font-black mb-0.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{t.badge}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-amber-950 font-heading">
              {t.heading}
            </h3>
            <p className="text-xs text-amber-950 font-semibold max-w-xl">
              {t.subheading}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStorePreview(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2B0E14] hover:bg-[#4A0E17] text-amber-200 hover:text-white font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer border border-amber-400"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{t.testDukaan}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Preview Frame on Left/Center, Controls & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Code Display Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Printable Frame Container */}
          <div
            id="printable-shop-qr-frame"
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-4 transition-all"
            style={{
              borderColor: activePreset.accentColor,
              backgroundColor: activePreset.lightColor,
            }}
          >
            {/* Header in Frame */}
            {frameStyle !== 'minimal' && (
              <div
                className="text-center pb-4 mb-4 border-b-2 rounded-2xl p-3"
                style={{
                  backgroundColor: activePreset.darkColor,
                  color: activePreset.lightColor,
                  borderColor: activePreset.accentColor,
                }}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-wide uppercase mb-1">
                  <Store className="w-4 h-4 text-amber-300" />
                  <span>{vendor.shopName}</span>
                  <IndianFlag size="xs" />
                </div>
                <div className="text-[11px] opacity-90 font-medium">
                  {vendor.area}, {vendor.district} • {vendor.regNumber}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>{t.verifiedStore}</span>
                </div>
              </div>
            )}

            {/* QR Code Presentation Box */}
            <div className="relative mx-auto flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-amber-200">
              {isGenerating ? (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C]" />
                  <span className="text-xs font-bold">QR कोड तयार होत आहे...</span>
                </div>
              ) : (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${vendor.shopName}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl select-none"
                />
              )}

              {/* Tag below QR */}
              <div className="mt-3 text-center">
                <span
                  className="text-xs font-black px-3 py-1 rounded-full inline-block shadow-xs"
                  style={{
                    backgroundColor: activePreset.darkColor,
                    color: activePreset.lightColor,
                  }}
                >
                  {t.scanInstruction}
                </span>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">
                  {t.instantDelivery}
                </p>
              </div>
            </div>

            {/* Bottom Footer Info in Frame */}
            {frameStyle === 'standee' && (
              <div className="mt-4 pt-3 border-t border-amber-300/80 flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#EA580C]" />
                  <span>{vendor.phone}</span>
                </span>
                <span className="text-[#EA580C] font-black">
                  mahavypaar.in/shop/{vendor.regNumber.toLowerCase()}
                </span>
              </div>
            )}
          </div>

          {/* Quick Tab Switches at bottom of preview */}
          {onSwitchTab && (
            <div className="flex items-center justify-center gap-3 mt-4 text-xs font-bold no-print">
              <button
                type="button"
                onClick={() => onSwitchTab('receipt')}
                className="text-[#4A0E17] hover:underline cursor-pointer"
              >
                {t.backToSlip}
              </button>
              <span className="text-amber-400">•</span>
              <button
                type="button"
                onClick={() => onSwitchTab('standee')}
                className="text-[#EA580C] hover:underline cursor-pointer"
              >
                {t.backToStandee}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Customizer, URL Card, Downloads & Share */}
        <div className="lg:col-span-5 space-y-4">
          {/* Digital Shop URL Box with Copy Button */}
          <div className="bg-[#FFFDF7] p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
            <label className="text-xs font-black text-[#4A0E17] block flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{t.shopUrlLabel}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shopUrl}
                className="w-full text-xs font-mono font-bold bg-amber-50/80 border border-amber-300 rounded-xl px-3 py-2 text-[#4A0E17] focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D97706] text-amber-950 font-black text-xs shrink-0 flex items-center gap-1.5 transition shadow-xs cursor-pointer border border-amber-300"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? t.copied : t.copyUrl}</span>
              </button>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-[#4A0E17] flex items-center gap-1.5 font-heading">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              <span>{t.customizeTitle}</span>
            </h4>

            {/* Color Presets */}
            <div>
              <span className="text-[11px] font-bold text-[#7C2D12] block mb-1.5">
                {t.colorPresets}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorPresets.map((preset) => {
                  const isActive = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'border-2 border-[#EA580C] bg-amber-100/80 shadow-xs'
                          : 'border-amber-200 bg-white hover:bg-amber-50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: preset.darkColor }}
                      />
                      <span className="text-[11px] truncate text-[#2B0E14]">
                        {preset.name[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Emblem Badges */}
            <div>
              <span className="text-[11px] font-bold text-[#7C2D12] block mb-1.5">
                {t.centerBadge}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
                {(
                  [
                    { id: 'dukaan', label: t.badgeDukaan },
                    { id: 'upi', label: t.badgeUpi },
                    { id: 'star', label: t.badgeStar },
                    { id: 'seal', label: t.badgeSeal },
                    { id: 'none', label: t.badgeNone },
                  ] as const
                ).map((b) => {
                  const isActive = selectedBadge === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBadge(b.id)}
                      className={`p-1.5 rounded-lg border text-[11px] font-black transition cursor-pointer ${
                        isActive
                          ? 'bg-[#4A0E17] text-amber-200 border-[#EA580C] shadow-xs'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Layout Styles */}
            <div>
              <span className="text-[11px] font-bold text-[#7C2D12] block mb-1.5">
                {t.frameStyle}
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {(
                  [
                    { id: 'standee', label: t.frameStandee },
                    { id: 'sticker', label: t.frameSticker },
                    { id: 'minimal', label: t.frameMinimal },
                  ] as const
                ).map((f) => {
                  const isActive = frameStyle === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrameStyle(f.id)}
                      className={`p-1.5 rounded-lg border text-[10px] font-black transition cursor-pointer ${
                        isActive
                          ? 'bg-[#EA580C] text-amber-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons: Downloads, WhatsApp Share, Print */}
          <div className="space-y-2 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownloadPng}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>{t.downloadPng}</span>
              </button>

              {/* Download SVG */}
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="py-2.5 px-3 rounded-xl bg-[#4A0E17] hover:bg-[#60131E] text-amber-100 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer border border-amber-600/40"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{t.downloadSvg}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Share on WhatsApp */}
              <a
                href={shareWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.shareWhatsApp}</span>
              </a>

              {/* Print Counter Card */}
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-[#EA580C] hover:bg-[#D97706] text-amber-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer border border-amber-300"
              >
                <Printer className="w-4 h-4 text-amber-950" />
                <span>{t.printCard}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Storefront Preview Modal */}
      {showStorePreview && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-500 max-h-[90vh] flex flex-col">
            {/* Top Bar */}
            <div className="bg-[#4A0E17] text-amber-100 p-4 flex items-center justify-between border-b-2 border-amber-600">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm sm:text-base font-black font-heading">
                    {t.previewHeading}
                  </h4>
                  <p className="text-[11px] text-amber-300 font-mono">
                    {shopUrl}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStorePreview(false)}
                className="px-3 py-1.5 rounded-lg bg-[#2B0E14] text-amber-200 hover:text-white text-xs font-black cursor-pointer"
              >
                ✕ {t.closePreview}
              </button>
            </div>

            {/* Scrollable Storefront Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FAF5EC]">
              {/* Store Header Card */}
              <div className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.verifiedStore}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#4A0E17] font-heading">
                      {vendor.shopName}
                    </h2>
                    <p className="text-xs text-[#7C2D12] font-semibold mt-0.5">
                      {vendor.ownerName} • {vendor.category.toUpperCase()} • {vendor.area}, {vendor.district}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-black text-sm text-[#4A0E17]">5.0</span>
                    <span className="text-[10px] text-[#7C2D12] font-bold">(४८+ रिव्ह्यूज)</span>
                  </div>
                </div>

                {/* Quick Customer Action Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-amber-200">
                  <a
                    href={`tel:${vendor.phone}`}
                    className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.callNow}</span>
                  </a>
                  <a
                    href={`https://wa.me/91${vendor.phone}?text=Hello%20${encodeURIComponent(vendor.shopName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.orderOnWa}</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${vendor.shopName}, ${vendor.area}, ${vendor.district}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.viewLocation}</span>
                  </a>
                  <div className="py-2 px-2.5 rounded-xl bg-[#4A0E17] text-amber-200 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.payUpi}</span>
                  </div>
                </div>
              </div>

              {/* Sample Digital Products Showcase */}
              <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
                <h3 className="text-sm font-black text-[#4A0E17] mb-3 flex items-center gap-1.5 font-heading">
                  <ShoppingBag className="w-4 h-4 text-[#EA580C]" />
                  <span>{t.specialProducts}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF5EC] border border-amber-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-black text-xs text-[#2B0E14]">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{item.unit}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-700">₹{item.price}</span>
                        <a
                          href={`https://wa.me/91${vendor.phone}?text=${encodeURIComponent(
                            `मला ${item.name} (₹${item.price} / ${item.unit}) हवे आहे.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[10px] font-black text-[#EA580C] hover:underline"
                        >
                          ऑर्डर करा +
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini QR display inside Storefront */}
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center gap-4">
                <img
                  src={qrDataUrl}
                  alt="Shop QR"
                  className="w-20 h-20 bg-white p-1 rounded-xl border border-amber-300 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black text-[#4A0E17]">
                    दुकानाचा थेट UPI व कॅटलॉग QR
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    हा QR कोड स्कॅन करून ग्राहक थेट यूपीआय (PhonePe/Google Pay/Paytm) द्वारे पेमेंट करू शकतात.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
