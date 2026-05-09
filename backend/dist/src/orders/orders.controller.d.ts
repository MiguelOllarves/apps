import { OrdersService } from './orders.service';
import { CreateOrderDto, CreatePublicOrderDto } from './dto/orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(tenantId: string, dto: CreateOrderDto): Promise<{
        items: ({
            menuItem: {
                id: string;
                currencyId: string;
                tenantId: string;
                recipeId: string;
                categoryId: string;
                price: number;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            subTotal: number;
            menuItemId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        type: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
        createdAt: Date;
        userId: string | null;
        customerId: string | null;
        currencyId: string;
        deliveryUserId: string | null;
        tenantId: string;
    }>;
    confirmShipment(tenantId: string, orderId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        type: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
        createdAt: Date;
        userId: string | null;
        customerId: string | null;
        currencyId: string;
        deliveryUserId: string | null;
        tenantId: string;
    }>;
    createPublicOrder(headerTenantId: string, dto: CreatePublicOrderDto): Promise<{
        tenant: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            slug: string | null;
            domain: string | null;
            logo: string | null;
            rif: string | null;
            instagram: string | null;
            facebook: string | null;
            whatsapp: string | null;
            coverImage: string | null;
            primaryColor: string | null;
            bannerImage: string | null;
        };
        items: ({
            menuItem: {
                recipe: {
                    id: string;
                    type: import("@prisma/client").$Enums.RecipeType;
                    tenantId: string;
                    name: string;
                    description: string | null;
                    genericCost: number;
                    nutritionalInfo: string | null;
                    imageUrl: string | null;
                };
            } & {
                id: string;
                currencyId: string;
                tenantId: string;
                recipeId: string;
                categoryId: string;
                price: number;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            subTotal: number;
            menuItemId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        type: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
        createdAt: Date;
        userId: string | null;
        customerId: string | null;
        currencyId: string;
        deliveryUserId: string | null;
        tenantId: string;
    }>;
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
    findAll(tenantId: string, limit?: number): Promise<({
        user: {
            id: string;
            createdAt: Date;
            tenantId: string;
            name: string;
            updatedAt: Date;
            phone: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.Role;
            notes: string | null;
        } | null;
        customer: {
            id: string;
            createdAt: Date;
            tenantId: string;
            name: string;
            phone: string;
            email: string | null;
            address: string | null;
        } | null;
        items: ({
            menuItem: {
                recipe: {
                    id: string;
                    type: import("@prisma/client").$Enums.RecipeType;
                    tenantId: string;
                    name: string;
                    description: string | null;
                    genericCost: number;
                    nutritionalInfo: string | null;
                    imageUrl: string | null;
                };
            } & {
                id: string;
                currencyId: string;
                tenantId: string;
                recipeId: string;
                categoryId: string;
                price: number;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            subTotal: number;
            menuItemId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        type: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
        createdAt: Date;
        userId: string | null;
        customerId: string | null;
        currencyId: string;
        deliveryUserId: string | null;
        tenantId: string;
    })[]>;
    getCustomerHistory(tenantId: string, userId: string): Promise<({
        items: ({
            menuItem: {
                id: string;
                currencyId: string;
                tenantId: string;
                recipeId: string;
                categoryId: string;
                price: number;
                isAvailable: boolean;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            subTotal: number;
            menuItemId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        type: import("@prisma/client").$Enums.OrderType;
        tableNumber: string | null;
        totalAmount: number;
        paymentMethod: string | null;
        paymentCurrencyId: string | null;
        exchangeRateAtPayment: number | null;
        paymentProofUrl: string | null;
        deliveryNotes: string | null;
        clientLocation: string | null;
        createdAt: Date;
        userId: string | null;
        customerId: string | null;
        currencyId: string;
        deliveryUserId: string | null;
        tenantId: string;
    })[]>;
}
