import { createTransaction, getTransactions } from '$lib/server/database.js';

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

export const GET = async () => {
    const transactions = await getTransactions();
    return new Response(JSON.stringify(transactions), { status: 200 });
};
