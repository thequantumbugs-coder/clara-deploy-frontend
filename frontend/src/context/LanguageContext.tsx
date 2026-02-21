import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'English' | 'Kannada' | 'Hindi' | 'Tamil' | 'Telugu' | 'Malayalam';

interface Translations {
  [key: string]: {
    [L in Language]: string;
  };
}

export const translations: Translations = {
  welcome: {
    English: 'Welcome to the Campus',
    Kannada: 'ಕ್ಯಾಂಪಸ್‌ಗೆ ಸುಸ್ವಾಗತ',
    Hindi: 'कैंपस में आपका स्वागत है',
    Tamil: 'வளாகத்திற்கு வரவேற்கிறோம்',
    Telugu: 'క్యాంపస్‌కు స్వాగతం',
    Malayalam: 'ക്യാമ്പസിലേക്ക് സ്വാഗതം',
  },
  tapToWake: {
    English: 'Tap to Wake',
    Kannada: 'ಎಚ್ಚರಗೊಳಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    Hindi: 'जगाने के लिए टैप करें',
    Tamil: 'விழித்தெழுவதற்கு தட்டவும்',
    Telugu: 'మేల్కొలపడానికి నొక్కండి',
    Malayalam: 'ഉണർത്താൻ ടാപ്പ് ചെയ്യുക',
  },
  selectLanguage: {
    English: 'Select Language',
    Kannada: 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
    Hindi: 'भाषा चुनें',
    Tamil: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    Telugu: 'భాషను ఎంచుకోండి',
    Malayalam: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  },
  mainMenu: {
    English: 'How can I assist you today?',
    Kannada: 'ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    Hindi: 'आज मैं आपकी कैसे सहायता कर सकता हूँ?',
    Tamil: 'இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    Telugu: 'ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
    Malayalam: 'ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
  },
  admissions: {
    English: 'Admissions',
    Kannada: 'ಪ್ರವೇಶಾತಿಗಳು',
    Hindi: 'प्रवेश',
    Tamil: 'சேர்க்கை',
    Telugu: 'ప్రవేశాలు',
    Malayalam: 'അഡ്മിഷൻ',
  },
  fees: {
    English: 'Fees',
    Kannada: 'ಶುಲ್ಕಗಳು',
    Hindi: 'शुल्क',
    Tamil: 'கட்டணம்',
    Telugu: 'ఫీజులు',
    Malayalam: 'ഫീസ്',
  },
  departments: {
    English: 'Departments',
    Kannada: 'ವಿಭಾಗಗಳು',
    Hindi: 'विभाग',
    Tamil: 'துறைகள்',
    Telugu: 'విభాగాలు',
    Malayalam: 'വകുപ്പുകൾ',
  },
  placements: {
    English: 'Placements',
    Kannada: 'ಉದ್ಯೋಗಾವಕಾಶಗಳು',
    Hindi: 'प्लेसमेंट',
    Tamil: 'வேலைவாய்ப்பு',
    Telugu: 'ప్లేస్‌మెంట్లు',
    Malayalam: 'പ്ലേസ്‌മെന്റ്',
  },
  campus: {
    English: 'Campus',
    Kannada: 'ಕ್ಯಾಂಪಸ್',
    Hindi: 'कैंपस',
    Tamil: 'வளாகம்',
    Telugu: 'క్యాంపస్',
    Malayalam: 'ക്യാമ്പസ്',
  },
  contact: {
    English: 'Contact',
    Kannada: 'ಸಂಪರ್ಕಿಸಿ',
    Hindi: 'संपर्क',
    Tamil: 'தொடர்பு',
    Telugu: 'సంప్రదించండి',
    Malayalam: 'ബന്ധപ്പെടുക',
  },
  listening: {
    English: 'Listening...',
    Kannada: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    Hindi: 'सुन रहा हूँ...',
    Tamil: 'கேட்கிறது...',
    Telugu: 'వింటున్నాను...',
    Malayalam: 'ശ്രദ്ധിക്കുന്നു...',
  },
  claraIsThinking: {
    English: 'CLARA is thinking...',
    Kannada: 'ಕ್ಲಾರಾ ಯೋಚಿಸುತ್ತಿದ್ದಾಳೆ...',
    Hindi: 'क्लारा सोच रही है...',
    Tamil: 'கிளாரா யோசிக்கிறாள்...',
    Telugu: 'క్లారా ఆలోచిస్తోంది...',
    Malayalam: 'ക്ലാര ചിന്തിക്കുന്നു...',
  },
  ttsInstructionMenu: {
    English: 'Please select one of the following options to continue.',
    Kannada: 'ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ.',
    Hindi: 'जारी रखने के लिए कृपया निम्नलिखित विकल्पों में से एक चुनें।',
    Tamil: 'தொடர பின்வரும் விருப்பங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்.',
    Telugu: 'కొనసాగించడానికి దయచేసి కింది ఎంపికలలో ఒకదాన్ని ఎంచుకోండి.',
    Malayalam: 'തുടരുന്നതിന് ദയവായി താഴെ പറയുന്ന ഓപ്ഷനുകളിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക.',
  },
  // Chat / Voice screen
  claraGreeting: {
    English: 'Good evening. I am CLARA, your campus assistant. How may I help you today?',
    Kannada: 'ಶುಭ ಸಂಜೆ. ನಾನು ಕ್ಲಾರಾ, ನಿಮ್ಮ ಕ್ಯಾಂಪಸ್ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    Hindi: 'शुभ संध्या। मैं CLARA हूँ, आपकी कैंपस सहायक। आज मैं आपकी कैसे मदद कर सकती हूँ?',
    Tamil: 'வணக்கம்। நான் கிளாரா, உங்கள் வளாக உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    Telugu: 'శుభ సాయంత్రం. నేను క్లారా, మీ క్యాంపస్ సహాయకురాలు. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
    Malayalam: 'സുപ്രഭാതം. ഞാൻ ക്ലാര, നിങ്ങളുടെ ക്യാമ്പസ് സഹായി. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
  },
  tapToSpeak: {
    English: 'Tap to speak',
    Kannada: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    Hindi: 'बोलने के लिए टैप करें',
    Tamil: 'பேச தட்டவும்',
    Telugu: 'మాట్లాడడానికి నొక్కండి',
    Malayalam: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക',
  },
  chatBack: {
    English: 'Back',
    Kannada: 'ಹಿಂದೆ',
    Hindi: 'वापस',
    Tamil: 'பின்செல்',
    Telugu: 'వెనుక',
    Malayalam: 'പിന്നിൽ',
  },
  cardOpen: {
    English: 'Open',
    Kannada: 'ತೆರೆಯಿರಿ',
    Hindi: 'खोलें',
    Tamil: 'திற',
    Telugu: 'తెరిచి',
    Malayalam: 'തുറക്കുക',
  },
  cardAsset: {
    English: 'Asset',
    Kannada: 'ಆಸ್ತಿ',
    Hindi: 'संसाधन',
    Tamil: 'சொத்து',
    Telugu: 'ఆస్తి',
    Malayalam: 'ആസ്തി',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('English');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
