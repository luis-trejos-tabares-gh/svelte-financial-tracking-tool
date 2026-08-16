import { getPaymentMethods, createPaymentMethod, seedDefaults } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	await seedDefaults(orgId);
	return json(await getPaymentMethods(orgId));
};

export const POST = async ({ request, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	const data = await request.json();
	if (!data.code || !data.name) {
		return json({ message: 'code y name son requeridos' }, { status: 400 });
	}
	const created = await createPaymentMethod({ icon: '💳', ...data, groupId: orgId, active: true });
	return json(created, { status: 201 });
};
