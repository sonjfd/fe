import axios from "@/services/axios.customize";


export const getAllNotificationOfAdmin = (query: string,) => {
    const url = `/api/v1/admin/notifications?${query}`
    return axios.get<IBackendRes<IModelPaginate<AdminNotification>>>(url)
}

export const updateNotificationOfAdmin = (id: number) => {
    const url = `/api/v1/admin/notifications/${id}`
    return axios.put(url)
}