import { browser } from '$app/environment';
import { get } from 'svelte/store';
import {
  init, register, locale,
  getLocaleFromNavigator,
  unwrapFunctionStore, format,
} from 'svelte-i18n';

// ── Supported locales ─────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'de'];
export const LOCALE_LABELS     = { en: 'EN', es: 'ES', pt: 'PT', de: 'DE' };
export const LOCALE_NAMES      = { en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch' };

/** Maps app locale code → BCP-47 tag used for Intl date/number formatting */
export const FORMAT_LOCALE = {
  en: 'en-US',
  es: 'es-CR',
  pt: 'pt-BR',
  de: 'de-DE',
};

// ── Locale file registration ──────────────────────────────────────────────────
// To add a new language: register it here and add it to SUPPORTED_LOCALES above.

register('en', () => import('./locales/en.json'));
register('es', () => import('./locales/es.json'));
register('pt', () => import('./locales/pt.json'));
register('de', () => import('./locales/de.json'));

// ── Initialisation ────────────────────────────────────────────────────────────

export function setupI18n() {
  const savedLocale  = browser ? (localStorage.getItem('locale') ?? null)           : null;
  const navLocale    = browser ? (getLocaleFromNavigator()?.slice(0, 2) ?? null)     : null;
  const initialLocale = savedLocale ?? navLocale ?? 'es';

  init({ fallbackLocale: 'en', initialLocale });
}

// ── Locale helper (persist on change) ────────────────────────────────────────

export function setLocale(code) {
  locale.set(code);
  if (browser) localStorage.setItem('locale', code);
}

// ── Plain-JS translation helper (usable outside Svelte reactive contexts) ────
// Use $t('key') in .svelte templates; use t('key') in plain JS.

export const t = unwrapFunctionStore(format);

// ── Number / date formatters ──────────────────────────────────────────────────

function currentFormatLocale() {
  return FORMAT_LOCALE[get(locale)] ?? 'en-US';
}

/**
 * Format a monetary amount according to the current locale.
 * Always uses the absolute value so callers can prepend their own sign.
 */
export function fmtAmount(amount, currency) {
  const loc = currentFormatLocale();
  const abs = Math.abs(Number(amount));
  if (currency === 'USD') {
    return `$${abs.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₡${abs.toLocaleString(loc)}`;
}

/**
 * Format a date string or Date object according to the current locale.
 */
export function fmtDate(raw) {
  const loc = currentFormatLocale();
  const d   = new Date(raw);
  const date = d.toLocaleDateString(loc, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
  if (!hasTime) return date;
  const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${date} ${time}`;
}

/**
 * Returns the month name for a given year/month (1-indexed) in the current locale.
 */
export function fmtMonthLabel(year, month) {
  const loc = currentFormatLocale();
  const name = new Date(year, month - 1, 1)
    .toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
