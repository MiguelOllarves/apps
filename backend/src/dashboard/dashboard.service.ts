import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService
  ) { }

  async getMetrics(tenantId: string, range: string = '7d') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Sales of the day (Always static for the "Today" card)
    const dayOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: today }
      },
      include: { items: { include: { menuItem: { include: { recipe: true } } } } }
    });

    const daySales = dayOrders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);

    // 2. Projected Utility (Price - Recipe Cost)
    const dayProfit = dayOrders.reduce((acc: number, order: any) => {
      const orderCost = order.items.reduce((itemAcc: number, item: any) => {
        const recipeCost = item.menuItem?.recipe?.genericCost || 0;
        return itemAcc + (recipeCost * item.quantity);
      }, 0);
      return acc + (order.totalAmount - orderCost);
    }, 0);

    // 3. Stock Alerts
    const stockAlerts = await this.inventory.getCriticalStock(tenantId);

    // 4. Sales Trends (Dynamic Range)
    const salesTrend = [];
    let iterations = 7;
    let unit: 'day' | 'week' | 'month' = 'day';

    if (range === 'today') iterations = 1;
    else if (range === '7d') iterations = 7;
    else if (range === 'month') iterations = 30;
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
      } else if (unit === 'month') {
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

    // 5. Pending Orders (For Real-time Badge)
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

  async getPublicMenu(slug: string) {
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

    if (!tenant) return null;

    return {
      name: tenant.name,
      logo: null,
      categories: tenant.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        menuItems: cat.menuItems.map((item: any) => ({
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

  async purgeData(tenantId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
}
