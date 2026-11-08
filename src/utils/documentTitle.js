import { CONFIG } from '../globalConfig';

const MAX_DOCUMENT_TITLE_LENGTH = 80;

export function trimDocumentTitlePart(text, maxLength = MAX_DOCUMENT_TITLE_LENGTH) {
  const value = typeof text === 'string' ? text.trim() : '';
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

/** Browser tab: `{pageTitle} | {appName}` */
export function formatPageDocumentTitle(pageTitle) {
  const part = trimDocumentTitlePart(pageTitle);
  if (!part) return CONFIG.appName;
  return `${part} | ${CONFIG.appName}`;
}

/**
 * Prefer entity name for tab title; skip URL-like names; optional subtitle field.
 */
export function resolveEntityDocumentTitle(entity, fallbackTitle, options = {}) {
  const { nameKey = 'name', subtitleKey } = options;
  const fallback = trimDocumentTitlePart(fallbackTitle) || 'Page';

  const rawName = entity?.[nameKey];
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (name && !/^https?:\/\//i.test(name)) {
    return trimDocumentTitlePart(name) || fallback;
  }

  if (subtitleKey) {
    const rawSubtitle = entity?.[subtitleKey];
    const subtitle = typeof rawSubtitle === 'string' ? rawSubtitle.trim() : '';
    if (subtitle) {
      return trimDocumentTitlePart(subtitle) || fallback;
    }
  }

  return fallback;
}
