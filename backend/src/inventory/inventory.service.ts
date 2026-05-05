import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';
import { RecordTransactionDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  async recordTransaction(
    tenantId: string,
    data: RecordTransactionDto,
    tx?: Prisma.TransactionClient,
  ) {
    const execute = async (client: Prisma.TransactionClient | PrismaService) => {
      const material = await client.rawMaterial.findFirst({
        where: { id: data.rawMaterialId, tenantId },
      });

      if (!material) {
        throw new NotFoundException('Raw Material not found');
      }

      let effectiveQuantity = data.quantityChanged;
      if (data.type === 'SALE' || data.type === 'SHRINKAGE') {
        const yieldFactor = material.yieldPercentage / 100;
        effectiveQuantity = (Math.abs(data.quantityChanged) / yieldFactor) * -1;
      }

      const newStock = material.currentStock + effectiveQuantity;

      if (newStock < 0) {
        throw new BadRequestException(
          `Stock insuficiente para ${material.name}. Requerido: ${Math.abs(effectiveQuantity).toFixed(2)}, Disponible: ${material.currentStock.toFixed(2)}`,
        );
      }

      const transaction = await client.inventoryTransaction.create({
        data: {
          tenantId,
          rawMaterialId: data.rawMaterialId,
          type: data.type,
          quantityChanged: effectiveQuantity,
          costAtTransaction: material.baseCost,
          referenceId: data.referenceId,
        },
      });

      const updatedMaterial = await client.rawMaterial.update({
        where: { id: material.id },
        data: { currentStock: Math.round(newStock * 100) / 100 },
      });

      return { transaction, updatedMaterial };
    };

    if (tx) {
      return execute(tx);
    } else {
      return this.prisma.$transaction(async (innerTx: Prisma.TransactionClient) => execute(innerTx));
    }
  }

  async getCriticalStock(tenantId: string) {
    const materials = await this.prisma.rawMaterial.findMany({
      where: { tenantId },
    });
    return materials.filter((m: any) => m.currentStock <= m.minStockAlert);
  }

  async getTransactionHistory(tenantId: string, rawMaterialId?: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        tenantId,
        ...(rawMaterialId && { rawMaterialId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
