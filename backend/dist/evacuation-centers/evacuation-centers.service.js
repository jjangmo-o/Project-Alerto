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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvacuationCentersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const mapbox_routing_service_1 = require("./routing/mapbox-routing.service");
const travel_mode_util_1 = require("./utils/travel-mode.util");
const hazards_service_1 = require("../hazards/hazards.service");
const hazard_events_service_1 = require("../hazards/hazard-events.service");
let EvacuationCentersService = class EvacuationCentersService {
    supabaseService;
    routingService;
    hazardsService;
    hazardEvents;
    constructor(supabaseService, routingService, hazardsService, hazardEvents) {
        this.supabaseService = supabaseService;
        this.routingService = routingService;
        this.hazardsService = hazardsService;
        this.hazardEvents = hazardEvents;
    }
    async findAll() {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('evacuation_centers')
            .select(`
        center_id,
        name,
        address,
        capacity,
        current_occupancy,
        latitude,
        longitude
      `);
        if (error) {
            console.error('[EvacuationCentersService] Supabase error:', error);
            throw new Error('Failed to fetch evacuation centers');
        }
        console.log('[EvacuationCentersService] Raw data from Supabase:', data);
        const transformed = (data ?? []).map(center => ({
            id: center.center_id,
            name: center.name,
            address: center.address,
            capacity_current: center.current_occupancy ?? 0,
            capacity_total: center.capacity,
            location: {
                coordinates: [center.longitude, center.latitude],
            },
        }));
        return transformed;
    }
    async findNearest(lat, lng, mode) {
        if (typeof lat !== 'number' ||
            typeof lng !== 'number' ||
            Number.isNaN(lat) ||
            Number.isNaN(lng)) {
            throw new common_1.BadRequestException('Invalid coordinates');
        }
        if (!(0, travel_mode_util_1.isValidTravelMode)(mode)) {
            throw new common_1.BadRequestException('Invalid travel mode. Use walking, driving, or two-wheeler.');
        }
        const supabase = this.supabaseService.getClient();
        const { data: rawCenters, error } = await supabase
            .from('evacuation_centers')
            .select(`
        center_id,
        name,
        address,
        capacity,
        current_occupancy,
        latitude,
        longitude
      `);
        if (error || !rawCenters || rawCenters.length === 0) {
            throw new common_1.BadRequestException('No evacuation centers available');
        }
        const centers = rawCenters.map(center => ({
            id: center.center_id,
            name: center.name,
            address: center.address,
            capacity_current: center.current_occupancy ?? 0,
            capacity_total: center.capacity,
            location: {
                coordinates: [center.longitude, center.latitude],
            },
        }));
        const nearest = this.findNearestCenter(lat, lng, centers);
        if (!nearest) {
            throw new common_1.BadRequestException('No evacuation center with valid coordinates');
        }
        const [destLng, destLat] = nearest.location.coordinates;
        return {
            evacuationCenter: {
                id: nearest.id,
                name: nearest.name,
                status: nearest.status,
                capacity_current: nearest.capacity_current,
                capacity_total: nearest.capacity_total,
                latitude: destLat,
                longitude: destLng,
            },
        };
    }
    async findNearestWithRoute(lat, lng, mode, options) {
        if (typeof lat !== 'number' ||
            typeof lng !== 'number' ||
            Number.isNaN(lat) ||
            Number.isNaN(lng)) {
            throw new common_1.BadRequestException('Invalid coordinates');
        }
        if (!(0, travel_mode_util_1.isValidTravelMode)(mode)) {
            throw new common_1.BadRequestException('Invalid travel mode. Use walking, driving, or two-wheeler.');
        }
        const supabase = this.supabaseService.getClient();
        const { data: rawCenters, error } = await supabase
            .from('evacuation_centers')
            .select(`
      center_id,
      name,
      address,
      capacity,
      current_occupancy,
      latitude,
      longitude
    `);
        if (error || !rawCenters || rawCenters.length === 0) {
            throw new common_1.BadRequestException('No evacuation centers available');
        }
        const centers = rawCenters.map(center => ({
            id: center.center_id,
            name: center.name,
            address: center.address,
            capacity_current: center.current_occupancy ?? 0,
            capacity_total: center.capacity,
            location: {
                coordinates: [center.longitude, center.latitude],
            },
        }));
        const nearest = this.findNearestCenter(lat, lng, centers);
        if (!nearest) {
            throw new common_1.BadRequestException('No evacuation center with valid coordinates');
        }
        const [destLng, destLat] = nearest.location.coordinates;
        const routes = await this.routingService.getRoute(lat, lng, destLat, destLng, mode);
        const floodActive = options?.testFlood ?? this.hazardEvents.isFloodEventActive();
        const earthquakeActive = options?.testEarthquake ?? this.hazardEvents.isEarthquakeEventActive();
        const scoredRoutes = routes.map(route => {
            let hazardPenalty = 0;
            if (floodActive) {
                hazardPenalty += this.hazardsService.scoreRouteFloodRisk(route.geometry);
            }
            return {
                ...route,
                hazardPenalty,
                finalScore: route.durationSeconds + hazardPenalty,
            };
        });
        scoredRoutes.sort((a, b) => a.finalScore - b.finalScore);
        return {
            evacuationCenter: {
                id: nearest.id,
                name: nearest.name,
                status: nearest.status,
                capacity_current: nearest.capacity_current,
                capacity_total: nearest.capacity_total,
                latitude: destLat,
                longitude: destLng,
            },
            routes: scoredRoutes,
            eventStatus: {
                flood: floodActive,
                earthquake: earthquakeActive,
            },
        };
    }
    async routeBetween(originLat, originLng, destLat, destLng, mode, options) {
        if (!(0, travel_mode_util_1.isValidTravelMode)(mode)) {
            throw new common_1.BadRequestException('Invalid travel mode');
        }
        const floodActive = options?.testFlood ?? this.hazardEvents.isFloodEventActive();
        const earthquakeActive = options?.testEarthquake ?? this.hazardEvents.isEarthquakeEventActive();
        const routes = await this.routingService.getRoute(originLat, originLng, destLat, destLng, mode, { testFlood: floodActive, testEarthquake: earthquakeActive });
        const scoredRoutes = routes.map(route => {
            let hazardPenalty = 0;
            if (floodActive) {
                hazardPenalty +=
                    this.hazardsService.scoreRouteFloodRisk(route.geometry);
            }
            return {
                ...route,
                hazardPenalty,
                finalScore: route.durationSeconds + hazardPenalty,
            };
        });
        scoredRoutes.sort((a, b) => a.finalScore - b.finalScore);
        return {
            routes: scoredRoutes,
            eventStatus: {
                flood: floodActive,
                earthquake: earthquakeActive,
            },
        };
    }
    findNearestCenter(lat, lng, centers) {
        const toRad = (v) => (v * Math.PI) / 180;
        return centers.reduce((closest, center) => {
            if (!center.location ||
                !Array.isArray(center.location.coordinates)) {
                return closest;
            }
            const [lng2, lat2] = center.location.coordinates;
            const R = 6371000;
            const dLat = toRad(lat2 - lat);
            const dLng = toRad(lng2 - lng);
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat)) *
                    Math.cos(toRad(lat2)) *
                    Math.sin(dLng / 2) ** 2;
            const c = 2 *
                Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            if (!closest || distance < closest.distance) {
                return { ...center, distance };
            }
            return closest;
        }, null);
    }
};
exports.EvacuationCentersService = EvacuationCentersService;
exports.EvacuationCentersService = EvacuationCentersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        mapbox_routing_service_1.MapboxRoutingService,
        hazards_service_1.HazardsService,
        hazard_events_service_1.HazardEventsService])
], EvacuationCentersService);
//# sourceMappingURL=evacuation-centers.service.js.map