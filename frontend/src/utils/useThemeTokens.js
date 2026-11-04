import { useState, useEffect } from 'react';

/**
 * Custom React hook to consume centralized runtime theme tokens
 * as specified in UI_PORTAL_INTEGRATION_GUIDE.md (Section 7).
 * Reads live CSS variable values from the DOM / window.ThemeLoader.
 */
export function useThemeTokens() {
  const [tokens, setTokens] = useState(() => {
    if (typeof window !== 'undefined' && window.ThemeLoader && typeof window.ThemeLoader.getTokens === 'function') {
      return window.ThemeLoader.getTokens();
    }
    return {};
  });

  useEffect(() => {
    const handleUpdate = () => {
      if (typeof window !== 'undefined' && window.ThemeLoader && typeof window.ThemeLoader.getTokens === 'function') {
        setTokens(window.ThemeLoader.getTokens());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('theme:updated', handleUpdate);
      window.addEventListener('pydah:theme-updated', handleUpdate);
      return () => {
        window.removeEventListener('theme:updated', handleUpdate);
        window.removeEventListener('pydah:theme-updated', handleUpdate);
      };
    }
  }, []);

  return tokens;
}

export default useThemeTokens;

