export interface StockOutItemResDTO {
    productVariantId: number;
    sku: string;
    productName: string;
    quantity: number;
}

export interface StockOutSimpleResDTO{
    id:number;
    orderId:number;
    type: string;
    createdAt: string;
}

export interface StockOutResDTO{
    id: number;
    orderId: number;
    type: string;
    createdAt: string;
    items: StockOutItemResDTO[]
}

export interface PaginationDTO<T>{
    page: number;
    size: number;
    total: number;
    items: T;
}
export interface IBackendRes<T> {
    data: T;
    message: string;
    status: number;
}