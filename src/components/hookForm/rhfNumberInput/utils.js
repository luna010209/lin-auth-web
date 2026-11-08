export function transformNumberOnChange(value, options) {
  const { min = 0, max = 9999 } = options ?? {};

  if (!value || value.trim() === '') {
    return 0;
  }

  const numericValue = Number(value.trim());

  if (!Number.isNaN(numericValue)) {
    // Clamp the value between min and max
    return Math.max(min, Math.min(max, numericValue));
  }

  return 0;
}
