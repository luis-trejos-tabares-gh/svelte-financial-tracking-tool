import { updatePaymentMethod, deletePaymentMethod } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const PATCH = async ({ params, request, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	const data = await request.json();
	const updated = await updatePaymentMethod(params.id, data, orgId);
	return json(updated);
};

export const DELETE = async ({ params, locals }) => {
	const { orgId } = locals.auth();
	if (!orgId) return json({ message: 'No active group' }, { status: 403 });

	await deletePaymentMethod(params.id, orgId);
	return new Response(null, { status: 204 });
};
