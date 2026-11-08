import { allLangs } from "../locales";

// ======================================================
// 🎤 TEXT-TO-SPEECH
// ======================================================

function getSpeechLocale(langValue) {
  const found = allLangs.find((l) => l.value === langValue);

  if (found?.numberFormat?.code) return found.numberFormat.code;
  if (found?.adapterLocale) return found.adapterLocale;

  return langValue || 'en-US';
}

export function speakText(text, langValue = 'en') {
  if (!text) return;
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = getSpeechLocale(langValue);
  utter.rate = 1;
  utter.pitch = 1;

  window.speechSynthesis.speak(utter);
}