import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExchangeRates {
  USD: number;
  VES: number;
  USDT: number;
  EUR: number;
}

export interface MultiCurrencyPrice {
  USD: number;
  VES: number;
  USDT: number;
  EUR: number;
}

@Injectable()
export class CurrenciesService implements OnModuleInit {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    this.logger.log('Iniciando sincronización automática de tasas...');
    // No bloqueamos el arranque del módulo, lo corremos en segundo plano
    this.syncAllTenants().catch(err =>
      this.logger.error(`Error en sincronización inicial: ${err}`)
    );
  }

  async syncAllTenants() {
    const tenants = await this.prisma.tenant.findMany();
    for (const tenant of tenants) {
      await this.syncExternalRates(tenant.id);
    }
  }

  async findAll(tenantId: string) {
    return this.prisma.currency.findMany({
      where: { tenantId },
      orderBy: { isBaseCurrency: 'desc' },
    });
  }

  async getRates(tenantId: string): Promise<ExchangeRates> {
    const currencies = await this.prisma.currency.findMany({
      where: { tenantId },
    });

    const rates: ExchangeRates = { USD: 1, VES: 55, USDT: 1, EUR: 0.92 };

    for (const c of currencies) {
      if (c.code in rates) {
        rates[c.code as keyof ExchangeRates] = c.exchangeRate;
      }
    }

    return rates;
  }

  /**
   * Convert a USD price to all currencies
   */
  convertToAll(priceUSD: number, rates: ExchangeRates): MultiCurrencyPrice {
    return {
      USD: Math.round(priceUSD * 100) / 100,
      VES: Math.round(priceUSD * rates.VES * 100) / 100,
      USDT: Math.round(priceUSD * rates.USDT * 100) / 100,
      EUR: Math.round(priceUSD * rates.EUR * 100) / 100,
    };
  }

  /**
   * Fetch real exchange rates from external APIs.
   * BCV: Uses pydolarve open API or similar
   * USDT: Uses Binance P2P rate
   * EUR: Uses European Central Bank
   */
  async syncExternalRates(tenantId: string): Promise<ExchangeRates> {
    const newRates: ExchangeRates = { USD: 1, VES: 55, USDT: 1, EUR: 0.92 };

    // --- BCV (VES) Rate ---
    try {
      const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares/bcv', {
        signal: AbortSignal.timeout(5000),
      });
      if (bcvRes.ok) {
        const bcvData = await bcvRes.json();
        if (bcvData?.venta) {
          newRates.VES = bcvData.venta;
          this.logger.log(`[BCV] Tasa actualizada: ${newRates.VES} VES/USD`);
        }
      }
    } catch (err) {
      this.logger.warn(`[BCV] Error fetching rate, using stored value. ${err}`);
      // Fallback to existing rate in DB if API fails
      const existing = await this.prisma.currency.findFirst({ where: { tenantId, code: 'VES' } });
      if (existing) newRates.VES = existing.exchangeRate;
    }

    // --- EUR Rate ---
    try {
      const eurRes = await fetch(
        'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR',
        { signal: AbortSignal.timeout(5000) },
      );
      if (eurRes.ok) {
        const eurData = await eurRes.json();
        if (eurData?.rates?.EUR) {
          newRates.EUR = eurData.rates.EUR;
          this.logger.log(`[EUR] Tasa actualizada: ${newRates.EUR} EUR/USD`);
        }
      }
    } catch (err) {
      this.logger.warn(`[EUR] Error fetching rate. ${err}`);
    }

    // --- USDT Rate (pegged to 1 USD, but may have slight deviations) ---
    try {
      const usdtRes = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDC',
        { signal: AbortSignal.timeout(5000) },
      );
      if (usdtRes.ok) {
        const usdtData = await usdtRes.json();
        if (usdtData?.price) {
          newRates.USDT = parseFloat(usdtData.price);
          this.logger.log(`[USDT] Rate: ${newRates.USDT}`);
        }
      }
    } catch (err) {
      // USDT is generally 1:1 with USD
      newRates.USDT = 1;
    }

    // Persist to database
    for (const [code, rate] of Object.entries(newRates)) {
      await this.prisma.currency.updateMany({
        where: { tenantId, code },
        data: { exchangeRate: rate },
      });
    }

    return newRates;
  }

  async updateRate(tenantId: string, currencyId: string, newRate: number) {
    return this.prisma.currency.update({
      where: { id: currencyId },
      data: { exchangeRate: newRate },
    });
  }
}
