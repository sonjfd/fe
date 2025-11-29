export interface IStockAdjItemRes{
    productVariantId: number;
    sku: string;
    productVariantName: string;
    oldQuantity: number;
    changeQuantity: number;
    newQuantity: number;
}

export interface IStockAdjRes{
    id: number;
    reason: string;
    createdAt: string;
    items: IStockAdjItemRes[];
}

export interface IStockAdjCreateItemReq{
    productVariantId: number;
    changeQuantity: number;
}

export interface IStockAdjCreateReq{
    reason: string;
    items: IStockAdjCreateItemReq[];
}

export interface IPagination<T>{
    items: T;
    current: number;
    pageSize: number;
    pages: number;
}
