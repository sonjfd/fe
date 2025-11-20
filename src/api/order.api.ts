import axios from "@/services/axios.customize";

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