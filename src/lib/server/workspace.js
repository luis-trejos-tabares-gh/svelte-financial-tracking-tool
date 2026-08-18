import { json } from '@sveltejs/kit';
import { clerkClient } from 'svelte-clerk/server';
import {
	createWorkspace,
	getWorkspaceById,
	getWorkspacesForUser,
	addWorkspaceMember,
	isWorkspaceMember,
	getLegacyGroupIds,
	seedDefaults,
} from '$lib/server/database.js';

export const WORKSPACE_COOKIE = 'expenseur_workspace';

function cookieOpts() {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365,
		secure: process.env.NODE_ENV === 'production',
	};
}

async function personalName(userId) {
	try {
		const user = await clerkClient.users.getUser(userId);
		const first = user.firstName?.trim();
		return first ? `${first}'s workspace` : 'Personal';
	} catch {
		return 'Personal';
	}
}

/**
 * Map leftover Clerk-org group_id values into workspace + membership rows.
 * Safe to call on every request — all operations are idempotent.
 */
async function importLegacyGroups(userId, orgId) {
	const legacyIds = await getLegacyGroupIds();
	for (const id of legacyIds) {
		const existing = await getWorkspaceById(id);
		if (!existing) {
			try {
				await createWorkspace({ id, name: 'Imported workspace', ownerId: userId });
			} catch {
				// another request may have inserted it
			}
		}
	}

	const attachId = orgId && legacyIds.includes(orgId) ? orgId : null;
	if (attachId && !(await isWorkspaceMember(attachId, userId))) {
		try {
			await addWorkspaceMember({ workspaceId: attachId, userId });
		} catch { /* already a member */ }
	}

	if (orgId) {
		try {
			const list = await clerkClient.organizations.getOrganizationMembershipList({
				organizationId: orgId,
			});
			const ws = await getWorkspaceById(orgId);
			if (ws) {
				for (const m of list.data ?? []) {
					const memberId = m.publicUserData?.userId;
					if (memberId && !(await isWorkspaceMember(orgId, memberId))) {
						try {
							await addWorkspaceMember({ workspaceId: orgId, userId: memberId });
						} catch { /* duplicate */ }
					}
				}
			}
		} catch {
			// Organizations may already be disabled in Clerk
		}
	}
}

export async function ensurePersonalWorkspace(userId) {
	const existing = await getWorkspacesForUser(userId);
	if (existing.length > 0) return existing;

	const legacyIds = await getLegacyGroupIds();
	if (legacyIds.length === 1) {
		const id = legacyIds[0];
		if (!(await getWorkspaceById(id))) {
			await createWorkspace({ id, name: 'Imported workspace', ownerId: userId });
		}
		try {
			await addWorkspaceMember({ workspaceId: id, userId });
		} catch { /* already a member */ }
		return getWorkspacesForUser(userId);
	}

	const workspace = await createWorkspace({
		name: await personalName(userId),
		ownerId: userId,
	});
	await addWorkspaceMember({ workspaceId: workspace.id, userId });
	await seedDefaults(workspace.id);
	return [workspace];
}

export async function getActiveWorkspace(userId, cookies) {
	const workspaces = await getWorkspacesForUser(userId);
	if (workspaces.length === 0) return { workspaces: [], workspaceId: null };

	const cookieId = cookies.get(WORKSPACE_COOKIE);
	const valid = workspaces.find((w) => w.id === cookieId);
	const workspaceId = valid ? valid.id : workspaces[0].id;

	if (cookieId !== workspaceId) {
		cookies.set(WORKSPACE_COOKIE, workspaceId, cookieOpts());
	}

	return { workspaces, workspaceId };
}

export function setActiveWorkspaceCookie(cookies, workspaceId) {
	cookies.set(WORKSPACE_COOKIE, workspaceId, cookieOpts());
}

/**
 * Layout bootstrap: import legacy Clerk-org rows, guarantee a personal
 * workspace, resolve the active workspace from the cookie.
 */
export async function bootstrapWorkspaces(userId, cookies, orgId) {
	await importLegacyGroups(userId, orgId);
	await ensurePersonalWorkspace(userId);
	return getActiveWorkspace(userId, cookies);
}

/**
 * Guard for +server.js routes.
 * @returns {{ userId: string, workspaceId: string } | { error: Response }}
 */
export async function requireWorkspace(locals, cookies) {
	const { userId } = locals.auth();
	if (!userId) {
		return { error: json({ message: 'Unauthorized' }, { status: 401 }) };
	}

	const { workspaceId } = await getActiveWorkspace(userId, cookies);
	if (!workspaceId) {
		return { error: json({ message: 'No active workspace' }, { status: 403 }) };
	}

	return { userId, workspaceId };
}
