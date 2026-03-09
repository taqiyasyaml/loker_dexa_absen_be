import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  mstSiteUser: {
    user: r.one.mstUser({
      from: r.mstSiteUser.user_id,
      to: r.mstUser.id,
    }),
    site: r.one.mstSite({
      from: r.mstSiteUser.site_id,
      to: r.mstSite.id,
    }),
  },
  trxAttendance: {
    user: r.one.mstUser({
      from: r.trxAttendance.user_id,
      to: r.mstUser.id,
    }),
    site: r.one.mstSite({
      from: r.trxAttendance.site_id,
      to: r.mstSite.id,
    }),
    logs: r.many.logAttendance(),
  },
  logAttendance: {
    trxAttendance: r.one.trxAttendance({
      from: r.logAttendance.trx_attendance_id,
      to: r.trxAttendance.id,
    }),
  },
}));
