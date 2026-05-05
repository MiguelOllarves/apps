import { OnModuleInit } from '@nestjs/common';
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
export declare class CurrenciesService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    syncAllTenants(): Promise<void>;
    findAll(tenantId: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        updatedAt: Date;
        tenantId: string;
        code: string;
        exchangeRate: number;
        isBaseCurrency: boolean;
    }[]>;
    getRates(tenantId: string): Promise<ExchangeRates>;
    convertToAll(priceUSD: number, rates: ExchangeRates): MultiCurrencyPrice;
    syncExternalRates(tenantId: string): Promise<ExchangeRates>;
    updateRate(tenantId: string, currencyId: string, newRate: number): Promise<{
        symbol: string;
        id: string;
        name: string;
        updatedAt: Date;
        tenantId: string;
        code: string;
        exchangeRate: number;
        isBaseCurrency: boolean;
    }>;
}
