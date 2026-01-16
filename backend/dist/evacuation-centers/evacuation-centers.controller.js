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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvacuationCentersController = void 0;
const common_1 = require("@nestjs/common");
const evacuation_centers_service_1 = require("./evacuation-centers.service");
let EvacuationCentersController = class EvacuationCentersController {
    evacuationService;
    constructor(evacuationService) {
        this.evacuationService = evacuationService;
    }
    async findAll() {
        return this.evacuationService.findAll();
    }
    findNearest(lat, lng, mode = 'walking') {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            throw new common_1.BadRequestException('lat and lng must be valid numbers');
        }
        return this.evacuationService.findNearest(latNum, lngNum, mode);
    }
    async findNearestWithRoute(lat, lng, mode = 'walking', testFlood, testEarthquake) {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            throw new common_1.BadRequestException('lat and lng must be valid numbers');
        }
        return this.evacuationService.findNearestWithRoute(latNum, lngNum, mode, {
            testFlood: testFlood === 'true',
            testEarthquake: testEarthquake === 'true',
        });
    }
    routeBetween(originLat, originLng, destLat, destLng, mode, testFlood, testEarthquake) {
        return this.evacuationService.routeBetween(Number(originLat), Number(originLng), Number(destLat), Number(destLng), mode, {
            testFlood: testFlood === 'true',
            testEarthquake: testEarthquake === 'true',
        });
    }
};
exports.EvacuationCentersController = EvacuationCentersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EvacuationCentersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nearest'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EvacuationCentersController.prototype, "findNearest", null);
__decorate([
    (0, common_1.Get)('nearest-route'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('mode')),
    __param(3, (0, common_1.Query)('testFlood')),
    __param(4, (0, common_1.Query)('testEarthquake')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EvacuationCentersController.prototype, "findNearestWithRoute", null);
__decorate([
    (0, common_1.Get)('route'),
    __param(0, (0, common_1.Query)('originLat')),
    __param(1, (0, common_1.Query)('originLng')),
    __param(2, (0, common_1.Query)('destLat')),
    __param(3, (0, common_1.Query)('destLng')),
    __param(4, (0, common_1.Query)('mode')),
    __param(5, (0, common_1.Query)('testFlood')),
    __param(6, (0, common_1.Query)('testEarthquake')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number, String, String, String]),
    __metadata("design:returntype", void 0)
], EvacuationCentersController.prototype, "routeBetween", null);
exports.EvacuationCentersController = EvacuationCentersController = __decorate([
    (0, common_1.Controller)('api/v1/evacuation-centers'),
    __metadata("design:paramtypes", [evacuation_centers_service_1.EvacuationCentersService])
], EvacuationCentersController);
//# sourceMappingURL=evacuation-centers.controller.js.map