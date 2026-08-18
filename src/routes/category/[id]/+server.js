import { updateCategory, deleteCategory } from '$lib/server/database.js';
import { requireWorkspace } from '$lib/server/workspace.js';
import { json } from '@sveltejs/kit';

export const PATCH = async ({ params, request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const data = await request.json();
	const updated = await updateCategory(params.id, data, ctx.workspaceId);
	return json(updated);
};

export const DELETE = async ({ params, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	await deleteCategory(params.id, ctx.workspaceId);
	return new Response(null, { status: 204 });
};
