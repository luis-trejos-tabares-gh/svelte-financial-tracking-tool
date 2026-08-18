import { json } from '@sveltejs/kit';
import {
	createWorkspace,
	addWorkspaceMember,
	seedDefaults,
	getWorkspacesForUser,
} from '$lib/server/database.js';
import { setActiveWorkspaceCookie } from '$lib/server/workspace.js';

export const GET = async ({ locals }) => {
	const { userId } = locals.auth();
	if (!userId) return json({ message: 'Unauthorized' }, { status: 401 });
	return json(await getWorkspacesForUser(userId));
};

export const POST = async ({ request, locals, cookies }) => {
	const { userId } = locals.auth();
	if (!userId) return json({ message: 'Unauthorized' }, { status: 401 });

	const { name } = await request.json();
	const trimmed = (name ?? '').trim();
	if (!trimmed) return json({ message: 'name is required' }, { status: 400 });

	const workspace = await createWorkspace({ name: trimmed, ownerId: userId });
	await addWorkspaceMember({ workspaceId: workspace.id, userId });
	await seedDefaults(workspace.id);
	setActiveWorkspaceCookie(cookies, workspace.id);

	return json(workspace, { status: 201 });
};
