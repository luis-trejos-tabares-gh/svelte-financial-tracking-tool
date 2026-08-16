import { transaction as TransactionTable, currency as CurrencyTable, paymentMethod as PaymentMethodTable, budget as BudgetTable, category as CategoryTable } from './db/schema.js';
import { db } from './db/index.js';
import { eq, and, gte, lte, or, like, ne } from 'drizzle-orm';

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

const DEFAULT_CATEGORIES = [
	{ name: 'Hogar'           },
	{ name: 'Vacaciones'      },
	{ name: 'Comida'          },
	{ name: 'Transporte'      },
	{ name: 'Salud'           },
	{ name: 'Entretenimiento' },
	{ name: 'Educación'       },
	{ name: 'Ropa'            },
	{ name: 'Servicios'       },
	{ name: 'Otros'           },
];

/** Seeds default currencies, payment methods, and categories for a group if they don't exist yet. */
export const seedDefaults = async (groupId) => {
	for (const c of DEFAULT_CURRENCIES) {
		const exists = await db.select().from(CurrencyTable)
			.where(and(eq(CurrencyTable.code, c.code), eq(CurrencyTable.groupId, groupId))).get();
		if (!exists) await db.insert(CurrencyTable).values({ ...c, groupId });
	}
	for (const p of DEFAULT_PAYMENT_METHODS) {
		const exists = await db.select().from(PaymentMethodTable)
			.where(and(eq(PaymentMethodTable.code, p.code), eq(PaymentMethodTable.groupId, groupId))).get();
		if (!exists) await db.insert(PaymentMethodTable).values({ ...p, groupId });
	}
	for (const cat of DEFAULT_CATEGORIES) {
		const exists = await db.select().from(CategoryTable)
			.where(and(eq(CategoryTable.name, cat.name), eq(CategoryTable.groupId, groupId))).get();
		if (!exists) await db.insert(CategoryTable).values({ ...cat, groupId });
	}
};

// ── Currency ──────────────────────────────────────────────────────────────────
export const getCurrencies    = async (groupId) => db.select().from(CurrencyTable).where(eq(CurrencyTable.groupId, groupId)).all();
export const createCurrency   = async (data) => (await db.insert(CurrencyTable).values(data).returning())[0];
export const updateCurrency   = async (id, data, groupId) => (await db.update(CurrencyTable).set(data).where(and(eq(CurrencyTable.id, id), eq(CurrencyTable.groupId, groupId))).returning())[0];
export const deleteCurrency   = async (id, groupId) => db.delete(CurrencyTable).where(and(eq(CurrencyTable.id, id), eq(CurrencyTable.groupId, groupId)));

// ── Payment methods ───────────────────────────────────────────────────────────
export const getPaymentMethods   = async (groupId) => db.select().from(PaymentMethodTable).where(eq(PaymentMethodTable.groupId, groupId)).all();
export const createPaymentMethod = async (data) => (await db.insert(PaymentMethodTable).values(data).returning())[0];
export const updatePaymentMethod = async (id, data, groupId) => (await db.update(PaymentMethodTable).set(data).where(and(eq(PaymentMethodTable.id, id), eq(PaymentMethodTable.groupId, groupId))).returning())[0];
export const deletePaymentMethod = async (id, groupId) => db.delete(PaymentMethodTable).where(and(eq(PaymentMethodTable.id, id), eq(PaymentMethodTable.groupId, groupId)));

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories    = async (groupId) => db.select().from(CategoryTable).where(eq(CategoryTable.groupId, groupId)).orderBy(CategoryTable.name).all();
export const createCategory   = async (data) => (await db.insert(CategoryTable).values(data).returning())[0];
export const updateCategory   = async (id, data, groupId) => (await db.update(CategoryTable).set(data).where(and(eq(CategoryTable.id, id), eq(CategoryTable.groupId, groupId))).returning())[0];
export const deleteCategory   = async (id, groupId) => db.delete(CategoryTable).where(and(eq(CategoryTable.id, id), eq(CategoryTable.groupId, groupId)));

