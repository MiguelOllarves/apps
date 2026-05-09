import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) { }

  async updateSettings(tenantId: string, data: { name?: string; address?: string; logo?: string; bannerImage?: string; primaryColor?: string; slug?: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        address: data.address,
        logo: data.logo,
        bannerImage: data.bannerImage,
        primaryColor: data.primaryColor,
        slug: data.slug,
      },
    });
  }

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }
}
