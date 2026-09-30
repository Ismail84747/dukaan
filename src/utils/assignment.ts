import { Vendor, Language } from '../types';

export const ASSIGNED_PHONE = '9137786506';
export const ASSIGNED_PHONE_FORMATTED = '+91 9137786506';

export type AssignedOfficerName = 'Ismail' | 'Faraz';

/**
 * Assigns Ismail or Faraz to a vendor deterministically
 */
export function getAssignedOfficer(vendor: { id?: string; shopName?: string; phone?: string }): AssignedOfficerName {
  const seed = (vendor.phone || vendor.id || vendor.shopName || '1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return seed % 2 === 0 ? 'Ismail' : 'Faraz';
}

export function formatOfficerName(officer: string, lang: Language = 'mr'): string {
  if (lang === 'hi') {
    return officer === 'Ismail' ? 'इस्माईल (Ismail)' : 'फ़राज़ (Faraz)';
  }
  if (lang === 'en') {
    return officer === 'Ismail' ? 'Ismail' : 'Faraz';
  }
  return officer === 'Ismail' ? 'इस्माईल (Ismail)' : 'फराझ (Faraz)';
}

/**
 * Builds the WhatsApp notification message for Ismail or Faraz on 9137786506
 */
export function buildAssignmentWhatsAppMessage(vendor: Vendor, officer: string = getAssignedOfficer(vendor), lang: Language = 'mr'): string {
  const officerName = formatOfficerName(officer, lang);
  if (lang === 'hi') {
    return (
      `🚨 *नई डिजिटल दुकान आवंटन सूचना (New Onboarding)*\n` +
      `----------------------------------------\n` +
      `👤 *नियुक्त अधिकारी:* ${officerName}\n` +
      `🏪 *दुकान:* ${vendor.shopName}\n` +
      `👨‍💼 *मालिक:* ${vendor.ownerName}\n` +
      `📞 *फोन:* ${vendor.phone}\n` +
      `📍 *पता:* ${vendor.area}, ${vendor.district} - ${vendor.pincode}\n` +
      `📦 *चुना हुआ पैकेज:* ${vendor.packageName} (₹${vendor.packagePrice})\n` +
      `🆔 *पंजीकरण संख्या:* ${vendor.regNumber}\n` +
      `💳 *मार्गदर्शन शुल्क:* भुगतान संपन्न (Guidance Fee)\n` +
      `⏰ *समय:* ${new Date(vendor.createdAt || Date.now()).toLocaleString('en-IN')}\n` +
      `----------------------------------------\n` +
      `📍 *कार्रवाई:* कृपया २४ घंटों में व्यापारी से संपर्क कर Google Maps पिन व ५-स्टार रिव्यू स्टेंडी कार्य पूरा करें।`
    );
  }
  if (lang === 'en') {
    return (
      `🚨 *New Digital Dukaan Assignment Notice*\n` +
      `----------------------------------------\n` +
      `👤 *Assigned Officer:* ${officerName}\n` +
      `🏪 *Shop:* ${vendor.shopName}\n` +
      `👨‍💼 *Owner:* ${vendor.ownerName}\n` +
      `📞 *Phone:* ${vendor.phone}\n` +
      `📍 *Address:* ${vendor.area}, ${vendor.district} - ${vendor.pincode}\n` +
      `📦 *Selected Plan:* ${vendor.packageName} (₹${vendor.packagePrice})\n` +
      `🆔 *Registration ID:* ${vendor.regNumber}\n` +
      `💳 *Fee:* Paid (Guidance Fee)\n` +
      `⏰ *Time:* ${new Date(vendor.createdAt || Date.now()).toLocaleString('en-IN')}\n` +
      `----------------------------------------\n` +
      `📍 *Action:* Please connect with the merchant within 24 hours to complete Google Maps verification & Standee setup.`
    );
  }

  return (
    `🚨 *नवीन डिजिटल दुकान वाटप सूचना (New Onboarding Assignment)*\n` +
    `----------------------------------------\n` +
    `👤 *नियुक्त अधिकारी:* ${officerName}\n` +
    `🏪 *दुकान:* ${vendor.shopName}\n` +
    `👨‍💼 *दुकानदार:* ${vendor.ownerName}\n` +
    `📞 *ग्राहक संपर्क:* ${vendor.phone}\n` +
    `📍 *पत्ता:* ${vendor.area}, ${vendor.district} - ${vendor.pincode}\n` +
    `📦 *निवडलेले पॅकेज:* ${vendor.packageName} (₹${vendor.packagePrice})\n` +
    `🆔 *नोंदणी क्रमांक:* ${vendor.regNumber}\n` +
    `💳 *मार्गदर्शन शुल्क:* भरले (Guidance Fee)\n` +
    `⏰ *नोंदणी वेळ:* ${new Date(vendor.createdAt || Date.now()).toLocaleString('en-IN')}\n` +
    `----------------------------------------\n` +
    `📍 *कृती:* कृपया २४ तासांत दुकानदाराशी संपर्क साधून Google Maps पिन व ५-स्टार रिव्ह्यू स्टँडी वाटप पूर्ण करावे.`
  );
}

/**
 * Builds the SMS notification message for Ismail or Faraz on 9137786506
 */
export function buildAssignmentSMSMessage(vendor: Vendor, officer: string = getAssignedOfficer(vendor), lang: Language = 'mr'): string {
  const officerName = formatOfficerName(officer, lang);
  return (
    `MahaVyapaar New Assignment: ${officerName} assigned to ${vendor.shopName} (${vendor.ownerName}, Mob: ${vendor.phone}). ` +
    `Area: ${vendor.area}, ${vendor.district}. Plan: ${vendor.packageName} (Rs.${vendor.packagePrice}). Reg: ${vendor.regNumber}. Guidance fee paid.`
  );
}

/**
 * Builds the SMS receipt message for the vendor/merchant
 */
export function buildVendorSMSReceipt(vendor: Vendor, officer: string = getAssignedOfficer(vendor), lang: Language = 'mr'): string {
  const officerName = formatOfficerName(officer, lang);
  if (lang === 'hi') {
    return (
      `महाव्यापार डिजिटल सेतु रसीद:\n` +
      `रजिस्ट्रेशन ID: ${vendor.regNumber}\n` +
      `दुकान: ${vendor.shopName}\n` +
      `मालिक: ${vendor.ownerName}\n` +
      `प्लान: ${vendor.packageName} (Rs.${vendor.packagePrice})\n` +
      `नियुक्त अधिकारी: ${officerName} (+91 9137786506)\n` +
      `विजिट: ४८ घंटे के भीतर\n` +
      `सूचना: भुगतान केवल व्यवसाय मार्गदर्शन के लिए है।`
    );
  }
  if (lang === 'en') {
    return (
      `MahaVyapaar Digital Setu Receipt:\n` +
      `Reg ID: ${vendor.regNumber}\n` +
      `Shop: ${vendor.shopName}\n` +
      `Owner: ${vendor.ownerName}\n` +
      `Plan: ${vendor.packageName} (Rs.${vendor.packagePrice})\n` +
      `Assigned Officer: ${officerName} (+91 9137786506)\n` +
      `Visit: Within 48 hours\n` +
      `Notice: Payment is strictly for business guidance.`
    );
  }

  return (
    `MahaVyapaar Digital Setu Receipt:\n` +
    `Reg ID: ${vendor.regNumber}\n` +
    `Shop: ${vendor.shopName}\n` +
    `Owner: ${vendor.ownerName}\n` +
    `Plan: ${vendor.packageName} (Rs.${vendor.packagePrice})\n` +
    `Assigned Officer: ${officerName} (+91 9137786506)\n` +
    `Visit: Within 48 hours\n` +
    `Notice: Payment is strictly for business guidance.`
  );
}

/**
 * Returns the SMS URL to send receipt directly to the vendor's mobile phone
 */
export function getVendorSMSReceiptUrl(vendor: Vendor, officer?: string, lang: Language = 'mr'): string {
  const text = buildVendorSMSReceipt(vendor, officer, lang);
  return `sms:+91${vendor.phone}?body=${encodeURIComponent(text)}`;
}

/**
 * Returns the WhatsApp URL to directly notify 9137786506
 */
export function getWhatsAppNotificationUrl(vendor: Vendor, officer?: string, lang: Language = 'mr'): string {
  const text = buildAssignmentWhatsAppMessage(vendor, officer, lang);
  return `https://api.whatsapp.com/send?phone=91${ASSIGNED_PHONE}&text=${encodeURIComponent(text)}`;
}

/**
 * Returns the SMS URL to directly notify 9137786506
 */
export function getSMSNotificationUrl(vendor: Vendor, officer?: string, lang: Language = 'mr'): string {
  const text = buildAssignmentSMSMessage(vendor, officer, lang);
  return `sms:+91${ASSIGNED_PHONE}?body=${encodeURIComponent(text)}`;
}
