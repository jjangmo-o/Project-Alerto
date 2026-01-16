import { HazardEventsService } from '../hazards/hazard-events.service';
export declare class AdminEventsController {
    private readonly hazardEvents;
    constructor(hazardEvents: HazardEventsService);
    enableFlood(): {
        message: string;
        floodActive: boolean;
    };
    disableFlood(): {
        message: string;
        floodActive: boolean;
    };
    enableEarthquake(): {
        message: string;
        earthquakeActive: boolean;
    };
    disableEarthquake(): {
        message: string;
        earthquakeActive: boolean;
    };
}
