import { OrderType } from '@prisma/client';
export declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateOrderDto {
    userId?: string;
    type: OrderType;
    tableNumber?: string;
    currencyId?: string;
    items: OrderItemDto[];
}
export declare class CreatePublicOrderDto {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    tenantId?: string;
    tableNumber?: string;
    items: {
        id: string;
        quantity: number;
        price: number;
    }[];
}
