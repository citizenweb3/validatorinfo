import { useEffect } from 'react';

export function useWindowEvent<T>(name: string, handler: (detail: T) => void) {
  useEffect(() => {
    const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(name, listener as EventListener);
    return () => window.removeEventListener(name, listener as EventListener);
  }, [name, handler]);
}

export function emitWindowEvent<T>(name: string, detail: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
