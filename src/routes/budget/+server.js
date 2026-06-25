import { getBudgets, createBudget, getBudgetSpend } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export const GET = async () => {
    const budgets = await getBudgets();
    // Attach live spend to each budget
    const withSpend = await Promise.all(
        budgets.map(async (b) => ({
            ...b,
            spent: await getBudgetSpend(b),
        }))
    );
    return json(withSpend);
};

export const POST = async ({ request }) => {
    const data = await request.json();

    // Basic required field validation
    const missing = ['label', 'amount', 'currency', 'startDate', 'endDate', 'type']
        .filter(k => data[k] === undefined || data[k] === '');
    if (missing.length) {
        return json({ message: `Campos requeridos: ${missing.join(', ')}` }, { status: 400 });
    }
    if (data.startDate > data.endDate) {
        return json({ message: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, { status: 400 });
    }

    try {
        const created = await createBudget(data);
        return json({ ...created, spent: 0 }, { status: 201 });
    } catch (err) {
        return json({ message: err.message }, { status: 409 });
    }
};
