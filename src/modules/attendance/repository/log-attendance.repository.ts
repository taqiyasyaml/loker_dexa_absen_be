import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';

@Injectable()
export class LogAttendanceRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
  ) {}

  private getDb(trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    return trx || this.db;
  }

  async create(data: typeof schema.logAttendance.$inferInsert, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [result] = await this.getDb(trx)
      .insert(schema.logAttendance)
      .values(data)
      .returning();
    return result;
  }
}
