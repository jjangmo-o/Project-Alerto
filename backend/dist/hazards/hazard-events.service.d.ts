import { HazardEventsGateway } from './hazard-events.gateway';
export declare class HazardEventsService {
    private readonly gateway;
    private floodActive;
    private earthquakeActive;
    constructor(gateway: HazardEventsGateway);
    isFloodEventActive(): boolean;
    isEarthquakeEventActive(): boolean;
    getStatus(): {
        flood: boolean;
        earthquake: boolean;
    };
    enableFloodEvent(): {
        flood: boolean;
        earthquake: boolean;
    };
    disableFloodEvent(): {
        flood: boolean;
        earthquake: boolean;
    };
    enableEarthquakeEvent(): {
        flood: boolean;
        earthquake: boolean;
    };
    disableEarthquakeEvent(): {
        flood: boolean;
        earthquake: boolean;
    };
}
