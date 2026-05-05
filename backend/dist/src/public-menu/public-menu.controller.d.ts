import { PrismaService } from '../prisma/prisma.service';
import { CurrenciesService } from '../currencies/currencies.service';
interface PublicMenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    prices: {
        USD: number;
        VES: number;
        USDT: number;
        EUR: number;
    };
}
interface PublicMenuCategory {
    name: string;
    items: PublicMenuItem[];
}
export declare class PublicMenuController {
    private prisma;
    private currenciesService;
    constructor(prisma: PrismaService, currenciesService: CurrenciesService);
    getMenuBySlug(slug: string): Promise<{
        restaurantName: string;
        tenantId: string;
        slug: string | null;
        logo: string | null;
        coverImage: string | null;
        address: string | null;
        phone: string | null;
        instagram: string | null;
        whatsapp: string | null;
        rates: import("../currencies/currencies.service").ExchangeRates;
        menu: PublicMenuCategory[];
    }>;
}
export {};
