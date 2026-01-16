// src/reports/dto/create-report.dto.ts
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

export enum ReportStatus {
  SAFE = 'SAFE',
  NEED_HELP = 'NEED_HELP',
  INJURED = 'INJURED',
  MISSING = 'MISSING',
  TRAPPED = 'TRAPPED',
}

export class CreateReportDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsString()
  barangayId: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
media?: {
  url: string;
  type: 'image' | 'video';
}[];
}


