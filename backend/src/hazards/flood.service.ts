import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as turf from '@turf/turf';

@Injectable()
export class FloodService {
  private floodGeoJSON: any = null;

  constructor() {
    this.loadFloodData();
  }

  private loadFloodData() {
    try {
      const filePath = path.join(__dirname, 'data', 'marikina_flood_5yr.geojson');
      const data = fs.readFileSync(filePath, 'utf-8');
      this.floodGeoJSON = JSON.parse(data);
      console.log(`Loaded ${this.floodGeoJSON.features?.length || 0} flood zone features`);
    } catch (error) {
      console.error('Error loading flood GeoJSON:', error);
      this.floodGeoJSON = { type: 'FeatureCollection', features: [] };
    }
  }

  getFloodGeoJSON() {
    return this.floodGeoJSON;
  }

  /**
   * Check if a point is inside any flood zone
   * Returns risk level: 0 (none), 2 (medium), 5 (high)
   */
  getFloodRiskAtPoint(lng: number, lat: number): number {
    if (!this.floodGeoJSON?.features?.length) {
      return 0;
    }

    const point = turf.point([lng, lat]);
    
    for (const feature of this.floodGeoJSON.features) {
      try {
        if (turf.booleanPointInPolygon(point, feature)) {
          // All flood zones in 5yr scenario are considered high risk
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
   * Calculate total flood risk along a route (array of [lng, lat] coordinates)
   */
  calculateRouteFloodRisk(coordinates: [number, number][]): number {
    let totalRisk = 0;
    
    // Sample every few points to avoid performance issues with large routes
    const sampleRate = Math.max(1, Math.floor(coordinates.length / 50));
    
    for (let i = 0; i < coordinates.length; i += sampleRate) {
      const [lng, lat] = coordinates[i];
      totalRisk += this.getFloodRiskAtPoint(lng, lat);
    }
    
    return totalRisk;
  }
}
