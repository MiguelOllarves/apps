import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, role: 'CLIENT' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: { name: string; email: string; phone?: string; notes?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    return this.prisma.user.create({
      data: {
        ...data,
        tenantId,
        role: 'CLIENT',
        passwordHash: 'customer-no-password', // Customers don't log in traditionally yet
      },
    });
  }

  async update(tenantId: string, id: string, data: { name?: string; email?: string; phone?: string; notes?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        tenantId, // Ensure tenant consistency
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.user.delete({
      where: { id, tenantId },
    });
  }

  async getMetrics(tenantId: string, customerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: customerId, tenantId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { menuItem: { include: { recipe: true } } } } }
        }
      }
    });

    if (!user) throw new NotFoundException('Customer not found');

    const totalSpent = user.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    return {
      customer: user,
      totalOrders: user.orders.length,
      totalSpent,
      history: user.orders,
    };
  }
}
