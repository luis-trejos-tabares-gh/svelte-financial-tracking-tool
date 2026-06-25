import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const transaction = sqliteTable('transaction', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	amount: integer('amount').notNull(),
	date: text('date').notNull(),
	category: text('category').notNull(),
	currency: text('currency').notNull().default('CRC'),
	paymentMethod: text('payment_method').notNull().default('other'),
});

export const currency = sqliteTable('currency', {
	id:     text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	code:   text('code').notNull().unique(),
	name:   text('name').notNull(),
	symbol: text('symbol').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

export const paymentMethod = sqliteTable('payment_method', {
	id:    text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	code:  text('code').notNull().unique(),
	name:  text('name').notNull(),
	icon:  text('icon').default('💳'),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

/**
 * Budget table.
 *
 * type = 'monthly'  → startDate = 'YYYY-MM-01', endDate = last day of that month
 * type = 'ranged'   → arbitrary start / end chosen by the user
 *
 * Overlapping ranged budgets (same currency) are rejected at the API layer.
 */
export const budget = sqliteTable('budget', {
	id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	type:      text('type', { enum: ['monthly', 'ranged'] }).notNull().default('monthly'),
	label:     text('label').notNull(),            // e.g. "Junio 2026" or "Viaje a Panamá"
	amount:    real('amount').notNull(),           // real so USD cents work
	currency:  text('currency').notNull().default('CRC'),
	startDate: text('start_date').notNull(),       // YYYY-MM-DD
	endDate:   text('end_date').notNull(),         // YYYY-MM-DD
	active:    integer('active', { mode: 'boolean' }).notNull().default(true),
});
