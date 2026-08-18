import { getCategories, createCategory, seedDefaults } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	await seedDefaults(ctx.workspaceId);
	return json(await getCategories(ctx.workspaceId));
};

export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const data = await request.json();
	if (!data.name) {
		return json({ message: 'name es requerido' }, { status: 400 });
	}
	const created = await createCategory({ ...data, groupId: ctx.workspaceId, active: true });
	return json(created, { status: 201 });
};
