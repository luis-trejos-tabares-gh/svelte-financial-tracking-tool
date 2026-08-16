import { clerkClient } from 'svelte-clerk/server';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const { userId, orgId, orgRole } = locals.auth();
	if (!userId) redirect(307, '/sign-in');
	if (!orgId)  redirect(307, '/onboarding');

	const [user, org, memberships] = await Promise.all([
		clerkClient.users.getUser(userId),
		clerkClient.organizations.getOrganization({ organizationId: orgId }),
		clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId }),
	]);

	return {
		user: JSON.parse(JSON.stringify(user)),
		org:  JSON.parse(JSON.stringify(org)),
		members: JSON.parse(JSON.stringify(memberships.data)),
		isAdmin: orgRole === 'org:admin',
	};
}
