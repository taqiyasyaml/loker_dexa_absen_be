import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class MstSiteUserRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
  ) {}

  private getDb(trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    return trx || this.db;
  }

  async upsert(data: typeof schema.mstSiteUser.$inferInsert, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [siteUser] = await this.getDb(trx)
      .insert(schema.mstSiteUser)
      .values(data)
      .onConflictDoUpdate({
        target: [schema.mstSiteUser.site_id, schema.mstSiteUser.user_id],
        set: data,
      })
      .returning();
    return siteUser;
  }

  async findBySiteId(siteId: string) {
    return this.db
      .select({
        id: schema.mstSiteUser.id,
        user_id: schema.mstSiteUser.user_id,
        site_id: schema.mstSiteUser.site_id,
        is_active: schema.mstSiteUser.is_active,
        is_admin: schema.mstSiteUser.is_admin,
        user_name: schema.mstUser.name,
        username: schema.mstUser.username,
      })
      .from(schema.mstSiteUser)
      .innerJoin(schema.mstUser, eq(schema.mstSiteUser.user_id, schema.mstUser.id))
      .where(eq(schema.mstSiteUser.site_id, siteId));
  }

  async findMember(siteId: string, userId: string) {
    const [member] = await this.db
      .select()
      .from(schema.mstSiteUser)
      .where(
        and(
          eq(schema.mstSiteUser.site_id, siteId),
          eq(schema.mstSiteUser.user_id, userId)
        )
      )
      .limit(1);
    return member;
  }

  async update(siteId: string, userId: string, data: Partial<typeof schema.mstSiteUser.$inferInsert>, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [updated] = await this.getDb(trx)
      .update(schema.mstSiteUser)
      .set(data)
      .where(
        and(
          eq(schema.mstSiteUser.site_id, siteId),
          eq(schema.mstSiteUser.user_id, userId)
        )
      )
      .returning();
    return updated;
  }

  async findManagedByUserId(userId: string) {
    return this.db
      .select({
        site_id: schema.mstSite.id,
        site_name: schema.mstSite.name,
      })
      .from(schema.mstSiteUser)
      .innerJoin(schema.mstSite, eq(schema.mstSiteUser.site_id, schema.mstSite.id))
      .where(
        and(
          eq(schema.mstSiteUser.user_id, userId),
          eq(schema.mstSiteUser.is_admin, true),
          eq(schema.mstSiteUser.is_active, true)
        )
      );
  }
}
