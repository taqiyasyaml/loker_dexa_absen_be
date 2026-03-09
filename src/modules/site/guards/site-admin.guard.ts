import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { MstSiteUserRepository } from '@/modules/site/repository/mst-site-user.repository';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';

@Injectable()
export class SiteAdminGuard implements CanActivate {
  constructor(private readonly siteUserRepository: MstSiteUserRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const siteId = request.params.site_id || request.body.site_id;

    if (!user || !siteId) {
      return false;
    }

    const member = await this.siteUserRepository.findMember(siteId, user.sub);

    if (!member || !member.is_admin || !member.is_active) {
      throw new ForbiddenException('Only site administrators can perform this action');
    }

    return true;
  }
}
