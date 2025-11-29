import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const language = i18n.language || 'en';
  const isRTL = language === 'he';

  const switchLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    },
    [i18n]
  );

  return {
    t,
    language,
    isRTL,
    switchLanguage,
  };
};
