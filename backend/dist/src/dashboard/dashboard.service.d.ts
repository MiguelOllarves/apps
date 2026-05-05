import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
export declare class DashboardService {
    private prisma;
    private inventory;
    constructor(prisma: PrismaService, inventory: InventoryService);
    getMetrics(tenantId: string, range?: string): Promise<{
        daySales: any;
        dayProfit: number;
        stockAlertsCount: number;
        stockAlerts: {
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
        }[];
        salesTrend: {
            date: string;
            sales: number;
        }[];
        growthPercentage: number;
        pendingOrdersCount: number;
    }>;
    getPublicMenu(slug: string): Promise<{
        name: string;
        logo: null;
        categories: {
            id: any;
            name: any;
            menuItems: any;
        }[];
    } | null>;
    purgeData(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
