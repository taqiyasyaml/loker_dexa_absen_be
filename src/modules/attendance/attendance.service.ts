import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { TrxAttendanceRepository } from '@/modules/attendance/repository/trx-attendance.repository';
import { LogAttendanceRepository } from '@/modules/attendance/repository/log-attendance.repository';
import { MstSiteUserRepository } from '@/modules/site/repository/mst-site-user.repository';
import { AttendanceActionDto } from '@/modules/attendance/dto/attendance-action.dto';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
    private readonly trxRepo: TrxAttendanceRepository,
    private readonly logRepo: LogAttendanceRepository,
    private readonly siteUserRepo: MstSiteUserRepository,
  ) {}

  async getAvailableSites(userId: string) {
    const results = await this.db
      .select({
        site_id: schema.mstSite.id,
        site_name: schema.mstSite.name,
        is_attendance_active: schema.trxAttendance.is_attendance_active,
      })
      .from(schema.mstSiteUser)
      .innerJoin(schema.mstSite, eq(schema.mstSiteUser.site_id, schema.mstSite.id))
      .leftJoin(
        schema.trxAttendance,
        and(
          eq(schema.trxAttendance.site_id, schema.mstSite.id),
          eq(schema.trxAttendance.user_id, userId),
          eq(schema.trxAttendance.is_attendance_active, true),
          isNull(schema.trxAttendance.deleted_at),
        ),
      )
      .where(
        and(
          eq(schema.mstSiteUser.user_id, userId),
          eq(schema.mstSiteUser.is_active, true),
        ),
      );

    return results.map((r) => ({
      ...r,
      is_attendance_active: !!r.is_attendance_active,
    }));
  }

  async checkIn(userId: string, siteId: string, dto: AttendanceActionDto, photoPath?: string) {
    // 1. Validate membership
    const membership = await this.siteUserRepo.findMember(siteId, userId);
    if (!membership || !membership.is_active) {
      throw new ForbiddenException('You are not an active member of this site');
    }

    // 2. Check for active session
    const activeSession = await this.trxRepo.findActive(userId, siteId);
    if (activeSession) {
      throw new BadRequestException('You already have an active attendance session at this site');
    }

    return await this.db.transaction(async (trx) => {
      // 3. Create Trx
      const trxSession = await this.trxRepo.create(
        {
          user_id: userId,
          site_id: siteId,
          is_attendance_active: true,
          is_check_in: true,
          check_in_at: new Date(),
          created_by: userId,
        },
        trx,
      );

      // 4. Create Log
      await this.logRepo.create(
        {
          trx_attendance_id: trxSession.id,
          notes: dto.notes,
          photo_path: photoPath,
          latitude: dto.latitude,
          longitude: dto.longitude,
          created_by: userId,
        },
        trx,
      );

      return trxSession;
    });
  }

  async checkPoint(userId: string, siteId: string, dto: AttendanceActionDto, photoPath?: string) {
    const activeSession = await this.trxRepo.findActive(userId, siteId);
    if (!activeSession) {
      throw new NotFoundException('No active attendance session found at this site');
    }

    await this.logRepo.create({
      trx_attendance_id: activeSession.id,
      notes: dto.notes,
      photo_path: photoPath,
      latitude: dto.latitude,
      longitude: dto.longitude,
      created_by: userId,
    });

    return { message: 'Checkpoint logged successfully' };
  }

  async checkOut(userId: string, siteId: string, dto: AttendanceActionDto, photoPath?: string) {
    const activeSession = await this.trxRepo.findActive(userId, siteId);
    if (!activeSession) {
      throw new NotFoundException('No active attendance session found at this site');
    }

    return await this.db.transaction(async (trx) => {
      // 1. Finalize Trx
      const finalized = await this.trxRepo.update(
        activeSession.id,
        {
          is_attendance_active: false,
          is_check_out: true,
          check_out_at: new Date(),
          updated_by: userId,
        },
        trx,
      );

      // 2. Create Log
      await this.logRepo.create(
        {
          trx_attendance_id: activeSession.id,
          notes: dto.notes,
          photo_path: photoPath,
          latitude: dto.latitude,
          longitude: dto.longitude,
          created_by: userId,
        },
        trx,
      );

      return finalized;
    });
  }

  async cancelCheckIn(userId: string, siteId: string) {
    const activeSession = await this.trxRepo.findActive(userId, siteId);
    if (!activeSession) {
      throw new NotFoundException('No active attendance session found to cancel');
    }

    if (activeSession.is_check_out) {
      throw new BadRequestException('Cannot cancel a session that has already been checked out');
    }

    return this.trxRepo.softDelete(activeSession.id, userId);
  }

  async forceCheckIn(userId: string, siteId: string, dto: AttendanceActionDto, photoPath?: string) {
    const activeSession = await this.trxRepo.findActive(userId, siteId);
    
    return await this.db.transaction(async (trx) => {
      if (activeSession) {
        // Close old session
        await this.trxRepo.update(
          activeSession.id,
          {
            is_attendance_active: false,
            updated_by: userId,
          },
          trx,
        );
      }

      // Start new session
      return this.checkIn(userId, siteId, dto, photoPath);
    });
  }
}
