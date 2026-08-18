import { json } from '@sveltejs/kit';
import { isWorkspaceMember } from '$lib/server/database.js';
import { setActiveWorkspaceCookie } from '$lib/server/workspace.js';

export const POST = async ({ request, locals, cookies }) => {
	const { userId } = locals.auth();
	if (!userId) return json({ message: 'Unauthorized' }, { status: 401 });

	const { workspaceId } = await request.json();
	if (!workspaceId) return json({ message: 'workspaceId is required' }, { status: 400 });

	if (!(await isWorkspaceMember(workspaceId, userId))) {
		return json({ message: 'Not a member of this workspace' }, { status: 403 });
	}

	setActiveWorkspaceCookie(cookies, workspaceId);
	return json({ ok: true, workspaceId });
};
