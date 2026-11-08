import i18next from 'i18next';
import { getStorage } from 'minimal-shared/utils';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { I18N_LANG_KEY } from '../storage/keys';

// ----------------------------------------------------------------------

export const fallbackLng = 'en';

export const languages = [
  'en', 
  'fr', 
  'vi', 
  'zh',   
  'ko',   
  'ja',   
  'ar'
];

export const defaultNS = 'common';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  vi: {
    success: 'Ngôn ngữ đã được thay đổi!',
    error: 'Lỗi khi thay đổi ngôn ngữ!',
    loading: 'Đang tải...',
  },
  fr: {
    success: 'La langue a été changée!',
    error: 'Erreur lors du changement de langue!',
    loading: 'Chargement...',
  },
  zh: {
    success: '语言已更改！',
    error: '更改语言时出错！',
    loading: '加载中...',
  },
  ko: {
    success: '언어가 변경되었습니다!',
    error: '언어 변경 중 오류가 발생했습니다!',
    loading: '로딩 중...',
  },
  ja: {
    success: '言語が変更されました！',
    error: '言語の変更中にエラーが発生しました！',
    loading: '読み込み中...',
  },
  ar: {
    success: 'تم تغيير اللغة!',
    error: 'خطأ في تغيير اللغة!',
    loading: 'جارٍ التحميل...',
  },
};

// ----------------------------------------------------------------------

async function resolveInitialLanguage() {
  const saved = getStorage(I18N_LANG_KEY) || getStorage('i18nextLng');

  if (saved && languages.includes(saved)) {
    return saved;
  }

  return fallbackLng;
}

export async function initI18n() {
  const lng = await resolveInitialLanguage();

  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(resourcesToBackend((lang, ns) => import(`./translates/${lang}/${ns}.json`)))
    .init({
      ...i18nOptions(lng),
      detection: { caches: ['localStorage'] },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
}