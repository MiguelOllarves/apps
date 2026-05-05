import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    tenantId: string,
    userId: string | null,
    action: string,
    entity: string,
    entityId: string,
    oldValue: Prisma.InputJsonValue,
    newValue: Prisma.InputJsonValue,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue || {},
        newValue: newValue || {},
      },
    });
  }
}
