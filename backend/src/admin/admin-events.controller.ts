import { Controller, Post, UseGuards } from '@nestjs/common';
import { HazardEventsService } from '../hazards/hazard-events.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';


@Controller('admin/events')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminEventsController {
  constructor(
    private readonly hazardEvents: HazardEventsService,
  ) {}

  // 🌧️ FLOOD EVENT
  @Post('flood/enable')
  enableFlood() {
    this.hazardEvents.enableFloodEvent();
    return {
      message: 'Flood event enabled',
      floodActive: true,
    };
  }

  @Post('flood/disable')
  disableFlood() {
    this.hazardEvents.disableFloodEvent();
    return {
      message: 'Flood event disabled',
      floodActive: false,
    };
  }

  // 🌏 EARTHQUAKE EVENT (future routing)
  @Post('earthquake/enable')
  enableEarthquake() {
    this.hazardEvents.enableEarthquakeEvent();
    return {
      message: 'Earthquake event enabled',
      earthquakeActive: true,
    };
  }

  @Post('earthquake/disable')
  disableEarthquake() {
    this.hazardEvents.disableEarthquakeEvent();
    return {
      message: 'Earthquake event disabled',
      earthquakeActive: false,
    };
  }
}
