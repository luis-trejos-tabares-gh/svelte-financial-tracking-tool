import { buildClerkProps } from 'svelte-clerk/server';
import { redirect } from '@sveltejs/kit';

const PUBLIC_PATHS = ['/sign-in', '/sign-up'];

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals, url }) => {
	const { userId, orgId } = locals.auth();
	const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

	if (!userId && !isPublic) {
		redirect(307, '/sign-in');
	}

	if (userId && !orgId && url.pathname !== '/onboarding') {
		redirect(307, '/onboarding');
	}

	return {
		...buildClerkProps(locals.auth())
	};
};
