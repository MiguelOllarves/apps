import { CurrenciesService } from './currencies.service';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
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
    getRates(tenantId: string): Promise<import("./currencies.service").ExchangeRates>;
    syncRates(tenantId: string): Promise<import("./currencies.service").ExchangeRates>;
    updateRate(tenantId: string, id: string, rate: number): Promise<{
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
