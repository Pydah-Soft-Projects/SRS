import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SCRIPT_ID = 'pydah-portal-switcher-cdn';

/**
 * Universal Portal Switcher component.
 * Conditionally renders ONLY when the active user is authenticated via Central SSO.
 */
export default function PortalSwitcher() {
  const { isAuthenticated, isSsoUser } = useAuth();

  useEffect(() => {
    // Only render the switcher if user is logged in AND session is from SSO
    if (!isAuthenticated || !isSsoUser) {
      // Clean up script if it was loaded previously
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }

      // Clean up any switcher elements rendered by the CDN
      const switcherElements = document.querySelectorAll(
        'pydah-portal-switcher, #pydah-portal-switcher, .pydah-portal-switcher-root, #pydah-portal-switcher-container'
      );
      switcherElements.forEach((el) => el.remove());

      if (window.PydahSwitcher && typeof window.PydahSwitcher.destroy === 'function') {
        try {
          window.PydahSwitcher.destroy();
        } catch (_) {}
      }

      return;
    }

    // Do not inject again if already present
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    // Inject CDN script into document body
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://crm.pydah.edu.in/portal-switcher.js';
    script.setAttribute('data-current-portal', 'staff-recruitment');
    script.setAttribute('data-api-base-url', 'https://crm.pydah.edu.in');
    script.setAttribute('data-position', 'bottom-right');
    script.setAttribute('data-theme', 'light');
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      // If component unmounts or state changes to false, clean up
      if (!isAuthenticated || !isSsoUser) {
        const el = document.getElementById(SCRIPT_ID);
        if (el) el.remove();
      }
    };
  }, [isAuthenticated, isSsoUser]);

  return null;
}
