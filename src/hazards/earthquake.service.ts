import { Injectable } from '@nestjs/common';
import { EarthquakeZone } from './earthquake.types';

@Injectable()
export class EarthquakeService {
  // TEMP earthquake-risk areas (fault proximity proxy)
  private zones: EarthquakeZone[] = [
    {
      id: 'marikina-fault',
      name: 'West Valley Fault (Marikina segment)',
      severity: 'high',
      polygon: [
        [121.095, 14.640],
        [121.120, 14.640],
        [121.120, 14.670],
        [121.095, 14.670],
      ],
    },
  ];

  getEarthquakeZones() {
    return this.zones;
  }
}
