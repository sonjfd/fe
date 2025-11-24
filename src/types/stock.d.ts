export interface StockResDTO{
    id: number;
    variantId: number;
    sku: string;
    productName: string;
    variantName: string;
    quantity: number;
    reserved: number;
    available: number;
}

export interface StockInItemResDTO{
    id: number;
    productVariantId: number;
    variantName: string;
    quantity: number;
    cost: number;
}

export interface StockInResDTO{
    id: number;
    supplierName: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
    item: StockInItemResDTO[];
}

export interface StockInCreateReqDTO{
    supplierName: string;
    items: {
        productVariantId: number;
        quantity: number;
        cost: number;
    }[];
}