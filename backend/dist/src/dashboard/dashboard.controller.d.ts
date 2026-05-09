import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(tenantId: string, range: string): Promise<{
        daySales: any;
        dayProfit: number;
        stockAlertsCount: number;
        stockAlerts: {
            id: string;
            tenantId: string;
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
        }[];
        salesTrend: {
            date: string;
            sales: number;
        }[];
        growthPercentage: number;
        pendingOrdersCount: number;
    }>;
    getPublicMenu(slug: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        logo: string | null;
        bannerImage: string | null;
        address: string | null;
        categories: {
            id: any;
            name: any;
            menuItems: any;
        }[];
    }>;
    purgeData(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
