import { updateCategory, deleteCategory } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const PATCH = async ({ params, request }) => {
	const data = await request.json();
	const updated = await updateCategory(params.id, data);
	return json(updated);
};

export const DELETE = async ({ params }) => {
	await deleteCategory(params.id);
	return new Response(null, { status: 204 });
};
