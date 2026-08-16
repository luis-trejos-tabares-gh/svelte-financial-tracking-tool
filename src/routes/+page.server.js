import { getFilteredTransactions, getCurrencies, getPaymentMethods, getCategories, getBudgets, seedDefaults } from '$lib/server/database.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const { orgId } = locals.auth();
	if (!orgId) redirect(307, '/onboarding');

	await seedDefaults(orgId);

	// Default to current month
	const now      = new Date();
	const year     = now.getFullYear();
	const month    = String(now.getMonth() + 1).padStart(2, '0');
	const lastDay  = new Date(year, now.getMonth() + 1, 0).getDate();
	const startDate = `${year}-${month}-01`;
	const endDate   = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

	const [transactions, currencies, paymentMethods, categories, budgets] = await Promise.all([
		getFilteredTransactions({ groupId: orgId, startDate, endDate }),
		getCurrencies(orgId),
		getPaymentMethods(orgId),
		getCategories(orgId),
		getBudgets(orgId),
	]);

	return {
		transactions,
		currencies:     currencies.filter((c) => c.active),
		paymentMethods: paymentMethods.filter((p) => p.active),
		categories:     categories.filter((c) => c.active),
		budgets,
	};
}
