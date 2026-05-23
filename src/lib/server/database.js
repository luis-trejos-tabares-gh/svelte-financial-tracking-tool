import { transaction as TransactionTable } from './db/schema.js';
import { db } from './db/index.js';
import { eq, and, gte, lte, or, like } from 'drizzle-orm';

const createTransaction = async (transaction) => {
    const newTransaction = await db.insert(TransactionTable).values(transaction).returning()
    .catch((error) => {
        console.error('Error creating transaction:', error);
    });

    return newTransaction && newTransaction[0] || null;
};

const deleteTransaction = async (id) => {
    await db.delete(TransactionTable).where(eq(TransactionTable.id, id))
    .catch((error) => {
        console.error('Error deleting transaction:', error);
    });
};

const getTransactions = async () => {
    try {
        const transactions = await db.select().from(TransactionTable).all();
        return Array.from(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

/**
 * @param {{ startDate?: string, endDate?: string, search?: string }} filters
 */
const getFilteredTransactions = async ({ startDate, endDate, search } = {}) => {
    try {
        const conditions = [];

        if (startDate) conditions.push(gte(TransactionTable.date, startDate));
        if (endDate)   conditions.push(lte(TransactionTable.date, endDate));
        if (search) {
            const pattern = `%${search}%`;
            conditions.push(
                or(
                    like(TransactionTable.title,    pattern),
                    like(TransactionTable.category, pattern)
                )
            );
        }

        const query = db.select().from(TransactionTable);
        const transactions = conditions.length
            ? await query.where(and(...conditions)).all()
            : await query.all();

        return Array.from(transactions);
    } catch (error) {
        console.error('Error fetching filtered transactions:', error);
        return [];
    }
};

const getTransactionById = async (id) => {
    try {
        const transaction = await db.select().from(TransactionTable).where({ id }).first();
        return transaction || null;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

export { createTransaction, deleteTransaction, getTransactions, getFilteredTransactions, getTransactionById };