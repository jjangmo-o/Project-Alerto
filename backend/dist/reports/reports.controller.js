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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const optional_auth_guard_1 = require("../auth/guards/optional-auth.guard");
const media_service_1 = require("../media/media.service");
const reports_service_1 = require("./reports.service");
const platform_express_1 = require("@nestjs/platform-express");
let ReportsController = class ReportsController {
    reportsService;
    mediaService;
    constructor(reportsService, mediaService) {
        this.reportsService = reportsService;
        this.mediaService = mediaService;
    }
    async create(req, files, dto) {
        if (!files)
            files = [];
        const images = files.filter(f => f.mimetype.startsWith('image'));
        const videos = files.filter(f => f.mimetype.startsWith('video'));
        if (images.length > 10) {
            throw new common_1.BadRequestException('Maximum of 10 images allowed');
        }
        if (videos.length > 2) {
            throw new common_1.BadRequestException('Maximum of 2 videos allowed');
        }
        if (req.user) {
            dto.reporter = {
                name: req.user.name,
                contactNumber: req.user.contactNumber,
                address: req.user.address,
            };
            dto.barangayId = dto.barangayId || req.user.barangayId;
        }
        else {
            if (!dto.name || !dto.contactNumber || !dto.address) {
                throw new common_1.BadRequestException('Anonymous users must provide name, contact number, and address');
            }
            dto.reporter = {
                name: dto.name,
                contactNumber: dto.contactNumber,
                address: dto.address,
            };
        }
        const uploadedMedia = await this.mediaService.uploadFiles(files);
        return this.reportsService.create({
            ...dto,
            media: uploadedMedia,
        });
    }
    findByBarangay(barangayId) {
        return this.reportsService.findByBarangay(barangayId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 12)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('barangayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "findByBarangay", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        media_service_1.MediaService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map