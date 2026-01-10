// src/reports/reports.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { MediaService } from '../media/media.service';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly mediaService: MediaService,
  ) {}

@Post()
@UseGuards(OptionalAuthGuard)
@UseInterceptors(FilesInterceptor('files', 12))
  async create(
  @Req() req: Request & { user?: any },
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: any,
) {
  if (!files) files = [];

  const images = files.filter(f => f.mimetype.startsWith('image'));
  const videos = files.filter(f => f.mimetype.startsWith('video'));

  if (images.length > 10) {
    throw new BadRequestException('Maximum of 10 images allowed');
  }

  if (videos.length > 2) {
    throw new BadRequestException('Maximum of 2 videos allowed');
  }

  // 🔐 AUTH LOGIC
  if (req.user) {
    // Logged-in user → auto-fill
    dto.reporter = {
      name: req.user.name,
      contactNumber: req.user.contactNumber,
      address: req.user.address,
    };

    // Default barangay from user
    dto.barangayId = dto.barangayId || req.user.barangayId;
  } else {
    // Anonymous user → must provide info
    if (!dto.name || !dto.contactNumber || !dto.address) {
      throw new BadRequestException(
        'Anonymous users must provide name, contact number, and address',
      );
    }

    dto.reporter = {
      name: dto.name,
      contactNumber: dto.contactNumber,
      address: dto.address,
    };
  }

  const uploadedMedia = await this.mediaService.uploadFiles(files);

  return this.reportsService.create({
    ...dto,
    media: uploadedMedia,
  });
}

  @Get()
  findByBarangay(@Query('barangayId') barangayId: string) {
    return this.reportsService.findByBarangay(barangayId);
  }
}
