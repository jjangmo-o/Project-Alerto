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
exports.CreateReportDto = exports.ReportStatus = void 0;
const class_validator_1 = require("class-validator");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["SAFE"] = "SAFE";
    ReportStatus["NEED_HELP"] = "NEED_HELP";
    ReportStatus["INJURED"] = "INJURED";
    ReportStatus["MISSING"] = "MISSING";
    ReportStatus["TRAPPED"] = "TRAPPED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
class CreateReportDto {
    status;
    barangayId;
    latitude;
    longitude;
    description;
    media;
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportStatus),
    __metadata("design:type", String)
], CreateReportDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "barangayId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "media", void 0);
//# sourceMappingURL=create-report.dto.js.map