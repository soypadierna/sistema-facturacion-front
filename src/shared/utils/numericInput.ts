import type { KeyboardEvent, ClipboardEvent } from 'react';

const CONTROL_KEYS = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

function isNumericControlKey(e: KeyboardEvent<HTMLInputElement>): boolean {
  return (
    CONTROL_KEYS.includes(e.key) ||
    ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'A', 'C', 'V', 'X'].includes(e.key))
  );
}

export function handleNumericKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
  if (!/^[0-9]$/.test(e.key) && !isNumericControlKey(e)) {
    e.preventDefault();
  }
}

export function handleNumericPaste(e: ClipboardEvent<HTMLInputElement>): void {
  e.preventDefault();
  const text = e.clipboardData.getData('text').replace(/\D/g, '');
  const target = e.target as HTMLInputElement;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const newValue = target.value.slice(0, start) + text + target.value.slice(end);
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeSetter?.call(target, newValue);
  target.dispatchEvent(new Event('input', { bubbles: true }));
}