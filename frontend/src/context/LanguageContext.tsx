import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header & Meta
    'app.brand': 'APEX',
    'app.subtitle': 'Touch Banking',
    'app.terminal': 'Apex Prime X-9000',
    'app.location': 'Mumbai Central #04',
    'app.online': 'ONLINE • 256-BIT ENCRYPTED',
    'app.eject': 'Eject',
    'app.back': 'Back',
    'app.time': 'Terminal Time',
    'app.sound': 'Sound Effects',
    'app.sessionExpiring': 'Session expiring in',
    'app.seconds': 's',

    // Screens
    'title.welcome': 'Welcome',
    'title.auth': 'Authentication',
    'title.dashboard': 'Dashboard',
    'title.balance': 'Balance Inquiry',
    'title.deposit': 'Cash Deposit',
    'title.withdraw': 'Cash Withdrawal',
    'title.transfer': 'Funds Transfer',
    'title.history': 'Recent Activity',
    'title.changePin': 'Security Settings',
    'title.eject': 'Card Return',

    // Welcome Page
    'welcome.header': 'Welcome to Apex Touch Banking',
    'welcome.prompt': 'Insert your ATM card or select a pre-configured demo card below to begin.',
    'welcome.quickCards': 'Demo Test Cards',
    'welcome.insertCard': 'Insert Card',
    'welcome.cardInserted': 'Reading Card...',
    'welcome.cardLocked': 'Card Blocked',
    'welcome.cardExpired': 'Card Expired',

    // PIN Page
    'pin.title': 'Enter Your 4-Digit PIN',
    'pin.subtitle': 'Please protect your PIN from shoulder surfing.',
    'pin.account': 'Linked Account',
    'pin.holder': 'Account Holder',
    'pin.confirm': 'Authenticate',
    'pin.authenticating': 'Verifying PIN...',
    'pin.remaining': 'attempt(s) remaining',

    // Dashboard
    'dash.greeting': 'Welcome back',
    'dash.selectPrompt': 'Please select your desired banking service.',
    'dash.balance': 'Balance Inquiry',
    'dash.balanceDesc': 'View account balances and ledger limits',
    'dash.withdraw': 'Cash Withdrawal',
    'dash.withdrawDesc': 'Dispense cash in ₹500, ₹200 and ₹100 notes',
    'dash.deposit': 'Cash Deposit',
    'dash.depositDesc': 'Instant cash deposit into your account',
    'dash.transfer': 'Funds Transfer',
    'dash.transferDesc': 'Direct inter-account bank transfers',
    'dash.history': 'Mini Statement',
    'dash.historyDesc': 'Review recent 5 transactions and audit log',
    'dash.pin': 'Change PIN',
    'dash.pinDesc': 'Update your secret 4-digit security PIN',

    // Balance Page
    'balance.title': 'Account Balance Summary',
    'balance.current': 'Current Ledger Balance',
    'balance.available': 'Available for Withdrawal',
    'balance.minBalance': 'Minimum Balance Requirement',
    'balance.print': 'Print Statement',

    // Withdraw Page
    'withdraw.title': 'Fast Cash Withdrawal',
    'withdraw.selectPrompt': 'Select a quick denomination or enter a custom amount in multiples of ₹100.',
    'withdraw.custom': 'Custom Amount',
    'withdraw.enterCustom': 'Enter amount (multiple of ₹100)',
    'withdraw.notesAvailable': 'Available in ATM',
    'withdraw.dispense': 'Dispense Cash',
    'withdraw.dispensing': 'Counting & Dispensing Cash...',
    'withdraw.collect': 'Please Collect Your Cash Below',
    'withdraw.collected': 'Cash Collected',

    // Deposit Page
    'deposit.title': 'Instant Cash Deposit',
    'deposit.prompt': 'Enter the amount to deposit into the note intake feeder.',
    'deposit.confirm': 'Deposit Cash',
    'deposit.processing': 'Feeding & Verifying Notes...',
    'deposit.success': 'Deposit Successful',

    // Transfer Page
    'transfer.title': 'Inter-Account Transfer',
    'transfer.recipient': 'Recipient Account Number',
    'transfer.amount': 'Transfer Amount',
    'transfer.beneficiaries': 'Saved Demo Beneficiaries',
    'transfer.confirm': 'Transfer Funds',
    'transfer.processing': 'Executing Transfer...',
    'transfer.success': 'Transfer Completed',

    // History Page
    'history.title': 'Recent Transactions',
    'history.empty': 'No transactions recorded yet.',
    'history.type': 'Type',
    'history.amount': 'Amount',
    'history.balanceAfter': 'Balance After',
    'history.date': 'Date & Time',

    // Change PIN
    'changePin.current': 'Current PIN',
    'changePin.new': 'New 4-Digit PIN',
    'changePin.confirm': 'Confirm New PIN',
    'changePin.submit': 'Update PIN',
    'changePin.updating': 'Updating PIN...',
    'changePin.success': 'PIN Changed Successfully',

    // Eject Page
    'eject.title': 'Session Terminated',
    'eject.message': 'Please collect your card from the slot below.',
    'eject.thankYou': 'Thank you for banking with Apex Private Bank.',
    'eject.newSession': 'Start New Session',

    // Hardware
    'hw.cardSlot': 'Card Reader',
    'hw.cashSlot': 'Cash Dispenser',
    'hw.receiptSlot': 'Thermal Printer',
    'hw.keypad': 'PIN Pad',
    'hw.takeCash': 'Click to Collect Cash',
    'hw.takeReceipt': 'Collect Receipt',
  },
  hi: {
    // Header & Meta
    'app.brand': 'एपेक्स',
    'app.subtitle': 'टच बैंकिंग',
    'app.terminal': 'एपेक्स प्राइम X-9000',
    'app.location': 'मुंबई सेंट्रल #04',
    'app.online': 'ऑनलाइन • 256-बिट सुरक्षित',
    'app.eject': 'कार्ड निकालें',
    'app.back': 'पीछे',
    'app.time': 'टर्मिनल समय',
    'app.sound': 'ध्वनि प्रभाव',
    'app.sessionExpiring': 'सत्र समाप्त होने में',
    'app.seconds': 'सेकंड',

    // Screens
    'title.welcome': 'स्वागत है',
    'title.auth': 'प्रमाणीकरण',
    'title.dashboard': 'डैशबोर्ड',
    'title.balance': 'शेष राशि जांच',
    'title.deposit': 'नकद जमा',
    'title.withdraw': 'नकद निकासी',
    'title.transfer': 'धन अंतरण',
    'title.history': 'हालिया लेन-देन',
    'title.changePin': 'सुरक्षा सेटिंग्स',
    'title.eject': 'कार्ड वापसी',

    // Welcome Page
    'welcome.header': 'एपेक्स टच बैंकिंग में आपका स्वागत है',
    'welcome.prompt': 'शुरू करने के लिए अपना एटीएम कार्ड स्लॉट में डालें या नीचे दिया गया डेमो कार्ड चुनें।',
    'welcome.quickCards': 'डेमो परीक्षण कार्ड',
    'welcome.insertCard': 'कार्ड डालें',
    'welcome.cardInserted': 'कार्ड पढ़ा जा रहा है...',
    'welcome.cardLocked': 'कार्ड ब्लॉक है',
    'welcome.cardExpired': 'कार्ड की अवधि समाप्त',

    // PIN Page
    'pin.title': 'अपना ४-अंकों का पिन दर्ज करें',
    'pin.subtitle': 'कृपया दूसरों की नज़र से बचाकर पिन दर्ज करें।',
    'pin.account': 'संबद्ध खाता',
    'pin.holder': 'खाता धारक',
    'pin.confirm': 'सत्यापित करें',
    'pin.authenticating': 'पिन सत्यापित हो रहा है...',
    'pin.remaining': 'प्रयास शेष हैं',

    // Dashboard
    'dash.greeting': 'वापसी पर स्वागत है',
    'dash.selectPrompt': 'कृपया अपनी इच्छित बैंकिंग सेवा का चयन करें।',
    'dash.balance': 'शेष राशि जांच',
    'dash.balanceDesc': 'खाता शेष और न्यूनतम सीमा देखें',
    'dash.withdraw': 'नकद निकासी',
    'dash.withdrawDesc': '₹500, ₹200 और ₹100 के नोटों में निकासी',
    'dash.deposit': 'नकद जमा',
    'dash.depositDesc': 'खाते में तत्काल नकद जमा करें',
    'dash.transfer': 'धन अंतरण',
    'dash.transferDesc': 'सीधे खाते से खाते में धन भेजें',
    'dash.history': 'मिनी स्टेटमेंट',
    'dash.historyDesc': 'पिछले 5 लेन-देन का विवरण देखें',
    'dash.pin': 'पिन बदलें',
    'dash.pinDesc': 'अपना ४-अंकों का सुरक्षा पिन बदलें',

    // Balance Page
    'balance.title': 'खाता शेष सारांश',
    'balance.current': 'कुल वर्तमान शेष',
    'balance.available': 'निकासी हेतु उपलब्ध शेष',
    'balance.minBalance': 'न्यूनतम शेष आवश्यकता',
    'balance.print': 'रसीद प्रिंट करें',

    // Withdraw Page
    'withdraw.title': 'त्वरित नकद निकासी',
    'withdraw.selectPrompt': 'दी गई राशि चुनें या ₹100 के गुणक में अन्य राशि दर्ज करें।',
    'withdraw.custom': 'अन्य राशि',
    'withdraw.enterCustom': 'राशि दर्ज करें (₹100 का गुणक)',
    'withdraw.notesAvailable': 'एटीएम में उपलब्ध नोट',
    'withdraw.dispense': 'नकद निकालें',
    'withdraw.dispensing': 'नोटों की गिनती व निकासी जारी है...',
    'withdraw.collect': 'कृपया नीचे से अपना नकद प्राप्त करें',
    'withdraw.collected': 'नकद प्राप्त किया गया',

    // Deposit Page
    'deposit.title': 'तत्काल नकद जमा',
    'deposit.prompt': 'नोट फीडर में जमा की जाने वाली राशि दर्ज करें।',
    'deposit.confirm': 'नकद जमा करें',
    'deposit.processing': 'नोटों की गिनती व सत्यापन जारी है...',
    'deposit.success': 'नकद सफलतापूर्वक जमा हुआ',

    // Transfer Page
    'transfer.title': 'अंतर-खाता धन अंतरण',
    'transfer.recipient': 'प्राप्तकर्ता का खाता संख्या',
    'transfer.amount': 'अंतरण राशि',
    'transfer.beneficiaries': 'सहेजे गए लाभार्थी',
    'transfer.confirm': 'पैसे भेजें',
    'transfer.processing': 'अंतरण प्रक्रिया जारी है...',
    'transfer.success': 'धन अंतरण सफल रहा',

    // History Page
    'history.title': 'हालिया लेन-देन',
    'history.empty': 'अभी तक कोई लेन-देन दर्ज नहीं है।',
    'history.type': 'प्रकार',
    'history.amount': 'राशि',
    'history.balanceAfter': 'बाद का शेष',
    'history.date': 'दिनांक व समय',

    // Change PIN
    'changePin.current': 'वर्तमान पिन',
    'changePin.new': 'नया ४-अंकों का पिन',
    'changePin.confirm': 'नए पिन की पुष्टि करें',
    'changePin.submit': 'पिन अपडेट करें',
    'changePin.updating': 'पिन अपडेट हो रहा है...',
    'changePin.success': 'पिन सफलतापूर्वक बदल दिया गया',

    // Eject Page
    'eject.title': 'सत्र समाप्त हुआ',
    'eject.message': 'कृपया नीचे दिए गए स्लॉट से अपना कार्ड निकालें।',
    'eject.thankYou': 'एपेक्स प्राइवेट बैंक में विश्वास के लिए धन्यवाद।',
    'eject.newSession': 'नया सत्र प्रारंभ करें',

    // Hardware
    'hw.cardSlot': 'कार्ड रीडर',
    'hw.cashSlot': 'नकद निकास (डिस्पेंसर)',
    'hw.receiptSlot': 'थर्मल प्रिंटर',
    'hw.keypad': 'पिन पैड',
    'hw.takeCash': 'नकद लेने के लिए क्लिक करें',
    'hw.takeReceipt': 'रसीद लें',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('apex_atm_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('apex_atm_lang', lang);
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
