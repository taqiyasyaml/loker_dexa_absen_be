import { doublePrecision, pgTable, text } from 'drizzle-orm/pg-core';
import { auditableSchema } from './base.schema';

export const logAttendance = pgTable('log_attendance', {
  ...auditableSchema,
  trx_attendance_id: text('trx_attendance_id').notNull(),
  notes: text('notes').notNull(),
  photo_path: text('photo_path'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
});
