import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    // Navigation & Menus
    dashboard: 'Dashboard',
    available_jobs: 'Available Jobs',
    assigned_jobs: 'Assigned Jobs',
    services: 'Services',
    overview: 'Overview',
    new_request: 'New Request',
    active_requests: 'Active Requests',
    history: 'Request History',
    update_profile: 'Update Profile',
    notifications: 'Notifications',
    settings: 'Settings',
    how_to_use: 'How to Use',
    about_fixit: 'About FixIt',
    sign_out: 'Sign Out',
    technicians: 'Technicians',
    requests: 'Requests',
    activity_log: 'Activity Log',
    management: 'Management',
    job_center: 'Job Center',
    account_preferences: 'Account & Preferences',
    guide_platform: 'Guide & Platform',
    sign_in: 'Sign In',
    get_started: 'Get Started',
    book_service: 'Book a Service',
    join_technician: 'Join as Technician',

    // Statuses
    pending: 'PENDING',
    matching: 'MATCHING',
    assigned: 'ASSIGNED',
    accepted: 'ACCEPTED',
    in_progress: 'IN PROGRESS',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    all: 'All',

    // Dashboard & Actions
    active_jobs_count: 'Active Jobs',
    available_requests_count: 'Available Requests',
    total_earnings: 'Total Earnings',
    average_rating: 'Average Rating',
    current_assigned_jobs: 'Current Assigned Jobs',
    available_near_you: 'Available Near You',
    view_all: 'View all',
    manage: 'Manage',
    chat_with_customer: 'Chat with Customer',
    start_job: 'Start Job',
    mark_complete: 'Mark Complete',
    search_placeholder: 'Search employees, pages, features...',
    my_profile: 'My Profile',
    change_password: 'Change Password',
    guest_mode_badge: "You're exploring FixIt as a Guest",

    // Settings
    display_language: 'Display Language',
    language_region: 'Language & Region',
    language_desc: 'Standard language used across all user portals.',
    dark_mode: 'Dark Mode',
    theme_appearance: 'Theme & Appearance',
    system_notifications: 'Push Notifications',
  },
  hi: {
    // Navigation & Menus
    dashboard: 'डैशबोर्ड',
    available_jobs: 'उपलब्ध कार्य',
    assigned_jobs: 'सौंपे गए कार्य',
    services: 'सेवाएं',
    overview: 'सिंहावलोकन',
    new_request: 'नया अनुरोध',
    active_requests: 'सक्रिय अनुरोध',
    history: 'अनुरोध इतिहास',
    update_profile: 'प्रोफ़ाइल अपडेट',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',
    how_to_use: 'उपयोग कैसे करें',
    about_fixit: 'फिक्स-इट के बारे में',
    sign_out: 'लॉग आउट',
    technicians: 'तकनीशियन',
    requests: 'सेवा अनुरोध',
    activity_log: 'गतिविधि लॉग',
    management: 'प्रबंधन',
    job_center: 'कार्य केंद्र',
    account_preferences: 'खाता एवं प्राथमिकताएं',
    guide_platform: 'गाइड एवं प्लेटफ़ॉर्म',
    sign_in: 'लॉग इन करें',
    get_started: 'शुरू करें',
    book_service: 'सेवा बुक करें',
    join_technician: 'तकनीशियन बनें',

    // Statuses
    pending: 'लंबित',
    matching: 'मैचिंग',
    assigned: 'आवंटित',
    accepted: 'स्वीकृत',
    in_progress: 'प्रगति पर',
    completed: 'पूर्ण',
    cancelled: 'रद्द',
    all: 'सभी',

    // Dashboard & Actions
    active_jobs_count: 'सक्रिय कार्य',
    available_requests_count: 'उपलब्ध अनुरोध',
    total_earnings: 'कुल कमाई',
    average_rating: 'औसत रेटिंग',
    current_assigned_jobs: 'वर्तमान सौंपे गए कार्य',
    available_near_you: 'आपके नजदीकी अनुरोध',
    view_all: 'सभी देखें',
    manage: 'प्रबंधित करें',
    chat_with_customer: 'ग्राहक से चैट करें',
    start_job: 'काम शुरू करें',
    mark_complete: 'पूर्ण चिह्नित करें',
    search_placeholder: 'पेज, फीचर्स, प्रोफाइल खोजें...',
    my_profile: 'मेरी प्रोफाइल',
    change_password: 'पासवर्ड बदलें',
    guest_mode_badge: 'आप अतिथि (Guest) मोड में देख रहे हैं',

    // Settings
    display_language: 'प्रदर्शन भाषा',
    language_region: 'भाषा एवं क्षेत्र',
    language_desc: 'पूरे प्लेटफ़ॉर्म पर उपयोग की जाने वाली भाषा।',
    dark_mode: 'डार्क मोड',
    theme_appearance: 'थीम और दिखावट',
    system_notifications: 'पुश सूचनाएं',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('fixit_language') || 'en';
  });

  const setLanguage = (langCode) => {
    let normalized = 'en';
    if (langCode.includes('Hindi') || langCode === 'hi' || langCode.includes('हिंदी')) {
      normalized = 'hi';
    } else {
      normalized = 'en';
    }
    setLanguageState(normalized);
    localStorage.setItem('fixit_language', normalized);
    document.documentElement.lang = normalized;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    return fallback || key;
  };

  const currentLanguageLabel =
    language === 'hi' ? 'Hindi (हिंदी)' : 'English (India)';

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageLabel: currentLanguageLabel,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      languageLabel: 'English (India)',
      setLanguage: () => {},
      t: (k, fallback) => fallback || k,
    };
  }
  return context;
}

export default LanguageContext;
