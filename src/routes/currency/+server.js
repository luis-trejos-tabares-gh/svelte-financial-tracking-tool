import { getCurrencies, createCurrency, seedDefaults } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async () => {
    await seedDefaults();
    const currencies = await getCurrencies();
    return json(currencies);
};

export const POST = async ({ request }) => {
    const data = await request.json();
    if (!data.code || !data.name || !data.symbol) {
        return json({ message: 'code, name y symbol son requeridos' }, { status: 400 });
    }
    const created = await createCurrency({ ...data, active: true });
    return json(created, { status: 201 });
};
