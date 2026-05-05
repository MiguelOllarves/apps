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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const recipes_service_1 = require("../recipes/recipes.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let OrdersService = class OrdersService {
    prisma;
    recipesService;
    whatsappService;
    constructor(prisma, recipesService, whatsappService) {
        this.prisma = prisma;
        this.recipesService = recipesService;
        this.whatsappService = whatsappService;
    }
    async createOrder(tenantId, data) {
        if (!data.items || data.items.length === 0) {
            throw new common_1.BadRequestException('La orden debe tener al menos un item.');
        }
        if (!data.currencyId) {
            const baseCurrency = await this.prisma.currency.findFirst({
                where: { tenantId, isBaseCurrency: true },
            });
            if (!baseCurrency)
                throw new common_1.BadRequestException('ID de moneda requerido y no se encontró moneda base.');
            data.currencyId = baseCurrency.id;
        }
        if (data.userId) {
            const user = await this.prisma.user.findFirst({
                where: { id: data.userId, tenantId },
            });
            if (!user)
                throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        let totalAmount = 0;
        const orderItemsData = data.items.map((item) => {
            const subTotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
            totalAmount += subTotal;
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subTotal,
            };
        });
        totalAmount = Math.round(totalAmount * 100) / 100;
        const order = await this.prisma.order.create({
            data: {
                tenantId,
                userId: data.userId || null,
                type: data.type,
                tableNumber: data.tableNumber,
                currencyId: data.currencyId,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: orderItemsData,
                },
            },
            include: { items: { include: { menuItem: true } } },
        });
        return order;
    }
    async shipOrder(tenantId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: { include: { menuItem: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Orden no encontrada.');
        if (order.status === 'SHIPPED')
            throw new common_1.BadRequestException('La orden ya ha sido despachada.');
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'SHIPPED' },
            });
            for (const item of order.items) {
                if (item.menuItem?.recipeId) {
                    await this.recipesService.consumeRecipeIngredients(tenantId, item.menuItem.recipeId, item.quantity, tx);
                }
            }
            return updatedOrder;
        });
    }
    async createPublicOrder(tenantId, data) {
        const { customerName, customerPhone, customerAddress, items, tableNumber } = data;
        const customer = await this.prisma.customer.upsert({
            where: {
                phone_tenantId: {
                    phone: customerPhone,
                    tenantId: tenantId,
                },
            },
            create: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
                tenantId,
            },
            update: {
                name: customerName,
                address: customerAddress,
            },
        });
        const baseCurrency = await this.prisma.currency.findFirst({
            where: { tenantId, isBaseCurrency: true },
        });
        let totalAmount = 0;
        const orderItemsData = items.map((item) => {
            const subTotal = Math.round(item.quantity * item.price * 100) / 100;
            totalAmount += subTotal;
            return {
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
                subTotal,
            };
        });
        totalAmount = Math.round(totalAmount * 100) / 100;
        const order = await this.prisma.order.create({
            data: {
                tenantId,
                customerId: customer.id,
                type: tableNumber ? 'DINE_IN' : 'DELIVERY',
                tableNumber: tableNumber?.toString(),
                currencyId: baseCurrency?.id || 'USD',
                totalAmount,
                status: 'PENDING',
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: { include: { menuItem: { include: { recipe: true } } } },
                tenant: true
            },
        });
        try {
            const adminPhone = order.tenant.whatsapp || 'ADMIN_PHONE';
            const itemsList = order.items
                .map((item) => `• ${item.quantity}x ${item.menuItem.recipe.name}`)
                .join('\n');
            const messageToAdmin = [
                `🔔 *¡NUEVO PEDIDO RECIBIDO!*`,
                ``,
                `📍 *Cliente:* ${customerName}`,
                `📞 *Teléfono:* ${customerPhone}`,
                `🏠 *Ubicación:* ${customerAddress || 'En local'}`,
                `🍴 *Tipo:* ${tableNumber ? `Mesa ${tableNumber}` : 'Delivery'}`,
                ``,
                `📦 *Detalle:*`,
                itemsList,
                ``,
                `💰 *Total:* $${totalAmount.toFixed(2)}`,
                `👉 _Ver en ControlTotal: http://localhost:3000/dashboard/pos_`,
            ].join('\n');
            this.whatsappService.sendOrderConfirmation(adminPhone, order.id, 'ADMIN_REPORT').then(() => {
                console.log(`[WhatsApp] Alerta de pedido ${order.id} enviada al admin.`);
            });
            this.whatsappService.sendOrderConfirmation(customerPhone, order.id, customerName);
        }
        catch (error) {
            console.error('[WhatsApp] Error disparando notificaciones:', error);
        }
        return order;
    }
    async getCustomerHistory(tenantId, userId) {
        return this.prisma.order.findMany({
            where: { tenantId, userId },
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { menuItem: true } } },
        });
    }
    async findAll(tenantId, limit) {
        return this.prisma.order.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit ? Number(limit) : undefined,
            include: { user: true },
        });
    }
    async getMetrics(tenantId) {
        const orders = await this.prisma.order.findMany({
            where: { tenantId },
        });
        const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const validMenuItem = await this.prisma.menuItem.findFirst({
            where: { tenantId },
            include: { recipe: true, category: true },
        });
        const baseCurrency = await this.prisma.currency.findFirst({
            where: { tenantId, isBaseCurrency: true },
        });
        return {
            totalSales: Math.round(totalSales * 100) / 100,
            orderCount: orders.length,
            growthPercentage: 48.5,
            simulableMenu: validMenuItem
                ? {
                    id: validMenuItem.id,
                    name: validMenuItem.recipe.name,
                    price: validMenuItem.price,
                    currencyId: baseCurrency?.id,
                }
                : null,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        recipes_service_1.RecipesService,
        whatsapp_service_1.WhatsappService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map