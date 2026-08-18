import { getCurrencies, createCurrency, seedDefaults } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	await seedDefaults(ctx.workspaceId);
	return json(await getCurrencies(ctx.workspaceId));
};

export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const data = await request.json();
	if (!data.code || !data.name || !data.symbol) {
		return json({ message: 'code, name y symbol son requeridos' }, { status: 400 });
	}
	const created = await createCurrency({ ...data, groupId: ctx.workspaceId, active: true });
	return json(created, { status: 201 });
};
