import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Main Office' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Jl. Sudirman No. 1', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
