import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    sendDailySummary(tenantId: string): Promise<{
        summary: import("./whatsapp.service").DailySummaryData;
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    previewDailySummary(tenantId: string): Promise<import("./whatsapp.service").DailySummaryData>;
}
