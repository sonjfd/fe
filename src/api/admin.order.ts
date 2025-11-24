import axios from "@/services/axios.customize";

export const getAllOrder = (query: string) => {
    const backendUrl = `/api/v1/admin/orders?${query}`;
    return axios.get<IBackendRes<IModelPaginate<Order>>>(backendUrl)
}

export const getOrderDetail = (id: number) => {
    const backendUrl = `/api/v1/admin/orders/${id}`;
    return axios.get<IBackendRes<OneOrder>>(backendUrl)
}

export const updateOrder = (id: number, paymentStatus: string, orderStatus: string) => {
    const backendUrl = `/api/v1/admin/orders/${id}`;
    return axios.put<IBackendRes<Order>>(backendUrl, { paymentStatus, orderStatus })
}