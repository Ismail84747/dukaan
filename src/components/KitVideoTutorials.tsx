import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  MapPin,
  QrCode,
  Radio,
  FileCheck,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { Language } from '../types';
import { speakText, stopSpeaking, playSoundboxChime } from '../utils/speech';
import { ASSIGNED_PHONE_FORMATTED, ASSIGNED_PHONE, formatOfficerName, getAssignedOfficer } from '../utils/assignment';
import { IndianFlag } from './IndianFlag';

interface KitVideoTutorialsProps {
  lang: Language;
  onOpenApply?: () => void;
}

export type KitVideoId = 'soundbox' | 'standee' | 'maps' | 'receipt';

interface VideoStep {
  stepNum: number;
  timeSec: number;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  instruction: Record<Language, string>;
  narration: Record<Language, string>;
}

interface VideoGuide {
  id: KitVideoId;
  durationSec: number;
  title: Record<Language, string>;
  shortDesc: Record<Language, string>;
  badge: Record<Language, string>;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  steps: VideoStep[];
  simulationLabel: Record<Language, string>;
}

export const KitVideoTutorials: React.FC<KitVideoTutorialsProps> = ({ lang, onOpenApply }) => {
  const [activeVideoId, setActiveVideoId] = useState<KitVideoId>('soundbox');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.75 for elders / non-tech
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [simulatedPaymentAmount, setSimulatedPaymentAmount] = useState<number>(50);
  const [isSimulatingAction, setIsSimulatingAction] = useState<boolean>(false);
  const [shareNotice, setShareNotice] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const videoGuides: VideoGuide[] = [
    {
      id: 'soundbox',
      durationSec: 36,
      accentColor: '#EA580C',
      icon: Radio,
      title: {
        mr: '१. बोलणारा UPI साऊंडबॉक्स कसा वापरावा?',
        hi: '१. बोलने वाला UPI साउंडबॉक्स कैसे उपयोग करें?',
        en: '1. How to use the Voice UPI Soundbox?',
      },
      shortDesc: {
        mr: 'पॉवर चालू करणे, ग्राहकाचे पेमेंट होताच मोठ्या आवाजात मराठी घोषणा ऐकणे व दैनंदिन हिशोब.',
        hi: 'पावर ऑन करना, पेमेंट आते ही तेज आवाज में हिंदी घोषणा सुनना और दैनिक हिसाब।',
        en: 'Turning on power, hearing loud payment confirmation voice in Marathi/Hindi & daily totals.',
      },
      badge: {
        mr: 'सर्वात सोपे • हात मोकळे',
        hi: 'अति सरल • हैंड्स-फ्री',
        en: 'Easiest • Hands-Free',
      },
      simulationLabel: {
        mr: 'पेमेंट आवाज ऐका (₹५० टेस्ट)',
        hi: 'भुगतान आवाज सुनें (₹५० टेस्ट)',
        en: 'Hear Payment Voice (₹50 Test)',
      },
      steps: [
        {
          stepNum: 1,
          timeSec: 0,
          title: {
            mr: 'पॉवर बटन चालू करा (Power ON)',
            hi: 'पावर बटन चालू करें (Power ON)',
            en: 'Turn on the Power Switch',
          },
          subtitle: {
            mr: 'साऊंडबॉक्सच्या बाजूचे गोल बटन ३ सेकंद दाबून ठेवा. हिरवा दिवा पेटेल.',
            hi: 'साउंडबॉक्स के बगल का गोल बटन ३ सेकंड दबाए रखें। हरी बत्ती जलेगी।',
            en: 'Hold the side button for 3 seconds until the green LED turns on.',
          },
          instruction: {
            mr: 'साऊंडबॉक्स टेबलवर काऊंटरजवळ ठेवा. यात इनबिल्ट 4G सिमकार्ड असल्याने वायफायची गरज नाही.',
            hi: 'साउंडबॉक्स टेबल पर काउंटर के पास रखें। इसमें इनबिल्ट 4G सिम है, वाईफाई की जरूरत नहीं।',
            en: 'Place soundbox near billing desk. In-built 4G SIM works instantly without Wi-Fi.',
          },
          narration: {
            mr: 'नमस्कार दुकानदार बंधूंनो. साऊंडबॉक्स सुरू करण्यासाठी बाजूचे गोल बटन तीन सेकंद दाबून धरा. हिरवा दिवा लागताच स्पीकर तयार होतो.',
            hi: 'नमस्ते व्यापारी बंधुओं। साउंडबॉक्स चालू करने के लिए बगल का गोल बटन तीन सेकंड दबाएं। हरी बत्ती जलते ही स्पीकर तैयार हो जाता है।',
            en: 'Welcome shopkeepers. To start the soundbox, press the side power button for 3 seconds. The green light indicates ready state.',
          },
        },
        {
          stepNum: 2,
          timeSec: 12,
          title: {
            mr: 'ग्राहकाने QR स्कॅन करताच मोठा आवाज',
            hi: 'ग्राहक के QR स्कैन करते ही तेज आवाज',
            en: 'Loud Voice Confirmation on Scan',
          },
          subtitle: {
            mr: 'PhonePe, Google Pay किंवा Paytm वरून पैसे आल्यास स्पीकर मोठ्याने बोलेल.',
            hi: 'PhonePe, Google Pay या Paytm से पैसे आते ही स्पीकर स्पष्ट आवाज में बोलेगा।',
            en: 'Speaker immediately announces in Marathi/Hindi whenever any customer pays.',
          },
          instruction: {
            mr: 'गर्दीच्या वेळी मोबाईलमध्ये मेसेज तपासण्याची अजिबात गरज नाही; थेट कानाने ऐका!',
            hi: 'भीड़ के समय मोबाइल में SMS देखने की जरूरत नहीं; सीधे कानों से सुनें!',
            en: 'No need to check SMS in busy hours; loud announcement guarantees real credit!',
          },
          narration: {
            mr: 'ग्राहकाने कोणत्याही ॲपवरून पैसे पाठवताच साऊंडबॉक्स मोठ्या आवाजात बोलेल: फोनपे वर पन्नास रुपये मिळाले! गर्दीत मोबाईल पाहण्याची गरज नाही.',
            hi: 'ग्राहक के किसी भी ऐप से पैसे भेजते ही साउंडबॉक्स जोर से बोलेगा: फोनपे पर पचास रुपये प्राप्त हुए! मोबाइल देखने की जरूरत नहीं।',
            en: 'When a customer pays with any UPI app, the soundbox loudly announces: Received fifty rupees on PhonePe! Completely verified.',
          },
        },
        {
          stepNum: 3,
          timeSec: 24,
          title: {
            mr: 'दिवसभराचा हिशोब व बॅटरी चार्जिंग',
            hi: 'दिनभर का कुल हिसाब व चार्जिंग',
            en: 'Daily Total Balance & Charging',
          },
          subtitle: {
            mr: 'संध्याकाळी हिशोबाचे बटन दाबल्यास आज एकूण किती रुपये आले ते स्पीकर सांगेल.',
            hi: 'शाम को हिसाब का बटन दबाते ही आज कुल कितने रुपये आए, स्पीकर बताएगा।',
            en: 'Press the total balance button to hear todays entire collection sum.',
          },
          instruction: {
            mr: 'रात्री मोबाईल चार्जरने फक्त १ तास चार्ज करा; बॅटरी सलग ३ दिवस चालते.',
            hi: 'रात को सामान्य मोबाइल चार्जर से १ घंटा चार्ज करें; बैटरी ३ दिन चलती है।',
            en: 'Charge with any normal mobile charger for 1 hour; battery lasts up to 3 full days.',
          },
          narration: {
            mr: 'दुकान बंद करताना हिशोब बटन दाबा, स्पीकर आजची एकूण जमा रक्कम सांगेल. रात्री साध्या चार्जरने चार्ज करा, बॅटरी तीन दिवस चालते.',
            hi: 'दुकान बंद करते समय हिसाब बटन दबाएं, स्पीकर आज की कुल जमा राशि बताएगा। रात को चार्जर से चार्ज करें, बैटरी ३ दिन चलती है।',
            en: 'At shop closing, tap the summary button to hear total daily earnings. Charge once at night, battery lasts three days.',
          },
        },
      ],
    },
    {
      id: 'standee',
      durationSec: 32,
      accentColor: '#D97706',
      icon: QrCode,
      title: {
        mr: '२. ऍक्रेलिक ५-स्टार QR स्टँडी कशी ठेवावी?',
        hi: '२. ऐक्रेलिक ५-स्टार QR स्टेंडी कैसे रखें?',
        en: '2. How to place the 5-Star QR Standee?',
      },
      shortDesc: {
        mr: 'काऊंटरवर डोळ्यांसमोर ठेवणे, ग्राहकांना कॅमेऱ्याने स्कॅन करायला सांगणे व रेटिंग वाढवणे.',
        hi: 'काउंटर पर आंखों के सामने रखना, ग्राहकों से कैमरा स्कैन कराना और रेटिंग बढ़ाना।',
        en: 'Counter placement, having customers scan via phone camera & collecting 5-star ratings.',
      },
      badge: {
        mr: 'ग्राहक वाढवा • १० सेकंद',
        hi: 'ग्राहक बढ़ाएं • १० सेकंड',
        en: 'More Footfall • 10 Sec',
      },
      simulationLabel: {
        mr: 'कॅमेरा स्कॅन पाहा (५-स्टार)',
        hi: 'कैमरा स्कैन देखें (५-स्टार)',
        en: 'Simulate Camera Scan (5-Star)',
      },
      steps: [
        {
          stepNum: 1,
          timeSec: 0,
          title: {
            mr: 'बिलिंग काऊंटरवर नजरेसमोर ठेवा',
            hi: 'बिलिंग काउंटर पर नजरों के सामने रखें',
            en: 'Place at Eye-Level on Counter',
          },
          subtitle: {
            mr: 'स्टँडी मजबूत व वॉटरप्रूफ आहे. ग्राहकाला बिल देताना सहज दिसेल अशा जागेवर ठेवा.',
            hi: 'स्टेंडी मजबूत व वाटरप्रूफ है। बिल देते समय ग्राहक को सीधे दिखाई दे वहां रखें।',
            en: 'Durable acrylic standee is waterproof. Place directly where customers pay.',
          },
          instruction: {
            mr: 'या स्टँडीवर दोन गोष्टी आहेत: पैसे भरण्याचा UPI QR आणि गुगल ५-स्टार रिव्ह्यू QR.',
            hi: 'इस स्टेंडी पर दो चीजें हैं: पैसे भुगतान का UPI QR और गूगल ५-स्टार रिव्यू QR।',
            en: 'The dual standee holds both UPI payment QR and direct Google 5-Star review code.',
          },
          narration: {
            mr: 'मित्रांनो, ५-स्टार QR स्टँडी तुमच्या गल्ल्याजवळ ठेवा. हिच्यामुळे ग्राहक बिल भरताना तुमच्या सेवेचे कौतुक गुगलवर करू शकतात.',
            hi: 'साथियों, ५-स्टार QR स्टेंडी को काउंटर पर रखें। इससे ग्राहक भुगतान करते समय गूगल पर आपकी दुकान को ५-स्टार रेटिंग दे सकते हैं।',
            en: 'Place the 5-Star QR standee on your cash desk. Customers can easily leave 5-star Google ratings while paying bills.',
          },
        },
        {
          stepNum: 2,
          timeSec: 11,
          title: {
            mr: 'ग्राहकाला कॅमेऱ्याने स्कॅन करण्यास सांगा',
            hi: 'ग्राहक से मोबाइल कैमरे से स्कैन करने को कहें',
            en: 'Ask Customer to Scan via Camera',
          },
          subtitle: {
            mr: '"दादा, आपल्या दुकानाला ५-स्टार देऊन जा!" असे प्रेमाने सांगा.',
            hi: '"भैया, अपनी दुकान को एक ५-स्टार रिव्यू दे दीजिए!" प्यार से कहें।',
            en: 'Simply ask customers: "Please tap 5 stars for our shop on Google!"',
          },
          instruction: {
            mr: 'कोणतेही ॲप डाऊनलोड न करता मोबाईल कॅमेरा किंवा Google Lens थेट स्कॅन करतो.',
            hi: 'कोई ऐप डाउनलोड किए बिना मोबाइल कैमरा या गूगल लेंस सीधे स्कैन करता है।',
            en: 'No app download needed; standard phone camera or Google Lens opens it in 2 seconds.',
          },
          narration: {
            mr: 'ग्राहकाला सांगा: दादा, कॅमेरा समोर धरा. स्कॅन करताच तुमच्या दुकानाचे गुगल पेज उघडेल आणि ५-स्टार बटन समोर येईल.',
            hi: 'ग्राहक से कहें: भैया, मोबाइल कैमरा सामने लाइए। स्कैन होते ही दुकान का गूगल पेज खुलेगा और ५-स्टार बटन आ जाएगा।',
            en: 'Just tell the customer to point their camera. The shop Google page pops up with the 5-star rating stars ready to tap.',
          },
        },
        {
          stepNum: 3,
          timeSec: 22,
          title: {
            mr: '५ स्टार मिळताच परिसरातील रँकिंग वाढते',
            hi: '५ स्टार मिलते ही इलाके में दुकान ऊपर आएगी',
            en: 'Instant Boost in Local Search Ranking',
          },
          subtitle: {
            mr: 'जितके जास्त ५-स्टार रिव्ह्यू, तितके जास्त नवीन ग्राहक गुगल मॅप्सवरून दुकानात येतील.',
            hi: 'जितने ज्यादा ५-स्टार रिव्यू, उतने ज्यादा नए ग्राहक गूगल से आपकी दुकान पर आएंगे।',
            en: 'Higher reviews mean Google Maps recommends your shop first to nearby buyers.',
          },
          instruction: {
            mr: 'दररोज किमान ५ ग्राहकांकडून रिव्ह्यू घेतल्यास महिनाभरात १००+ रिव्ह्यू पूर्ण होतात.',
            hi: 'रोज ५ ग्राहकों से रिव्यू लेने पर महीने में १००+ रिव्यू पूरे हो जाते हैं।',
            en: 'Asking just 5 satisfied customers daily builds 100+ top reviews every single month.',
          },
          narration: {
            mr: 'ग्राहक ५-स्टार दाबून पोस्ट करतो. यामुळे गुगल तुमच्या दुकानाला परिसरातील नंबर १ दुकान म्हणून दाखवते आणि नफा वाढतो.',
            hi: 'ग्राहक ५-स्टार दबाकर पोस्ट करेगा। इससे गूगल आपकी दुकान को इलाके की सबसे भरोसेमंद दुकान के रूप में दिखाएगा।',
            en: 'With each 5-star rating, Google promotes your shop at the top of local searches, boosting footfall and profits.',
          },
        },
      ],
    },
    {
      id: 'maps',
      durationSec: 36,
      accentColor: '#10B981',
      icon: MapPin,
      title: {
        mr: '३. गुगल मॅप्सवर दुकान कसे दिसते व ग्राहक कसे येतात?',
        hi: '३. गूगल मैप्स पर दुकान कैसे दिखती है और ग्राहक कैसे आते हैं?',
        en: '3. How shop appears on Google Maps & brings customers?',
      },
      shortDesc: {
        mr: 'परिसरातील ग्राहकाने शोधल्यावर दुकान दिसणे, फोटो पाहणे व थेट दुकानाच्या दारात चालत येणे.',
        hi: 'इलाके के ग्राहक द्वारा सर्च करने पर दुकान दिखना, फोटो देखना और सीधे दुकान तक आना।',
        en: 'Nearby buyers searching, seeing shop photos, opening hours and walking turn-by-turn.',
      },
      badge: {
        mr: 'नवीन ग्राहक • २४ तास',
        hi: 'नए ग्राहक • २४ घंटे',
        en: 'New Footfall • 24/7',
      },
      simulationLabel: {
        mr: 'मॅप्स नेव्हिगेशन पाहा',
        hi: 'मैप्स नेविगेशन देखें',
        en: 'See Maps Navigation',
      },
      steps: [
        {
          stepNum: 1,
          timeSec: 0,
          title: {
            mr: 'ग्राहक गुगलवर शोधतो: "दुकान Near Me"',
            hi: 'ग्राहक गूगल पर खोजता है: "दुकान Near Me"',
            en: 'Customer Searches "Shop Near Me"',
          },
          subtitle: {
            mr: 'पुणे, मुंबई किंवा आपल्या गावातील कोणीही जवळचे दुकान शोधले की तुमचे नाव दिसते.',
            hi: 'आपके शहर या गांव में कोई भी किराना, होटल या दुकान खोजेगा तो आपका नाम दिखेगा।',
            en: 'Anyone in your locality searching for food, grocery or repair sees your verified shop.',
          },
          instruction: {
            mr: 'सेतू अधिकारी तुमच्या दुकानाचा अचूक GPS लोकेशन पिन गुगल मॅप्सवर लावतात.',
            hi: 'सेतु अधिकारी आपकी दुकान का सही GPS लोकेशन पिन गूगल मैप्स पर लगाते हैं।',
            en: 'MahaVyapaar officers register your precise GPS coordinates on the official Google map.',
          },
          narration: {
            mr: 'तुमच्या परिसरातील नवीन ग्राहक जेव्हा गुगल मॅप्स उघडतो, तेव्हा त्याला तुमच्या दुकानाचे नाव, पत्ता आणि फोन नंबर ठळक दिसतो.',
            hi: 'आपके इलाके का नया ग्राहक जब गूगल मैप्स खोलता है, तो उसे आपकी दुकान का नाम, पता और फोन नंबर स्पष्ट दिखाई देता है।',
            en: 'When shoppers open Google Maps nearby, your shop profile, photos, and contact info appear prominently.',
          },
        },
        {
          stepNum: 2,
          timeSec: 12,
          title: {
            mr: 'फोटो, कामाची वेळ व चालू स्थिती (Open Now)',
            hi: 'फोटो, दुकान खुलने का समय व स्थिति (Open Now)',
            en: 'Photos, Hours & "Open Now" Status',
          },
          subtitle: {
            mr: 'ग्राहक दुकानाचे फोटो बघून आणि दुकान चालू आहे का हे तपासून निघतात.',
            hi: 'ग्राहक दुकान की फोटो और दुकान खुली है या नहीं, यह देखकर खरीदारी के लिए आते हैं।',
            en: 'Shoppers check photos, verified badge, and current open hours before visiting.',
          },
          instruction: {
            mr: 'सकाळी ८ ते रात्री १० अशी तुमची अचूक वेळ गुगलवर हिरव्या रंगात "Open Now" दिसते.',
            hi: 'सुबह ८ से रात १० तक का समय गूगल पर हरे रंग में "Open Now" दिखता है।',
            en: 'Displays green "Open Now" badge during your working hours for maximum credibility.',
          },
          narration: {
            mr: 'ग्राहक दुकानाचे फोटो, मालाचे प्रकार आणि दुकान चालू आहे का हे पाहतो. हिरवा ओपन नाऊ पाहून ग्राहकाचा विश्वास बसतो.',
            hi: 'ग्राहक दुकान की फोटो और खुलने का समय देखता है। दुकान खुली देखकर ग्राहक तुरंत आने का फैसला लेता है।',
            en: 'Customers view clear shop photos and open timings. Seeing the active status encourages immediate store visits.',
          },
        },
        {
          stepNum: 3,
          timeSec: 24,
          title: {
            mr: 'दिशा (Directions) दाबून थेट दारात आगमन',
            hi: 'दिशानिर्देश (Directions) दबाकर सीधे दुकान पर पहुंचना',
            en: 'Directions Turn-by-Turn to Shop Door',
          },
          subtitle: {
            mr: 'गुगल मॅप्सचा निळा रस्ता ग्राहकाला वळणावळणाने थेट तुमच्या दुकानापर्यंत आणतो.',
            hi: 'गूगल मैप्स का नीला रास्ता ग्राहक को सीधे आपकी दुकान के दरवाजे तक ले आता है।',
            en: 'The blue GPS navigation line guides the customer step-by-step right outside your shop.',
          },
          instruction: {
            mr: 'यामुळे आडगल्लीत किंवा मुख्य रस्त्यापासून आत असणारे दुकानही सर्वांना सहज सापडते.',
            hi: 'इससे गली या अंदरूनी हिस्से में मौजूद दुकान भी नए ग्राहकों को आसानी से मिल जाती है।',
            en: 'Even shops located in interior lanes become easily discoverable to passersby.',
          },
          narration: {
            mr: 'ग्राहक डायरेक्शन्स बटन दाबतो आणि गुगलचा रस्ता त्याला चालत किंवा गाडीने थेट तुमच्या दुकानात घेऊन येतो. नफा आणि ग्राहक दोन्ही वाढतात.',
            hi: 'ग्राहक डायरेक्शंस बटन दबाता है और गूगल का नेविगेशन उसे सीधे आपकी दुकान पर ले आता है। ग्राहक और बिक्री दोनों बढ़ते हैं।',
            en: 'Customer taps Directions, and turn-by-turn navigation walks them directly into your shop. More buyers, more profit.',
          },
        },
      ],
    },
    {
      id: 'receipt',
      durationSec: 30,
      accentColor: '#B45309',
      icon: FileCheck,
      title: {
        mr: '४. अधिकृत ऑनबोर्डिंग पावती व किट वितरण मार्गदर्शक',
        hi: '४. आधिकारिक ऑनबोर्डिंग रसीद व किट वितरण मार्गदर्शक',
        en: '4. Official Onboarding Receipt & Kit Delivery Guide',
      },
      shortDesc: {
        mr: 'अधिकृत ऑनबोर्डिंग पावती, सुरक्षा QR कोड आणि नियुक्त सेतू प्रतिनिधीकडून किट वितरण.',
        hi: 'आधिकारिक ऑनबोर्डिंग रसीद, सुरक्षा QR कोड और नियुक्त सेतु प्रतिनिधि द्वारा किट वितरण।',
        en: 'Official onboarding receipt, security QR verification & field specialist kit delivery.',
      },
      badge: {
        mr: 'अधिकृत पावती • वाटप',
        hi: 'आधिकारिक रसीद • आवंटन',
        en: 'Official Receipt • Dispatch',
      },
      simulationLabel: {
        mr: 'पावती व QR पडताळणी पाहा',
        hi: 'रसीद व QR सत्यापन देखें',
        en: 'Simulate Receipt Scan',
      },
      steps: [
        {
          stepNum: 1,
          timeSec: 0,
          title: {
            mr: 'अधिकृत ऑनबोर्डिंग पावती सुरक्षित ठेवा',
            hi: 'आधिकारिक ऑनबोर्डिंग रसीद सुरक्षित रखें',
            en: 'Keep Onboarding Receipt Secure',
          },
          subtitle: {
            mr: 'पावतीवर तुमचा नोंदणी क्रमांक (Application ID) व भरणा केलेले शुल्क असते.',
            hi: 'रसीद पर आपका आवेदन क्रमांक व भुगतान शुल्क दर्ज होता है।',
            en: 'Contains your verified registration ID and cleared guidance fee.',
          },
          instruction: {
            mr: 'नोंदणी झाल्यावर ऑनबोर्डिंग पावतीची PDF डाऊनलोड करा व दुकानदाराने स्वतःकडे सुरक्षित ठेवावी.',
            hi: 'पंजीकरण के बाद ऑनबोर्डिंग रसीद की PDF डाउनलोड करें और सुरक्षित रखें।',
            en: 'Download the official onboarding receipt PDF slip immediately upon registration.',
          },
          narration: {
            mr: 'दुकानदार बंधूंनो, ऑनलाईन नोंदणी पूर्ण झाल्यावर अधिकृत ऑनबोर्डिंग पावती डाऊनलोड करा. या पावतीवर तुमचा अर्ज क्रमांक आणि नियुक्त अधिकाऱ्याचा नंबर असतो.',
            hi: 'व्यापारी बंधुओं, पंजीकरण पूर्ण होने पर आधिकारिक ऑनबोर्डिंग रसीद डाउनलोड करें। इस रसीद पर आपका आवेदन क्रमांक व अधिकारी का नंबर होता है।',
            en: 'Dear merchant, download your official onboarding receipt upon registration. It displays your application number and assigned officer phone.',
          },
        },
        {
          stepNum: 2,
          timeSec: 10,
          title: {
            mr: 'पावतीवरील QR कोडने थेट सत्यता पडताळणी',
            hi: 'रसीद के QR से तत्काल सत्यता जांच',
            en: 'Scan QR for Instant Online Verification',
          },
          subtitle: {
            mr: 'कोणीही मोबाईलने QR स्कॅन केल्यास पोर्टलवरील अधिकृत माहिती दिसते.',
            hi: 'कोई भी मोबाइल से QR स्कैन करेगा तो पोर्टल पर दुकान का आधिकारिक ब्योरा दिखेगा।',
            en: 'Scanning the QR instantly loads the official verified portal registry card.',
          },
          instruction: {
            mr: 'कोणतीही खोटी नोंदणी टाळण्यासाठी प्रत्येक पावतीवर वेगळा सुरक्षा QR कोड दिलेला आहे.',
            hi: 'नकली रसीद से बचाव के लिए हर दुकान को अलग डिजिटल सुरक्षा QR दिया गया है।',
            en: 'Each shop receives a unique tamper-proof security QR linked directly to database.',
          },
          narration: {
            mr: 'पावतीवरील सुरक्षा QR कोड स्कॅन केल्यावर महाव्यापार पोर्टलवर तुमच्या दुकानाची माहिती उघडते. खोटी माहिती देणाऱ्यांपासून दुकान सुरक्षित राहते.',
            hi: 'रसीद का कोड स्कैन करते ही पोर्टल पर दुकान की प्रामाणिक जानकारी खुल जाती है। दुकान की साख बढ़ती है।',
            en: 'Scanning verifies your business profile instantly on the portal, guaranteeing authenticity.',
          },
        },
        {
          stepNum: 3,
          timeSec: 20,
          title: {
            mr: '२४ तासांत नियुक्त प्रतिनिधीकडून किट वितरण',
            hi: '२४ घंटे में नियुक्त प्रतिनिधि द्वारा किट वितरण',
            en: '24-Hour Kit Delivery by Designated Specialist',
          },
          subtitle: {
            mr: 'इस्माईल किंवा फराझ थेट तुमच्या दुकानावर येऊन ५-स्टार स्टँडी व साहित्य देतात.',
            hi: 'इस्माईल या फ़राज़ सीधे आपकी दुकान पर आकर ५-स्टार स्टेंडी व सामग्री सौंपते हैं।',
            en: 'Field specialists visit your store directly with the 5-star acrylic standee.',
          },
          instruction: {
            mr: 'पावती क्रमांक दाखवून प्रतिनिधीकडून आपले अधिकृत डिजिटल साहित्य प्राप्त करून घ्या.',
            hi: 'रसीद संख्या दिखाकर प्रतिनिधि से अपनी आधिकारिक डिजिटल सामग्री प्राप्त करें।',
            en: 'Present your receipt ID to receive your 5-star review standee and Google Maps pin setup.',
          },
          narration: {
            mr: 'पावती मिळताच पुढील २४ ते ४८ तासांत आमचे नियुक्त अधिकारी तुमच्या दुकानावर येतात आणि Google Maps पिन व ५-स्टार रिव्ह्यू स्टँडी बसवून देतात.',
            hi: 'रसीद मिलते ही २४ से ४८ घंटों में हमारे प्रतिनिधि आपकी दुकान पर आते हैं और Google Maps पिन व ५-स्टार स्टेंडी चालू कर देते हैं।',
            en: 'Once the receipt is issued, our field specialist visits your shop within 24-48 hours to configure Google Maps and set up your review standee.',
          },
        },
      ],
    },
  ];

  const currentGuide = videoGuides.find((g) => g.id === activeVideoId) || videoGuides[0];

  // Determine current active step based on currentTime
  const currentStep =
    [...currentGuide.steps]
      .reverse()
      .find((step) => currentTime >= step.timeSec) || currentGuide.steps[0];

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((currentTime / currentGuide.durationSec) * 100)
  );

  // Play / Pause timer effect
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 250 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25;
          if (next >= currentGuide.durationSec) {
            setIsPlaying(false);
            return currentGuide.durationSec;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, currentGuide.durationSec]);

  // Voice narration trigger when step changes during playback
  const lastNarratedStepRef = useRef<number>(-1);
  useEffect(() => {
    if (isPlaying && !isAudioMuted && currentStep.stepNum !== lastNarratedStepRef.current) {
      lastNarratedStepRef.current = currentStep.stepNum;
      stopSpeaking();
      const textToSpeak = currentStep.narration[lang] || currentStep.narration.mr;
      speakText(textToSpeak, lang);
    }
  }, [isPlaying, isAudioMuted, currentStep.stepNum, lang]);

  const handleSelectVideo = (id: KitVideoId) => {
    stopSpeaking();
    lastNarratedStepRef.current = -1;
    setActiveVideoId(id);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      if (currentTime >= currentGuide.durationSec) {
        setCurrentTime(0);
        lastNarratedStepRef.current = -1;
      }
      setIsPlaying(true);
      if (!isAudioMuted) {
        const textToSpeak = currentStep.narration[lang] || currentStep.narration.mr;
        speakText(textToSpeak, lang);
      }
    }
  };

  const handleRestart = () => {
    stopSpeaking();
    lastNarratedStepRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(true);
    if (!isAudioMuted) {
      const textToSpeak = currentGuide.steps[0].narration[lang] || currentGuide.steps[0].narration.mr;
      speakText(textToSpeak, lang);
    }
  };

  const handleJumpToStep = (stepTimeSec: number) => {
    stopSpeaking();
    lastNarratedStepRef.current = -1;
    setCurrentTime(stepTimeSec);
    setIsPlaying(true);
  };

  const handleMuteToggle = () => {
    if (!isAudioMuted) {
      stopSpeaking();
      setIsAudioMuted(true);
    } else {
      setIsAudioMuted(false);
      const textToSpeak = currentStep.narration[lang] || currentStep.narration.mr;
      speakText(textToSpeak, lang);
    }
  };

  // Interactive Simulator action
  const handleRunSimulation = () => {
    setIsSimulatingAction(true);
    stopSpeaking();

    if (activeVideoId === 'soundbox') {
      playSoundboxChime();
      setTimeout(() => {
        const text =
          lang === 'mr'
            ? `फोनपे वर ${simulatedPaymentAmount} रुपये प्राप्त झाले!`
            : lang === 'hi'
            ? `फोनपे पर ${simulatedPaymentAmount} रुपये प्राप्त हुए!`
                        : `Received ${simulatedPaymentAmount} Rupees on PhonePe!`;
        speakText(text, lang);
        setTimeout(() => setIsSimulatingAction(false), 2500);
      }, 350);
    } else if (activeVideoId === 'standee') {
      setTimeout(() => {
        const text =
          lang === 'mr'
            ? 'गुगल ५-स्टार रिव्ह्यू यशस्वीरीत्या सबमिट झाला! दुकानाला नवीन रेटिंग जोडले गेले.'
            : lang === 'hi'
            ? 'गूगल ५-स्टार रिव्यू सफलतापूर्वक सबमिट हुआ! दुकान को नई रेटिंग मिली।'
            : 'Google 5-Star Review submitted successfully! Store rating updated.';
        speakText(text, lang);
        setIsSimulatingAction(false);
      }, 1500);
    } else if (activeVideoId === 'maps') {
      setTimeout(() => {
        const text =
          lang === 'mr'
            ? 'गुगल मॅप्स: १०० मीटर पुढे डावीकडे वळा, आपले दुकान समोर आहे!'
            : lang === 'hi'
            ? 'गूगल मैप्स: १०० मीटर आगे बाएं मुड़ें, आपकी दुकान सामने है!'
            : 'Google Maps: In 100 meters turn left, your destination shop is ahead!';
        speakText(text, lang);
        setIsSimulatingAction(false);
      }, 1500);
    } else {
      setTimeout(() => {
        const text =
          lang === 'mr'
            ? 'ऑनबोर्डिंग पावती व QR पडताळणी यशस्वी! नोंदणीकृत अधिकृत व्यापारी आयडी वैध आहे.'
            : lang === 'hi'
            ? 'ऑनबोर्डिंग रसीद व QR सत्यापन सफल! पंजीकृत व्यापारी आईडी वैध है।'
            : 'Receipt and QR verification successful! Registered official merchant ID is valid.';
        speakText(text, lang);
        setIsSimulatingAction(false);
      }, 1500);
    }
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `*महाव्यापार डिजिटल किट व्हिडिओ मार्गदर्शक*\n` +
      `दुकानदारांसाठी साऊंडबॉक्स, QR स्टँडी, गुगल मॅप्स व ऑनबोर्डिंग पावती वापरण्याची सोपी पद्धत शिका:\n` +
      `https://ais-dev-ttac47smwicmk3gsvkzlnt-381367807080.asia-southeast1.run.app\n` +
      `मदत क्रमांक: ${ASSIGNED_PHONE_FORMATTED}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 3000);
  };

  return (
    <section
      id="video-guides"
      className="py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-[#FAF5EC] via-[#FFFDF7] to-[#FAF2DF] border-b border-amber-800/20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-200 text-[#4A0E17] border border-amber-400 text-xs font-black mb-3 shadow-xs">
            <IndianFlag size="xs" />
            <span>
              {lang === 'mr'
                ? 'चित्रमय सोपे व्हिडिओ प्रशिक्षण (Simple Visual Video Guides)'
                : lang === 'hi'
                ? 'सरल सचित्र वीडियो प्रशिक्षण (Simple Visual Video Guides)'
                : 'Interactive Visual Video Guides for Digital Kit'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#4A0E17] tracking-tight font-heading">
            {lang === 'mr'
              ? 'डिजिटल किट कसे वापरावे? (व्हिडिओ मार्गदर्शक)'
              : lang === 'hi'
              ? 'डिजिटल किट का उपयोग कैसे करें? (वीडियो गाइड)'
              : 'How to Use Your Digital Kit? (Interactive Video Guides)'}
          </h2>

          <p className="text-[#5C2B14] text-sm sm:text-base mt-2.5 font-semibold">
            {lang === 'mr'
              ? 'मोबाईल किंवा कॉम्प्युटरची जास्त माहिती नसतानाही ५ मिनिटांत शिका — साऊंडबॉक्स, QR स्टँडी, गुगल मॅप्स व ऑनबोर्डिंग पावतीचा सोपा वापर.'
              : lang === 'hi'
              ? 'तकनीक की ज्यादा समझ न होने पर भी ५ मिनट में सीखें — साउंडबॉक्स, QR स्टेंडी, गूगल मैप्स व ऑनबोर्डिंग रसीद का सरल उपयोग।'
              : 'Designed for non-technical shopkeepers — learn how to operate your soundbox, standee, maps pin, and onboarding receipt in 5 minutes.'}
          </p>
        </div>

        {/* Accessibility Toolbar (Language narration, 0.75x speed, audio mute, help officer) */}
        <div className="bg-[#FAF5EC] border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Speed selection for senior / non-technical shopkeepers */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#4A0E17] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{lang === 'mr' ? 'व्हिडिओ गती (Speed):' : 'Speed:'}</span>
              </span>
              <div className="inline-flex rounded-lg border border-amber-400 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(0.75)}
                  className={`px-2.5 py-1 text-xs font-black rounded-md transition cursor-pointer ${
                    playbackSpeed === 0.75
                      ? 'bg-[#EA580C] text-amber-950 shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                  title="ज्येष्ठ दुकानदारांसाठी सावकाश गती (Slower for elders)"
                >
                  0.75x ({lang === 'mr' ? 'सावकाश' : lang === 'hi' ? 'धीमी' : 'Slow'})
                </button>
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(1.0)}
                  className={`px-2.5 py-1 text-xs font-black rounded-md transition cursor-pointer ${
                    playbackSpeed === 1.0
                      ? 'bg-[#EA580C] text-amber-950 shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  1.0x ({lang === 'mr' ? 'सामान्य' : lang === 'hi' ? 'सामान्य' : 'Normal'})
                </button>
              </div>
            </div>

            {/* Audio Voice Narration Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMuteToggle}
                className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  !isAudioMuted
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                    : 'bg-rose-100 text-rose-950 border-rose-300'
                }`}
                title="व्हॉईस आवाज सुरू किंवा बंद करा"
              >
                {!isAudioMuted ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                    <span>{lang === 'mr' ? 'मोठ्याने आवाज चालू ✓' : 'Loud Voice ON ✓'}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-700" />
                    <span>{lang === 'mr' ? 'आवाज मूक (Muted)' : 'Voice Muted'}</span>
                  </>
                )}
              </button>

              {/* Share Guide on WhatsApp for shop helper or family */}
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="मुलाला किंवा सहकाऱ्याला व्हॉट्सॲपवर पाठवा"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === 'mr' ? 'घरच्यांना पाठवा' : lang === 'hi' ? 'परिवार को भेजें' : 'Share on WhatsApp'}
                </span>
                <span className="sm:hidden">WhatsApp</span>
              </button>

              {/* Direct Call to Field Specialist */}
              <a
                href={`tel:${ASSIGNED_PHONE}`}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="मार्गदर्शनासाठी थेट कॉल करा"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {lang === 'mr' ? 'मदत: ' : 'Help: '}
                  {formatOfficerName(getAssignedOfficer({ id: 'support' }))} ({ASSIGNED_PHONE_FORMATTED})
                </span>
                <span className="md:hidden">९१३७७८६५०६</span>
              </a>
            </div>
          </div>

          {shareNotice && (
            <div className="mt-2 text-center text-xs font-black text-emerald-800 bg-emerald-100/80 py-1 rounded-lg border border-emerald-300">
              ✓ व्हॉट्सॲप मेसेज उघडला आहे! आपण कुटुंब किंवा दुकानातील सहकाऱ्याला व्हिडिओ लिंक पाठवू शकता.
            </div>
          )}
        </div>

        {/* 4 Video Module Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {videoGuides.map((guide) => {
            const isCurrent = guide.id === activeVideoId;
            const Icon = guide.icon;

            return (
              <div
                key={guide.id}
                onClick={() => handleSelectVideo(guide.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#FFFDF7] to-amber-100/90 border-[#EA580C] shadow-md ring-2 ring-amber-400 scale-[1.02]'
                    : 'bg-white/80 border-amber-300/60 hover:bg-[#FFFDF7] hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                        isCurrent
                          ? 'bg-[#EA580C] text-amber-950 shadow-xs'
                          : 'bg-amber-100 text-[#4A0E17]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? 'bg-amber-200 text-[#4A0E17] border border-amber-400'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {guide.badge[lang] || guide.badge.mr}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-[#2B0E14] font-heading line-clamp-2">
                    {guide.title[lang] || guide.title.mr}
                  </h3>
                  <p className="text-[11px] text-[#5C2B14] line-clamp-2 mt-1">
                    {guide.shortDesc[lang] || guide.shortDesc.mr}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-200/80 text-[10px] font-black">
                  <span className="text-stone-500">{guide.durationSec}s {lang === 'mr' ? 'व्हिडिओ' : 'Video'}</span>
                  <span
                    className={`flex items-center gap-1 ${
                      isCurrent ? 'text-[#EA580C] font-black' : 'text-stone-600'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Play className="w-3 h-3 fill-current animate-pulse" />
                        <span>{lang === 'mr' ? 'चालू आहे' : 'Active'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'mr' ? 'पहा' : 'Watch'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            MAIN INTERACTIVE VIDEO PLAYER FRAME
            ======================================================== */}
        <div className="bg-[#1C140E] rounded-3xl border-3 border-amber-500/50 shadow-2xl overflow-hidden text-white">
          {/* Top Video Header Strip */}
          <div className="bg-[#2B1B10] px-4 sm:px-6 py-3 border-b border-amber-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs sm:text-sm font-black text-amber-200 font-heading">
                {currentGuide.title[lang] || currentGuide.title.mr}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                {lang === 'mr' ? 'पायरी' : 'Step'} {currentStep.stepNum} / {currentGuide.steps.length}
              </span>
              <span className="font-mono text-amber-300 font-black">
                {Math.floor(currentTime)}s / {currentGuide.durationSec}s
              </span>
            </div>
          </div>

          {/* Animated Visual Stage (Interactive Simulated Canvas) */}
          <div className="relative min-h-[320px] sm:min-h-[400px] bg-gradient-to-b from-[#140C07] to-[#26150C] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Background ambient lighting effects */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(234, 88, 12, 0.4) 0%, transparent 70%)',
              }}
            />

            {/* SCENE 1: SOUNDBOX DEMONSTRATION */}
            {activeVideoId === 'soundbox' && (
              <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                {/* Simulated Soundbox Device */}
                <div className="relative w-48 sm:w-56 bg-gradient-to-b from-[#334155] to-[#0F172A] rounded-2xl p-4 sm:p-5 border-2 border-amber-400 shadow-2xl text-center">
                  {/* Speaker Grill */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#1E293B] border-4 border-amber-500/80 flex items-center justify-center mb-3 relative overflow-hidden shadow-inner">
                    <Radio className="w-12 h-12 text-amber-400" />
                    {/* Animated Sound Wave Rings */}
                    {(isPlaying || isSimulatingAction) && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-60 pointer-events-none" />
                        <div className="absolute inset-2 rounded-full border border-emerald-400 animate-pulse opacity-70 pointer-events-none" />
                      </>
                    )}
                  </div>

                  {/* MahaVyapaar Brand Badge on Soundbox */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black mb-2 shadow-xs">
                    <IndianFlag size="xs" />
                    <span>महाव्यापार साऊंडबॉक्स</span>
                  </div>

                  {/* LED Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">4G SIM ACTIVE • READY</span>
                  </div>

                  {/* Dual UPI Logos */}
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-amber-200 bg-black/40 py-1 rounded-lg">
                    <span>PhonePe</span> • <span>GPay</span> • <span>Paytm</span>
                  </div>
                </div>

                {/* Simulated Customer Payment Event Notification Bubble */}
                <div className="mt-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl px-5 py-3 shadow-xl max-w-md text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-black mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'mr' ? 'मोठ्याने आवाज आला:' : 'Loud Voice Spoken:'}</span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white font-heading">
                    {lang === 'mr'
                      ? `"PhonePe वर ₹${simulatedPaymentAmount} प्राप्त झाले!"`
                      : lang === 'hi'
                      ? `"PhonePe पर ₹${simulatedPaymentAmount} प्राप्त हुए!"`
                      : `"Received ₹${simulatedPaymentAmount} on PhonePe!"`}
                  </p>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    {lang === 'mr' ? '✓ मोबाईल न उघडता थेट कानाने खात्री!' : 'Instant hands-free verification!'}
                  </p>

                  {/* Payment Amount Test Selector Chips */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-emerald-300">
                      {lang === 'mr' ? 'रक्कम निवडा:' : 'Select Amount:'}
                    </span>
                    {[20, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSimulatedPaymentAmount(amt)}
                        className={`px-2 py-0.5 rounded text-[11px] font-black transition cursor-pointer ${
                          simulatedPaymentAmount === amt
                            ? 'bg-amber-400 text-amber-950 shadow-xs scale-105'
                            : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: STANDEE & CAMERA SCAN DEMONSTRATION */}
            {activeVideoId === 'standee' && (
              <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <div className="relative bg-gradient-to-b from-[#FFFDF7] to-amber-50 text-[#4A0E17] rounded-2xl p-5 border-4 border-amber-400 shadow-2xl w-56 sm:w-64 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <IndianFlag size="xs" />
                    <span className="text-[11px] font-black text-[#EA580C]">5-STAR GOOGLE REVIEW</span>
                  </div>

                  {/* 5 Stars Rating Animation */}
                  <div className="flex items-center justify-center gap-1 mb-3 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-xl animate-bounce" style={{ animationDelay: `${s * 100}ms` }}>
                        ★
                      </span>
                    ))}
                  </div>

                  {/* QR Code Container */}
                  <div className="relative bg-white p-3 rounded-xl border-2 border-amber-300 inline-block shadow-inner">
                    <QrCode className="w-24 h-24 sm:w-28 sm:h-28 text-[#4A0E17]" />
                    {/* Viewfinder laser animation */}
                    <div className="absolute inset-x-2 top-2 h-1 bg-[#EA580C] shadow-lg animate-pulse" />
                  </div>

                  <p className="text-xs font-black text-[#4A0E17] mt-3">
                    {lang === 'mr' ? 'कॅमेऱ्याने स्कॅन करा' : 'Scan with Camera'}
                  </p>
                  <span className="text-[10px] text-stone-600 block">
                    {lang === 'mr' ? '१० सेकंदात ५-स्टार रेटिंग द्या' : 'Tap 5 stars in 10 sec'}
                  </span>
                </div>

                <div className="mt-4 bg-amber-950/90 border-2 border-amber-400 rounded-2xl px-5 py-2.5 shadow-xl text-center">
                  <span className="text-xs font-black text-amber-200">
                    {lang === 'mr' ? 'ग्राहकाचा अनुभव:' : 'Customer Experience:'}
                  </span>
                  <p className="text-sm font-bold text-white">
                    {lang === 'mr'
                      ? 'कोणतेही ॲप न घेता थेट गुगलवर ५ स्टार सबमिट होतात!'
                      : 'Opens directly on Google Maps; no app download required!'}
                  </p>
                </div>
              </div>
            )}

            {/* SCENE 3: GOOGLE MAPS PIN & SHOP DISCOVERY */}
            {activeVideoId === 'maps' && (
              <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                {/* Simulated Google Maps Screen */}
                <div className="w-full max-w-md bg-[#1E293B] rounded-2xl p-4 border-2 border-emerald-400 shadow-2xl relative overflow-hidden">
                  {/* Grid Lines simulating map streets */}
                  <div className="h-32 bg-[#0F172A] rounded-xl relative overflow-hidden border border-slate-700 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                    {/* Simulated blue route line */}
                    <div className="absolute w-40 h-1 bg-sky-400 rounded-full rotate-12 shadow-[0_0_12px_#38bdf8]" />

                    {/* Animated Pulsing Geopin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black text-white bg-black/80 px-2 py-0.5 rounded-md border border-rose-500 mt-1 shadow-md">
                        {lang === 'mr' ? 'आपले दुकान (Open Now)' : 'Your Shop (Open Now)'}
                      </span>
                    </div>
                  </div>

                  {/* Shop Details Card on Map */}
                  <div className="mt-3 bg-white text-[#2B0E14] p-3 rounded-xl flex items-center justify-between gap-3 shadow-md">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{lang === 'mr' ? 'सुरू आहे • Open Now' : 'Open Now'}</span>
                        <span className="text-amber-500">★ 4.9 (128)</span>
                      </div>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">
                        {lang === 'mr' ? 'स्थानिक ग्राहक ५० मीटर अंतरावर' : 'Local shopper 50m away'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center gap-1 shadow-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{lang === 'mr' ? 'दिशा (Route)' : 'Directions'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-amber-200">
                  {lang === 'mr'
                    ? 'परिसरातील नवीन ग्राहकांना गुगल मॅप्स थेट तुमच्या दुकानाच्या दारात आणते.'
                    : 'Turn-by-turn navigation brings nearby buyers straight to your shop door.'}
                </div>
              </div>
            )}

            {/* SCENE 4: OFFICIAL ONBOARDING RECEIPT & KIT DISPATCH */}
            {activeVideoId === 'receipt' && (
              <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                {/* Official Onboarding Receipt Simulation */}
                <div className="w-64 sm:w-72 bg-[#FFFDF7] text-[#4A0E17] rounded-xl p-4 border-4 border-amber-600 shadow-2xl text-center relative">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IndianFlag size="xs" />
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      महाव्यापार डिजिटल सेतू
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-[#4A0E17] font-heading border-b border-amber-200 pb-1">
                    अधिकृत ऑनबोर्डिंग पावती (Receipt Slip)
                  </h4>

                  <div className="my-2 bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-left space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7C2D12] font-bold">अर्ज क्र:</span>
                      <span className="font-mono font-black text-[#EA580C]">MV-MH-2025-0891</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7C2D12] font-bold">शुल्क भरणा:</span>
                      <span className="font-black text-emerald-700">₹२९ / ₹७९ (Paid ✓)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7C2D12] font-bold">नियुक्त प्रतिनिधी:</span>
                      <span className="font-bold text-[#4A0E17]">इस्माईल (9137786506)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 py-1 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{lang === 'mr' ? 'नोंदणी व प्रतिनिधी वाटप यशस्वी' : 'Registration & Dispatch Verified'}</span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-950/90 border-2 border-amber-400 rounded-2xl px-5 py-2.5 shadow-xl text-center">
                  <p className="text-xs font-bold text-amber-100">
                    {lang === 'mr'
                      ? 'अधिकृत पावतीची PDF डाऊनलोड करा; २४ तासांत नियुक्त अधिकारी किट वितरणासाठी दुकानावर येतील.'
                      : 'Download your official PDF slip; designated field specialist visits your store within 24 hours.'}
                  </p>
                </div>
              </div>
            )}

            {/* Closed Captions Subtitles Strip (Synced with Step Narration) */}
            <div className="w-full max-w-2xl mt-6 bg-black/80 backdrop-blur-xs border-2 border-amber-500/60 rounded-2xl p-3.5 sm:p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-1 text-amber-400 text-xs font-black">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {lang === 'mr'
                    ? `पायरी ${currentStep.stepNum}: ${currentStep.title.mr}`
                    : `Step ${currentStep.stepNum}: ${currentStep.title.en}`}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-amber-100 leading-snug">
                "{currentStep.narration[lang] || currentStep.narration.mr}"
              </p>
            </div>
          </div>

          {/* Video Timeline & Scrub Controls */}
          <div className="bg-[#2B1B10] px-4 sm:px-6 py-4 border-t border-amber-900/80">
            {/* Scrubber Progress Bar with Milestone Dots */}
            <div className="relative mb-4">
              <div className="w-full bg-stone-700/80 h-2.5 rounded-full overflow-hidden p-0.5 cursor-pointer">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#EA580C] h-full rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Step indicator markers on progress bar */}
              <div className="flex justify-between items-center mt-1.5 px-1 text-[10px] font-bold text-amber-300">
                {currentGuide.steps.map((s, idx) => (
                  <button
                    key={s.stepNum}
                    type="button"
                    onClick={() => handleJumpToStep(s.timeSec)}
                    className={`hover:underline cursor-pointer flex items-center gap-1 ${
                      currentTime >= s.timeSec ? 'text-amber-300 font-black' : 'text-stone-400'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {s.title[lang] || s.title.mr}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Main Play / Pause Button */}
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-[#EA580C] hover:from-amber-400 hover:to-amber-500 text-amber-950 flex items-center justify-center font-black shadow-lg transition active:scale-95 cursor-pointer"
                  title={isPlaying ? 'थांबवा (Pause)' : 'चालू करा (Play)'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* Restart from beginning */}
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-600 transition cursor-pointer"
                  title="पुन्हा सुरू करा (Restart)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Audio voice narration mute/unmute */}
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    !isAudioMuted
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                      : 'bg-stone-800 text-stone-400 border-stone-600'
                  }`}
                  title={!isAudioMuted ? 'आवाज मूक करा' : 'आवाज सुरू करा'}
                >
                  {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Current Time Display */}
                <span className="text-xs font-mono font-bold text-amber-200">
                  {Math.floor(currentTime)}s / {currentGuide.durationSec}s
                </span>
              </div>

              {/* Interactive Simulator Trigger (Try it Yourself) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulatingAction}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 border border-emerald-400 cursor-pointer disabled:opacity-50"
                  title="थेट आवाज किंवा कृती तपासून पाहा"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>{currentGuide.simulationLabel[lang] || currentGuide.simulationLabel.mr}</span>
                </button>

                {/* Transcript text toggle */}
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-600 text-xs font-bold transition cursor-pointer"
                >
                  {showTranscript ? (lang === 'mr' ? 'मजकूर लपवा' : 'Hide Text') : (lang === 'mr' ? 'मजकूर वाचा' : 'Read Text')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Expandable Transcript Section for Elder / Deaf / Low Audio Shopkeepers */}
        {showTranscript && (
          <div className="mt-4 bg-[#FFFDF7] border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-black text-[#4A0E17] font-heading mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#EA580C]" />
              <span>
                {lang === 'mr' ? 'व्हिडिओ संपूर्ण लिखित मजकूर (Transcript):' : 'Full Video Transcript:'}
              </span>
            </h4>
            <div className="space-y-3">
              {currentGuide.steps.map((st) => (
                <div key={st.stepNum} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-black text-[#EA580C]">
                    {lang === 'mr' ? 'पायरी' : 'Step'} {st.stepNum}: {st.title[lang] || st.title.mr}
                  </span>
                  <p className="text-[#2B0E14] font-medium mt-1">
                    {st.narration[lang] || st.narration.mr}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Illustrated Cards (Below Video for Quick Glance) */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-black text-[#4A0E17] font-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                {lang === 'mr'
                  ? 'सविस्तर ३ सोप्या पायऱ्या (Quick Visual Summary):'
                  : '3 Simple Steps (Quick Visual Summary):'}
              </span>
            </h3>
            <span className="text-xs text-stone-500 font-bold hidden sm:inline">
              {lang === 'mr' ? 'कोणत्याही पायरीवर क्लिक करून व्हिडिओ सुरू करा' : 'Click any step to jump'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentGuide.steps.map((step, idx) => {
              const isCurrent = currentStep.stepNum === step.stepNum;

              return (
                <div
                  key={step.stepNum}
                  onClick={() => handleJumpToStep(step.timeSec)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-amber-100/90 border-[#EA580C] shadow-md ring-2 ring-amber-400'
                      : 'bg-white/90 border-amber-300/60 hover:bg-amber-50 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          isCurrent ? 'bg-[#EA580C] text-amber-950' : 'bg-amber-200 text-[#4A0E17]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-stone-500">
                        {step.timeSec}s
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#2B0E14] font-heading">
                      {step.title[lang] || step.title.mr}
                    </h4>
                    <p className="text-xs text-[#5C2B14] mt-1 font-semibold">
                      {step.subtitle[lang] || step.subtitle.mr}
                    </p>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-3 pt-2 border-t border-amber-200">
                    {step.instruction[lang] || step.instruction.mr}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assistance / Helpline Bottom Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#4A0E17] via-[#5C2B14] to-[#4A0E17] text-white rounded-2xl p-5 sm:p-6 border-2 border-amber-500/50 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'mr'
                    ? 'अडचण आल्यास मोफत घरपोच प्रात्यक्षिक (Free Field Officer Visit)'
                    : 'Need in-person help? Free Field Officer Visit'}
                </span>
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white font-heading mt-1">
                {lang === 'mr'
                  ? 'काही समजत नसेल तर काळजी करू नका! सेतू अधिकारी दुकानात येऊन शिकवतील.'
                  : 'Do not worry if this feels new! Our field officer will demonstrate in your shop.'}
              </h4>
              <p className="text-xs text-amber-200 mt-0.5">
                {lang === 'mr'
                  ? 'नोंदणी केल्यानंतर २४ तासांच्या आत सेतू अधिकारी साऊंडबॉक्स, स्टँडी व नकाशा प्रत्यक्ष चालू करून देतात.'
                  : 'Within 24 hours of registration, our representative visits your shop to activate the complete kit.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {onOpenApply && (
                <button
                  type="button"
                  onClick={onOpenApply}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#EA580C] hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer border border-amber-300"
                >
                  {lang === 'mr' ? 'किटसाठी नोंदणी करा' : 'Apply for Digital Kit'} →
                </button>
              )}
              <a
                href={`tel:${ASSIGNED_PHONE}`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/30 transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>{ASSIGNED_PHONE_FORMATTED}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
