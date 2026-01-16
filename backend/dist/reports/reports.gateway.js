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
exports.ReportsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let ReportsGateway = class ReportsGateway {
    server;
    handleJoinCity(client) {
        client.join('city:marikina');
        return { joined: 'city:marikina' };
    }
    handleLeaveCity(client) {
        client.leave('city:marikina');
        return { left: 'city:marikina' };
    }
    handleJoinBarangay(client, barangayId) {
        const room = `barangay:${barangayId}`;
        client.join(room);
        return { joined: room };
    }
    handleLeaveBarangay(client, barangayId) {
        const room = `barangay:${barangayId}`;
        client.leave(room);
        return { left: room };
    }
    emitNewReport(barangayId, report) {
        this.server.to('city:marikina').emit('report:new', report);
        this.server.to(`barangay:${barangayId}`).emit('report:new', report);
    }
    emitRemovedReport(barangayId, reportId) {
        this.server.to('city:marikina').emit('report:removed', reportId);
        this.server.to(`barangay:${barangayId}`).emit('report:removed', reportId);
    }
};
exports.ReportsGateway = ReportsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ReportsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinCity'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ReportsGateway.prototype, "handleJoinCity", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveCity'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ReportsGateway.prototype, "handleLeaveCity", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinBarangay'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ReportsGateway.prototype, "handleJoinBarangay", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveBarangay'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ReportsGateway.prototype, "handleLeaveBarangay", null);
exports.ReportsGateway = ReportsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true })
], ReportsGateway);
//# sourceMappingURL=reports.gateway.js.map