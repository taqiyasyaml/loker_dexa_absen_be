import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendanceActionDto {
  @ApiProperty({ example: -6.17511, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @ApiProperty({ example: 106.86503, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @ApiProperty({ example: 'Working from site' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}
