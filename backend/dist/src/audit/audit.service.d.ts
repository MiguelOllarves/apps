import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(tenantId: string, userId: string | null, action: string, entity: string, entityId: string, oldValue: Prisma.InputJsonValue, newValue: Prisma.InputJsonValue): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entity: string;
        entityId: string;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
    }>;
}
