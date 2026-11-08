// Utility function to format prices
export function formatPrice(value, currency, locale = navigator.language) {
  if (value == null) return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(value));
}