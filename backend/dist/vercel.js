"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let appReady;
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.init();
}
appReady = createApp();
async function handler(req, res) {
    await appReady;
    server(req, res);
}
//# sourceMappingURL=vercel.js.map