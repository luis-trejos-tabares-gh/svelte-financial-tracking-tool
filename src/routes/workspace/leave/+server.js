import { json } from '@sveltejs/kit';
import {
	getWorkspacesForUser,
	getWorkspaceById,
	removeWorkspaceMember,
	deleteWorkspaceMembers,
} from '$lib/server/database.js';
import { requireWorkspace, setActiveWorkspaceCookie } from '$lib/server/workspace.js';

/** Leave the active workspace. Owner dissolving removes all memberships. */
export const POST = async ({ locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const workspaces = await getWorkspacesForUser(ctx.userId);
	if (workspaces.length < 2) {
		return json({ message: 'Cannot leave your only workspace' }, { status: 400 });
	}

	const current = await getWorkspaceById(ctx.workspaceId);
	if (current?.ownerId === ctx.userId) {
		await deleteWorkspaceMembers(ctx.workspaceId);
	} else {
		await removeWorkspaceMember(ctx.workspaceId, ctx.userId);
	}

	const remaining = (await getWorkspacesForUser(ctx.userId))[0];
	if (remaining) setActiveWorkspaceCookie(cookies, remaining.id);

	return json({ ok: true });
};
