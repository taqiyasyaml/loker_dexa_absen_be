import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { eq } from 'drizzle-orm';

@Injectable()
export class MstSiteRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
  ) {}

  private getDb(trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    return trx || this.db;
  }

  async create(data: typeof schema.mstSite.$inferInsert, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [site] = await this.getDb(trx)
      .insert(schema.mstSite)
      .values(data)
      .returning();
    return site;
  }

  async findById(id: string, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [site] = await this.getDb(trx)
      .select()
      .from(schema.mstSite)
      .where(eq(schema.mstSite.id, id))
      .limit(1);
    return site;
  }
}
