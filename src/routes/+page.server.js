import { getFilteredTransactions, getCurrencies, getPaymentMethods, getCategories, getBudgets, seedDefaults } from '$lib/server/database.js';
import { getActiveWorkspace } from '$lib/server/workspace.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies }) {
	const { userId } = locals.auth();
	if (!userId) redirect(307, '/sign-in');

	const { workspaceId } = await getActiveWorkspace(userId, cookies);
	if (!workspaceId) redirect(307, '/sign-in');

	await seedDefaults(workspaceId);

	const now      = new Date();
	const year     = now.getFullYear();
	const month    = String(now.getMonth() + 1).padStart(2, '0');
	const lastDay  = new Date(year, now.getMonth() + 1, 0).getDate();
	const startDate = `${year}-${month}-01`;
	const endDate   = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

	const [transactions, currencies, paymentMethods, categories, budgets] = await Promise.all([
		getFilteredTransactions({ groupId: workspaceId, startDate, endDate }),
		getCurrencies(workspaceId),
		getPaymentMethods(workspaceId),
		getCategories(workspaceId),
		getBudgets(workspaceId),
	]);

	return {
		transactions,
		currencies:     currencies.filter((c) => c.active),
		paymentMethods: paymentMethods.filter((p) => p.active),
		categories:     categories.filter((c) => c.active),
		budgets,
	};
}
