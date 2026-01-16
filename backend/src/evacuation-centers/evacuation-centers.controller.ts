import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { EvacuationCentersService } from './evacuation-centers.service';
import type { TravelMode } from './types/travel-mode.type';

@Controller('api/v1/evacuation-centers')
export class EvacuationCentersController {
  constructor(
    private readonly evacuationService: EvacuationCentersService,
  ) {}

  @Get()
  async findAll() {
    return this.evacuationService.findAll();
  }

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
  
@Get('nearest-route')
async findNearestWithRoute(
  @Query('lat') lat: string,
  @Query('lng') lng: string,
  @Query('mode') mode: 'walking' | 'driving' | 'two-wheeler' = 'walking',
  @Query('testFlood') testFlood?: string,
  @Query('testEarthquake') testEarthquake?: string,
) {
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    throw new BadRequestException(
      'lat and lng must be valid numbers',
    );
  }

  return this.evacuationService.findNearestWithRoute(
    latNum,
    lngNum,
    mode,
    {
      testFlood: testFlood === 'true',
      testEarthquake: testEarthquake === 'true',
    },
  );
}
  @Get('route')
  routeBetween(
    @Query('originLat') originLat: number,
    @Query('originLng') originLng: number,
    @Query('destLat') destLat: number,
    @Query('destLng') destLng: number,
    @Query('mode') mode: TravelMode,
    @Query('testFlood') testFlood?: string,
    @Query('testEarthquake') testEarthquake?: string,
  ) {
    return this.evacuationService.routeBetween(
      Number(originLat),
      Number(originLng),
      Number(destLat),
      Number(destLng),
      mode,
      {
        testFlood: testFlood === 'true',
        testEarthquake: testEarthquake === 'true',
      },
    );
  }
}
