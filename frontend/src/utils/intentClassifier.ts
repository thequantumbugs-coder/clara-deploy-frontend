/**
 * Lightweight Frontend Intent Classifier
 * Detects if a user message is related to College/Campus information.
 */

const COLLEGE_KEYWORDS: Record<string, string[]> = {
    en: [
        'college', 'course', 'department', 'admission', 'fee', 'tuition', 'placement',
        'faculty', 'professor', 'where is', 'direction', 'building', 'campus',
        'event', 'facility', 'hostel', 'library', 'lab', 'canteen', 'office'
    ],
    hi: [
        'कॉलेज', 'कोर्स', 'विभाग', 'प्रवेश', 'शुल्क', 'फीस', 'प्लेसमेंट', 'फैकल्टी',
        'शिक्षक', 'कहाँ है', 'रास्ता', 'भवन', 'इमारत', 'कैंपस', 'कार्यक्रम', 'सुविधा',
        'छात्रावास', 'पुस्तकालय', 'प्रायोगशाला', 'कैंटीन', 'कार्यालय'
    ],
    kn: [
        'ಕಾಲೇಜು', 'ಕೋರ್ಸ್', 'ವಿಭಾಗ', 'ಪ್ರವೇಶ', 'ಶುಲ್ಕ', 'ಫೀಸು', 'ಪ್ಲೇಸ್ಮೆಂಟ್', 'ಫ್ಯಾಕಲ್ಟಿ',
        'ಶಿಕ್ಷಕರು', 'ಎಲ್ಲಿದೆ', 'ದಾರಿ', 'ಕಟ್ಟಡ', 'ಕ್ಯಾಂಪಸ್', 'ಕಾರ್ಯಕ್ರಮ', 'ಸೌಲಭ್ಯ',
        'ವಸತಿ ನಿಲಯ', 'ಗ್ರಂಥಾಲಯ', 'ಪ್ರಯೋಗಾಲಯ', 'ಕ್ಯಾಂಟೀನ್', 'ಕಚೇರಿ'
    ],
    ta: [
        'கல்லூரி', 'பாடநெறி', 'துறை', 'சேர்க்கை', 'கட்டணம்', 'வேலைவாய்ப்பு',
        'ஆசிரியர்கள்', 'எங்கே உள்ளது', 'வழி', 'கட்டிடம்', 'வளாகம்', 'நிகழ்வு',
        'வசதி', 'விடுதி', 'நூலகம்', 'ஆய்வகம்', 'உணவகம்', 'அலுவலகம்'
    ],
    te: [
        'కళాశాల', 'కోర్సు', 'విభాగం', 'ప్రవేశం', 'ఫీజు', 'ప్లేస్‌మెంట్', 'అధ్యాపకులు',
        'ఎక్కడ ఉంది', 'దారి', 'భవనం', 'క్యాంపస్', 'కార్యక్రమం', 'సౌకర్యం',
        'హాస్టల్', 'గ్రంథాలయం', 'ప్రయోగశాల', 'కాంటీన్', 'కార్యాలయం'
    ],
    ml: [
        'കോളേജ്', 'കോഴ്‌സ്', 'ഡിപ്പാർട്ട്‌മെന്റ്', 'പ്രവേശനം', 'ഫീസ്', 'പ്ലേസ്‌മെന്റ്',
        'ഫാക്കൽറ്റി', 'അധ്യാപകർ', 'എവിടെയാണ്', 'വഴി', 'കെട്ടിടം', 'ക്യാമ്പസ്',
        'പരിപാടി', 'സൗകര്യം', 'ഹോസ്റ്റൽ', 'ലൈബ്രറി', 'ലാബ്', 'കാന്റീൻ', 'ഓഫീസ്'
    ]
};

/**
 * Normalizes text for better keyword matching
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Returns true if the text matches any college-related intent in any supported language.
 */
export function isCollegeIntent(text: string): boolean {
    const normalized = normalizeText(text);
    if (!normalized) return false;

    // Check across all defined language sets
    for (const lang in COLLEGE_KEYWORDS) {
        const keywords = COLLEGE_KEYWORDS[lang];

        // Use Unicode-aware boundaries for multilingual accuracy
        if (keywords.some(keyword => {
            // Escape special characters in keyword
            const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Look for the keyword surrounded by non-letter characters or string boundaries
            // \p{L} matches any Unicode letter
            const regex = new RegExp(`(?:^|[^\\p{L}])(${escaped})(?:$|[^\\p{L}])`, 'ui');
            return regex.test(normalized);
        })) {
            return true;
        }
    }

    return false;
}
