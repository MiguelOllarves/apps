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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_service_1 = require("../inventory/inventory.service");
let DashboardService = class DashboardService {
    prisma;
    inventory;
    constructor(prisma, inventory) {
        this.prisma = prisma;
        this.inventory = inventory;
    }
    async getMetrics(tenantId, range = '7d') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOrders = await this.prisma.order.findMany({
            where: {
                tenantId,
                createdAt: { gte: today }
            },
            include: { items: { include: { menuItem: { include: { recipe: true } } } } }
        });
        const daySales = dayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const dayProfit = dayOrders.reduce((acc, order) => {
            const orderCost = order.items.reduce((itemAcc, item) => {
                const recipeCost = item.menuItem?.recipe?.genericCost || 0;
                return itemAcc + (recipeCost * item.quantity);
            }, 0);
            return acc + (order.totalAmount - orderCost);
        }, 0);
        const stockAlerts = await this.inventory.getCriticalStock(tenantId);
        const salesTrend = [];
        let iterations = 7;
        let unit = 'day';
        if (range === 'today')
            iterations = 1;
        else if (range === '7d')
            iterations = 7;
        else if (range === 'month')
            iterations = 30;
        else if (range === 'year') {
            iterations = 12;
            unit = 'month';
        }
        for (let i = iterations - 1; i >= 0; i--) {
            const d = new Date();
            let label = '';
            if (unit === 'day' || range === 'month') {
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);
                const nextD = new Date(d);
                nextD.setDate(nextD.getDate() + 1);
                const dailyOrders = await this.prisma.order.aggregate({
                    where: { tenantId, createdAt: { gte: d, lt: nextD } },
                    _sum: { totalAmount: true }
                });
                label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                salesTrend.push({ date: label, sales: dailyOrders._sum.totalAmount || 0 });
            }
            else if (unit === 'month') {
                d.setMonth(d.getMonth() - i);
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                const nextM = new Date(d);
                nextM.setMonth(nextM.getMonth() + 1);
                const monthlyOrders = await this.prisma.order.aggregate({
                    where: { tenantId, createdAt: { gte: d, lt: nextM } },
                    _sum: { totalAmount: true }
                });
                label = d.toLocaleDateString('es-ES', { month: 'short' });
                salesTrend.push({ date: label, sales: monthlyOrders._sum.totalAmount || 0 });
            }
        }
        const pendingOrdersCount = await this.prisma.order.count({
            where: { tenantId, status: 'PENDING' }
        });
        return {
            daySales,
            dayProfit,
            stockAlertsCount: stockAlerts.length,
            stockAlerts: stockAlerts.slice(0, 5),
            salesTrend,
            growthPercentage: 12.5,
            pendingOrdersCount,
        };
    }
    async getPublicMenu(slug) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                OR: [
                    { name: { contains: slug, mode: 'insensitive' } },
                    { id: slug }
                ]
            },
            include: {
                categories: {
                    where: { type: 'MENU_ITEM' },
                    include: {
                        menuItems: {
                            include: { recipe: true }
                        }
                    }
                }
            }
        });
        if (!tenant)
            return null;
        return {
            name: tenant.name,
            logo: null,
            categories: tenant.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                menuItems: cat.menuItems.map((item) => ({
                    id: item.id,
                    price: item.price,
                    recipe: {
                        name: item.recipe.name,
                        description: item.recipe.description,
                        imageUrl: item.recipe.imageUrl
                    }
                }))
            }))
        };
    }
    async purgeData(tenantId) {
        return this.prisma.$transaction(async (tx) => {
            await tx.orderItem.deleteMany({ where: { order: { tenantId } } });
            await tx.order.deleteMany({ where: { tenantId } });
            await tx.inventoryTransaction.deleteMany({ where: { tenantId } });
            await tx.menuItem.deleteMany({ where: { tenantId } });
            await tx.recipeIngredient.deleteMany({ where: { recipe: { tenantId } } });
            await tx.recipe.deleteMany({ where: { tenantId } });
            await tx.rawMaterial.deleteMany({ where: { tenantId } });
            return { success: true, message: 'Data purged successfully for tenant' };
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map