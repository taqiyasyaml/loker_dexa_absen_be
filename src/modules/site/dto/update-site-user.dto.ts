import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSiteUserDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_admin?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
