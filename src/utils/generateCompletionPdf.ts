import { jsPDF } from 'jspdf';
import { Vendor, Language } from '../types';
import { getAssignedOfficer, getOfficerPhoneFormatted, formatOfficerName } from './assignment';
import { generateQRCodeDataURL, getVendorShopUrl } from './qrCode';

/**
 * Generates a high-resolution, professional A4 Onboarding Completion Certificate PDF for a vendor.
 * Created when admin finishes/completes the merchant's digital setu onboarding process.
 */
export const generateCompletionPdf = async (vendor: Vendor, lang: Language = 'mr'): Promise<void> => {
  // A4 dimensions in pt (standard jsPDF)
  const a4WidthPt = 595.28;
  const a4HeightPt = 841.89;

  // Render on 2.5x High-DPI canvas for crisp print quality
  const scale = 2.5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(a4WidthPt * scale);
  canvas.height = Math.round(a4HeightPt * scale);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const assignedOfficer = vendor.assignedTo || getAssignedOfficer(vendor);
  const officerName = formatOfficerName(assignedOfficer, lang);
  const officerPhone = vendor.assignedPhone
    ? (vendor.assignedPhone.startsWith('+') ? vendor.assignedPhone : `+91 ${vendor.assignedPhone}`)
    : getOfficerPhoneFormatted(assignedOfficer);
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate QR Code data URL for verification
  const qrDataUrl = await generateQRCodeDataURL(getVendorShopUrl(vendor), {
    size: 260,
    color: '#4A0E17',
    bgColor: '#FFFFFF',
    margin: 1,
  });

  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => resolve();
    qrImg.src = qrDataUrl;
  });

  const w = canvas.width;
  const h = canvas.height;

  // Background - Royal warm cream
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, w, h);

  // Decorative Border
  const pad = 22 * scale;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.5 * scale;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  ctx.strokeStyle = '#4A0E17';
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeRect(pad + 4 * scale, pad + 4 * scale, w - (pad + 4 * scale) * 2, h - (pad + 4 * scale) * 2);

  // Corner decorative flourishes
  const cornerSize = 18 * scale;
  ctx.fillStyle = '#4A0E17';
  ctx.fillRect(pad, pad, cornerSize, 4.5 * scale);
  ctx.fillRect(pad, pad, 4.5 * scale, cornerSize);
  ctx.fillRect(w - pad - cornerSize, pad, cornerSize, 4.5 * scale);
  ctx.fillRect(w - pad - 4.5 * scale, pad, 4.5 * scale, cornerSize);
  ctx.fillRect(pad, h - pad - 4.5 * scale, cornerSize, 4.5 * scale);
  ctx.fillRect(pad, h - pad - cornerSize, 4.5 * scale, cornerSize);
  ctx.fillRect(w - pad - cornerSize, h - pad - 4.5 * scale, cornerSize, 4.5 * scale);
  ctx.fillRect(w - pad - 4.5 * scale, h - pad - cornerSize, 4.5 * scale, cornerSize);

  let curY = pad + 18 * scale;

  // Header Ribbon: Indian Tricolor bar
  const ribbonW = w - (pad + 12 * scale) * 2;
  const ribbonX = pad + 12 * scale;
  ctx.fillStyle = '#FF9933'; // Saffron
  ctx.fillRect(ribbonX, curY, ribbonW, 3 * scale);
  ctx.fillStyle = '#FFFFFF'; // White
  ctx.fillRect(ribbonX, curY + 3 * scale, ribbonW, 3 * scale);
  ctx.fillStyle = '#138808'; // Green
  ctx.fillRect(ribbonX, curY + 6 * scale, ribbonW, 3 * scale);
  curY += 16 * scale;

  // Header Box
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4A0E17';
  ctx.font = `900 ${18 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('महाव्यापार डिजिटल सोल्युशन्स प्रायव्हेट लिमिटेड', w / 2, curY);
  curY += 13 * scale;

  ctx.fillStyle = '#7C2D12';
  ctx.font = `800 ${11 * scale}px "Arial", sans-serif`;
  ctx.fillText('MAHAVYAPAAR DIGITAL SOLUTIONS PRIVATE LIMITED', w / 2, curY);
  curY += 10 * scale;

  ctx.fillStyle = '#57534E';
  ctx.font = `600 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('Incorporated under Companies Act • Reg. No: MH-2024-09823 • Digital Setu Cell', w / 2, curY);
  curY += 14 * scale;

  // Completion Title Banner in Maroon with Gold Trim
  const bannerH = 36 * scale;
  const bannerW = w - (pad + 16 * scale) * 2;
  const bannerX = pad + 16 * scale;

  ctx.fillStyle = '#4A0E17';
  ctx.fillRect(bannerX, curY, bannerW, bannerH);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeRect(bannerX, curY, bannerW, bannerH);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFDF7';
  ctx.font = `900 ${14 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('अधिकृत डिजिटल ऑनबोर्डिंग व किट वितरण पूर्तता प्रमाणपत्र', w / 2, curY + 16 * scale);

  ctx.fillStyle = '#FDE68A';
  ctx.font = `700 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('OFFICIAL DIGITAL ONBOARDING & KIT HANDOVER COMPLETION CERTIFICATE', w / 2, curY + 29 * scale);
  curY += bannerH + 14 * scale;

  // Completion Status Strip (Registration ID, Completion Date, Status)
  const metaBoxW = w - (pad + 16 * scale) * 2;
  const metaBoxX = pad + 16 * scale;
  const metaBoxH = 34 * scale;
  ctx.fillStyle = '#FAF5EC';
  ctx.fillRect(metaBoxX, curY, metaBoxW, metaBoxH);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeRect(metaBoxX, curY, metaBoxW, metaBoxH);

  // Column 1: Reg Number
  ctx.textAlign = 'left';
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('नोंदणी क्रमांक (Application ID):', metaBoxX + 10 * scale, curY + 13 * scale);
  ctx.fillStyle = '#EA580C';
  ctx.font = `900 ${11 * scale}px "Courier New", monospace`;
  ctx.fillText(vendor.regNumber, metaBoxX + 10 * scale, curY + 27 * scale);

  // Column 2: Completion Timestamp
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('पूर्तता तारीख व वेळ (Completion Time):', metaBoxX + 175 * scale, curY + 13 * scale);
  ctx.fillStyle = '#1C1917';
  ctx.font = `800 ${9.5 * scale}px "Arial", sans-serif`;
  ctx.fillText(`${formattedDate} • ${formattedTime}`, metaBoxX + 175 * scale, curY + 27 * scale);

  // Column 3: Status Badge
  ctx.fillStyle = '#065F46';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('ऑनबोर्डिंग स्थिती (Status):', metaBoxX + 355 * scale, curY + 13 * scale);

  ctx.fillStyle = '#D1FAE5';
  ctx.fillRect(metaBoxX + 355 * scale, curY + 17 * scale, 130 * scale, 13 * scale);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX + 355 * scale, curY + 17 * scale, 130 * scale, 13 * scale);

  ctx.fillStyle = '#065F46';
  ctx.font = `900 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('✓ १००% पूर्ण (COMPLETED)', metaBoxX + 363 * scale, curY + 26.5 * scale);

  curY += metaBoxH + 16 * scale;

  // Helper function for Section Headers
  const drawSectionHeader = (titleMr: string, titleEn: string, yPos: number) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4A0E17';
    ctx.font = `900 ${11 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
    ctx.fillText(titleMr, metaBoxX, yPos);

    ctx.fillStyle = '#9A3412';
    ctx.font = `700 ${8.5 * scale}px "Arial", sans-serif`;
    ctx.fillText(`• ${titleEn}`, metaBoxX + ctx.measureText(titleMr).width + 6 * scale, yPos);

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(metaBoxX, yPos + 4 * scale);
    ctx.lineTo(metaBoxX + metaBoxW, yPos + 4 * scale);
    ctx.stroke();
  };

  // Section 1: Merchant & Business Details
  drawSectionHeader('१. प्रमाणित दुकानदार व व्यवसाय तपशील', 'Verified Merchant & Business Particulars', curY);
  curY += 12 * scale;

  // 2-column key-value grid
  const rowH = 16 * scale;
  const col1X = metaBoxX + 8 * scale;
  const col1ValX = metaBoxX + 90 * scale;
  const col2X = metaBoxX + 250 * scale;
  const col2ValX = metaBoxX + 335 * scale;

  // Row 1
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('दुकानाचे नाव (Shop):', col1X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `900 ${9.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(vendor.shopName, col1ValX, curY);

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('अधिकृत मालक (Owner):', col2X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `800 ${9.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(vendor.ownerName, col2ValX, curY);
  curY += rowH;

  // Row 2
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('संपर्क (Mobile No):', col1X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `900 ${9.5 * scale}px "Courier New", monospace`;
  ctx.fillText(`+91 ${vendor.phone}`, col1ValX, curY);

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('व्यवसाय प्रकार (Category):', col2X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `700 ${9 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  const catNames: Record<string, string> = {
    kirana: 'किराणा व जनरल स्टोअर्स (Kirana)',
    food: 'खाद्यपदार्थ व स्नॅक्स (Food & Snacks)',
    vegetable: 'भाजीपाला व फळे (Fruits & Veg)',
    retail: 'कापड व रिटेल स्टोअर (Retail & Garments)',
    artisan: 'स्थानिक कारागीर व सेवा (Artisan & Service)',
  };
  ctx.fillText(catNames[vendor.category] || vendor.category, col2ValX, curY);
  curY += rowH;

  // Row 3
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('पत्ता / परिसर (Area):', col1X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `700 ${9 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(vendor.area, col1ValX, curY);

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('जिल्हा व पिनकोड (District):', col2X, curY);
  ctx.fillStyle = '#1C1917';
  ctx.font = `700 ${9 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(`${vendor.district} - ${vendor.pincode}`, col2ValX, curY);
  curY += rowH;

  // Row 4
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('निवडलेले पॅकेज (Package):', col1X, curY);
  ctx.fillStyle = '#4A0E17';
  ctx.font = `900 ${9.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(`${vendor.packageName} (₹${vendor.packagePrice})`, col1ValX, curY);

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('पडताळणी माध्यम:', col2X, curY);
  ctx.fillStyle = '#065F46';
  ctx.font = `800 ${9 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('ऑन-साइट डिजिटल सेतू मित्र प्रत्यक्ष भेट', col2ValX, curY);
  curY += rowH + 4 * scale;

  // Section 2: Completed Deliverables & Scope Checklist
  drawSectionHeader('२. पूर्ण झालेल्या डिजिटल सेवा व किट वाटप तपशील', 'Scope of Completed Deliverables & Digital Handover', curY);
  curY += 12 * scale;

  const deliverablesBoxY = curY;
  const deliverablesBoxH = 68 * scale;
  ctx.fillStyle = '#F0FDF4';
  ctx.fillRect(metaBoxX, deliverablesBoxY, metaBoxW, deliverablesBoxH);
  ctx.strokeStyle = '#86EFAC';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX, deliverablesBoxY, metaBoxW, deliverablesBoxH);

  const deliverables = [
    {
      title: 'Google Maps Business Listing Live & Pinned with Verified Address',
      descMr: 'दुकानाचे लोकेशन गुगल मॅप्सवर अचूक ब्लू-टिक सह लाइव्ह झाले असून ग्राहक थेट शोधू शकतात.',
    },
    {
      title: '5★ Google Review Acrylic Standee (NFC + QR Integrated) Handed Over',
      descMr: 'काऊंटरवर ठेवता येणारी वॉटरप्रूफ ५-स्टार रिव्ह्यू स्टँडी यशस्वीरीत्या दुकानात बसवली आहे.',
    },
    {
      title: 'Official Digital UPI Payment Soundbox Setup & Voice Alert Active',
      descMr: 'दुकानदाराच्या बँक खात्याशी जोडलेला व्हॉईस साऊंडबॉक्स व UPI क्यूआर सक्रिय करण्यात आला.',
    },
    {
      title: 'WhatsApp Business Digital Storefront Catalog Enabled',
      descMr: 'ग्राहकांसाठी ऑनलाईन कॅटलॉग व दुकानाची डिजिटल लिंक (maha-vyapaar.in) सक्रिय झाली आहे.',
    },
  ];

  let itemY = deliverablesBoxY + 11 * scale;
  deliverables.forEach((item) => {
    // Green Check Circle
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(metaBoxX + 12 * scale, itemY - 2 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${7 * scale}px "Arial", sans-serif`;
    ctx.fillText('✓', metaBoxX + 9.5 * scale, itemY + 0.5 * scale);

    // Text
    ctx.fillStyle = '#065F46';
    ctx.font = `800 ${8.5 * scale}px "Arial", sans-serif`;
    ctx.fillText(item.title, metaBoxX + 22 * scale, itemY - 2 * scale);

    ctx.fillStyle = '#166534';
    ctx.font = `600 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
    ctx.fillText(item.descMr, metaBoxX + 22 * scale, itemY + 8 * scale);

    itemY += 15 * scale;
  });

  curY = deliverablesBoxY + deliverablesBoxH + 16 * scale;

  // Section 3: Field Specialist & Handover Verification
  drawSectionHeader('३. प्रतिनिधी पूर्तता स्वाक्षरी व डिजिटल सुरक्षा पडताळणी', 'Field Specialist Signoff & Security QR Verification', curY);
  curY += 12 * scale;

  const authBoxY = curY;
  const authBoxH = 76 * scale;
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(metaBoxX, authBoxY, metaBoxW, authBoxH);
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX, authBoxY, metaBoxW, authBoxH);

  // Left: QR Code Box
  const qrX = metaBoxX + 12 * scale;
  const qrY = authBoxY + 8 * scale;
  const qrSize = 60 * scale;

  if (qrImg.complete && qrImg.naturalWidth > 0) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } else {
    ctx.fillStyle = '#4A0E17';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
  }
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  // QR Note
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4A0E17';
  ctx.font = `800 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('सुरक्षा पडताळणी QR कोड', qrX + qrSize + 10 * scale, qrY + 12 * scale);

  ctx.fillStyle = '#78350F';
  ctx.font = `600 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('हा QR स्कॅन केल्यावर महाव्यापार पोर्टलवर', qrX + qrSize + 10 * scale, qrY + 23 * scale);
  ctx.fillText('दुकानदाराचे थेट लाइव्ह प्रोफाइल व प्रमाणपत्र उघडते.', qrX + qrSize + 10 * scale, qrY + 33 * scale);

  ctx.fillStyle = '#065F46';
  ctx.font = `800 ${7.5 * scale}px "Courier New", monospace`;
  ctx.fillText(`STATUS: VERIFIED & ACTIVE [${vendor.regNumber}]`, qrX + qrSize + 10 * scale, qrY + 46 * scale);

  // Center: Official Corporate Circular Stamp
  const stampCenterX = metaBoxX + 315 * scale;
  const stampCenterY = authBoxY + 38 * scale;
  const stampRadius = 28 * scale;

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(stampCenterX, stampCenterY, stampRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 0.8 * scale;
  ctx.beginPath();
  ctx.arc(stampCenterX, stampCenterY, stampRadius - 3.5 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#991B1B';
  ctx.font = `900 ${6 * scale}px "Arial", sans-serif`;
  ctx.fillText('MAHAVYAPAAR DIGITAL', stampCenterX, stampCenterY - 12 * scale);
  ctx.fillText('★ COMPLETED ★', stampCenterX, stampCenterY - 3 * scale);
  ctx.font = `800 ${5.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('CORPORATE SETU CELL', stampCenterX, stampCenterY + 6 * scale);
  ctx.fillText('GOVT. RECOG. DISPATCH', stampCenterX, stampCenterY + 14 * scale);

  // Right: Designated Officer & Signatory
  const rightX = metaBoxX + metaBoxW - 12 * scale;
  ctx.textAlign = 'right';

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(`नियुक्त सेतू मित्र: ${officerName} (${officerPhone})`, rightX, authBoxY + 16 * scale);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = `italic 700 ${11 * scale}px "Brush Script MT", "Caveat", cursive, sans-serif`;
  ctx.fillText('Ismail Faraz & Team', rightX, authBoxY + 36 * scale);

  ctx.strokeStyle = '#4A0E17';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(rightX - 110 * scale, authBoxY + 42 * scale);
  ctx.lineTo(rightX, authBoxY + 42 * scale);
  ctx.stroke();

  ctx.fillStyle = '#4A0E17';
  ctx.font = `800 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('अधिकृत पूर्तता स्वाक्षरी / Handover Signatory', rightX, authBoxY + 52 * scale);
  ctx.fillStyle = '#78350F';
  ctx.font = `600 ${6.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('MahaVyapaar Digital Solutions Pvt. Ltd.', rightX, authBoxY + 61 * scale);

  curY = authBoxY + authBoxH + 16 * scale;

  // Bottom Footer Legal Disclaimer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78716C';
  ctx.font = `600 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(
    'हे अधिकृत डिजिटल ऑनबोर्डिंग पूर्तता प्रमाणपत्र महाव्यापार डिजिटल सोल्युशन्स प्रायव्हेट लिमिटेड द्वारे वितरीत करण्यात आले आहे.',
    w / 2,
    curY + 6 * scale
  );
  ctx.font = `600 ${7 * scale}px "Courier New", monospace`;
  ctx.fillText(
    `COMPLETION-ID: MV-SETU-${vendor.id.slice(0, 10).toUpperCase()} • ISSUED ON: ${formattedDate} ${formattedTime}`,
    w / 2,
    curY + 16 * scale
  );

  // Convert canvas to image and add to jsPDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthPt, a4HeightPt);

  // Filename: MahaVyapaar_Completion_[RegNumber].pdf
  const filename = `MahaVyapaar_Completion_${(vendor.regNumber || 'REG').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  try {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (blobErr) {
    console.warn('Fallback to standard pdf.save:', blobErr);
    pdf.save(filename);
  }
};
