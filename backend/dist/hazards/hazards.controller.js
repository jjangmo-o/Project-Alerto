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
exports.HazardsController = void 0;
const common_1 = require("@nestjs/common");
const hazard_events_service_1 = require("./hazard-events.service");
const hazards_service_1 = require("./hazards.service");
let HazardsController = class HazardsController {
    hazardEvents;
    hazardsService;
    constructor(hazardEvents, hazardsService) {
        this.hazardEvents = hazardEvents;
        this.hazardsService = hazardsService;
    }
    getStatus() {
        return this.hazardEvents.getStatus();
    }
    getFloodGeoJSON() {
        return this.hazardsService.getFloodGeoJSON();
    }
    getEarthquakeGeoJSON() {
        return this.hazardsService.getEarthquakeGeoJSON();
    }
    enableFlood() {
        return this.hazardEvents.enableFloodEvent();
    }
    disableFlood() {
        return this.hazardEvents.disableFloodEvent();
    }
    enableEarthquake() {
        return this.hazardEvents.enableEarthquakeEvent();
    }
    disableEarthquake() {
        return this.hazardEvents.disableEarthquakeEvent();
    }
};
exports.HazardsController = HazardsController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('flood'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "getFloodGeoJSON", null);
__decorate([
    (0, common_1.Get)('earthquake'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "getEarthquakeGeoJSON", null);
__decorate([
    (0, common_1.Post)('flood/enable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "enableFlood", null);
__decorate([
    (0, common_1.Post)('flood/disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "disableFlood", null);
__decorate([
    (0, common_1.Post)('earthquake/enable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "enableEarthquake", null);
__decorate([
    (0, common_1.Post)('earthquake/disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HazardsController.prototype, "disableEarthquake", null);
exports.HazardsController = HazardsController = __decorate([
    (0, common_1.Controller)('hazards'),
    __metadata("design:paramtypes", [hazard_events_service_1.HazardEventsService,
        hazards_service_1.HazardsService])
], HazardsController);
//# sourceMappingURL=hazards.controller.js.map