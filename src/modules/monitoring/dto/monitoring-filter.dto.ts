import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class MonitoringFilterDto {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}
