import { Injectable, OnModuleInit } from '@nestjs/common';
import * as turf from '@turf/turf';
import * as fs from 'fs';
import * as path from 'path';
import {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
} from 'geojson';

type HazardLevel = 'low' | 'medium' | 'high' | 'none';

@Injectable()
export class HazardsService implements OnModuleInit {
  private floodFeatures: Feature<Polygon | MultiPolygon>[] = [];
  private earthquakeFeatures: Feature<Polygon | MultiPolygon>[] = [];


  onModuleInit() {
    this.loadHazardData();
  }

  private loadHazardData() {
    const floodPath = path.join(
      __dirname,
      'data',
      'marikina_flood_5yr.geojson',
    );

    const eqPath = path.join(
      __dirname,
      'data',
      'marikina_earthquake_hazard.geojson',
    );

    const floodData = JSON.parse(fs.readFileSync(floodPath, 'utf8'));
    const eqData = JSON.parse(fs.readFileSync(eqPath, 'utf8'));

    this.floodFeatures = floodData.features;
    this.earthquakeFeatures = eqData.features;

    console.log(
      `[HazardsService] Loaded ${this.floodFeatures.length} flood features and ${this.earthquakeFeatures.length} earthquake features`,
    );
  }

  /** Flood hazard at a point */
  getFloodHazardAtPoint(lat: number, lng: number): HazardLevel {
    const point = turf.point([lng, lat]);

    for (const feature of this.floodFeatures) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return feature.properties?.hazard_level ?? 'none';
      }
    }

    return 'none';
  }

  /** Earthquake hazard at a point */
  getEarthquakeHazardAtPoint(lat: number, lng: number): HazardLevel {
    const point = turf.point([lng, lat]);

    for (const feature of this.earthquakeFeatures) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return feature.properties?.hazard_level ?? 'none';
      }
    }

    return 'none';
  }
  scoreRouteFloodRisk(routeGeometry: any): number {
    let penalty = 0;

    const routeLine = turf.lineString(routeGeometry.coordinates);

    for (const feature of this.floodFeatures) {
        if (turf.booleanIntersects(routeLine, feature)) {
        const level = feature.properties?.hazard_level;

        if (level === 'high') penalty += 3000;
        if (level === 'medium') penalty += 1500;
        if (level === 'low') penalty += 500;
        }
    }

    return penalty;
  }

  /** Get flood hazard GeoJSON for map overlay */
  getFloodGeoJSON(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this.floodFeatures,
    };
  }

  /** Get earthquake hazard GeoJSON for map overlay */
  getEarthquakeGeoJSON(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this.earthquakeFeatures,
    };
  }
}
