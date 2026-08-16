import { createTransaction, getFilteredTransactions } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	try {
		const transaction = await request.json();
		const newTransaction = await createTransaction({ ...transaction, groupId: orgId });
		return json({ data: newTransaction }, { status: 201 });
	} catch (error) {
		console.error('Error creating transaction:', error);
		return json({ message: 'Error creating transaction' }, { status: 500 });
	}
};

export const GET = async ({ url, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	const startDate = url.searchParams.get('startDate') ?? undefined;
	const endDate   = url.searchParams.get('endDate')   ?? undefined;
	const search    = url.searchParams.get('search')    ?? undefined;

	const transactions = await getFilteredTransactions({ groupId: orgId, startDate, endDate, search });
	return json(transactions);
};
