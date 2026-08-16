import { getBudgets, createBudget, getBudgetSpend } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	const budgets = await getBudgets(orgId);
	const withSpend = await Promise.all(
		budgets.map(async (b) => ({ ...b, spent: await getBudgetSpend(b) }))
	);
	return json(withSpend);
};

export const POST = async ({ request, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	const data = await request.json();

	const missing = ['label', 'amount', 'currency', 'startDate', 'endDate', 'type']
		.filter((k) => data[k] === undefined || data[k] === '');
	if (missing.length) {
		return json({ message: `Campos requeridos: ${missing.join(', ')}` }, { status: 400 });
	}
	if (data.startDate > data.endDate) {
		return json({ message: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, { status: 400 });
	}

	const created = await createBudget({ ...data, groupId: orgId });
	return json({ ...created, spent: 0 }, { status: 201 });
};
