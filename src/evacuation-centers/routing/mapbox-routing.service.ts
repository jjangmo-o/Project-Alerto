import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { FloodService } from '../../hazards/flood.service';
import { EarthquakeService } from '../../hazards/earthquake.service';

@Injectable()
export class MapboxRoutingService {
  private readonly baseUrl =
    'https://api.mapbox.com/directions/v5/mapbox';
  
    constructor(
      private readonly floodService: FloodService,
      private readonly earthquakeService: EarthquakeService,
    ) {}


  async getRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    mode: 'walking' | 'driving' | 'two-wheeler',
  ) {
    console.log('FLOOD SERVICE:', this.floodService);
    const profile = this.resolveProfile(mode);

    const url = `${this.baseUrl}/${profile}/${fromLng},${fromLat};${toLng},${toLat}`;
    
    try {
      const response = await axios.get(url, {
        params: {
          access_token: process.env.MAPBOX_TOKEN,
          geometries: 'geojson',
          overview: 'full',
          alternatives: true,
        },
      });
      
      const routes = response.data.routes;
      if (!routes || routes.length === 0) {
        throw new BadRequestException('No routes found');
      }
  
      const floodZones = this.floodService.getFloodZones();
      const earthquakeZones = this.earthquakeService.getEarthquakeZones();

      let enrichedRoutes = routes.map((r: any, index: number) => {
        const floodRisk = this.calculateFloodRisk(
          r.geometry.coordinates,
          floodZones,
        );

        const earthquakeRisk = this.calculateEarthquakeRisk(
          r.geometry.coordinates,
          earthquakeZones,
        );

        const combinedRisk = floodRisk * 2 + earthquakeRisk * 3;

        return {
          id: `route-${index}`,
          geometry: r.geometry,
          distanceMeters: r.distance,
          durationSeconds: r.duration,
          floodRisk,
          earthquakeRisk,
          combinedRisk,
        };
      });

      enrichedRoutes = enrichedRoutes.sort((a, b) => {
        if (a.combinedRisk !== b.combinedRisk) {
          return a.combinedRisk - b.combinedRisk;
        }
        return a.durationSeconds - b.durationSeconds;
      });

      return enrichedRoutes.map((r, index) => ({
        id: r.id,
        geometry: r.geometry,
        distanceMeters: r.distanceMeters,
        durationSeconds: r.durationSeconds,
        label:
          r.combinedRisk === 0
            ? index === 0
              ? 'Safest path'
              : 'Alternative path'
            : r.earthquakeRisk > r.floodRisk
            ? 'Earthquake-risk path'
            : 'Flood-risk path',
        riskLevel:
          r.combinedRisk === 0
            ? 'low'
            : r.combinedRisk < 8
            ? 'medium'
            : 'high',
        isDefault: index === 0,
      }));


    } catch (error: any) {
      console.error('MAPBOX ERROR STATUS:', error?.response?.status);
      console.error('MAPBOX ERROR DATA:', error?.response?.data);
      console.error('MAPBOX ERROR MESSAGE:', error?.message);

      throw new BadRequestException(
        error?.response?.data?.message ||
        'Mapbox routing failed',
      );
    }
  }

  private resolveProfile(
    mode: 'walking' | 'driving' | 'two-wheeler',
  ): string {
    switch (mode) {
      case 'walking':
        return 'walking';
      case 'driving':
        return 'driving';
      case 'two-wheeler':
        return 'cycling';
      default:
        throw new BadRequestException('Invalid travel mode');
    }
  }
  
  private calculateFloodRisk(
    coordinates: [number, number][],
    floodZones: any[],
  ): number {
    let risk = 0;

    for (const [lng, lat] of coordinates) {
      for (const zone of floodZones) {
        const inside =
          lng >= zone.polygon[0][0] &&
          lng <= zone.polygon[1][0] &&
          lat >= zone.polygon[0][1] &&
          lat <= zone.polygon[2][1];

        if (inside) {
          risk += zone.severity === 'high' ? 5 : 2;
        }
      }
    }

    return risk;
  }
  private calculateEarthquakeRisk(
    coordinates: [number, number][],
    zones: any[],
  ): number {
    let risk = 0;

    for (const [lng, lat] of coordinates) {
      for (const zone of zones) {
        const minLng = Math.min(...zone.polygon.map(p => p[0]));
        const maxLng = Math.max(...zone.polygon.map(p => p[0]));
        const minLat = Math.min(...zone.polygon.map(p => p[1]));
        const maxLat = Math.max(...zone.polygon.map(p => p[1]));

        const inside =
          lng >= minLng &&
          lng <= maxLng &&
          lat >= minLat &&
          lat <= maxLat;

        if (inside) {
          risk += zone.severity === 'high' ? 5 : 2;
        }
      }
    }

    return risk;
  }

}

  