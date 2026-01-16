"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapboxRoutingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const flood_service_1 = require("../../hazards/flood.service");
const earthquake_service_1 = require("../../hazards/earthquake.service");
let MapboxRoutingService = class MapboxRoutingService {
    floodService;
    earthquakeService;
    baseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
    constructor(floodService, earthquakeService) {
        this.floodService = floodService;
        this.earthquakeService = earthquakeService;
    }
    async getRoute(fromLat, fromLng, toLat, toLng, mode, options) {
        console.log('FLOOD SERVICE:', this.floodService);
        console.log('Routing options:', options);
        const profile = this.resolveProfile(mode);
        const url = `${this.baseUrl}/${profile}/${fromLng},${fromLat};${toLng},${toLat}`;
        try {
            const response = await axios_1.default.get(url, {
                params: {
                    access_token: process.env.MAPBOX_TOKEN,
                    geometries: 'geojson',
                    overview: 'full',
                    alternatives: true,
                },
            });
            const routes = response.data.routes;
            if (!routes || routes.length === 0) {
                throw new common_1.BadRequestException('No routes found');
            }
            const useFloodRisk = options?.testFlood ?? false;
            const useEarthquakeRisk = options?.testEarthquake ?? false;
            let enrichedRoutes = routes.map((r, index) => {
                const floodRisk = useFloodRisk
                    ? this.floodService.calculateRouteFloodRisk(r.geometry.coordinates)
                    : 0;
                const earthquakeRisk = useEarthquakeRisk
                    ? this.earthquakeService.calculateRouteEarthquakeRisk(r.geometry.coordinates)
                    : 0;
                const combinedRisk = floodRisk * 2 + earthquakeRisk * 3;
                console.log(`Route ${index}: floodRisk=${floodRisk}, earthquakeRisk=${earthquakeRisk}, combinedRisk=${combinedRisk}`);
                return {
                    id: `route-${index}`,
                    geometry: r.geometry,
                    distanceMeters: r.distance,
                    durationSeconds: r.duration,
                    floodRisk,
                    earthquakeRisk,
                    combinedRisk,
                };
            });
            enrichedRoutes = enrichedRoutes.sort((a, b) => {
                if (a.combinedRisk !== b.combinedRisk) {
                    return a.combinedRisk - b.combinedRisk;
                }
                return a.durationSeconds - b.durationSeconds;
            });
            const fastestDuration = Math.min(...enrichedRoutes.map(r => r.durationSeconds));
            const lowestRisk = Math.min(...enrichedRoutes.map(r => r.combinedRisk));
            return enrichedRoutes.map((r, index) => {
                let label;
                if (r.combinedRisk === lowestRisk && r.durationSeconds === fastestDuration) {
                    label = 'safest & fastest';
                }
                else if (r.combinedRisk === lowestRisk) {
                    label = 'safest';
                }
                else if (r.durationSeconds === fastestDuration) {
                    label = 'fastest';
                }
                else {
                    label = 'alternate';
                }
                return {
                    id: r.id,
                    geometry: r.geometry,
                    distanceMeters: r.distanceMeters,
                    durationSeconds: r.durationSeconds,
                    label,
                    riskLevel: r.combinedRisk === 0 ? 'low' : r.combinedRisk < 8 ? 'medium' : 'high',
                    riskType: r.combinedRisk === 0 ? 'none'
                        : r.earthquakeRisk > r.floodRisk ? 'earthquake' : 'flood',
                    isDefault: index === 0,
                };
            });
        }
        catch (error) {
            console.error('MAPBOX ERROR STATUS:', error?.response?.status);
            console.error('MAPBOX ERROR DATA:', error?.response?.data);
            console.error('MAPBOX ERROR MESSAGE:', error?.message);
            throw new common_1.BadRequestException(error?.response?.data?.message ||
                'Mapbox routing failed');
        }
    }
    resolveProfile(mode) {
        switch (mode) {
            case 'walking':
                return 'walking';
            case 'driving':
                return 'driving';
            case 'two-wheeler':
                return 'cycling';
            default:
                throw new common_1.BadRequestException('Invalid travel mode');
        }
    }
};
exports.MapboxRoutingService = MapboxRoutingService;
exports.MapboxRoutingService = MapboxRoutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flood_service_1.FloodService,
        earthquake_service_1.EarthquakeService])
], MapboxRoutingService);
//# sourceMappingURL=mapbox-routing.service.js.map