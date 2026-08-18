import { buildClerkProps } from 'svelte-clerk/server';
import { redirect } from '@sveltejs/kit';
import { bootstrapWorkspaces } from '$lib/server/workspace.js';

const PUBLIC_PATHS = ['/sign-in', '/sign-up'];

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals, url, cookies }) => {
	const { userId, orgId } = locals.auth();
	const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

	if (!userId && !isPublic) {
		const next = url.pathname.startsWith('/invite/')
			? `/sign-in?redirect_url=${encodeURIComponent(url.pathname)}`
			: '/sign-in';
		redirect(307, next);
	}

	if (userId && url.pathname === '/onboarding') {
		redirect(307, '/');
	}

	let workspaces = [];
	let activeWorkspaceId = null;

	if (userId) {
		const resolved = await bootstrapWorkspaces(userId, cookies, orgId);
		workspaces = resolved.workspaces;
		activeWorkspaceId = resolved.workspaceId;
	}

	return {
		...buildClerkProps(locals.auth()),
		signedIn: !!userId,
		workspaces,
		activeWorkspaceId,
	};
};
