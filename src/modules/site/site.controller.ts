import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { SiteAdminGuard } from './guards/site-admin.guard';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { AddSiteUserDto } from './dto/add-site-user.dto';
import { UpdateSiteUserDto } from './dto/update-site-user.dto';

@ApiTags('site')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/site')
export class SiteController {
  constructor(private readonly siteService: SiteService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new site' })
  async createSite(@Req() req: any, @Body() dto: CreateSiteDto) {
    return this.siteService.createSite(req.user.sub, dto);
  }

  @Get('sites')
  @ApiOperation({ summary: 'Get sites managed by current user' })
  async getManagedSites(@Req() req: any) {
    return this.siteService.getManagedSites(req.user.sub);
  }

  @Post(':site_id/user')
  @UseGuards(SiteAdminGuard)
  @ApiOperation({ summary: 'Add user to site' })
  async addMember(
    @Param('site_id') siteId: string,
    @Req() req: any,
    @Body() dto: AddSiteUserDto,
  ) {
    return this.siteService.addMember(siteId, req.user.sub, dto);
  }

  @Get(':site_id/users')
  @UseGuards(SiteAdminGuard)
  @ApiOperation({ summary: 'Get site members' })
  async getMembers(@Param('site_id') siteId: string) {
    return this.siteService.getMembers(siteId);
  }

  @Put(':site_id/user/:user_id')
  @UseGuards(SiteAdminGuard)
  @ApiOperation({ summary: 'Update site member' })
  async updateMember(
    @Param('site_id') siteId: string,
    @Param('user_id') userId: string,
    @Req() req: any,
    @Body() dto: UpdateSiteUserDto,
  ) {
    return this.siteService.updateMember(siteId, userId, req.user.sub, dto);
  }
}
