import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MapboxRoutingService } from './routing/mapbox-routing.service';
import { isValidTravelMode } from './utils/travel-mode.util';
import { TravelMode } from './types/travel-mode.type';
import { HazardsService } from 'src/hazards/hazards.service';
import { HazardEventsService } from 'src/hazards/hazard-events.service';

@Injectable()
export class EvacuationCentersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly routingService: MapboxRoutingService,
    private readonly hazardsService: HazardsService,
    private readonly hazardEvents: HazardEventsService,
  ) {}

  // ============================
  // GET ALL EVACUATION CENTERS
  // ============================

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        center_id,
        name,
        address,
        capacity,
        current_occupancy,
        latitude,
        longitude
      `);

    if (error) {
      console.error('[EvacuationCentersService] Supabase error:', error);
      throw new Error('Failed to fetch evacuation centers');
    }

    console.log('[EvacuationCentersService] Raw data from Supabase:', data);

    // Transform to match frontend expected format
    const transformed = (data ?? []).map(center => ({
      id: center.center_id,
      name: center.name,
      address: center.address,
      capacity_current: center.current_occupancy ?? 0,
      capacity_total: center.capacity,
      location: {
        coordinates: [center.longitude, center.latitude],
      },
    }));

    return transformed;
  }

  // ============================
  // FIND NEAREST CENTER ONLY
  // (NO ROUTING, NO DESTINATION)
  // ============================

  async findNearest(
    lat: number,
    lng: number,
    mode: string,
  ) {
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

    const supabase = this.supabaseService.getClient();

    const { data: rawCenters, error } = await supabase
      .from('evacuation_centers')
      .select(`
        center_id,
        name,
        address,
        capacity,
        current_occupancy,
        latitude,
        longitude
      `);

    if (error || !rawCenters || rawCenters.length === 0) {
      throw new BadRequestException(
        'No evacuation centers available',
      );
    }

    // Transform to internal format with location object
    const centers = rawCenters.map(center => ({
      id: center.center_id,
      name: center.name,
      address: center.address,
      capacity_current: center.current_occupancy ?? 0,
      capacity_total: center.capacity,
      location: {
        coordinates: [center.longitude, center.latitude],
      },
    }));

    const nearest = this.findNearestCenter(lat, lng, centers);

    if (!nearest) {
      throw new BadRequestException(
        'No evacuation center with valid coordinates',
      );
    }

    const [destLng, destLat] =
      nearest.location.coordinates;

    return {
      evacuationCenter: {
        id: nearest.id,
        name: nearest.name,
        status: nearest.status,
        capacity_current: nearest.capacity_current,
        capacity_total: nearest.capacity_total,
        latitude: destLat,
        longitude: destLng,
      },
    };
  }

  // ============================
// FIND NEAREST + ROUTE COMBINED
// (Single call for frontend)
// ============================

async findNearestWithRoute(
  lat: number,
  lng: number,
  mode: TravelMode,
  options?: { testFlood?: boolean; testEarthquake?: boolean },
) {
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

  // Step 1: Find the nearest evacuation center
  const supabase = this.supabaseService.getClient();

  const { data: rawCenters, error } = await supabase
    .from('evacuation_centers')
    .select(`
      center_id,
      name,
      address,
      capacity,
      current_occupancy,
      latitude,
      longitude
    `);

  if (error || !rawCenters || rawCenters.length === 0) {
    throw new BadRequestException(
      'No evacuation centers available',
    );
  }

  // Transform to internal format with location object
  const centers = rawCenters.map(center => ({
    id: center.center_id,
    name: center.name,
    address: center.address,
    capacity_current: center.current_occupancy ?? 0,
    capacity_total: center.capacity,
    location: {
      coordinates: [center.longitude, center.latitude],
    },
  }));

  const nearest = this.findNearestCenter(lat, lng, centers);

  if (!nearest) {
    throw new BadRequestException(
      'No evacuation center with valid coordinates',
    );
  }

  const [destLng, destLat] = nearest.location.coordinates;

  // Step 2: Get route from origin to nearest center
  const routes = await this.routingService.getRoute(
    lat,
    lng,
    destLat,
    destLng,
    mode,
  );

  // Use test options if provided, otherwise use actual hazard event status
  const floodActive = options?.testFlood ?? this.hazardEvents.isFloodEventActive();
  const earthquakeActive = options?.testEarthquake ?? this.hazardEvents.isEarthquakeEventActive();

  const scoredRoutes = routes.map(route => {
    let hazardPenalty = 0;

    if (floodActive) {
      hazardPenalty += this.hazardsService.scoreRouteFloodRisk(
        route.geometry,
      );
    }

    return {
      ...route,
      hazardPenalty,
      finalScore: route.durationSeconds + hazardPenalty,
    };
  });

  scoredRoutes.sort((a, b) => a.finalScore - b.finalScore);

  // Step 3: Return combined response
  return {
    evacuationCenter: {
      id: nearest.id,
      name: nearest.name,
      status: nearest.status,
      capacity_current: nearest.capacity_current,
      capacity_total: nearest.capacity_total,
      latitude: destLat,
      longitude: destLng,
    },
    routes: scoredRoutes,
    eventStatus: {
      flood: floodActive,
      earthquake: earthquakeActive,
    },
  };
}
  // ============================
  // ROUTE BETWEEN TWO POINTS
  // (USED BY FRONTEND)
  // ============================

  async routeBetween(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    mode: TravelMode,
    options?: { testFlood?: boolean; testEarthquake?: boolean },
  ) {
    if (!isValidTravelMode(mode)) {
      throw new BadRequestException(
        'Invalid travel mode',
      );
    }

    // Use test options if provided, otherwise use actual hazard event status
    const floodActive =
      options?.testFlood ?? this.hazardEvents.isFloodEventActive();
    const earthquakeActive =
      options?.testEarthquake ?? this.hazardEvents.isEarthquakeEventActive();

    const routes = await this.routingService.getRoute(
      originLat,
      originLng,
      destLat,
      destLng,
      mode,
      { testFlood: floodActive, testEarthquake: earthquakeActive },
    );

    const scoredRoutes = routes.map(route => {
      let hazardPenalty = 0;

      if (floodActive) {
        hazardPenalty +=
          this.hazardsService.scoreRouteFloodRisk(
            route.geometry,
          );
      }

      return {
        ...route,
        hazardPenalty,
        finalScore:
          route.durationSeconds + hazardPenalty,
      };
    });

    scoredRoutes.sort(
      (a, b) => a.finalScore - b.finalScore,
    );

    return {
      routes: scoredRoutes,
      eventStatus: {
        flood: floodActive,
        earthquake: earthquakeActive,
      },
    };
  }

  // ============================
  // HELPER: NEAREST CENTER
  // ============================

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

      const R = 6371000;
      const dLat = toRad(lat2 - lat);
      const dLng = toRad(lng2 - lng);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;

      const c =
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;

      if (!closest || distance < closest.distance) {
        return { ...center, distance };
      }

      return closest;
    }, null);
  }
}
