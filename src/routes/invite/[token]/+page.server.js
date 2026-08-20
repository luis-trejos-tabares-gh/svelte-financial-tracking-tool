import {
	getInviteByToken,
	markInviteAccepted,
	isWorkspaceMember,
	addWorkspaceMember,
	getWorkspaceById,
} from '$lib/server/database.js';
import { setActiveWorkspaceCookie } from '$lib/server/workspace.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, cookies }) {
	const { userId } = locals.auth();
	const invite = await getInviteByToken(params.token);

	if (!invite) {
		return { status: 'invalid' };
	}

	const workspace = await getWorkspaceById(invite.workspaceId);
	if (!workspace) {
		return { status: 'invalid' };
	}

	if (invite.acceptedAt) {
		return { status: 'accepted', workspaceName: workspace.name };
	}
	if (new Date(invite.expiresAt) < new Date()) {
		return { status: 'expired', workspaceName: workspace.name };
	}

	if (!userId) {
		return {
			status: 'need_auth',
			workspaceName: workspace.name,
			email: invite.email ?? '',
			token: params.token,
		};
	}

	if (!(await isWorkspaceMember(invite.workspaceId, userId))) {
		await addWorkspaceMember({ workspaceId: invite.workspaceId, userId });
	}
	await markInviteAccepted(invite.id);
	setActiveWorkspaceCookie(cookies, invite.workspaceId);

	return { status: 'joined', workspaceName: workspace.name };
}
