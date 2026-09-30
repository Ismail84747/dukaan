import { jsPDF } from 'jspdf';
import { Vendor, Language } from '../types';
import { getAssignedOfficer, ASSIGNED_PHONE_FORMATTED, formatOfficerName } from './assignment';
import { generateQRCodeDataURL, getVendorShopUrl } from './qrCode';

/**
 * Generates a high-resolution, professional A4 Onboarding Receipt PDF for a vendor.
 * Uses high-DPI canvas rendering to ensure flawless Marathi/Hindi Devanagari typography,
 * authentic corporate stamps, QR codes, and government-grade formatting.
 */
export const generateReceiptPDF = async (vendor: Vendor, lang: Language = 'mr'): Promise<void> => {
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
  const formattedDate = new Date(vendor.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(vendor.createdAt || Date.now()).toLocaleTimeString('en-IN', {
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

  // Background
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, w, h);

  // Decorative Border
  const pad = 24 * scale;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  ctx.strokeStyle = '#4A0E17';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(pad + 4 * scale, pad + 4 * scale, w - (pad + 4 * scale) * 2, h - (pad + 4 * scale) * 2);

  // Corner decorative flourishes
  const cornerSize = 16 * scale;
  ctx.fillStyle = '#4A0E17';
  ctx.fillRect(pad, pad, cornerSize, 4 * scale);
  ctx.fillRect(pad, pad, 4 * scale, cornerSize);
  ctx.fillRect(w - pad - cornerSize, pad, cornerSize, 4 * scale);
  ctx.fillRect(w - pad - 4 * scale, pad, 4 * scale, cornerSize);
  ctx.fillRect(pad, h - pad - 4 * scale, cornerSize, 4 * scale);
  ctx.fillRect(pad, h - pad - cornerSize, 4 * scale, cornerSize);
  ctx.fillRect(w - pad - cornerSize, h - pad - 4 * scale, cornerSize, 4 * scale);
  ctx.fillRect(w - pad - 4 * scale, h - pad - cornerSize, 4 * scale, cornerSize);

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

  // Document Title Banner in Maroon with Gold Trim
  const bannerH = 34 * scale;
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
  ctx.fillText('अधिकृत डिजिटल ऑनबोर्डिंग पावती • OFFICIAL ONBOARDING RECEIPT', w / 2, curY + 16 * scale);

  ctx.fillStyle = '#FDE68A';
  ctx.font = `700 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('स्थानिक व्यवसाय डिजिटल सबलीकरण व प्रतिनिधी वाटप पत्र (Field Dispatch Slip)', w / 2, curY + 28 * scale);
  curY += bannerH + 16 * scale;

  // Metadata Strip (Receipt No, Date, Payment Status)
  const metaBoxW = w - (pad + 16 * scale) * 2;
  const metaBoxX = pad + 16 * scale;
  const metaBoxH = 32 * scale;
  ctx.fillStyle = '#FAF5EC';
  ctx.fillRect(metaBoxX, curY, metaBoxW, metaBoxH);
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX, curY, metaBoxW, metaBoxH);

  // Column 1: Receipt / Reg ID
  ctx.textAlign = 'left';
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('अर्ज क्रमांक / Registration ID:', metaBoxX + 10 * scale, curY + 12 * scale);
  ctx.fillStyle = '#B45309';
  ctx.font = `900 ${12 * scale}px "Courier New", monospace`;
  ctx.fillText(vendor.regNumber, metaBoxX + 10 * scale, curY + 25 * scale);

  // Column 2: Date & Time
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('दिनांक व वेळ / Date & Time:', metaBoxX + 135 * scale, curY + 12 * scale);
  ctx.fillStyle = '#1C1917';
  ctx.font = `700 ${9.5 * scale}px "Arial", sans-serif`;
  ctx.fillText(`${formattedDate} • ${formattedTime}`, metaBoxX + 135 * scale, curY + 25 * scale);

  // Column 3: Plan & Fee
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('भरणा केलेले शुल्क / Paid Fee:', metaBoxX + 255 * scale, curY + 12 * scale);
  ctx.fillStyle = '#047857';
  ctx.font = `900 ${13 * scale}px "Arial", sans-serif`;
  ctx.fillText(`₹${vendor.packagePrice} (Paid ✓)`, metaBoxX + 255 * scale, curY + 25 * scale);

  // Column 4: Status Badge
  ctx.fillStyle = '#065F46';
  ctx.fillRect(metaBoxX + 370 * scale, curY + 7 * scale, 90 * scale, 18 * scale);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('VERIFIED & ACTIVE', metaBoxX + 415 * scale, curY + 19 * scale);

  curY += metaBoxH + 16 * scale;

  // SECTION 1: MERCHANT & SHOP PARTICULARS
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

  drawSectionHeader('१. नोंदणीकृत दुकानदार व व्यवसायाची माहिती', 'Merchant & Business Details', curY);
  curY += 12 * scale;

  // 2-column key-value grid
  const rowH = 17 * scale;
  const col1X = metaBoxX + 8 * scale;
  const col1ValX = metaBoxX + 85 * scale;
  const col2X = metaBoxX + 245 * scale;
  const col2ValX = metaBoxX + 325 * scale;

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
  curY += rowH + 6 * scale;

  // SECTION 2: ASSIGNED SETU FIELD OFFICER
  drawSectionHeader('२. नियुक्त डिजिटल सेतू प्रतिनिधी व सेवा हमी', 'Designated Setu Field Specialist', curY);
  curY += 12 * scale;

  const officerBoxH = 34 * scale;
  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(metaBoxX, curY, metaBoxW, officerBoxH);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX, curY, metaBoxW, officerBoxH);

  ctx.fillStyle = '#4A0E17';
  ctx.font = `900 ${10.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(`क्षेत्र अधिकारी: ${officerName}`, metaBoxX + 10 * scale, curY + 14 * scale);

  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.fillText(`थेट संपर्क: ${ASSIGNED_PHONE_FORMATTED} • २४ तासांत ऑन-साइट पडताळणी व ५-स्टार रिव्ह्यू स्टँडी वाटप`, metaBoxX + 10 * scale, curY + 25 * scale);

  ctx.fillStyle = '#047857';
  ctx.font = `800 ${8.5 * scale}px "Arial", sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('✓ प्रतिनिधी नियुक्त (Assigned)', metaBoxX + metaBoxW - 10 * scale, curY + 18 * scale);
  ctx.textAlign = 'left';

  curY += officerBoxH + 16 * scale;

  // SECTION 3: INCLUDED DELIVERABLES & VERIFICATION QR
  drawSectionHeader('३. डिजिटल किट बाबी व अधिकृत स्कॅन कोड', 'Package Inclusions & Verification QR', curY);
  curY += 12 * scale;

  // Left column: Checklist of deliverables
  const qrBoxSize = 68 * scale;
  const qrBoxX = metaBoxX + metaBoxW - qrBoxSize - 4 * scale;

  const deliverables = [
    '✓ Google Maps अधिकृत लोकेशन पिन व गुगल बिझनेस प्रोफाईल',
    '✓ ॲक्रेलिक काऊंटर ५-स्टार रिव्ह्यू स्टँडी (NFC + QR स्कॅन)',
    '✓ UPI QR कोड व डिजिटल व्हॉईस साऊंडबॉक्स सहाय्य',
    '✓ ऑनलाईन डिजिटल दुकान पेज (Storefront URL)',
    '✓ सेतू प्रतिनिधीकडून थेट दुकानावर मोफत मार्गदर्शन व सहाय्य',
  ];

  let delivY = curY;
  ctx.fillStyle = '#1C1917';
  ctx.font = `700 ${8.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  deliverables.forEach((item) => {
    ctx.fillText(item, metaBoxX + 8 * scale, delivY);
    delivY += 13.5 * scale;
  });

  // Right column: QR code
  if (qrImg.complete && qrImg.naturalWidth > 0) {
    ctx.drawImage(qrImg, qrBoxX, curY - 4 * scale, qrBoxSize, qrBoxSize);
  } else {
    ctx.fillStyle = '#FAF5EC';
    ctx.fillRect(qrBoxX, curY - 4 * scale, qrBoxSize, qrBoxSize);
  }
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(qrBoxX, curY - 4 * scale, qrBoxSize, qrBoxSize);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#78350F';
  ctx.font = `700 ${7 * scale}px "Arial", sans-serif`;
  ctx.fillText('स्कॅन करून थेट दुकान पाहा', qrBoxX + qrBoxSize / 2, curY + qrBoxSize + 6 * scale);
  ctx.textAlign = 'left';

  curY += qrBoxSize + 16 * scale;

  // SECTION 4: STATUTORY GUIDANCE NOTICE
  const noticeBoxH = 28 * scale;
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(metaBoxX, curY, metaBoxW, noticeBoxH);
  ctx.strokeStyle = '#FCA5A5';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(metaBoxX, curY, metaBoxW, noticeBoxH);

  ctx.fillStyle = '#991B1B';
  ctx.font = `900 ${8 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('महत्त्वाची कायदेशीर सूचना (Corporate Guidance Notice):', metaBoxX + 8 * scale, curY + 11 * scale);

  ctx.fillStyle = '#7F1D1D';
  ctx.font = `600 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText(
    'आपण केलेले हे शुल्क भरणा केवळ खाजगी व्यवसाय मार्गदर्शन व डिजिटल ऑनबोर्डिंग सहाय्यासाठी आहे. महाव्यापार ही खाजगी मर्यादित कंपनी आहे.',
    metaBoxX + 8 * scale,
    curY + 21 * scale
  );
  curY += noticeBoxH + 20 * scale;

  // SECTION 5: SIGNATURE & OFFICIAL SEAL
  const signY = curY;
  // Left: Corporate Seal
  ctx.beginPath();
  const sealCenterX = metaBoxX + 50 * scale;
  const sealCenterY = signY + 18 * scale;
  const sealRadius = 22 * scale;
  ctx.arc(sealCenterX, sealCenterY, sealRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealCenterX, sealCenterY, sealRadius - 3 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4A0E17';
  ctx.font = `900 ${6 * scale}px "Arial", sans-serif`;
  ctx.fillText('MAHAVYAPAAR', sealCenterX, sealCenterY - 4 * scale);
  ctx.font = `800 ${5.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('★ VERIFIED ★', sealCenterX, sealCenterY + 3 * scale);
  ctx.font = `700 ${5 * scale}px "Arial", sans-serif`;
  ctx.fillText('DIGITAL SETU', sealCenterX, sealCenterY + 10 * scale);

  // Center: Generation Timestamp & Hash
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78716C';
  ctx.font = `600 ${7 * scale}px "Courier New", monospace`;
  ctx.fillText(`DOC-VERIFY-HASH: ${vendor.id.slice(0, 12).toUpperCase()}-DIGITAL-SETU`, w / 2, signY + 14 * scale);
  ctx.fillText('This is a computer generated official onboarding receipt slip.', w / 2, signY + 23 * scale);

  // Right: Signature
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1E3A8A';
  ctx.font = `italic 700 ${11 * scale}px "Brush Script MT", "Caveat", cursive, sans-serif`;
  ctx.fillText('Ismail Faraz & Team', metaBoxX + metaBoxW - 10 * scale, signY + 12 * scale);

  ctx.strokeStyle = '#4A0E17';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(metaBoxX + metaBoxW - 120 * scale, signY + 16 * scale);
  ctx.lineTo(metaBoxX + metaBoxW - 10 * scale, signY + 16 * scale);
  ctx.stroke();

  ctx.fillStyle = '#4A0E17';
  ctx.font = `800 ${7.5 * scale}px "Noto Sans Devanagari", "Tiro Devanagari Marathi", "Plus Jakarta Sans", "Arial", sans-serif`;
  ctx.fillText('अधिकृत स्वाक्षरी / Authorized Signatory', metaBoxX + metaBoxW - 10 * scale, signY + 24 * scale);
  ctx.fillStyle = '#78350F';
  ctx.font = `600 ${6.5 * scale}px "Arial", sans-serif`;
  ctx.fillText('MahaVyapaar Digital Solutions Pvt. Ltd.', metaBoxX + metaBoxW - 10 * scale, signY + 31 * scale);

  // Convert canvas to image and add to jsPDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthPt, a4HeightPt);

  // Clean filename: MahaVyapaar_Receipt_[RegNumber].pdf
  const filename = `MahaVyapaar_Receipt_${(vendor.regNumber || 'REG').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

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
