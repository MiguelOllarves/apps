import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RecordTransactionDto } from './dto/inventory.dto';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    recordTransaction(tenantId: string, data: RecordTransactionDto, tx?: Prisma.TransactionClient): Promise<{
        transaction: {
            id: string;
            tenantId: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.TransactionType;
            rawMaterialId: string;
            quantityChanged: number;
            referenceId: string | null;
            costAtTransaction: number;
        };
        updatedMaterial: {
            id: string;
            name: string;
            unit: import("@prisma/client").$Enums.UnitType;
            currentStock: number;
            minStockAlert: number;
            baseCost: number;
            replacementCost: number;
            yieldPercentage: number;
            shrinkagePercentage: number;
            categoryId: string;
            updatedAt: Date;
            tenantId: string;
        };
    }>;
    getCriticalStock(tenantId: string): Promise<{
        id: string;
        name: string;
        unit: import("@prisma/client").$Enums.UnitType;
        currentStock: number;
        minStockAlert: number;
        baseCost: number;
        replacementCost: number;
        yieldPercentage: number;
        shrinkagePercentage: number;
        categoryId: string;
        updatedAt: Date;
        tenantId: string;
    }[]>;
    getTransactionHistory(tenantId: string, rawMaterialId?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        rawMaterialId: string;
        quantityChanged: number;
        referenceId: string | null;
        costAtTransaction: number;
    }[]>;
}
