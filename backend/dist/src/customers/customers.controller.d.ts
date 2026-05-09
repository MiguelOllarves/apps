import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../auth/dto/auth.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(tenantId: string): Promise<{
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
    }[]>;
    create(tenantId: string, dto: CreateCustomerDto): Promise<{
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
    }>;
    update(tenantId: string, id: string, dto: UpdateCustomerDto): Promise<{
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
    }>;
    remove(tenantId: string, id: string): Promise<{
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
    }>;
    getMetrics(tenantId: string, id: string): Promise<{
        customer: {
            orders: ({
                items: ({
                    menuItem: {
                        recipe: {
                            id: string;
                            name: string;
                            tenantId: string;
                            type: import("@prisma/client").$Enums.RecipeType;
                            description: string | null;
                            imageUrl: string | null;
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
            })[];
        } & {
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
        };
        totalOrders: number;
        totalSpent: any;
        history: ({
            items: ({
                menuItem: {
                    recipe: {
                        id: string;
                        name: string;
                        tenantId: string;
                        type: import("@prisma/client").$Enums.RecipeType;
                        description: string | null;
                        imageUrl: string | null;
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
        })[];
    }>;
}
