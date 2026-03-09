import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { MstSiteRepository } from '@/modules/site/repository/mst-site.repository';
import { MstSiteUserRepository } from '@/modules/site/repository/mst-site-user.repository';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SiteController],
  providers: [SiteService, MstSiteRepository, MstSiteUserRepository],
  exports: [SiteService, MstSiteUserRepository],
})
export class SiteModule {}
