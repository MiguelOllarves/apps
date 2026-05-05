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
exports.CurrenciesController = void 0;
const common_1 = require("@nestjs/common");
const currencies_service_1 = require("./currencies.service");
let CurrenciesController = class CurrenciesController {
    currenciesService;
    constructor(currenciesService) {
        this.currenciesService = currenciesService;
    }
    findAll(tenantId) {
        return this.currenciesService.findAll(tenantId);
    }
    getRates(tenantId) {
        return this.currenciesService.getRates(tenantId);
    }
    syncRates(tenantId) {
        return this.currenciesService.syncExternalRates(tenantId);
    }
    updateRate(tenantId, id, rate) {
        return this.currenciesService.updateRate(tenantId, id, rate);
    }
};
exports.CurrenciesController = CurrenciesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('rates'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "getRates", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "syncRates", null);
__decorate([
    (0, common_1.Patch)(':id/rate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('exchangeRate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], CurrenciesController.prototype, "updateRate", null);
exports.CurrenciesController = CurrenciesController = __decorate([
    (0, common_1.Controller)('currencies'),
    __metadata("design:paramtypes", [currencies_service_1.CurrenciesService])
], CurrenciesController);
//# sourceMappingURL=currencies.controller.js.map