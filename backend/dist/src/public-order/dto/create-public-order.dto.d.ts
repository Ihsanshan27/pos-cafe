declare class PublicOrderItemDto {
    menuId: string;
    quantity: number;
    notes?: string;
}
export declare class CreatePublicOrderDto {
    customerName?: string;
    items: PublicOrderItemDto[];
}
export {};
