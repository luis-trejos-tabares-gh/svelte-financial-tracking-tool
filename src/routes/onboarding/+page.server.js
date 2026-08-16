import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const { userId, orgId } = locals.auth();

	if (!userId) redirect(307, '/sign-in');
	if (orgId)   redirect(307, '/');
}
