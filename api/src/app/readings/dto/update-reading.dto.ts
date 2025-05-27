import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReadingDto {
  @IsNumber()
  @IsOptional()
  glucoseValue?: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  mealContext?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}