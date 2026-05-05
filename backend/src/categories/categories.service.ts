import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; type: CategoryType }) {
    return this.prisma.category.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, type?: CategoryType) {
    return this.prisma.category.findMany({
      where: {
        tenantId,
        ...(type && { type }),
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(tenantId: string, id: string, data: { name?: string; type?: CategoryType }) {
    await this.findOne(tenantId, id); // Ensure it exists and belongs to tenant
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id); // Ensure it exists and belongs to tenant
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
