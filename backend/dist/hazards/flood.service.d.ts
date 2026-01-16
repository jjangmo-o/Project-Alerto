export declare class FloodService {
    private floodGeoJSON;
    constructor();
    private loadFloodData;
    getFloodGeoJSON(): any;
    getFloodRiskAtPoint(lng: number, lat: number): number;
    calculateRouteFloodRisk(coordinates: [number, number][]): number;
}
