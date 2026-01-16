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
exports.AdminEventsController = void 0;
const common_1 = require("@nestjs/common");
const hazard_events_service_1 = require("../hazards/hazard-events.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let AdminEventsController = class AdminEventsController {
    hazardEvents;
    constructor(hazardEvents) {
        this.hazardEvents = hazardEvents;
    }
    enableFlood() {
        this.hazardEvents.enableFloodEvent();
        return {
            message: 'Flood event enabled',
            floodActive: true,
        };
    }
    disableFlood() {
        this.hazardEvents.disableFloodEvent();
        return {
            message: 'Flood event disabled',
            floodActive: false,
        };
    }
    enableEarthquake() {
        this.hazardEvents.enableEarthquakeEvent();
        return {
            message: 'Earthquake event enabled',
            earthquakeActive: true,
        };
    }
    disableEarthquake() {
        this.hazardEvents.disableEarthquakeEvent();
        return {
            message: 'Earthquake event disabled',
            earthquakeActive: false,
        };
    }
};
exports.AdminEventsController = AdminEventsController;
__decorate([
    (0, common_1.Post)('flood/enable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEventsController.prototype, "enableFlood", null);
__decorate([
    (0, common_1.Post)('flood/disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEventsController.prototype, "disableFlood", null);
__decorate([
    (0, common_1.Post)('earthquake/enable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEventsController.prototype, "enableEarthquake", null);
__decorate([
    (0, common_1.Post)('earthquake/disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEventsController.prototype, "disableEarthquake", null);
exports.AdminEventsController = AdminEventsController = __decorate([
    (0, common_1.Controller)('admin/events'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [hazard_events_service_1.HazardEventsService])
], AdminEventsController);
//# sourceMappingURL=admin-events.controller.js.map