/**
 * Theme store – manages light / dark / auto mode.
 * Persists the user's choice in localStorage and applies the
 * `.dark` class to <html> so Tailwind's class-based dark mode works.
 */

const STORAGE_KEY = 'theme';

function createTheme() {
  // Read persisted preference, fallback to 'auto'
  const stored =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) ?? 'auto')
      : 'auto';

  let mode = $state(stored);

  /** @type {MediaQueryList | null} */
  let systemQuery = null;

  function applyClass() {
    if (typeof document === 'undefined') return;
    const prefersDark =
      systemQuery ? systemQuery.matches : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'auto' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }

  function handleSystemChange() {
    if (mode === 'auto') applyClass();
  }

  function init() {
    if (typeof window === 'undefined') return;
    systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemQuery.addEventListener('change', handleSystemChange);
    applyClass();
  }

  function destroy() {
    systemQuery?.removeEventListener('change', handleSystemChange);
  }

  /**
   * @param {'light' | 'dark' | 'auto'} newMode
   */
  function set(newMode) {
    mode = newMode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    applyClass();
  }

  return {
    get mode() { return mode; },
    set,
    init,
    destroy,
  };
}

export const theme = createTheme();
