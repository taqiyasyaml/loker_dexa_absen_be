import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { auditableSchema } from './base.schema';

export const trxAttendance = pgTable('trx_attendance', {
  ...auditableSchema,
  user_id: text('user_id').notNull(),
  site_id: text('site_id').notNull(),
  is_attendance_active: boolean('is_attendance_active').default(true).notNull(),
  is_check_in: boolean('is_check_in').default(false).notNull(),
  check_in_at: timestamp('check_in_at'),
  is_check_out: boolean('is_check_out').default(false).notNull(),
  check_out_at: timestamp('check_out_at'),
  
  is_finalized: boolean('is_finalized').default(false).notNull(),
  final_check_in_at: timestamp('final_check_in_at'),
  final_checkout_at: timestamp('final_checkout_at'),
  final_ms: integer('final_ms').default(0).notNull(),
  final_penalty_ms: integer('final_penalty_ms').default(0).notNull(),
  final_overtime_ms: integer('final_overtime_ms').default(0).notNull(),
  final_notes: text('final_notes'),
  final_at: timestamp('final_at'),
  final_by: text('final_by'),

  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
}, (t) => [
  uniqueIndex('trx_attendance_active_idx')
    .on(t.user_id, t.site_id)
    .where(eq(t.is_attendance_active, true))
]);
