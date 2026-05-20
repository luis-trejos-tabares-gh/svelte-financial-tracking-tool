import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transaction = sqliteTable('transaction', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	amount: integer('amount').notNull(),
	date: text('date').notNull(),
	category: text('category').notNull()
});
