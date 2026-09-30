import { Language } from '../types';

export interface FAQItem {
  keywords: string[];
  response: {
    mr: string;
    hi: string;
    en: string;
  };
  audioText: {
    mr: string;
    hi: string;
    en: string;
  };
}

export const aiKnowledgeBase: FAQItem[] = [
  {
    keywords: ['swiggy', 'zomato', 'स्विगी', 'झोमॅटो', 'ondc', 'ओएनडीसी', 'food', 'खाद्य', 'कागदपत्रे', 'documents', 'दस्तावेज'],
    response: {
      mr: '🍔 स्विगी, झोमॅटो आणि ONDC ऑनबोर्डिंगसाठी आवश्यक कागदपत्रे:\n१. मालकाचे पॅन कार्ड आणि आधार कार्ड\n२. दुकानाचा/गाड्याचा एफएसएसएआय (FSSAI) नोंदणी क्रमांक (केवळ ₹१००)\n३. बँक पासबुक किंवा कॅन्सल केलेला चेक\n४. खाद्यपदार्थांची मेन्यू यादी आणि दुकानाचे फोटो\n\n💡 महा-डिजिटल (₹१४९) योजनेमध्ये आमचा डिजिटल मित्र हे सर्व फॉर्म भरून देतो!',
      hi: '🍔 स्वीगी, जोमैटो और ONDC ऑनबोर्डिंग के लिए आवश्यक दस्तावेज:\n१. मालिक का पैन कार्ड और आधार कार्ड\n२. दुकान/स्टॉल का FSSAI खाद्य पंजीकरण (मात्र ₹१००)\n३. बैंक पासबुक या कैंसल चेक\n४. मेन्यू सूची और दुकान के फोटो\n\n💡 महा-डिजिटल (₹१४९) योजना में हमारे डिजिटल मित्र यह पूरी प्रक्रिया आपके लिए पूरी करते हैं!',
      en: '🍔 Documents required for Swiggy, Zomato & ONDC onboarding:\n1. Proprietor PAN Card & Aadhaar Card\n2. FSSAI Basic Food Registration (costs ₹100)\n3. Bank Passbook or Cancelled Cheque for UPI settlements\n4. Food Menu List and clear Storefront Photos\n\n💡 Under our Maha-Digital (₹149) package, our Digital Mitra handles the complete paperwork for you!',
    },
    audioText: {
      mr: 'स्विगी व झोमॅटोसाठी पॅन कार्ड, आधार कार्ड, एफएसएसएआय फूड लायसन्स आणि बँक पासबुक लागते. १४९ रुपयांच्या योजनेमध्ये आमचा मित्र हे सर्व करून देतो.',
      hi: 'स्वीगी और जोमैटो के लिए पैन कार्ड, आधार, एफएसएसएआई और बैंक पासबुक चाहिए। १४९ रुपये वाले प्लान में हम यह पूरा काम करवाते हैं।',
      en: 'For Swiggy and Zomato, you need PAN card, Aadhaar, FSSAI registration, and bank passbook. Our 149 rupees plan handles the complete onboarding.',
    },
  },
  {
    keywords: ['maps', 'google', 'मॅप्स', 'गुगल', 'लोकेशन', 'location', 'पत्ता', 'address'],
    response: {
      mr: '📍 गुगल मॅप्सवर दुकान सुरू करण्याची पद्धत:\n१. दुकानाचे अचूक नाव, पत्ता आणि संपर्क नंबर नोंदवणे.\n२. ग्राहकांना दिशा दाखवण्यासाठी अचूक जीपीएस पिन लावणे.\n३. दुकानाचे व उत्पादनांचे आकर्षक फोटो जोडणे.\n४. गुगल बिझनेस प्रोफाइल पडताळणी पूर्ण करणे.\n\n✨ हे सर्व ₹२९ च्या आरंभ सेतू योजनेमध्ये समाविष्ट आहे!',
      hi: '📍 गूगल मैप्स पर दुकान लाइव करने का तरीका:\n१. दुकान का सही नाम, पता और संपर्क नंबर दर्ज करना।\n२. ग्राहकों के लिए सटीक जीपीएस पिन सेट करना।\n३. दुकान व सामान के फोटो अपलोड करना।\n४. गूगल बिजनेस प्रोफाइल सत्यापन पूर्ण करना।\n\n✨ यह सुविधा ₹२९ की आरंभ सेतु योजना में शामिल है!',
      en: '📍 How Google Maps setup works for your shop:\n1. Register exact business name, landmark address & WhatsApp contact.\n2. Pinpoint accurate GPS location for easy customer navigation.\n3. Upload clear storefront & product photos.\n4. Official Google Business Verification.\n\n✨ This is fully included in the ₹29 Starter Setu plan!',
    },
    audioText: {
      mr: 'गुगल मॅप्सवर दुकानाचे नाव, फोटो व पत्ता टाकून ग्राहकांना लोकेशन दाखवले जाते. हे केवळ २९ रुपयांच्या आरंभ योजनेत समाविष्ट आहे.',
      hi: 'गूगल मैप्स पर दुकान का नाम, फोटो और जीपीएस पिन सेट किया जाता है। यह मात्र २९ रुपये की आरंभ योजना में शामिल है।',
      en: 'Google Maps setup adds your shop name, photos, and precise GPS location so local customers find you easily. Included in 29 rupees plan.',
    },
  },
  {
    keywords: ['योजना', 'plan', 'package', 'पॅकेज', 'किंमत', 'price', 'दर', 'difference', 'फरक', '२९', '७९', '१४९', 'discount'],
    response: {
      mr: '🏷️ तिन्ही डिजिटल कंपनी पॅकेजेसचा फरक:\n• ₹२९ (आरंभ): गुगल मॅप्स + QR साऊंडबॉक्स सहाय्य + डिजिटल ऑनबोर्डिंग पावती व अधिकारी वाटप\n• ₹७९ (प्रगती): आरंभ + २ किमी गुगल जाहिरात + ५-स्टार रिव्ह्यू स्टँडी + व्हॉट्सॲप कॅटलॉग\n• ₹१४९ (महा-डिजिटल): वरील सर्व + स्विगी, झोमॅटो, ONDC थेट नोंदणी + १-ऑन-१ डिजिटल मित्र भेट\n\n✅ कोणतीही छुपी फी नाही. कमाल मर्यादा ₹१५० आहे!',
      hi: '🏷️ तीनों डिजिटल कंपनी पैकेज का विवरण:\n• ₹२९ (आरंभ): गूगल मैप्स + QR साउंडबॉक्स मदद + डिजिटल ऑनबोर्डिंग रसीद व अधिकारी आवंटन\n• ₹७९ (प्रगती): आरंभ + २ किमी गूगल विज्ञापन + ५-स्टार रिव्यू स्टैंडी + व्हाट्सएप कैटलॉग\n• ₹१४९ (महा-डिजिटल): सभी सुविधाएं + स्वीगी, जोमैटो, ONDC लिस्टिंग + १-ऑन-१ डिजिटल मित्र सहायता\n\n✅ कोई छुपा शुल्क नहीं है। अधिकतम सीमा ₹१५० है!',
      en: '🏷️ Comparison of 3 Corporate Growth Packages:\n• ₹29 (Starter): Google Maps + QR Soundbox onboarding + Digital Onboarding Slip & Officer Assignment\n• ₹79 (Growth): Starter + 2km Hyperlocal Google Ads + 5-Star Review Standee + WhatsApp Catalog\n• ₹149 (Maha-Digital): All above + Swiggy, Zomato, ONDC Onboarding + 1-on-1 Field Support\n\n✅ Zero hidden fees. Capped strictly at ₹150!',
    },
    audioText: {
      mr: '२९ रुपयात गुगल मॅप्स, ७९ रुपयात गुगल जाहिरात व रिव्ह्यू स्टँडी, आणि १४९ रुपयात झोमॅटो स्विगी व ओएनडीसी ऑनबोर्डिंग मिळते.',
      hi: '२९ रुपये में गूगल मैप्स, ७९ रुपये में विज्ञापन और स्टैंडी, तथा १४९ रुपये में जोमैटो स्वीगी ऑनबोर्डिंग मिलती है।',
      en: '29 rupees gives Google Maps, 79 rupees adds Google Ads and Review Standee, and 149 rupees unlocks Swiggy, Zomato, and ONDC onboarding.',
    },
  },
  {
    keywords: ['gst', 'जीएसटी', 'कर', 'tax', 'कागदपत्र', 'उद्यम', 'udyam', 'shop act'],
    response: {
      mr: '📄 जीएसटी (GST) बद्दल माहिती:\nलहान दुकानदार, गाडेवाले आणि भाजी विक्रेत्यांसाठी जीएसटी असणे अजिबात बंधनकारक नाही! (वार्षिक उलाढाल ₹४० लाखांपर्यंत जीएसटी लागत नाही).\n\nआपण फक्त आधार कार्ड, पॅन कार्ड आणि उद्यम आधार (Udyam Aadhaar) द्वारे सर्व सवलती व डिजिटल सुविधा घेऊ शकता.',
      hi: '📄 जीएसटी (GST) के बारे में जानकारी:\nछोटे दुकानदारों और ठेलेवालों के लिए जीएसटी होना बिल्कुल जरूरी नहीं है! (₹४० लाख तक के सालाना टर्नओवर पर जीएसटी छूट है)।\n\nआप सिर्फ आधार कार्ड, पैन कार्ड या उद्यम आधार के जरिए सभी डिजिटल सुविधाएं शुरू कर सकते हैं।',
      en: '📄 Regarding GST Requirement:\nSmall shopkeepers and street vendors DO NOT need GST! (Businesses with annual turnover under ₹40 Lakhs are exempted).\n\nYou can easily onboard using only Aadhaar, PAN card, and free Udyam Aadhaar registration.',
    },
    audioText: {
      mr: 'लहान व्यापाऱ्यांना जीएसटीची अजिबात गरज नाही. आधार व पॅन कार्ड द्वारे आपण सर्व सुविधा सुरू करू शकता.',
      hi: 'छोटे व्यापारियों के लिए जीएसटी जरूरी नहीं है। आप आधार और पैन कार्ड से ही रजिस्ट्रेशन कर सकते हैं।',
      en: 'Small merchants do not need GST. You can onboard seamlessly with just your Aadhaar and PAN card.',
    },
  },
  {
    keywords: ['soundbox', 'qr', 'साऊंडबॉक्स', 'क्युआर', 'पेमेंट', 'phonepe', 'gpay', 'paytm', 'स्पीकर'],
    response: {
      mr: '🔊 मराठी साऊंडबॉक्स व QR कोड सहाय्यता:\n• ' +
        'ग्राहकाने पैसे पाठवल्यावर "फोनपे वर ५० रुपये मिळाले" अशी मराठीत स्पष्ट ऑडिओ घोषणा होते.\n• ' +
        'सर्व प्रमुख यूपीआय (GPay, PhonePe, Paytm, BHIM) एकाच क्यूआर वर चालतात.\n• ' +
        'पैसे थेट तुमच्या बँक खात्यात विना-कपात जमा होतात.',
      hi: '🔊 वॉयस साउंडबॉक्स व QR कोड सहायता:\n• ' +
        'भुगतान होने पर "फोनपे पर ५० रुपये प्राप्त हुए" जैसी स्पष्ट हिंदी/मराठी आवाज सुनाई देगी।\n• ' +
        'सभी यूपीआई ऐप्स (GPay, PhonePe, Paytm, BHIM) एक ही क्यूआर से चलेंगे।\n• ' +
        'पैसा सीधे आपके बैंक खाते में बिना किसी कटौती के आएगा।',
      en: '🔊 Voice Soundbox & All-In-One QR Assistance:\n• ' +
        'Instant voice alerts in Marathi / Hindi on every customer payment.\n• ' +
        'Accepts all UPI apps (GPay, PhonePe, Paytm, BHIM) with a single QR code.\n• ' +
        'Zero commission settlement directly into your savings/current bank account.',
    },
    audioText: {
      mr: 'साऊंडबॉक्समुळे प्रत्येक पेमेंटवर मराठीत आवाज येतो आणि पैसे थेट तुमच्या बँक खात्यात जमा होतात.',
      hi: 'साउंडबॉक्स से हर पेमेंट पर आवाज सुनाई देती है और पैसा सीधे आपके बैंक में जमा होता है।',
      en: 'The soundbox announces every incoming payment in your local language directly into your bank account.',
    },
  },
  {
    keywords: ['digital mitra', 'मित्र', 'मदत', 'help', 'माणूस', 'person', 'भेट', 'visit'],
    response: {
      mr: '🤝 डिजिटल मित्र कोण आहेत?\nडिजिटल मित्र हे महाव्यापार डिजिटल सेतू उपक्रमातील प्रशिक्षित स्थानिक तरुण स्वयंसेवक आहेत.\n• ते प्रत्यक्ष तुमच्या दुकानावर येतात.\n• तुमच्या मोबाईलमध्ये ॲप्स डाऊनलोड व सेटअप करून देतात.\n• क्यूआर कोड आणि गुगल मॅप्स लोकेशन पडताळतात.',
      hi: '🤝 डिजिटल मित्र कौन हैं?\nडिजिटल मित्र महाव्यापार डिजिटल सेतु पहल के प्रशिक्षित स्थानीय स्वयंसेवक हैं।\n• वे स्वयं आपकी दुकान पर आते हैं।\n• आपके फोन में ऐप्स और कैटलॉग सेटअप करते हैं।\n• क्यूआर और गूगल लोकेशन का भौतिक सत्यापन करते हैं।',
      en: '🤝 Who is a Digital Mitra?\nDigital Mitras are trained youth volunteers who visit your shop in person, configure your mobile apps, verify your GPS location, and train you in digital sales.',
    },
    audioText: {
      mr: 'डिजिटल मित्र हे स्थानिक प्रशिक्षित स्वयंसेवक आहेत जे प्रत्यक्ष तुमच्या दुकानाला भेट देऊन सर्व सेटअप करून देतात.',
      hi: 'डिजिटल मित्र स्थानीय प्रशिक्षित साथी हैं जो खुद आपकी दुकान पर आकर सारा काम पूरा कराते हैं।',
      en: 'Digital Mitras are trained field volunteers who visit your shop in person to handle setup and training.',
    },
  }
];

