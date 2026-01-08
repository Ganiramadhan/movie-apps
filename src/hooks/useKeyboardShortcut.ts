import { useEffect } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void, ctrlKey = false) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (ctrlKey && !event.ctrlKey && !event.metaKey) return;
      if (!ctrlKey && (event.ctrlKey || event.metaKey)) return;
      
      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [key, callback, ctrlKey]);
}
