import { EvacuationCentersService } from './evacuation-centers.service';
import type { TravelMode } from './types/travel-mode.type';
export declare class EvacuationCentersController {
    private readonly evacuationService;
    constructor(evacuationService: EvacuationCentersService);
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
    findNearest(lat: string, lng: string, mode?: 'walking' | 'driving' | 'two-wheeler'): Promise<{
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
    findNearestWithRoute(lat: string, lng: string, mode?: 'walking' | 'driving' | 'two-wheeler', testFlood?: string, testEarthquake?: string): Promise<{
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
    routeBetween(originLat: number, originLng: number, destLat: number, destLng: number, mode: TravelMode, testFlood?: string, testEarthquake?: string): Promise<{
        routes: any;
        eventStatus: {
            flood: boolean;
            earthquake: boolean;
        };
    }>;
}
