import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class TrxAttendanceRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
  ) {}

  private getDb(trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    return trx || this.db;
  }

  async create(data: typeof schema.trxAttendance.$inferInsert, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [result] = await this.getDb(trx)
      .insert(schema.trxAttendance)
      .values(data)
      .returning();
    return result;
  }

  async findActive(userId: string, siteId: string) {
    const [result] = await this.db
      .select()
      .from(schema.trxAttendance)
      .where(
        and(
          eq(schema.trxAttendance.user_id, userId),
          eq(schema.trxAttendance.site_id, siteId),
          eq(schema.trxAttendance.is_attendance_active, true),
          isNull(schema.trxAttendance.deleted_at)
        )
      )
      .limit(1);
    return result;
  }

  async update(id: string, data: Partial<typeof schema.trxAttendance.$inferInsert>, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [result] = await this.getDb(trx)
      .update(schema.trxAttendance)
      .set(data)
      .where(eq(schema.trxAttendance.id, id))
      .returning();
    return result;
  }

  async softDelete(id: string, userId: string, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [result] = await this.getDb(trx)
      .update(schema.trxAttendance)
      .set({
        is_attendance_active: false,
        deleted_at: new Date(),
        deleted_by: userId,
      })
      .where(eq(schema.trxAttendance.id, id))
      .returning();
    return result;
  }
}
