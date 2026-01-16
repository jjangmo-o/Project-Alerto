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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const reports_gateway_1 = require("./reports.gateway");
let ReportsService = class ReportsService {
    reportsGateway;
    reports = [];
    constructor(reportsGateway) {
        this.reportsGateway = reportsGateway;
    }
    create(dto) {
        const report = {
            id: crypto.randomUUID(),
            ...dto,
            createdAt: new Date(),
            isRemoved: false,
        };
        this.reports.push(report);
        this.reportsGateway.emitNewReport(dto.barangayId, report);
        return report;
    }
    findAll() {
        return this.reports.filter(r => !r.isRemoved);
    }
    findByBarangay(barangayId) {
        return this.reports.filter(r => r.barangayId === barangayId && !r.isRemoved);
    }
    remove(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report)
            return;
        report.isRemoved = true;
        this.reportsGateway.emitRemovedReport(report.barangayId, reportId);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_gateway_1.ReportsGateway])
], ReportsService);
//# sourceMappingURL=reports.service.js.map