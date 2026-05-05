import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: {
        name: string;
        type: CategoryType;
    }): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    findAll(tenantId: string, type?: CategoryType): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    update(tenantId: string, id: string, data: {
        name?: string;
        type?: CategoryType;
    }): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
}
