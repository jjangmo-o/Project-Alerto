import { SupabaseService } from '../supabase/supabase.service';
import { MapboxRoutingService } from './routing/mapbox-routing.service';
import { TravelMode } from './types/travel-mode.type';
import { HazardsService } from 'src/hazards/hazards.service';
import { HazardEventsService } from 'src/hazards/hazard-events.service';
export declare class EvacuationCentersService {
    private readonly supabaseService;
    private readonly routingService;
    private readonly hazardsService;
    private readonly hazardEvents;
    constructor(supabaseService: SupabaseService, routingService: MapboxRoutingService, hazardsService: HazardsService, hazardEvents: HazardEventsService);
    findAll(): Promise<{
        id: any;
        name: any;
        address: any;
        capacity_current: any;
        capacity_total: any;
        location: {
            coordinates: any[];
        };
    }[]>;
    findNearest(lat: number, lng: number, mode: string): Promise<{
        evacuationCenter: {
            id: any;
            name: any;
            status: any;
            capacity_current: any;
            capacity_total: any;
            latitude: any;
            longitude: any;
        };
    }>;
    findNearestWithRoute(lat: number, lng: number, mode: TravelMode, options?: {
        testFlood?: boolean;
        testEarthquake?: boolean;
    }): Promise<{
        evacuationCenter: {
            id: any;
            name: any;
            status: any;
            capacity_current: any;
            capacity_total: any;
            latitude: any;
            longitude: any;
        };
        routes: any;
        eventStatus: {
            flood: boolean;
            earthquake: boolean;
        };
    }>;
    routeBetween(originLat: number, originLng: number, destLat: number, destLng: number, mode: TravelMode, options?: {
        testFlood?: boolean;
        testEarthquake?: boolean;
    }): Promise<{
        routes: any;
        eventStatus: {
            flood: boolean;
            earthquake: boolean;
        };
    }>;
    private findNearestCenter;
}
