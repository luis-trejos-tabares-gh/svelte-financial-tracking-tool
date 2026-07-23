import { getFilteredTransactions, getCurrencies, getPaymentMethods, getCategories, seedDefaults } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    await seedDefaults();

    const [transactions, currencies, paymentMethods, categories] = await Promise.all([
        getFilteredTransactions({}),
        getCurrencies(),
        getPaymentMethods(),
        getCategories(),
    ]);

    return {
        transactions,
        currencies:     currencies.filter(c => c.active),
        paymentMethods: paymentMethods.filter(p => p.active),
        categories:     categories.filter(c => c.active),
    };
}
