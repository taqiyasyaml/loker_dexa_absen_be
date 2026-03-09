import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { eq } from 'drizzle-orm';

@Injectable()
export class MstUserRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
  ) {}

  private getDb(trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    return trx || this.db;
  }

  async findByUsername(username: string, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [user] = await this.getDb(trx)
      .select()
      .from(schema.mstUser)
      .where(eq(schema.mstUser.username, username))
      .limit(1);
    return user;
  }

  async findById(id: string, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [user] = await this.getDb(trx)
      .select()
      .from(schema.mstUser)
      .where(eq(schema.mstUser.id, id))
      .limit(1);
    return user;
  }

  async createUser(data: typeof schema.mstUser.$inferInsert, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [user] = await this.getDb(trx)
      .insert(schema.mstUser)
      .values(data)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<typeof schema.mstUser.$inferInsert>, trx?: NodePgTransaction<typeof schema, typeof relations, any>) {
    const [user] = await this.getDb(trx)
      .update(schema.mstUser)
      .set(data)
      .where(eq(schema.mstUser.id, id))
      .returning();
    return user;
  }
}
