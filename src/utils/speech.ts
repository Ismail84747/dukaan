import { Language } from '../types';

export let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechRecognitionInstance: any = null;
let speechHeartbeatTimer: any = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize & cache voices
const updateVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
      }
    } catch (e) {
      // ignore
    }
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  updateVoices();
  try {
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    window.speechSynthesis.onvoiceschanged = updateVoices;
  } catch (e) {
    // ignore
  }
}

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
};

let sharedAudioContext: AudioContext | null = null;

/**
 * Plays a subtle two-tone audio chime (like a digital soundbox) when speech starts
 */
export const playSoundboxChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      sharedAudioContext = new AudioContextClass();
    }
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    const ctx = sharedAudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.24);
  } catch (e) {
    // AudioContext might be blocked until user gesture, ignore gracefully
  }
};

/**
 * Sanitizes text for TTS: strips emojis, removes symbols like bullets/stars,
 * translates ₹ symbol to spoken word, so voice synthesizers don't read weird characters.
 */
export const sanitizeTextForSpeech = (rawText: string, lang: Language): string => {
  let cleaned = rawText;

  // Replace currency symbol with spoken words
  if (lang === 'mr' || lang === 'hi') {
    cleaned = cleaned.replace(/₹\s*(\d+)/g, '$1 रुपये');
    cleaned = cleaned.replace(/₹/g, ' रुपये ');
  } else {
    cleaned = cleaned.replace(/₹\s*(\d+)/g, '$1 Rupees');
    cleaned = cleaned.replace(/₹/g, ' Rupees ');
  }

  // Remove common decorative emojis, icons, and bullets
  cleaned = cleaned
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Emojis
    .replace(/[•★\*\#\-—_🚩]/g, ' ') // Bullets and symbols
    .replace(/[\(\)\[\]\{\}]/g, ', ') // Parens into pauses
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

/**
 * Finds the best available voice with intelligent fallback.
 * Prevents silent failures on systems without Marathi/Hindi language packs.
 */
const selectBestVoice = (lang: Language): { voice: SpeechSynthesisVoice | null; langCode: string } => {
  updateVoices();
  const voices = cachedVoices.length > 0 ? cachedVoices : (window.speechSynthesis?.getVoices() || []);

  const defaultVoice = voices.find((v) => v.default) || voices[0] || null;

  if (lang === 'mr') {
    // 1. Direct Marathi voice
    const mrVoice = voices.find(
      (v) => v.lang === 'mr-IN' || v.lang.startsWith('mr') || v.name.toLowerCase().includes('marathi')
    );
    if (mrVoice) return { voice: mrVoice, langCode: mrVoice.lang };

    // 2. Hindi voice (Devanagari phonetics read Marathi with high fidelity)
    const hiVoice = voices.find(
      (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hiVoice) return { voice: hiVoice, langCode: hiVoice.lang };

    // 3. Indian English or any Indian accented voice
    const inVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('in'));
    if (inVoice) return { voice: inVoice, langCode: inVoice.lang };

    // 4. Safe fallback: default system voice with its own native lang
    if (defaultVoice) {
      return { voice: defaultVoice, langCode: defaultVoice.lang };
    }

    return { voice: null, langCode: 'hi-IN' };
  }

  if (lang === 'hi') {
    const hiVoice = voices.find(
      (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hiVoice) return { voice: hiVoice, langCode: hiVoice.lang };

    const inVoice = voices.find((v) => v.lang.includes('IN'));
    if (inVoice) return { voice: inVoice, langCode: inVoice.lang };

    if (defaultVoice) {
      return { voice: defaultVoice, langCode: defaultVoice.lang };
    }

    return { voice: null, langCode: 'hi-IN' };
  }

  // English
  const enInVoice = voices.find((v) => v.lang === 'en-IN');
  if (enInVoice) return { voice: enInVoice, langCode: enInVoice.lang };

  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) return { voice: enVoice, langCode: enVoice.lang };

  if (defaultVoice) {
    return { voice: defaultVoice, langCode: defaultVoice.lang };
  }

  return { voice: null, langCode: 'en-US' };
};

export const speakText = (
  text: string,
  lang: Language = 'mr',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis is not supported on this browser.');
    if (onEnd) onEnd();
    return;
  }

  stopSpeaking();

  const cleanText = sanitizeTextForSpeech(text, lang);
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Small delay to allow any pending cancel() to clear in Chromium
  setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      playSoundboxChime();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance = utterance;
      // Prevent GC bug in Chromium by pinning to global window
      (window as any).__mahaVyapaarUtterance = utterance;

      const { voice, langCode } = selectBestVoice(lang);
      utterance.lang = langCode;
      if (voice) {
        utterance.voice = voice;
      }

      // Natural conversational speed
      utterance.rate = lang === 'mr' || lang === 'hi' ? 0.92 : 0.96;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        // Start heartbeat to prevent Chromium 14-second cutoff
        clearInterval(speechHeartbeatTimer);
        speechHeartbeatTimer = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearInterval(speechHeartbeatTimer);
          }
        }, 4500);

        if (onStart) onStart();
      };

      const cleanup = () => {
        clearInterval(speechHeartbeatTimer);
        currentUtterance = null;
        delete (window as any).__mahaVyapaarUtterance;
      };

      utterance.onend = () => {
        cleanup();
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        cleanup();
        // Ignore interrupted errors caused by explicit stopSpeaking()
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('TTS utterance notice:', e);
          if (onError) onError(e);
        }
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS execution error:', err);
      if (onEnd) onEnd();
    }
  }, 40);
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    clearInterval(speechHeartbeatTimer);
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    currentUtterance = null;
    delete (window as any).__mahaVyapaarUtterance;
  }
};

export const isSpeaking = (): boolean => {
  if (!isSpeechSynthesisSupported()) return false;
  return Boolean(currentUtterance && window.speechSynthesis.speaking);
};

export const startSpeechToText = (
  lang: Language = 'mr',
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (error: any) => void
) => {
  if (!isSpeechRecognitionSupported()) {
    console.warn('Speech recognition is not supported in this environment.');
    if (onError) onError('not-supported');
    if (onEnd) onEnd();
    return;
  }

  stopSpeechToText();

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  try {
    const recognition = new SpeechRecognition();
    speechRecognitionInstance = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;

    // Choose appropriate BCP-47 language tag
    if (lang === 'mr') {
      recognition.lang = 'mr-IN';
    } else if (lang === 'hi') {
      recognition.lang = 'hi-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition notice:', event.error);
      if (onError) onError(event.error);
      if (onEnd) onEnd();
    };

    recognition.onend = () => {
      speechRecognitionInstance = null;
      if (onEnd) onEnd();
    };

    recognition.start();
  } catch (err) {
    console.error('Speech recognition start error:', err);
    speechRecognitionInstance = null;
    if (onEnd) onEnd();
  }
};

export const stopSpeechToText = () => {
  if (speechRecognitionInstance) {
    try {
      speechRecognitionInstance.stop();
    } catch (err) {
      // ignore
    }
    speechRecognitionInstance = null;
  }
};

