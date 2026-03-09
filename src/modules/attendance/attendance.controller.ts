import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceActionDto } from '@/modules/attendance/dto/attendance-action.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

const UPLOAD_DIR = './uploads/checkpoints';

// Helper to ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Get('sites')
  @ApiOperation({ summary: 'Get active sites for attendance' })
  async getAvailableSites(@Req() req: any) {
    return this.attendanceService.getAvailableSites(req.user.sub);
  }

  @Post('site/:site_id/check-in')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Check in to a site' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
          return cb(new BadRequestException('Only JPG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024, // 500kb
      },
    }),
  )
  async checkIn(
    @Param('site_id') siteId: string,
    @Req() req: any,
    @Body() dto: AttendanceActionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendanceService.checkIn(req.user.sub, siteId, dto, file?.path);
  }

  @Delete('site/:site_id/check-in')
  @ApiOperation({ summary: 'Cancel active check-in' })
  async cancelCheckIn(@Param('site_id') siteId: string, @Req() req: any) {
    return this.attendanceService.cancelCheckIn(req.user.sub, siteId);
  }

  @Post('site/:site_id/check-in/force')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Force a new check-in (closes existing active session)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
          return cb(new BadRequestException('Only JPG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024,
      },
    }),
  )
  async forceCheckIn(
    @Param('site_id') siteId: string,
    @Req() req: any,
    @Body() dto: AttendanceActionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendanceService.forceCheckIn(req.user.sub, siteId, dto, file?.path);
  }

  @Post('site/:site_id/check-point')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Log a checkpoint' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
          return cb(new BadRequestException('Only JPG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024,
      },
    }),
  )
  async checkPoint(
    @Param('site_id') siteId: string,
    @Req() req: any,
    @Body() dto: AttendanceActionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendanceService.checkPoint(req.user.sub, siteId, dto, file?.path);
  }

  @Post('site/:site_id/check-out')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Check out from a site' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
          return cb(new BadRequestException('Only JPG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024,
      },
    }),
  )
  async checkOut(
    @Param('site_id') siteId: string,
    @Req() req: any,
    @Body() dto: AttendanceActionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendanceService.checkOut(req.user.sub, siteId, dto, file?.path);
  }
}
