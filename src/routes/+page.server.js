import { getFilteredTransactions, getCurrencies, getPaymentMethods, seedDefaults } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    await seedDefaults();

    const [transactions, currencies, paymentMethods] = await Promise.all([
        getFilteredTransactions({}),
        getCurrencies(),
        getPaymentMethods(),
    ]);

    return {
        transactions,
        currencies:     currencies.filter(c => c.active),
        paymentMethods: paymentMethods.filter(p => p.active),
    };
}
