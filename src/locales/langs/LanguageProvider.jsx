import i18next from 'i18next';
import { useState } from 'react';
import { LanguageContext } from './LanguageContext';
import { fallbackLng } from '../localesConfig';
import { I18N_LANG_KEY } from '../../storage/keys';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(i18next.language || fallbackLng);

  const updateLanguage = (newLang) => {
    localStorage.setItem(I18N_LANG_KEY, newLang);
    setLanguage(newLang);
    i18next.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}