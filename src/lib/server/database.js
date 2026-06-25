import { transaction as TransactionTable, currency as CurrencyTable, paymentMethod as PaymentMethodTable, budget as BudgetTable } from './db/schema.js';
import { db } from './db/index.js';
import { eq, and, gte, lte, or, like, lt, gt } from 'drizzle-orm';

// ── Seed helpers ──────────────────────────────────────────────────────────────
const DEFAULT_CURRENCIES = [
	{ code: 'CRC', name: 'Colón Costarricense', symbol: '₡' },
	{ code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
];

const DEFAULT_PAYMENT_METHODS = [
	{ code: 'tarjeta_credito', name: 'Tarjeta de Crédito',    icon: '💳' },
	{ code: 'tarjeta_debito',  name: 'Tarjeta de Débito',     icon: '🏦' },
	{ code: 'transferencia',   name: 'Transferencia Bancaria', icon: '🔁' },
	{ code: 'sinpe',           name: 'SINPE Móvil',            icon: '📱' },
	{ code: 'efectivo',        name: 'Efectivo',               icon: '💵' },
];

export const seedDefaults = async () => {
	for (const c of DEFAULT_CURRENCIES) {
		const exists = await db.select().from(CurrencyTable).where(eq(CurrencyTable.code, c.code)).get();
		if (!exists) await db.insert(CurrencyTable).values(c);
	}
	for (const p of DEFAULT_PAYMENT_METHODS) {
		const exists = await db.select().from(PaymentMethodTable).where(eq(PaymentMethodTable.code, p.code)).get();
		if (!exists) await db.insert(PaymentMethodTable).values(p);
	}
};

// ── Currency ──────────────────────────────────────────────────────────────────
export const getCurrencies    = async () => db.select().from(CurrencyTable).all();
export const createCurrency   = async (data) => (await db.insert(CurrencyTable).values(data).returning())[0];
export const updateCurrency   = async (id, data) => (await db.update(CurrencyTable).set(data).where(eq(CurrencyTable.id, id)).returning())[0];
export const deleteCurrency   = async (id) => db.delete(CurrencyTable).where(eq(CurrencyTable.id, id));

// ── Payment methods ───────────────────────────────────────────────────────────
export const getPaymentMethods   = async () => db.select().from(PaymentMethodTable).all();
export const createPaymentMethod = async (data) => (await db.insert(PaymentMethodTable).values(data).returning())[0];
export const updatePaymentMethod = async (id, data) => (await db.update(PaymentMethodTable).set(data).where(eq(PaymentMethodTable.id, id)).returning())[0];
export const deletePaymentMethod = async (id) => db.delete(PaymentMethodTable).where(eq(PaymentMethodTable.id, id));

// ── Transactions ──────────────────────────────────────────────────────────────

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

// ── Budgets ───────────────────────────────────────────────────────────────────

/**
 * Check for date-range overlap with existing active budgets of the same currency.
 * Two periods overlap when:  existingStart <= newEnd  AND  existingEnd >= newStart
 * Returns the first conflicting budget, or null if none.
 *
 * @param {{ currency: string, startDate: string, endDate: string, excludeId?: string }} opts
 */
export const findOverlappingBudget = async ({ currency, startDate, endDate, excludeId }) => {
    const conditions = [
        eq(BudgetTable.currency, currency),
        eq(BudgetTable.active, true),
        lte(BudgetTable.startDate, endDate),   // existing.start <= newEnd
        gte(BudgetTable.endDate,   startDate), // existing.end   >= newStart
    ];
    if (excludeId) conditions.push(gt(BudgetTable.id, ''));  // placeholder replaced below

    const rows = await db.select().from(BudgetTable).where(and(...conditions)).all();
    if (!excludeId) return rows[0] ?? null;
    return rows.find(r => r.id !== excludeId) ?? null;
};

export const getBudgets        = async () => db.select().from(BudgetTable).orderBy(BudgetTable.startDate).all();
export const getBudgetById     = async (id) => db.select().from(BudgetTable).where(eq(BudgetTable.id, id)).get();

export const createBudget = async (data) => {
    const overlap = await findOverlappingBudget({
        currency:  data.currency,
        startDate: data.startDate,
        endDate:   data.endDate,
    });
    if (overlap) {
        throw new Error(`Período superpuesto con presupuesto existente: "${overlap.label}" (${overlap.startDate} – ${overlap.endDate})`);
    }
    return (await db.insert(BudgetTable).values(data).returning())[0];
};

export const updateBudget = async (id, data) => {
    if (data.startDate || data.endDate || data.currency) {
        const current = await getBudgetById(id);
        const overlap = await findOverlappingBudget({
            currency:  data.currency  ?? current.currency,
            startDate: data.startDate ?? current.startDate,
            endDate:   data.endDate   ?? current.endDate,
            excludeId: id,
        });
        if (overlap) {
            throw new Error(`Período superpuesto con presupuesto existente: "${overlap.label}" (${overlap.startDate} – ${overlap.endDate})`);
        }
    }
    return (await db.update(BudgetTable).set(data).where(eq(BudgetTable.id, id)).returning())[0];
};

export const deleteBudget = async (id) => db.delete(BudgetTable).where(eq(BudgetTable.id, id));

/**
 * Return the total spent (sum of transaction amounts) within a budget's date range and currency.
 */
export const getBudgetSpend = async (budget) => {
    const rows = await db.select({ amount: TransactionTable.amount })
        .from(TransactionTable)
        .where(and(
            eq(TransactionTable.currency, budget.currency),
            gte(TransactionTable.date, budget.startDate),
            lte(TransactionTable.date, budget.endDate + 'T23:59:59'),
        )).all();
    return rows.reduce((sum, r) => sum + (Number(r.amount) ?? 0), 0);
};