import { redirect } from '@sveltejs/kit';
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
	if (!userId) {
		redirect(307, `/sign-in?redirect_url=${encodeURIComponent(`/invite/${params.token}`)}`);
	}

	const invite = await getInviteByToken(params.token);
	if (!invite) {
		return { status: 'invalid' };
	}
	if (invite.acceptedAt) {
		return { status: 'accepted' };
	}
	if (new Date(invite.expiresAt) < new Date()) {
		return { status: 'expired' };
	}

	const workspace = await getWorkspaceById(invite.workspaceId);
	if (!workspace) {
		return { status: 'invalid' };
	}

	if (!(await isWorkspaceMember(invite.workspaceId, userId))) {
		await addWorkspaceMember({ workspaceId: invite.workspaceId, userId });
	}
	await markInviteAccepted(invite.id);
	setActiveWorkspaceCookie(cookies, invite.workspaceId);

	return { status: 'joined', workspaceName: workspace.name };
}
