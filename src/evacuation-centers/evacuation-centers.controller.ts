import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { EvacuationCentersService } from './evacuation-centers.service';

@Controller('api/v1/evacuation-centers')
export class EvacuationCentersController {
  constructor(
    private readonly evacuationService: EvacuationCentersService,
  ) {}

  @Get('nearest')
  findNearest(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('mode') mode: 'walking' | 'driving' | 'two-wheeler' = 'walking',
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      throw new BadRequestException(
        'lat and lng must be valid numbers',
      );
    }

    return this.evacuationService.findNearest(
      latNum,
      lngNum,
      mode,
    );
  }

}
