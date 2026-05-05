import { PrismaService } from '../prisma/prisma.service';
import { RecipesService } from '../recipes/recipes.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateOrderDto, CreatePublicOrderDto } from './dto/orders.dto';
export declare class OrdersService {
    private prisma;
    private recipesService;
    private whatsappService;
    constructor(prisma: PrismaService, recipesService: RecipesService, whatsappService: WhatsappService);
    createOrder(tenantId: string, data: CreateOrderDto): Promise<{
        items: ({
            menuItem: {
                id: string;
                categoryId: string;
                tenantId: string;
                price: number;
                currencyId: string;
                recipeId: string;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            orderId: string;
            menuItemId: string;
            unitPrice: number;
            subTotal: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OrderType;
        userId: string | null;
        currencyId: string;
        customerId: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryUserId: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
    }>;
    shipOrder(tenantId: string, orderId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OrderType;
        userId: string | null;
        currencyId: string;
        customerId: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryUserId: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
    }>;
    createPublicOrder(tenantId: string, data: CreatePublicOrderDto): Promise<{
        tenant: {
            id: string;
            name: string;
            updatedAt: Date;
            slug: string | null;
            domain: string | null;
            logo: string | null;
            rif: string | null;
            address: string | null;
            phone: string | null;
            instagram: string | null;
            facebook: string | null;
            whatsapp: string | null;
            coverImage: string | null;
            primaryColor: string | null;
            bannerImage: string | null;
            createdAt: Date;
        };
        items: ({
            menuItem: {
                recipe: {
                    id: string;
                    name: string;
                    tenantId: string;
                    type: import("@prisma/client").$Enums.RecipeType;
                    imageUrl: string | null;
                    description: string | null;
                    genericCost: number;
                    nutritionalInfo: string | null;
                };
            } & {
                id: string;
                categoryId: string;
                tenantId: string;
                price: number;
                currencyId: string;
                recipeId: string;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            orderId: string;
            menuItemId: string;
            unitPrice: number;
            subTotal: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OrderType;
        userId: string | null;
        currencyId: string;
        customerId: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryUserId: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
    }>;
    getCustomerHistory(tenantId: string, userId: string): Promise<({
        items: ({
            menuItem: {
                id: string;
                categoryId: string;
                tenantId: string;
                price: number;
                currencyId: string;
                recipeId: string;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            orderId: string;
            menuItemId: string;
            unitPrice: number;
            subTotal: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OrderType;
        userId: string | null;
        currencyId: string;
        customerId: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryUserId: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
    })[]>;
    findAll(tenantId: string, limit?: number): Promise<({
        user: {
            id: string;
            name: string;
            updatedAt: Date;
            tenantId: string;
            phone: string | null;
            createdAt: Date;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.Role;
            notes: string | null;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OrderType;
        userId: string | null;
        currencyId: string;
        customerId: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryUserId: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
    })[]>;
    getMetrics(tenantId: string): Promise<{
        totalSales: number;
        orderCount: number;
        growthPercentage: number;
        simulableMenu: {
            id: string;
            name: string;
            price: number;
            currencyId: string | undefined;
        } | null;
    }>;
}
