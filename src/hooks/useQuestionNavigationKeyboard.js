import { useEffect } from 'react';

function isEditableTarget(target) {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;

  return Boolean(target.closest('[contenteditable="true"]'));
}

function isPrevKey(key) {
  return key === 'ArrowLeft' || key === 'ArrowUp';
}

function isNextKey(key) {
  return key === 'ArrowRight' || key === 'ArrowDown';
}

/** Arrow keys (and optional ←/→) to move prev/next question. Skips when typing in inputs. */
export function useQuestionNavigationKeyboard({ onPrev, onNext, enabled = true }) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isEditableTarget(event.target)) return;

      if (isPrevKey(event.key)) {
        event.preventDefault();
        onPrev?.();
        return;
      }

      if (isNextKey(event.key)) {
        event.preventDefault();
        onNext?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNext, onPrev]);
}
