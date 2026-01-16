import { FloodService } from '../../hazards/flood.service';
import { EarthquakeService } from '../../hazards/earthquake.service';
export declare class MapboxRoutingService {
    private readonly floodService;
    private readonly earthquakeService;
    private readonly baseUrl;
    constructor(floodService: FloodService, earthquakeService: EarthquakeService);
    getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number, mode: 'walking' | 'driving' | 'two-wheeler', options?: {
        testFlood?: boolean;
        testEarthquake?: boolean;
    }): Promise<any>;
    private resolveProfile;
}
