import { HazardEventsService } from './hazard-events.service';
import { HazardsService } from './hazards.service';
export declare class HazardsController {
    private readonly hazardEvents;
    private readonly hazardsService;
    constructor(hazardEvents: HazardEventsService, hazardsService: HazardsService);
    getStatus(): {
        flood: boolean;
        earthquake: boolean;
    };
    getFloodGeoJSON(): import("geojson").FeatureCollection<import("geojson").Geometry, import("geojson").GeoJsonProperties>;
    getEarthquakeGeoJSON(): import("geojson").FeatureCollection<import("geojson").Geometry, import("geojson").GeoJsonProperties>;
    enableFlood(): {
        flood: boolean;
        earthquake: boolean;
    };
    disableFlood(): {
        flood: boolean;
        earthquake: boolean;
    };
    enableEarthquake(): {
        flood: boolean;
        earthquake: boolean;
    };
    disableEarthquake(): {
        flood: boolean;
        earthquake: boolean;
    };
}
