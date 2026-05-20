import { transaction as TransactionTable } from './db/schema.js';
import { db } from './db/index.js';
import { get } from 'http';
import { eq } from 'drizzle-orm';

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

const getTransactionById = async (id) => {
    try {
        const transaction = await db.select().from(TransactionTable).where({ id }).first();
        return transaction || null;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

export { createTransaction, deleteTransaction, getTransactions, getTransactionById };