import { TransactionStatus, PaymentMethod, OrderType } from '@prisma/client';
export declare class TransactionItemDto {
    menuId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateTransactionDto {
    items: TransactionItemDto[];
    status?: TransactionStatus;
    paymentMethod?: PaymentMethod;
    orderType?: OrderType;
    tableNumber?: string;
    discountAmount?: number;
    taxAmount?: number;
    shiftId?: string;
    customerName?: string;
    customerId?: string;
}
