import { getCategories, createCategory, seedDefaults } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	await seedDefaults();
	const categories = await getCategories();
	return json(categories);
};

export const POST = async ({ request }) => {
	const data = await request.json();
	if (!data.name) {
		return json({ message: 'name es requerido' }, { status: 400 });
	}
	const created = await createCategory({ ...data, active: true });
	return json(created, { status: 201 });
};
