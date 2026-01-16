"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HazardsService = void 0;
const common_1 = require("@nestjs/common");
const turf = __importStar(require("@turf/turf"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let HazardsService = class HazardsService {
    floodFeatures = [];
    earthquakeFeatures = [];
    onModuleInit() {
        this.loadHazardData();
    }
    loadHazardData() {
        const floodPath = path.join(__dirname, 'data', 'marikina_flood_5yr.geojson');
        const eqPath = path.join(__dirname, 'data', 'marikina_earthquake_hazard.geojson');
        const floodData = JSON.parse(fs.readFileSync(floodPath, 'utf8'));
        const eqData = JSON.parse(fs.readFileSync(eqPath, 'utf8'));
        this.floodFeatures = floodData.features;
        this.earthquakeFeatures = eqData.features;
        console.log(`[HazardsService] Loaded ${this.floodFeatures.length} flood features and ${this.earthquakeFeatures.length} earthquake features`);
    }
    getFloodHazardAtPoint(lat, lng) {
        const point = turf.point([lng, lat]);
        for (const feature of this.floodFeatures) {
            if (turf.booleanPointInPolygon(point, feature)) {
                return feature.properties?.hazard_level ?? 'none';
            }
        }
        return 'none';
    }
    getEarthquakeHazardAtPoint(lat, lng) {
        const point = turf.point([lng, lat]);
        for (const feature of this.earthquakeFeatures) {
            if (turf.booleanPointInPolygon(point, feature)) {
                return feature.properties?.hazard_level ?? 'none';
            }
        }
        return 'none';
    }
    scoreRouteFloodRisk(routeGeometry) {
        let penalty = 0;
        const routeLine = turf.lineString(routeGeometry.coordinates);
        for (const feature of this.floodFeatures) {
            if (turf.booleanIntersects(routeLine, feature)) {
                const level = feature.properties?.hazard_level;
                if (level === 'high')
                    penalty += 3000;
                if (level === 'medium')
                    penalty += 1500;
                if (level === 'low')
                    penalty += 500;
            }
        }
        return penalty;
    }
    getFloodGeoJSON() {
        return {
            type: 'FeatureCollection',
            features: this.floodFeatures,
        };
    }
    getEarthquakeGeoJSON() {
        return {
            type: 'FeatureCollection',
            features: this.earthquakeFeatures,
        };
    }
};
exports.HazardsService = HazardsService;
exports.HazardsService = HazardsService = __decorate([
    (0, common_1.Injectable)()
], HazardsService);
//# sourceMappingURL=hazards.service.js.map