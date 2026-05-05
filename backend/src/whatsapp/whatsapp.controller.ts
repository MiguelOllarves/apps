import { Controller, Post, Headers, Get } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Trigger daily summary generation and delivery for the tenant
   */
  @Post('daily-summary')
  async sendDailySummary(@Headers('x-tenant-id') tenantId: string) {
    const summary = await this.whatsappService.generateDailySummary(tenantId);

    // In production, the admin phone number would come from tenant settings
    const result = await this.whatsappService.sendDailySummary('+58000000000', summary);

    return {
      ...result,
      summary,
    };
  }

  /**
   * Preview the daily summary data without sending
   */
  @Get('daily-summary/preview')
  async previewDailySummary(@Headers('x-tenant-id') tenantId: string) {
    return this.whatsappService.generateDailySummary(tenantId);
  }
}
