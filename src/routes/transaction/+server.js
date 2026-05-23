import { createTransaction, getFilteredTransactions } from '$lib/server/database.js';

export const POST = async ({ request }) => {
    try {
        const transaction = await request.json();
        const newTransaction = await createTransaction(transaction);
        return new Response(JSON.stringify({ data: newTransaction }), { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return new Response(JSON.stringify({ message: 'Error creating transaction' }), { status: 500 });
    }
};

export const GET = async ({ url }) => {
    const startDate = url.searchParams.get('startDate') ?? undefined;
    const endDate   = url.searchParams.get('endDate')   ?? undefined;
    const search    = url.searchParams.get('search')    ?? undefined;

    const transactions = await getFilteredTransactions({ startDate, endDate, search });
    return new Response(JSON.stringify(transactions), { status: 200 });
};
