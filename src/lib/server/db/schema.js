import { integer, sqliteTable, text, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const category = sqliteTable('category', {
	id:      text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	groupId: text('group_id').notNull(),
	name:    text('name').notNull(),
	active:  integer('active', { mode: 'boolean' }).notNull().default(true),
}, (t) => ({
	uniqueNamePerGroup: uniqueIndex('category_name_group_unique').on(t.name, t.groupId),
}));

export const transaction = sqliteTable('transaction', {
	id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	groupId:       text('group_id').notNull(),
	title:         text('title').notNull(),
	amount:        integer('amount').notNull(),
	date:          text('date').notNull(),
	category:      text('category').notNull(),
	currency:      text('currency').notNull().default('CRC'),
	paymentMethod: text('payment_method').notNull().default('other'),
	type:          text('type', { enum: ['expense', 'income'] }).notNull().default('expense'),
	budgetId:      text('budget_id'),
});

export const currency = sqliteTable('currency', {
	id:      text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	groupId: text('group_id').notNull(),
	code:    text('code').notNull(),
	name:    text('name').notNull(),
	symbol:  text('symbol').notNull(),
	active:  integer('active', { mode: 'boolean' }).notNull().default(true),
}, (t) => ({
	uniqueCodePerGroup: uniqueIndex('currency_code_group_unique').on(t.code, t.groupId),
}));

export const paymentMethod = sqliteTable('payment_method', {
	id:      text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	groupId: text('group_id').notNull(),
	code:    text('code').notNull(),
	name:    text('name').notNull(),
	icon:    text('icon').default('💳'),
	active:  integer('active', { mode: 'boolean' }).notNull().default(true),
}, (t) => ({
	uniqueCodePerGroup: uniqueIndex('payment_method_code_group_unique').on(t.code, t.groupId),
}));

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
	groupId:   text('group_id').notNull(),
	type:      text('type', { enum: ['monthly', 'ranged'] }).notNull().default('monthly'),
	label:     text('label').notNull(),
	amount:    real('amount').notNull(),
	currency:  text('currency').notNull().default('CRC'),
	startDate: text('start_date').notNull(),
	endDate:   text('end_date').notNull(),
	active:    integer('active', { mode: 'boolean' }).notNull().default(true),
});
