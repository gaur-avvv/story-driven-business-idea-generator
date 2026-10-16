import { useEffect, useRef } from 'react';

/**
 * Syncs an `isOpen` boolean to a native <dialog> element.
 * Returns a ref to attach. Free focus-trap + Escape handling, top-layer.
 * Calls `onRequestClose` when the dialog is dismissed (Escape, backdrop).
 */
export function useDialog(isOpen: boolean, onRequestClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isOpen && !el.open) {
      el.showModal();
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => onRequestClose();
    // Native `close` fires on Escape or el.close(). If `isOpen` is still
    // true here the user dismissed via Escape — propagate to React state.
    el.addEventListener('close', handleClose);
    return () => el.removeEventListener('close', handleClose);
  }, [onRequestClose]);

  return ref;
}
