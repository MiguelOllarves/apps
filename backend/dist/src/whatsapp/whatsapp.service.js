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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendOrderConfirmation(phoneNumber, orderId, customerName) {
        this.logger.log(`[WhatsApp] Sending order ${orderId} confirmation to ${customerName} at ${phoneNumber}`);
        return {
            success: true,
            message: 'WhatsApp notification enqueued.',
            timestamp: new Date().toISOString(),
        };
    }
    async sendDailySummary(phoneNumber, summary) {
        const topItemsText = summary.topItems.length > 0
            ? summary.topItems.map((item, i) => `  ${i + 1}. ${item.name} (×${item.quantity})`).join('\n')
            : '  Sin ventas registradas.';
        const stockAlerts = summary.criticalStockItems.length > 0
            ? summary.criticalStockItems.map((item) => `  ⚠️ ${item.name}: ${item.currentStock} ${item.unit}`).join('\n')
            : '  ✅ Todo el stock está en niveles óptimos.';
        const message = [
            `📊 *Resumen Diario ControlTotal*`,
            ``,
            `💰 Ventas Totales: $${summary.totalSales.toFixed(2)}`,
            `📋 Órdenes Procesadas: ${summary.totalOrders}`,
            ``,
            `🏆 *Top Productos:*`,
            topItemsText,
            ``,
            `📦 *Alertas de Stock:*`,
            stockAlerts,
            ``,
            `_Reporte generado automáticamente por ControlTotal._`,
        ].join('\n');
        this.logger.log(`[WhatsApp] Sending Daily Summary to Admin ${phoneNumber}:\n${message}`);
        return {
            success: true,
            message: 'Daily WhatsApp summary enqueued.',
            timestamp: new Date().toISOString(),
        };
    }
    async generateDailySummary(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await this.prisma.order.findMany({
            where: {
                tenantId,
                createdAt: { gte: today },
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            include: { recipe: true },
                        },
                    },
                },
            },
        });
        const totalSales = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const itemCounts = new Map();
        for (const order of todayOrders) {
            for (const item of order.items) {
                const name = item.menuItem?.recipe?.name || 'Producto';
                const existing = itemCounts.get(name);
                if (existing) {
                    existing.quantity += item.quantity;
                }
                else {
                    itemCounts.set(name, { name, quantity: item.quantity });
                }
            }
        }
        const topItems = Array.from(itemCounts.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        const materials = await this.prisma.rawMaterial.findMany({
            where: { tenantId },
        });
        const criticalStockItems = materials
            .filter((m) => m.currentStock <= m.minStockAlert)
            .map((m) => ({ name: m.name, currentStock: m.currentStock, unit: m.unit }));
        return {
            totalSales: Math.round(totalSales * 100) / 100,
            totalOrders: todayOrders.length,
            topItems,
            criticalStockItems,
        };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map