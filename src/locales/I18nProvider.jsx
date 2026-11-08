import i18next from 'i18next';
import { I18nextProvider as Provider } from 'react-i18next';

// ----------------------------------------------------------------------

/**
 * [1] localStorage
 * Auto detection:
 * const lng = getStorage('i18nextLng')
 */
// const lng = getStorage('i18nextLng', fallbackLng);

// i18next
//   .use(LanguageDetector)
//   .use(initReactI18next)
//   .use(resourcesToBackend((lang, ns) => import(`./translates/${lang}/${ns}.json`)))
//   .init({ 
//     ...i18nOptions(lng), 
//     detection: { caches: ['localStorage'] } 
//   });

// ----------------------------------------------------------------------

export function I18nProvider({ children }) {
  return <Provider i18n={i18next}>{children}</Provider>;
}
