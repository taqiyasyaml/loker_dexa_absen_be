import { pgTable, text } from 'drizzle-orm/pg-core';
import { auditableSchema } from './base.schema';

export const mstSite = pgTable('mst_site', {
  ...auditableSchema,
  name: text('name').notNull(),
});
