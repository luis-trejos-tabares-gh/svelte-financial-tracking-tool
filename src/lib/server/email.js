import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

/**
 * Send a workspace invite email via Resend.
 * Returns { sent: boolean, error?: string }.
 */
export async function sendInviteEmail({ to, inviteUrl, workspaceName }) {
	if (!env.RESEND_API_KEY) {
		return { sent: false, error: 'RESEND_API_KEY is not set' };
	}

	const resend = new Resend(env.RESEND_API_KEY);
	const from = env.RESEND_FROM || 'expenseur <onboarding@resend.dev>';

	const { error } = await resend.emails.send({
		from,
		to,
		subject: `You've been invited to ${workspaceName} on expenseur`,
		html: `
			<div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #0f172a;">
				<p>You've been invited to join <strong>${escapeHtml(workspaceName)}</strong> on expenseur.</p>
				<p>
					<a href="${inviteUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
						Accept invitation
					</a>
				</p>
				<p style="font-size:12px;color:#64748b;">Or copy this link:<br>${escapeHtml(inviteUrl)}</p>
			</div>
		`,
	});

	if (error) return { sent: false, error: error.message ?? 'Failed to send email' };
	return { sent: true };
}

function escapeHtml(str) {
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}
