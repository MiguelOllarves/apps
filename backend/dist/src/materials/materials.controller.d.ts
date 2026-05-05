import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/materials.dto';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(tenantId: string, dto: CreateMaterialDto): Promise<{
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
    }>;
    findAll(tenantId: string, categoryId?: string): Promise<({
        category: {
            id: string;
            name: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.CategoryType;
        };
    } & {
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
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        category: {
            id: string;
            name: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.CategoryType;
        };
    } & {
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
    }>;
    update(tenantId: string, id: string, dto: UpdateMaterialDto): Promise<{
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
    }>;
    remove(tenantId: string, id: string): Promise<{
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
    }>;
}
