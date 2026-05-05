import { PrismaService } from '../prisma/prisma.service';
export interface DailySummaryData {
    totalSales: number;
    totalOrders: number;
    topItems: {
        name: string;
        quantity: number;
    }[];
    criticalStockItems: {
        name: string;
        currentStock: number;
        unit: string;
    }[];
}
export declare class WhatsappService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendOrderConfirmation(phoneNumber: string, orderId: string, customerName: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    sendDailySummary(phoneNumber: string, summary: DailySummaryData): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    generateDailySummary(tenantId: string): Promise<DailySummaryData>;
}
