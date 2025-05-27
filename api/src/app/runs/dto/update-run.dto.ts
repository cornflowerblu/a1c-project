import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRunDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  estimatedA1C?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}