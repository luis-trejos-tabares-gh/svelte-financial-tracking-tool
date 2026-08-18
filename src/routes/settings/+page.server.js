import { clerkClient } from 'svelte-clerk/server';
import { redirect } from '@sveltejs/kit';
import { getActiveWorkspace } from '$lib/server/workspace.js';
import { getWorkspaceById, getWorkspaceMembers } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies }) {
	const { userId } = locals.auth();
	if (!userId) redirect(307, '/sign-in');

	const { workspaceId } = await getActiveWorkspace(userId, cookies);
	if (!workspaceId) redirect(307, '/');

	const [user, workspace, memberRows] = await Promise.all([
		clerkClient.users.getUser(userId),
		getWorkspaceById(workspaceId),
		getWorkspaceMembers(workspaceId),
	]);

	const members = await Promise.all(memberRows.map(async (m) => {
		try {
			const u = await clerkClient.users.getUser(m.userId);
			return {
				userId: m.userId,
				firstName: u.firstName,
				lastName: u.lastName,
				imageUrl: u.imageUrl,
				email: u.emailAddresses?.[0]?.emailAddress ?? '',
				isOwner: workspace?.ownerId === m.userId,
			};
		} catch {
			return {
				userId: m.userId,
				firstName: null,
				lastName: null,
				imageUrl: null,
				email: '',
				isOwner: workspace?.ownerId === m.userId,
			};
		}
	}));

	return {
		user: JSON.parse(JSON.stringify(user)),
		workspace,
		members,
		isOwner: workspace?.ownerId === userId,
		canLeave: (await getActiveWorkspace(userId, cookies)).workspaces.length > 1,
	};
}
