import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { SiteAdminGuard } from '@/modules/site/guards/site-admin.guard';
import { MonitoringService } from './monitoring.service';
import { MonitoringFilterDto } from './dto/monitoring-filter.dto';
import { FinalizeAttendanceDto } from './dto/finalize-attendance.dto';

@ApiTags('monitoring')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) { }

  @Get('site/:site_id/unfinalized')
  @UseGuards(SiteAdminGuard)
  @ApiOperation({ summary: 'Get unfinalized attendances for a site' })
  async getUnfinalizedWorkItems(
    @Param('site_id') siteId: string,
    @Query() filter: MonitoringFilterDto,
    @Req() req: any,
  ) {
    const results = await this.monitoringService.getUnfinalizedAttendances(siteId, filter);
    // Fill final_user_name with current admin name as per PRD "fallback"
    return results.map(r => ({ ...r, final_user_name: req.user.username }));
  }

  @Get('site/:site_id/user/:user_id')
  @UseGuards(SiteAdminGuard)
  @ApiOperation({ summary: 'Get attendance history for a specific user at a site' })
  async getUserMonitoring(
    @Param('site_id') siteId: string,
    @Param('user_id') userId: string,
    @Query() filter: MonitoringFilterDto,
    @Req() req: any,
  ) {
    const results = await this.monitoringService.getUserAttendanceHistory(siteId, userId, filter);
    return results.map(r => ({ ...r, final_user_name: r.final_user_name || req.user.username }));
  }

  @Put('finalize-attendance')
  @ApiOperation({ summary: 'Batch finalize attendance records' })
  async finalizeAttendance(@Req() req: any, @Body() dto: FinalizeAttendanceDto) {
    return this.monitoringService.finalizeAttendance(
      req.user.sub,
      req.user.username,
      dto,
    );
  }
}
