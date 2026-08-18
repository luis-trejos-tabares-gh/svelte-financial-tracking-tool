import { getBudgets, createBudget, getBudgetSpend } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const budgets = await getBudgets(ctx.workspaceId);
	const withSpend = await Promise.all(
		budgets.map(async (b) => ({ ...b, spent: await getBudgetSpend(b) }))
	);
	return json(withSpend);
};

export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const data = await request.json();

	const missing = ['label', 'amount', 'currency', 'startDate', 'endDate', 'type']
		.filter((k) => data[k] === undefined || data[k] === '');
	if (missing.length) {
		return json({ message: `Campos requeridos: ${missing.join(', ')}` }, { status: 400 });
	}
	if (data.startDate > data.endDate) {
		return json({ message: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, { status: 400 });
	}

	const created = await createBudget({ ...data, groupId: ctx.workspaceId });
	return json({ ...created, spent: 0 }, { status: 201 });
};
