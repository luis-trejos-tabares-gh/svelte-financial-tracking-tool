import { updateCurrency, deleteCurrency } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const PATCH = async ({ params, request }) => {
    const data = await request.json();
    const updated = await updateCurrency(params.id, data);
    return json(updated);
};

export const DELETE = async ({ params }) => {
    await deleteCurrency(params.id);
    return new Response(null, { status: 204 });
};
