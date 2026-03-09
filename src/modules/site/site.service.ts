import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '@/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { relations } from '@/database/relations';
import { MstSiteRepository } from '@/modules/site/repository/mst-site.repository';
import { MstSiteUserRepository } from '@/modules/site/repository/mst-site-user.repository';
import { CreateSiteDto } from './dto/create-site.dto';
import { AddSiteUserDto } from './dto/add-site-user.dto';
import { UpdateSiteUserDto } from './dto/update-site-user.dto';

import { MstUserRepository } from '@/modules/auth/repository/mst-user.repository';

@Injectable()
export class SiteService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema, typeof relations>,
    private readonly siteRepository: MstSiteRepository,
    private readonly siteUserRepository: MstSiteUserRepository,
    private readonly userRepository: MstUserRepository,
  ) { }

  async createSite(userId: string, dto: CreateSiteDto) {
    return await this.db.transaction(async (trx) => {
      const site = await this.siteRepository.create(
        {
          name: dto.name,
          created_by: userId,
        },
        trx,
      );

      await this.siteUserRepository.upsert(
        {
          site_id: site.id,
          user_id: userId,
          is_admin: true,
          is_active: true,
          created_by: userId,
        },
        trx,
      );

      return site;
    });
  }

  async getManagedSites(userId: string) {
    return this.siteUserRepository.findManagedByUserId(userId);
  }

  async addMember(siteId: string, adminId: string, dto: AddSiteUserDto) {
    const site = await this.siteRepository.findById(siteId);
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      throw new NotFoundException(`User with username ${dto.username} not found`);
    }

    return this.siteUserRepository.upsert({
      site_id: siteId,
      user_id: user.id,
      is_admin: dto.is_admin ?? false,
      is_active: true,
      created_by: adminId,
    });
  }

  async getMembers(siteId: string) {
    const site = await this.siteRepository.findById(siteId);
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return this.siteUserRepository.findBySiteId(siteId);
  }

  async updateMember(
    siteId: string,
    userId: string,
    adminId: string,
    dto: UpdateSiteUserDto,
  ) {
    const member = await this.siteUserRepository.findMember(siteId, userId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.siteUserRepository.update(siteId, userId, {
      ...dto,
      updated_by: adminId,
    });
  }
}
