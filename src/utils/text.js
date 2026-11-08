/**
 * Count words in a writing answer.
 * Latin tokens are split on whitespace; each CJK character counts as one word.
 */
export function countWords(text) {
  if (text == null) return 0;

  const value = String(text).trim();
  if (!value) return 0;

  const cjk = value.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/gu);
  const withoutCjk = value.replace(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/gu, ' ');
  const latin = withoutCjk.split(/\s+/).filter(Boolean);

  return (cjk?.length ?? 0) + latin.length;
}
