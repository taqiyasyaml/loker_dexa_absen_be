import { pgTable, text } from 'drizzle-orm/pg-core';
import { baseSchema } from './base.schema';

export const mstUser = pgTable('mst_user', {
  ...baseSchema,
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
});
