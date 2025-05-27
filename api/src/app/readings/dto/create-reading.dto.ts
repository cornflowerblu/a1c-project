import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReadingDto {
  @IsNumber()
  glucoseValue: number;

  @IsDateString()
  timestamp: string;

  @IsString()
  @IsOptional()
  mealContext?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}