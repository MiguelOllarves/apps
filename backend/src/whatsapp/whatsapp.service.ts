import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface DailySummaryData {
  totalSales: number;
  totalOrders: number;
  topItems: { name: string; quantity: number }[];
  criticalStockItems: { name: string; currentStock: number; unit: string }[];
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) { }

  async sendOrderConfirmation(phoneNumber: string, orderId: string, customerName: string) {
    this.logger.log(
      `[WhatsApp] Sending order ${orderId} confirmation to ${customerName} at ${phoneNumber}`,
    );

    // Stub for Twilio or Meta WhatsApp Business API integration
    return {
      success: true,
      message: 'WhatsApp notification enqueued.',
      timestamp: new Date().toISOString(),
    };
  }

  async sendDailySummary(phoneNumber: string, summary: DailySummaryData) {
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

  /**
   * Generate daily summary data for a tenant
   */
  async generateDailySummary(tenantId: string): Promise<DailySummaryData> {
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

    const totalSales = todayOrders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);

    // Aggregate top items
    const itemCounts = new Map<string, { name: string; quantity: number }>();
    for (const order of todayOrders) {
      for (const item of order.items) {
        const name = item.menuItem?.recipe?.name || 'Producto';
        const existing = itemCounts.get(name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemCounts.set(name, { name, quantity: item.quantity });
        }
      }
    }

    const topItems = Array.from(itemCounts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Critical stock
    const materials = await this.prisma.rawMaterial.findMany({
      where: { tenantId },
    });

    const criticalStockItems = materials
      .filter((m: any) => m.currentStock <= m.minStockAlert)
      .map((m: any) => ({ name: m.name, currentStock: m.currentStock, unit: m.unit }));

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders: todayOrders.length,
      topItems,
      criticalStockItems,
    };
  }
}
