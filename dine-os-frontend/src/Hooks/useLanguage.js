import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing language and localized content
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return {
    currentLanguage,
    changeLanguage,
    isRTL: currentLanguage === 'ar'
  };
};
