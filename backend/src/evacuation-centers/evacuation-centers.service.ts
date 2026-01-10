import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MapboxRoutingService } from './routing/mapbox-routing.service';
import { isValidTravelMode } from './utils/travel-mode.util';
import { TravelMode } from './types/travel-mode.type';

@Injectable()
export class EvacuationCentersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly routingService: MapboxRoutingService,
  ) {}

  async findNearest(
    lat: number,
    lng: number,
    mode: string,
  ) {
    console.log('INPUT COORDS:', lat, lng);
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      throw new BadRequestException('Invalid coordinates');
    }

    if (!isValidTravelMode(mode)) {
      throw new BadRequestException(
        'Invalid travel mode. Use walking, driving, or two-wheeler.',
      );
    }

    const safeMode: TravelMode = mode;

    const supabase = this.supabaseService.getClient();

    const { data: centers, error } = await supabase
      .from('evacuation_centers')
      .select(
        `
          id,
          name,
          status,
          capacity_current,
          capacity_total,
          location
        `,
      )
      .neq('status', 'CLOSED');
    console.log('RAW CENTERS:', centers);
    console.log('SUPABASE ERROR:', error);
    if (error || !centers || centers.length === 0) {
      throw new BadRequestException(
        'No evacuation centers available',
      );
    }

    const nearest = this.findNearestCenter(lat, lng, centers);
    console.log('NEAREST CENTER:', nearest);

    const [destLng, destLat] = nearest.location.coordinates;
    console.log('DESTINATION COORDS:', destLat, destLng);

    const routes = await this.routingService.getRoute(
      lat,
      lng,
      destLat,
      destLng,
      safeMode,
    );

    const validCenters = centers.filter(
      c =>
        c.location &&
        Array.isArray(c.location.coordinates) &&
        c.location.coordinates.length === 2,
    );

    if (validCenters.length === 0) {
      throw new BadRequestException(
        'No evacuation centers with valid location data',
      );
    }

    return {
      evacuationCenter: {
        id: nearest.id,
        name: nearest.name,
        status: nearest.status,
        capacity_current: nearest.capacity_current,
        capacity_total: nearest.capacity_total,
      },
      destination: [destLng, destLat],
      routes,
    };
  }
  
  private findNearestCenter(
    lat: number,
    lng: number,
    centers: any[],
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;

    return centers.reduce((closest, center) => {
      if (
        !center.location ||
        !Array.isArray(center.location.coordinates)
      ) {
        return closest;
      }

      const [lng2, lat2] = center.location.coordinates;

      const R = 6371000; // meters
      const dLat = toRad(lat2 - lat);
      const dLng = toRad(lng2 - lng);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (!closest || distance < closest.distance) {
        return { ...center, distance };
      }

      return closest;
    }, null);
  }

}
