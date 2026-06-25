import { updateBudget, deleteBudget } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const PATCH = async ({ params, request }) => {
    const data = await request.json();
    try {
        const updated = await updateBudget(params.id, data);
        return json(updated);
    } catch (err) {
        return json({ message: err.message }, { status: 409 });
    }
};

export const DELETE = async ({ params }) => {
    await deleteBudget(params.id);
    return new Response(null, { status: 204 });
};