// ── Transactions ──────────────────────────────────────────────────────────────

const createTransaction = async (transaction) => {
	const newTransaction = await db.insert(TransactionTable).values(transaction).returning()
		.catch((error) => { console.error('Error creating transaction:', error); });
	return newTransaction?.[0] ?? null;
};

const deleteTransaction = async (id, groupId) => {
	await db.delete(TransactionTable)
		.where(and(eq(TransactionTable.id, id), eq(TransactionTable.groupId, groupId)))
		.catch((error) => { console.error('Error deleting transaction:', error); });
};

const getTransactions = async (groupId) => {
	try {
		return Array.from(await db.select().from(TransactionTable).where(eq(TransactionTable.groupId, groupId)).all());
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return [];
	}
};

/**
 * @param {{ groupId: string, startDate?: string, endDate?: string, search?: string }} filters
 */
const getFilteredTransactions = async ({ groupId, startDate, endDate, search } = {}) => {
	try {
		const conditions = [eq(TransactionTable.groupId, groupId)];

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

		return Array.from(await db.select().from(TransactionTable).where(and(...conditions)).all());
	} catch (error) {
		console.error('Error fetching filtered transactions:', error);
		return [];
	}
};

const getTransactionById = async (id, groupId) => {
	try {
		const transaction = await db.select().from(TransactionTable)
			.where(and(eq(TransactionTable.id, id), eq(TransactionTable.groupId, groupId))).get();
		return transaction || null;
	} catch (error) {
		console.error('Error fetching transaction by id:', error);
		return null;
	}
};

export { createTransaction, deleteTransaction, getTransactions, getFilteredTransactions, getTransactionById };

// ── Budgets ───────────────────────────────────────────────────────────────────

/**
 * @param {{ groupId: string, currency: string, startDate: string, endDate: string, excludeId?: string }} opts
 */
export const findOverlappingBudget = async ({ groupId, currency, startDate, endDate, excludeId }) => {
	const conditions = [
		eq(BudgetTable.groupId,   groupId),
		eq(BudgetTable.currency,  currency),
		eq(BudgetTable.active,    true),
		lte(BudgetTable.startDate, endDate),
		gte(BudgetTable.endDate,   startDate),
	];
	if (excludeId) conditions.push(ne(BudgetTable.id, excludeId));

	const rows = await db.select().from(BudgetTable).where(and(...conditions)).all();
	return rows[0] ?? null;
};

export const getBudgets    = async (groupId) => db.select().from(BudgetTable).where(eq(BudgetTable.groupId, groupId)).orderBy(BudgetTable.startDate).all();
export const getBudgetById = async (id, groupId) => db.select().from(BudgetTable).where(and(eq(BudgetTable.id, id), eq(BudgetTable.groupId, groupId))).get();

export const createBudget = async (data) => {
	return (await db.insert(BudgetTable).values(data).returning())[0];
};

export const updateBudget = async (id, data, groupId) => {
	return (await db.update(BudgetTable).set(data).where(and(eq(BudgetTable.id, id), eq(BudgetTable.groupId, groupId))).returning())[0];
};

export const deleteBudget = async (id, groupId) => db.delete(BudgetTable).where(and(eq(BudgetTable.id, id), eq(BudgetTable.groupId, groupId)));

/**
 * Return the net spend for a budget:
 *   expenses assigned to this budget  minus  income assigned to this budget.
 * A positive result means money has been consumed; negative means more was
 * deposited than spent.
 */
export const getBudgetSpend = async (budget) => {
	const rows = await db.select({ amount: TransactionTable.amount, type: TransactionTable.type })
		.from(TransactionTable)
		.where(and(
			eq(TransactionTable.groupId,  budget.groupId),
			eq(TransactionTable.budgetId, budget.id),
		)).all();
	return rows.reduce((sum, r) => {
		const val = Number(r.amount) ?? 0;
		return r.type === 'income' ? sum - val : sum + val;
	}, 0);
};
