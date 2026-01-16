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
    options?: { testFlood?: boolean; testEarthquake?: boolean },
  ) {
    console.log('FLOOD SERVICE:', this.floodService);
    console.log('Routing options:', options);
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

      // Check if hazard scenarios are enabled
      const useFloodRisk = options?.testFlood ?? false;
      const useEarthquakeRisk = options?.testEarthquake ?? false;

      let enrichedRoutes = routes.map((r: any, index: number) => {
        // Calculate flood risk using actual GeoJSON data
        const floodRisk = useFloodRisk
          ? this.floodService.calculateRouteFloodRisk(r.geometry.coordinates)
          : 0;

        // Calculate earthquake risk using actual GeoJSON data
        const earthquakeRisk = useEarthquakeRisk
          ? this.earthquakeService.calculateRouteEarthquakeRisk(r.geometry.coordinates)
          : 0;

        const combinedRisk = floodRisk * 2 + earthquakeRisk * 3;

        console.log(`Route ${index}: floodRisk=${floodRisk}, earthquakeRisk=${earthquakeRisk}, combinedRisk=${combinedRisk}`);

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

      // Find which route is actually fastest (shortest duration)
      const fastestDuration = Math.min(...enrichedRoutes.map(r => r.durationSeconds));
      // Find which route is actually safest (lowest risk)
      const lowestRisk = Math.min(...enrichedRoutes.map(r => r.combinedRisk));

      return enrichedRoutes.map((r, index) => {
        // Determine label based on actual characteristics
        let label: string;
        if (r.combinedRisk === lowestRisk && r.durationSeconds === fastestDuration) {
          label = 'safest & fastest';
        } else if (r.combinedRisk === lowestRisk) {
          label = 'safest';
        } else if (r.durationSeconds === fastestDuration) {
          label = 'fastest';
        } else {
          label = 'alternate';
        }

        return {
          id: r.id,
          geometry: r.geometry,
          distanceMeters: r.distanceMeters,
          durationSeconds: r.durationSeconds,
          label,
          riskLevel: r.combinedRisk === 0 ? 'low' : r.combinedRisk < 8 ? 'medium' : 'high',
          riskType: r.combinedRisk === 0 ? 'none' 
            : r.earthquakeRisk > r.floodRisk ? 'earthquake' : 'flood',
          isDefault: index === 0,
        };
      });


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
}