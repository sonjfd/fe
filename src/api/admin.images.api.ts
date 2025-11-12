import axios from 'services/axios.customize'

export interface IProductImage {
    id: number;
    url: string
}

export const createProduct = (productId: number, payload: { url: string }) => {
    const urlBackEnd = `/api/v1/admin/products/${productId}/images`;
    return axios.post<IBackendRes<IProductImage>>(urlBackEnd, payload)
}

export const getAllImagesByProduct = (productId: number) => {
    const urlBackEnd = `/api/v1/admin/products/${productId}/images`
    return axios.get<IBackendRes<IProductImage[]>>(urlBackEnd)
}

export const updateImage = (id: number, payload: { url: string }) => {
    const urlBackEnd = `/api/v1/admin/images/${id}`
    return axios.put<IBackendRes<IProductImage>>(urlBackEnd, payload)
}

export const deleteImage = (id: number) => {
    const urlBackEnd = `/api/v1/admin/images/${id}`
    return axios.delete(urlBackEnd)
}