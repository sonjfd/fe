import axios from 'services/axios.customize'

interface Value {
    id: number
}

interface Item {
    values: Value[];
    price: number;
    stock: number;

}

interface PlayLoadVariant {
    items: Item[]
}

interface ListItemRes {
    id: number;
    sku: string;
    price: number;
    stock: number;
    sold: number;
    attributes: VariantAttributes[]

}

interface VariantAttributes {
    id: number;
    name: string;
    value: string
}

export const addVariantsApi = (productId: number, payload: PlayLoadVariant) => {
    const urlBackEnd = `/api/v1/admin/products/${productId}/variants`;
    return axios.post<IBackendRes<Item[]>>(urlBackEnd, payload);
}

export const getAllVariantByProductId = (productId: number, query: string) => {
    const urlBackEnd = `/api/v1/admin/products/${productId}/variants?${query}`;
    return axios.get<IBackendRes<IModelPaginate<ListItemRes>>>(urlBackEnd)
}

export const updateVariantAPI = (variantId: number) => {
    const urlBackEnd = `/api/v1/admin/variants/${variantId}`
    return axios.put<IBackendRes<ListItemRes>>(urlBackEnd)

}

export const deleteVariantAPI = (variantId: number) => {
    const urlBackEnd = `/api/v1/admin/variants/${variantId}`
    return axios.delete<IBackendRes<ListItemRes>>(urlBackEnd)

}