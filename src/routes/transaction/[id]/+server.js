import { deleteTransaction } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const DELETE = async ({ params, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	try {
		await deleteTransaction(params.id, orgId);
		return json({ message: 'Transaction deleted successfully' });
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return json({ message: 'Error deleting transaction' }, { status: 500 });
	}
};
