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
var CurrenciesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CurrenciesService = CurrenciesService_1 = class CurrenciesService {
    prisma;
    logger = new common_1.Logger(CurrenciesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        this.logger.log('Iniciando sincronización automática de tasas...');
        this.syncAllTenants().catch(err => this.logger.error(`Error en sincronización inicial: ${err}`));
    }
    async syncAllTenants() {
        const tenants = await this.prisma.tenant.findMany();
        for (const tenant of tenants) {
            await this.syncExternalRates(tenant.id);
        }
    }
    async findAll(tenantId) {
        return this.prisma.currency.findMany({
            where: { tenantId },
            orderBy: { isBaseCurrency: 'desc' },
        });
    }
    async getRates(tenantId) {
        const currencies = await this.prisma.currency.findMany({
            where: { tenantId },
        });
        const rates = { USD: 1, VES: 55, USDT: 1, EUR: 0.92 };
        for (const c of currencies) {
            if (c.code in rates) {
                rates[c.code] = c.exchangeRate;
            }
        }
        return rates;
    }
    convertToAll(priceUSD, rates) {
        return {
            USD: Math.round(priceUSD * 100) / 100,
            VES: Math.round(priceUSD * rates.VES * 100) / 100,
            USDT: Math.round(priceUSD * rates.USDT * 100) / 100,
            EUR: Math.round(priceUSD * rates.EUR * 100) / 100,
        };
    }
    async syncExternalRates(tenantId) {
        const newRates = { USD: 1, VES: 55, USDT: 1, EUR: 0.92 };
        try {
            const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares/bcv', {
                signal: AbortSignal.timeout(5000),
            });
            if (bcvRes.ok) {
                const bcvData = await bcvRes.json();
                if (bcvData?.venta) {
                    newRates.VES = bcvData.venta;
                    this.logger.log(`[BCV] Tasa actualizada: ${newRates.VES} VES/USD`);
                }
            }
        }
        catch (err) {
            this.logger.warn(`[BCV] Error fetching rate, using stored value. ${err}`);
            const existing = await this.prisma.currency.findFirst({ where: { tenantId, code: 'VES' } });
            if (existing)
                newRates.VES = existing.exchangeRate;
        }
        try {
            const eurRes = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR', { signal: AbortSignal.timeout(5000) });
            if (eurRes.ok) {
                const eurData = await eurRes.json();
                if (eurData?.rates?.EUR) {
                    newRates.EUR = eurData.rates.EUR;
                    this.logger.log(`[EUR] Tasa actualizada: ${newRates.EUR} EUR/USD`);
                }
            }
        }
        catch (err) {
            this.logger.warn(`[EUR] Error fetching rate. ${err}`);
        }
        try {
            const usdtRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDC', { signal: AbortSignal.timeout(5000) });
            if (usdtRes.ok) {
                const usdtData = await usdtRes.json();
                if (usdtData?.price) {
                    newRates.USDT = parseFloat(usdtData.price);
                    this.logger.log(`[USDT] Rate: ${newRates.USDT}`);
                }
            }
        }
        catch (err) {
            newRates.USDT = 1;
        }
        for (const [code, rate] of Object.entries(newRates)) {
            await this.prisma.currency.updateMany({
                where: { tenantId, code },
                data: { exchangeRate: rate },
            });
        }
        return newRates;
    }
    async updateRate(tenantId, currencyId, newRate) {
        return this.prisma.currency.update({
            where: { id: currencyId },
            data: { exchangeRate: newRate },
        });
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = CurrenciesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map