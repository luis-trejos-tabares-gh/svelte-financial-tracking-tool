import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import { SUPPORTED_LOCALES } from './index.js';

const MESSAGES = { en, es, pt, de };

/** @param {string | undefined | null} code */
export function resolveInviteLocale(code) {
	return SUPPORTED_LOCALES.includes(code) ? code : 'en';
}

function interp(str, values) {
	return String(str).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

/**
 * Invite email strings for the given locale.
 * `bodyHtml` interpolates `workspace` as already-escaped HTML.
 */
export function getInviteEmailCopy(locale, { workspaceName, workspaceHtml, appName = 'expenseur' }) {
	const loc = resolveInviteLocale(locale);
	const copy = MESSAGES[loc]?.email?.invite ?? MESSAGES.en.email.invite;
	return {
		locale: loc,
		subject: interp(copy.subject, { workspace: workspaceName, appName }),
		bodyHtml: interp(copy.body, { workspace: workspaceHtml, appName }),
		cta: copy.cta,
		copyLink: copy.copyLink,
	};
}
