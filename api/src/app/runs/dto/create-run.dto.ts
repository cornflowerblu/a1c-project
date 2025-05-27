import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRunDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}