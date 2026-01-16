import { Controller, Get, Post } from '@nestjs/common';
import { HazardEventsService } from './hazard-events.service';
import { HazardsService } from './hazards.service';

@Controller('hazards')
export class HazardsController {
  constructor(
    private readonly hazardEvents: HazardEventsService,
    private readonly hazardsService: HazardsService,
  ) {}

  // ============================
  // READ-ONLY (USED BY FRONTEND POLLING)
  // ============================

  @Get('status')
  getStatus() {
    return this.hazardEvents.getStatus();
  }

  // ============================
  // HAZARD GEOMETRY (MAP OVERLAYS)
  // ============================

  @Get('flood')
  getFloodGeoJSON() {
    return this.hazardsService.getFloodGeoJSON();
  }

  @Get('earthquake')
  getEarthquakeGeoJSON() {
    return this.hazardsService.getEarthquakeGeoJSON();
  }

  // ============================
  // OPTIONAL QUICK CONTROLS
  // (Keep if you want non-admin toggles)
  // ============================

  @Post('flood/enable')
  enableFlood() {
    return this.hazardEvents.enableFloodEvent();
  }

  @Post('flood/disable')
  disableFlood() {
    return this.hazardEvents.disableFloodEvent();
  }

  @Post('earthquake/enable')
  enableEarthquake() {
    return this.hazardEvents.enableEarthquakeEvent();
  }

  @Post('earthquake/disable')
  disableEarthquake() {
    return this.hazardEvents.disableEarthquakeEvent();
  }
}
