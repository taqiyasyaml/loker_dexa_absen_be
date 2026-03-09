import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { relations } from './relations';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        return drizzle({
          connection: { connectionString: process.env.DATABASE_URL! },
          schema,
          relations,
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
