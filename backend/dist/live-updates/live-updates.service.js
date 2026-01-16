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
exports.LiveUpdatesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let LiveUpdatesService = class LiveUpdatesService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async updateState(key, value, severity, source) {
        const supabase = this.supabaseService.getClient();
        await supabase.from('live_state').upsert({
            key,
            value,
            severity,
            source,
            updated_at: new Date(),
        });
    }
    async getCurrentState() {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('live_state')
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    }
};
exports.LiveUpdatesService = LiveUpdatesService;
exports.LiveUpdatesService = LiveUpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], LiveUpdatesService);
//# sourceMappingURL=live-updates.service.js.map