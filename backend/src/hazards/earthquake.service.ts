import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as turf from '@turf/turf';

@Injectable()
export class EarthquakeService {
  private earthquakeGeoJSON: any = null;

  constructor() {
    this.loadEarthquakeData();
  }

  private loadEarthquakeData() {
    try {
      const filePath = path.join(__dirname, 'data', 'marikina_earthquake_hazard.geojson');
      const data = fs.readFileSync(filePath, 'utf-8');
      this.earthquakeGeoJSON = JSON.parse(data);
      console.log(`Loaded ${this.earthquakeGeoJSON.features?.length || 0} earthquake zone features`);
    } catch (error) {
      console.error('Error loading earthquake GeoJSON:', error);
      this.earthquakeGeoJSON = { type: 'FeatureCollection', features: [] };
    }
  }

  getEarthquakeGeoJSON() {
    return this.earthquakeGeoJSON;
  }

  /**
   * Check if a point is inside any earthquake hazard zone
   * Returns risk level: 0 (none), 5 (high - in fault zone)
   */
  getEarthquakeRiskAtPoint(lng: number, lat: number): number {
    if (!this.earthquakeGeoJSON?.features?.length) {
      return 0;
    }

    const point = turf.point([lng, lat]);
    
    for (const feature of this.earthquakeGeoJSON.features) {
      try {
        if (turf.booleanPointInPolygon(point, feature)) {
          // All earthquake zones near fault lines are high risk
          return 5;
        }
      } catch (e) {
        // Skip malformed features
        continue;
      }
    }
    
    return 0;
  }

  /**
   * Calculate total earthquake risk along a route (array of [lng, lat] coordinates)
   */
  calculateRouteEarthquakeRisk(coordinates: [number, number][]): number {
    let totalRisk = 0;
    
    // Sample every few points to avoid performance issues with large routes
    const sampleRate = Math.max(1, Math.floor(coordinates.length / 50));
    
    for (let i = 0; i < coordinates.length; i += sampleRate) {
      const [lng, lat] = coordinates[i];
      totalRisk += this.getEarthquakeRiskAtPoint(lng, lat);
    }
    
    return totalRisk;
  }
}
