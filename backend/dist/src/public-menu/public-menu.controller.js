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
exports.PublicMenuController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const currencies_service_1 = require("../currencies/currencies.service");
const public_decorator_1 = require("../auth/public.decorator");
let PublicMenuController = class PublicMenuController {
    prisma;
    currenciesService;
    constructor(prisma, currenciesService) {
        this.prisma = prisma;
        this.currenciesService = currenciesService;
    }
    async getMenuBySlug(slug) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                OR: [
                    { slug },
                    { id: slug },
                ],
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Restaurante no encontrado.');
        const rates = await this.currenciesService.getRates(tenant.id);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { tenantId: tenant.id, isAvailable: true },
            include: {
                recipe: {
                    select: {
                        name: true,
                        description: true,
                        nutritionalInfo: true,
                    },
                },
                category: {
                    select: { name: true },
                },
                currency: {
                    select: { code: true },
                },
            },
        });
        const categoriesMap = {};
        menuItems.forEach((item) => {
            const catName = item.category.name;
            if (!categoriesMap[catName])
                categoriesMap[catName] = [];
            categoriesMap[catName].push({
                id: item.id,
                name: item.recipe.name,
                description: item.recipe.description,
                price: item.price,
                currency: item.currency.code,
                prices: this.currenciesService.convertToAll(item.price, rates),
            });
        });
        const menu = Object.entries(categoriesMap).map(([name, items]) => ({ name, items }));
        return {
            restaurantName: tenant.name,
            tenantId: tenant.id,
            slug: tenant.slug,
            logo: tenant.logo,
            coverImage: tenant.coverImage,
            address: tenant.address,
            phone: tenant.phone,
            instagram: tenant.instagram,
            whatsapp: tenant.whatsapp,
            rates,
            menu,
        };
    }
};
exports.PublicMenuController = PublicMenuController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicMenuController.prototype, "getMenuBySlug", null);
exports.PublicMenuController = PublicMenuController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('public-menu'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currencies_service_1.CurrenciesService])
], PublicMenuController);
//# sourceMappingURL=public-menu.controller.js.map