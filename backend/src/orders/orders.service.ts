import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecipesService } from '../recipes/recipes.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateOrderDto, CreatePublicOrderDto } from './dto/orders.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private recipesService: RecipesService,
    private whatsappService: WhatsappService,
  ) { }

  async createOrder(tenantId: string, data: CreateOrderDto) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('La orden debe tener al menos un item.');
    }

    if (!data.currencyId) {
      const baseCurrency = await this.prisma.currency.findFirst({
        where: { tenantId, isBaseCurrency: true },
      });
      if (!baseCurrency) throw new BadRequestException('ID de moneda requerido y no se encontró moneda base.');
      data.currencyId = baseCurrency.id;
    }

    // userId is optional — guest checkout allowed
    if (data.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: data.userId, tenantId },
      });
      if (!user) throw new NotFoundException('Usuario no encontrado.');
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

  /**
   * ATOMIC TRANSACTION: Confirm shipment and deduct inventory
   */
  async shipOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (order.status === 'SHIPPED') throw new BadRequestException('La orden ya ha sido despachada.');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' },
      });

      for (const item of order.items) {
        if (item.menuItem?.recipeId) {
          await this.recipesService.consumeRecipeIngredients(
            tenantId,
            item.menuItem.recipeId,
            item.quantity,
            tx,
          );
        }
      }

      return updatedOrder;
    });
  }

  async createPublicOrder(tenantId: string, data: CreatePublicOrderDto) {
    if (!tenantId) throw new BadRequestException('ID de tenant no proporcionado.');
    console.log('[Orders] Creating public order for tenant:', tenantId);
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
    console.log('[Orders] Base currency:', baseCurrency?.code, baseCurrency?.id);

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

    try {
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
      console.log('[Orders] Order created successfully:', order.id);

      // --- Notificación WhatsApp Automática ---
      try {
        const adminPhone = order.tenant.whatsapp || 'ADMIN_PHONE';
        const itemsList = order.items
          .map((item: any) => `• ${item.quantity}x ${item.menuItem.recipe.name}`)
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

        // Notificar al Admin del restaurante
        this.whatsappService.sendOrderConfirmation(adminPhone, order.id, 'ADMIN_REPORT').then(() => {
          console.log(`[WhatsApp] Alerta de pedido ${order.id} enviada al admin.`);
        });

        // Notificar al Cliente (Confirmación)
        this.whatsappService.sendOrderConfirmation(customerPhone, order.id, customerName);

      } catch (error) {
        console.error('[WhatsApp] Error disparando notificaciones:', error);
      }

      return order;
    } catch (dbError) {
      console.error('[Orders] Database error creating order:', dbError);
      throw new BadRequestException(`Error al procesar la orden: ${dbError.message || 'Error de base de datos'}`);
    }
  }

  async getCustomerHistory(tenantId: string, userId: string) {
    return this.prisma.order.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: true } } },
    });
  }

  async findAll(tenantId: string, limit?: number) {
    return this.prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : undefined,
      include: {
        user: true,
        customer: true,
        items: {
          include: {
            menuItem: {
              include: { recipe: true }
            }
          }
        }
      },
    });
  }

  async getMetrics(tenantId: string) {
    const orders = await this.prisma.order.findMany({
      where: { tenantId },
    });

    const totalSales = orders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);

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
}
