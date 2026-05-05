import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/materials.dto';

@Injectable()
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(tenantId: string, data: CreateMaterialDto) {
    let categoryId = data.categoryId;

    if (!categoryId || categoryId === '') {
      const defaultCategory =
        (await this.prisma.category.findFirst({
          where: { tenantId, type: 'RAW_MATERIAL', name: 'Insumos Generales' },
        })) ||
        (await this.prisma.category.create({
          data: { tenantId, name: 'Insumos Generales', type: 'RAW_MATERIAL' },
        }));
      categoryId = defaultCategory.id;
    }

    return this.prisma.rawMaterial.create({
      data: {
        ...data,
        categoryId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, categoryId?: string) {
    return this.prisma.rawMaterial.findMany({
      where: {
        tenantId,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const material = await this.prisma.rawMaterial.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async update(tenantId: string, id: string, data: UpdateMaterialDto, userId?: string) {
    const oldMaterial = await this.findOne(tenantId, id);

    const isPriceChanged =
      (data.baseCost !== undefined && data.baseCost !== oldMaterial.baseCost) ||
      (data.replacementCost !== undefined && data.replacementCost !== oldMaterial.replacementCost);

    const result = await this.prisma.rawMaterial.update({
      where: { id },
      data,
    });

    if (isPriceChanged) {
      await this.audit.log(
        tenantId,
        userId || null,
        'PRICE_CHANGE',
        'RawMaterial',
        id,
        { baseCost: oldMaterial.baseCost, replacementCost: oldMaterial.replacementCost },
        { baseCost: result.baseCost, replacementCost: result.replacementCost },
      );
    }

    return result;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.rawMaterial.delete({
      where: { id },
    });
  }
}
