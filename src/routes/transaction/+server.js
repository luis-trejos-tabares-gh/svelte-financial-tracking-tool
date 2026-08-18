import { createTransaction, getFilteredTransactions } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	try {
		const transaction = await request.json();
		const newTransaction = await createTransaction({
			...transaction,
			groupId: ctx.workspaceId,
			createdBy: ctx.userId,
		});
		return json({ data: newTransaction }, { status: 201 });
	} catch (error) {
		console.error('Error creating transaction:', error);
		return json({ message: 'Error creating transaction' }, { status: 500 });
	}
};

export const GET = async ({ url, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const startDate = url.searchParams.get('startDate') ?? undefined;
	const endDate   = url.searchParams.get('endDate')   ?? undefined;
	const search    = url.searchParams.get('search')    ?? undefined;

	const transactions = await getFilteredTransactions({
		groupId: ctx.workspaceId, startDate, endDate, search,
	});
	return json(transactions);
};
