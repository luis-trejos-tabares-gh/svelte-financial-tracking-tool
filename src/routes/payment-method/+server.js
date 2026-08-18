import { getPaymentMethods, createPaymentMethod, seedDefaults } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	await seedDefaults(ctx.workspaceId);
	return json(await getPaymentMethods(ctx.workspaceId));
};

export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const data = await request.json();
	if (!data.code || !data.name) {
		return json({ message: 'code y name son requeridos' }, { status: 400 });
	}
	const created = await createPaymentMethod({ icon: '💳', ...data, groupId: ctx.workspaceId, active: true });
	return json(created, { status: 201 });
};
