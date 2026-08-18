import { json } from '@sveltejs/kit';
import { requireWorkspace } from '$lib/server/workspace.js';
import { createWorkspaceInvite, getWorkspaceById } from '$lib/server/database.js';
import { sendInviteEmail } from '$lib/server/email.js';

/** POST /settings/invite — create an app-owned invite and email the link. */
export const POST = async ({ request, locals, cookies }) => {
	const ctx = await requireWorkspace(locals, cookies);
	if (ctx.error) return ctx.error;

	const { email } = await request.json();
	if (!email) return json({ message: 'email is required' }, { status: 400 });

	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

	await createWorkspaceInvite({
		workspaceId: ctx.workspaceId,
		email: email.trim().toLowerCase(),
		token,
		invitedBy: ctx.userId,
		expiresAt,
	});

	const origin = new URL(request.url).origin;
	const inviteUrl = `${origin}/invite/${token}`;
	const workspace = await getWorkspaceById(ctx.workspaceId);
	const { sent, error } = await sendInviteEmail({
		to: email.trim(),
		inviteUrl,
		workspaceName: workspace?.name ?? 'expenseur',
	});

	if (!sent) {
		return json({
			message: error ?? 'Invite created but email was not sent',
			inviteUrl,
		}, { status: 201 });
	}

	return json({ message: 'Invitation sent', inviteUrl });
};
