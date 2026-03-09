import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { SiteModule } from './modules/site/site.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    SiteModule,
    AttendanceModule,
    MonitoringModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
