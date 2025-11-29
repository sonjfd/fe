export interface IApiResponse<T> {
    code: number;
    message: string;
    data: T;
}


export interface IPagination<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
}


export interface IStockInCreateReq {
    supplierName: string;
    items: {
        productVariantId: number;
        sku: string;
        quantity: number;
        cost: number;
    }[];
}


export interface IStockIn {
    id: number;
    supplierName: string;
    sku:string;
    totalQuantity: number;
    status: 'PENDING' | 'CANCELLED' | 'CONFIRMED';
    note?: string;
    totalCost: number;
    createdAt: string;
}


export interface IStockInDetail extends IStockIn {
    items: {
        id: number;
        productVariantId: number;
        productName: string;
        sku: string;
        quantity: number;
        cost: number;
        totalPrice: number;
    }[];
}

export interface StockResDTO {
    variantId: number;
    variantName:string;
    variantQuantity: number;
    quantity: number;
    soldQuantity: number;
}
