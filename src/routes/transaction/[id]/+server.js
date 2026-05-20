import { deleteTransaction } from '$lib/server/database.js';

export const DELETE = async ({ params }) => {
    const { id } = params;

    try {
        await deleteTransaction(id);
        return new Response(JSON.stringify({ message: 'Transaction deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return new Response(JSON.stringify({ message: 'Error deleting transaction' }), { status: 500 });
    }
};
