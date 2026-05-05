import { UnitType } from '@prisma/client';
export declare class CreateMaterialDto {
    name: string;
    unit: UnitType;
    currentStock: number;
    minStockAlert: number;
    baseCost: number;
    replacementCost: number;
    yieldPercentage: number;
    shrinkagePercentage: number;
    categoryId?: string;
}
export declare class UpdateMaterialDto {
    name?: string;
    unit?: UnitType;
    currentStock?: number;
    minStockAlert?: number;
    baseCost?: number;
    replacementCost?: number;
    yieldPercentage?: number;
    shrinkagePercentage?: number;
    categoryId?: string;
}