export function queryAiAssistant(
  question: string,
  lang: Language
): { text: string; audioText: string; quickReplies: string[] } {
  const lower = question.toLowerCase();

  let matched = aiKnowledgeBase.find((item) =>
    item.keywords.some((k) => lower.includes(k.toLowerCase()))
  );

  if (!matched) {
    // Default helpful response
    const defaultText = {
      mr: `🙏 धन्यवाद आपल्या प्रश्नासाठी! महाव्यापार पुढाकारांतर्गत आपण ₹२९ ते ₹१४९ मध्ये गुगल मॅप्स, फोनपे साऊंडबॉक्स, ५-स्टार रिव्ह्यू स्टँडी आणि झोमॅटो/स्विगी ऑनबोर्डिंग सुरू करू शकता.\n\nअधिक माहितीसाठी ९१३७७८६५०६ वर कॉल करा किंवा खालीलपैकी एका विषयावर क्लिक करा.`,
      hi: `🙏 आपके सवाल के लिए धन्यवाद! महाव्यापार पहल के अंतर्गत आप ₹२९ से ₹१४९ में गूगल मैप्स, साउंडबॉक्स, ५-स्टार रिव्यू स्टैंडी और जोमैटो/स्वीगी ऑनबोर्डिंग प्राप्त कर सकते हैं।\n\nअधिक जानकारी के लिए ९१३७७८६५०६ पर संपर्क करें।`,
      en: `🙏 Thank you for your question! Under the MahaVyapaar initiative, you can get Google Maps listing, UPI Soundbox, 5-Star Review Standee, and Swiggy/Zomato onboarding at ₹29 to ₹149.\n\nFor more help, call +91 9137786506 or choose a quick topic below.`,
    };

    const defaultAudio = {
      mr: 'महाव्यापार योजनेत २९ ते १४९ रुपयात गुगल मॅप्स, यूपीआय साऊंडबॉक्स आणि झोमॅटो स्विगी सुविधा मिळते. अधिक माहितीसाठी ९१३७७८६५०६ वर कॉल करा.',
      hi: 'महाव्यापार योजना में २९ से १४९ रुपये में गूगल मैप्स, साउंडबॉक्स और जोमैटो स्वीगी ऑनबोर्डिंग मिलती है।',
      en: 'Under MahaVyapaar you get Google Maps, UPI soundbox, and Swiggy Zomato onboarding at twenty nine to one hundred forty nine rupees.',
    };

    return {
      text: defaultText[lang],
      audioText: defaultAudio[lang],
      quickReplies: [
        lang === 'mr' ? 'झोमॅटो व स्विगी कागदपत्रे?' : lang === 'hi' ? 'जोमैटो स्वीगी दस्तावेज?' : 'Swiggy & Zomato docs?',
        lang === 'mr' ? 'योजनांचे दर व फरक?' : lang === 'hi' ? 'योजनाओं की दरें?' : 'Scheme pricing & differences?',
        lang === 'mr' ? 'गुगल मॅप्स सेटअप कसे होते?' : lang === 'hi' ? 'गूगल मैप्स सेटअप?' : 'Google Maps setup?',
        lang === 'mr' ? 'जीएसटी (GST) पाहिजे का?' : lang === 'hi' ? 'जीएसटी की जरूरत है?' : 'Is GST required?'
      ]
    };
  }

  return {
    text: matched.response[lang],
    audioText: matched.audioText[lang],
    quickReplies: [
      lang === 'mr' ? 'योजनांचे दर व फरक' : lang === 'hi' ? 'योजनाओं की दरें' : 'Scheme comparison',
      lang === 'mr' ? 'कागदपत्रे काय लागतात?' : lang === 'hi' ? 'दस्तावेज क्या लगेंगे?' : 'What documents needed?',
      lang === 'mr' ? 'साऊंडबॉक्स कसा मिळेल?' : lang === 'hi' ? 'साउंडबॉक्स कैसे मिलेगा?' : 'How to get Soundbox?'
    ]
  };
}
