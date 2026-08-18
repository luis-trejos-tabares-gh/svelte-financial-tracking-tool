import { deleteTransaction } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const DELETE = async ({ params, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	try {
		await deleteTransaction(params.id, ctx.workspaceId);
		return json({ message: 'Transaction deleted successfully' });
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return json({ message: 'Error deleting transaction' }, { status: 500 });
	}
};
