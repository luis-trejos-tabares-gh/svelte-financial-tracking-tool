import { getPaymentMethods, createPaymentMethod, seedDefaults } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async () => {
    await seedDefaults();
    const methods = await getPaymentMethods();
    return json(methods);
};

export const POST = async ({ request }) => {
    const data = await request.json();
    if (!data.code || !data.name) {
        return json({ message: 'code y name son requeridos' }, { status: 400 });
    }
    const created = await createPaymentMethod({ icon: '💳', ...data, active: true });
    return json(created, { status: 201 });
};
