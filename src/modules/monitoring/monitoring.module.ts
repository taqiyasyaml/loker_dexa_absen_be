import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { SiteModule } from '@/modules/site/site.module';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [DatabaseModule, SiteModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
