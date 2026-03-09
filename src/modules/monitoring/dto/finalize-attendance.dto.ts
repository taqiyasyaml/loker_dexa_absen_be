import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class FinalizeItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trx_attendance_id: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  final_check_in_at?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  final_check_out_at?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  final_ms?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  final_penalty_ms?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  final_overtime_ms?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  final_notes?: string;
}

export class FinalizeAttendanceDto {
  @ApiProperty({ type: [FinalizeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeItemDto)
  items: FinalizeItemDto[];
}
