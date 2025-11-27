import axios from "@/services/axios.customize";
export interface ApplicableVoucher {
    id: number;
    code: string;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    maxDiscountAmount?: number | null;
    minOrderValue?: number | null;
    imageUrl?: string | null;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export const getAvailableVouchers = (orderAmount: number) => {
    const backEnd = "/api/v1/vouchers/available";
    return axios.get<IBackendRes<ApplicableVoucher[]>>(backEnd, {
        params: { orderAmount },
    });
};
export const getShippingFree = (addressId: number) => {
    const backEnd = `/shipping/quote`
    return axios.post<ShippingQuote>(backEnd, { addressId })
}


export const createOrder = (payload: CreateOrderRequest) => {
    const backEnd = "/api/v1/orders/create"
    return axios.post<IBackendRes<OrderCreateResponse>>(backEnd, payload)
}


export const getUserAddresses = () => {
    return axios.get<IBackendRes<IAddress[]>>("/api/v1/account/addresses");

}

export const updatePaymentStatus = (uuid: string, status: string) => {
    return axios.put("/api/v1/orders/update-payment-status", { uuid, status });
};

export const getUserOrder = (query: string) => {
    const backendUrl = `/api/v1/orders?${query}`;
    return axios.get<IBackendRes<IModelPaginate<Order>>>(backendUrl)

}

export const getOrderDetail = (id: number) => {
    const backendUrl = `/api/v1/orders/${id}`;
    return axios.get<IBackendRes<OneOrder>>(backendUrl)

}

export const vnPayPayment = (orderId: number, totalAmount: number) => {
    const backendUrl = `/api/v1/payment/vn-pay`
    return axios.post<IBackendRes<VNPayResponse>>(backendUrl, { orderId, totalAmount })

}

export const cancelUrl = (id: number) => {
    const backendUrl = `/api/v1/orders/${id}`
    return axios.delete(backendUrl)
}