export interface IRecentOrder {
    id: number;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
}

export interface IMonthlyRevenue{
    month: string;
    revenue: number;
}

export interface ITopProduct{
    name: string;
    sold: number;
    revenue: number;
}

export interface ICategoryShare{
    name: string;
    productCount: number;
}



export interface IDashboardStats{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    recentOrders: IRecentOrder[];
    monthlyRevenue: IMonthlyRevenue[];
    topProducts: ITopProduct[];
    categoryShare: ICategoryShare[];
}