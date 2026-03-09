import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { SiteModule } from '@/modules/site/site.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TrxAttendanceRepository } from '@/modules/attendance/repository/trx-attendance.repository';
import { LogAttendanceRepository } from '@/modules/attendance/repository/log-attendance.repository';

@Module({
  imports: [DatabaseModule, SiteModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    TrxAttendanceRepository,
    LogAttendanceRepository,
  ],
})
export class AttendanceModule {}
