"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvacuationCentersModule = void 0;
const common_1 = require("@nestjs/common");
const evacuation_centers_controller_1 = require("./evacuation-centers.controller");
const evacuation_centers_service_1 = require("./evacuation-centers.service");
const mapbox_routing_service_1 = require("./routing/mapbox-routing.service");
const supabase_module_1 = require("../supabase/supabase.module");
const hazards_module_1 = require("../hazards/hazards.module");
let EvacuationCentersModule = class EvacuationCentersModule {
};
exports.EvacuationCentersModule = EvacuationCentersModule;
exports.EvacuationCentersModule = EvacuationCentersModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, hazards_module_1.HazardsModule],
        controllers: [evacuation_centers_controller_1.EvacuationCentersController],
        providers: [evacuation_centers_service_1.EvacuationCentersService, mapbox_routing_service_1.MapboxRoutingService],
    })
], EvacuationCentersModule);
//# sourceMappingURL=evacuation-centers.module.js.map