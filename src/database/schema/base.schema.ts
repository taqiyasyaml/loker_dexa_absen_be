import { text, timestamp } from 'drizzle-orm/pg-core';

export const baseSchema = {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
};

export const auditableSchema = {
  ...baseSchema,
  created_by: text('created_by'),
  updated_by: text('updated_by'),
};
