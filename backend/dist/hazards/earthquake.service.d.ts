export declare class EarthquakeService {
    private earthquakeGeoJSON;
    constructor();
    private loadEarthquakeData;
    getEarthquakeGeoJSON(): any;
    getEarthquakeRiskAtPoint(lng: number, lat: number): number;
    calculateRouteEarthquakeRisk(coordinates: [number, number][]): number;
}
