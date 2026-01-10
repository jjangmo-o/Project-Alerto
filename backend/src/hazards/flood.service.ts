import { Injectable } from '@nestjs/common';
import { FloodZone } from './flood.types';

@Injectable()
export class FloodService {
  // TEMP: static flood-prone areas in Marikina
  private floodZones: FloodZone[] = [
    {
      id: 'marikina-river',
      name: 'Marikina River Basin',
      severity: 'high',
      polygon: [
        [121.090, 14.630],
        [121.115, 14.630],
        [121.115, 14.665],
        [121.090, 14.665],
      ],
    },
  ];

  getFloodZones() {
    return this.floodZones;
  }
}
