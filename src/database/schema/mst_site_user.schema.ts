import { boolean, pgTable, text, unique } from 'drizzle-orm/pg-core';
import { auditableSchema } from './base.schema';

export const mstSiteUser = pgTable('mst_site_user', {
  ...auditableSchema,
  user_id: text('user_id').notNull(),
  site_id: text('site_id').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  is_admin: boolean('is_admin').default(false).notNull(),
}, (t) => [
  unique('mst_site_user_site_user_idx').on(t.site_id, t.user_id),
]);
