import { clerkClient } from 'svelte-clerk/server';
import { json } from '@sveltejs/kit';

/** POST /settings/invite  — send an org invitation */
export const POST = async ({ request, locals }) => {
	const { orgId, orgRole } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });
	if (orgRole !== 'org:admin') return json({ message: 'Solo administradores pueden invitar miembros' }, { status: 403 });

	const { email } = await request.json();
	if (!email) return json({ message: 'email es requerido' }, { status: 400 });

	try {
		await clerkClient.organizations.createOrganizationInvitation({
			organizationId: orgId,
			emailAddress:   email,
			role:           'org:member',
			redirectUrl:    `${new URL(request.url).origin}/onboarding`,
		});
		return json({ message: 'Invitación enviada' });
	} catch (err) {
		return json({ message: err?.errors?.[0]?.message ?? 'Error al enviar la invitación' }, { status: 400 });
	}
};
