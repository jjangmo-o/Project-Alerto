import { Controller, Get } from '@nestjs/common';
import { FloodService } from './flood.service';
import { EarthquakeService } from './earthquake.service';

@Controller('hazards')
export class HazardsController {
  constructor(
    private readonly floodService: FloodService,
    private readonly earthquakeService: EarthquakeService,
  ) {}

  @Get('flood')
  getFloodZones() {
    return {
      type: 'FeatureCollection',
      features: this.floodService.getFloodZones().map(zone => ({
        type: 'Feature',
        properties: {
          severity: zone.severity,
          name: zone.name,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[...zone.polygon, zone.polygon[0]]],
        },
      })),
    };
  }

  @Get('earthquake')
  getEarthquakeZones() {
    return {
      type: 'FeatureCollection',
      features: this.earthquakeService.getEarthquakeZones().map(zone => ({
        type: 'Feature',
        properties: {
          severity: zone.severity,
          name: zone.name,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[...zone.polygon, zone.polygon[0]]],
        },
      })),
    };
  }
}
