import { OnModuleInit } from '@nestjs/common';
import { FeatureCollection } from 'geojson';
type HazardLevel = 'low' | 'medium' | 'high' | 'none';
export declare class HazardsService implements OnModuleInit {
    private floodFeatures;
    private earthquakeFeatures;
    onModuleInit(): void;
    private loadHazardData;
    getFloodHazardAtPoint(lat: number, lng: number): HazardLevel;
    getEarthquakeHazardAtPoint(lat: number, lng: number): HazardLevel;
    scoreRouteFloodRisk(routeGeometry: any): number;
    getFloodGeoJSON(): FeatureCollection;
    getEarthquakeGeoJSON(): FeatureCollection;
}
export {};
