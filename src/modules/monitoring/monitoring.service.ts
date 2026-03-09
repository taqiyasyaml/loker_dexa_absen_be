import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { and, eq, gte, lte, isNull, inArray } from 'drizzle-orm';
import { MonitoringFilterDto } from '@/modules/monitoring/dto/monitoring-filter.dto';
import { FinalizeAttendanceDto } from '@/modules/monitoring/dto/finalize-attendance.dto';
import { MstSiteUserRepository } from '@/modules/site/repository/mst-site-user.repository';

@Injectable()
export class MonitoringService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
    private readonly siteUserRepo: MstSiteUserRepository,
  ) {}

  private getDateRange(filter: MonitoringFilterDto) {
    const now = new Date();
    const start = filter.start_date
      ? new Date(filter.start_date)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = filter.end_date
      ? new Date(filter.end_date)
      : new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    if (end < start) {
      throw new BadRequestException('end_date must be greater than start_date');
    }

    return { start, end };
  }

  async getUnfinalizedAttendances(siteId: string, filter: MonitoringFilterDto) {
    const { start, end } = this.getDateRange(filter);

    const data = await this.db
      .select({
        trx_attendance_id: schema.trxAttendance.id,
        is_finalized: schema.trxAttendance.is_finalized,
        user_name: schema.mstUser.name,
        check_in_at: schema.trxAttendance.check_in_at,
        check_out_at: schema.trxAttendance.check_out_at,
      })
      .from(schema.trxAttendance)
      .innerJoin(schema.mstUser, eq(schema.trxAttendance.user_id, schema.mstUser.id))
      .where(
        and(
          eq(schema.trxAttendance.site_id, siteId),
          eq(schema.trxAttendance.is_finalized, false),
          gte(schema.trxAttendance.check_in_at, start),
          lte(schema.trxAttendance.check_in_at, end),
          isNull(schema.trxAttendance.deleted_at),
        ),
      );

    return data.map((item) => ({
      ...item,
      final_check_in_at: item.check_in_at,
      final_checkout_at: item.check_out_at,
      final_ms: 0,
      final_penalty_ms: 0,
      final_overtime_ms: 0,
      final_notes: '',
      final_at: new Date(),
      final_user_name: '', // To be filled by controller/service if needed
    }));
  }

  async getUserAttendanceHistory(siteId: string, userId: string, filter: MonitoringFilterDto) {
    const { start, end } = this.getDateRange(filter);

    const data = await this.db
      .select()
      .from(schema.trxAttendance)
      .innerJoin(schema.mstUser, eq(schema.trxAttendance.user_id, schema.mstUser.id))
      .where(
        and(
          eq(schema.trxAttendance.site_id, siteId),
          eq(schema.trxAttendance.user_id, userId),
          gte(schema.trxAttendance.check_in_at, start),
          lte(schema.trxAttendance.check_in_at, end),
          isNull(schema.trxAttendance.deleted_at),
        ),
      )
      .orderBy(schema.trxAttendance.check_in_at);

    return data.map(({ trx_attendance: trx, mst_user: user }) => {
      if (trx.is_finalized) {
        return {
          trx_attendance_id: trx.id,
          is_finalized: true,
          user_name: user.name,
          check_in_at: trx.check_in_at,
          check_out_at: trx.check_out_at,
          final_check_in_at: trx.final_check_in_at,
          final_checkout_at: trx.final_checkout_at,
          final_ms: trx.final_ms,
          final_penalty_ms: trx.final_penalty_ms,
          final_overtime_ms: trx.final_overtime_ms,
          final_notes: trx.final_notes,
          final_at: trx.final_at,
          final_user_name: trx.final_by, // Simplified
        };
      }
      return {
        trx_attendance_id: trx.id,
        is_finalized: false,
        user_name: user.name,
        check_in_at: trx.check_in_at,
        check_out_at: trx.check_out_at,
        final_check_in_at: trx.check_in_at,
        final_checkout_at: trx.check_out_at,
        final_ms: 0,
        final_penalty_ms: 0,
        final_overtime_ms: 0,
        final_notes: '',
        final_at: new Date(),
        final_user_name: '',
      };
    });
  }

  async finalizeAttendance(adminId: string, adminUsername: string, dto: FinalizeAttendanceDto) {
    const trxIds = dto.items.map((i) => i.trx_attendance_id);
    if (trxIds.length === 0) return [];

    // 1. Fetch all transactions to check site ownership
    const transactions = await this.db
      .select()
      .from(schema.trxAttendance)
      .where(inArray(schema.trxAttendance.id, trxIds));

    // 2. Validate site ownership for each transaction
    // Optimize: Get unique site IDs
    const siteIds = [...new Set(transactions.map((t) => t.site_id))];
    for (const siteId of siteIds) {
      const membership = await this.siteUserRepo.findMember(siteId, adminId);
      if (!membership || !membership.is_admin || !membership.is_active) {
        throw new ForbiddenException(`You are not an admin of site ${siteId}`);
      }
    }

    // Map for easy lookup
    const trxMap = new Map(transactions.map((t) => [t.id, t]));

    return await this.db.transaction(async (trx) => {
      const updatedRecords = [];

      for (const item of dto.items) {
        const existing = trxMap.get(item.trx_attendance_id);
        if (!existing) continue;

        const finalCheckIn = item.final_check_in_at ? new Date(item.final_check_in_at) : existing.check_in_at;
        const finalCheckOut = item.final_check_out_at ? new Date(item.final_check_out_at) : existing.check_out_at;

        if (finalCheckOut && finalCheckIn && finalCheckOut < finalCheckIn) {
          throw new BadRequestException(`final_check_out must be >= final_check_in for trx ${item.trx_attendance_id}`);
        }

        const finalMs = item.final_ms ?? 0;
        const penaltyMs = item.final_penalty_ms ?? 0;
        const overtimeMs = item.final_overtime_ms ?? 0;

        // Update Trx
        const [updated] = await trx
          .update(schema.trxAttendance)
          .set({
            is_finalized: true,
            is_attendance_active: false,
            final_check_in_at: finalCheckIn,
            final_checkout_at: finalCheckOut,
            final_ms: finalMs,
            final_penalty_ms: penaltyMs,
            final_overtime_ms: overtimeMs,
            final_notes: item.final_notes,
            final_at: new Date(),
            final_by: adminUsername,
            updated_by: adminId,
          })
          .where(eq(schema.trxAttendance.id, item.trx_attendance_id))
          .returning();

        // Calculate hours for log (ms / 3,600,000)
        const fH = (finalMs / 3600000).toFixed(2);
        const pH = (penaltyMs / 3600000).toFixed(2);
        const oH = (overtimeMs / 3600000).toFixed(2);
        const logNotes = `(System) Final : ${finalCheckIn?.toISOString()} - ${finalCheckOut?.toISOString()} (${fH} H -${pH} H +${oH} H) by ${adminUsername}`;

        // Create Log
        await trx.insert(schema.logAttendance).values({
          trx_attendance_id: item.trx_attendance_id,
          notes: logNotes,
          created_by: adminId,
        });

        updatedRecords.push(updated);
      }

      return updatedRecords;
    });
  }
}
