import axios from 'services/axios.customize'

export interface AttributeName {
    id: number;
    code: string;
    name: string;
    values: AttributeValue[]
}

export interface AttributeValue {
    id: number;
    value: string;
}

export interface CreateAttribute {
    id: number;
    code: string;
    name: string;
}

export interface CreateAttributeValue {
    id: number;
    value: string
}

export const fetchProductAttribute = (id: number) => {
    const urlBackEnd = `/api/v1/admin/products/${id}/attributes`
    return axios.get<IBackendRes<AttributeName[]>>(urlBackEnd)
}

export const addProductAttributeName = (code: string, name: string, product: { id: number }) => {
    const urlBackEnd = `/api/v1/admin/products/attributes`;
    return axios.post<IBackendRes<CreateAttribute>>(urlBackEnd, { code, name, product })
}

export const updateProductAttributeName = (id: number, code: string, name: string) => {
    const urlBackEnd = `/api/v1/admin/products/attributes/${id}`
    return axios.put<IBackendRes<CreateAttribute>>(urlBackEnd, { code, name })
}

export const deletedProductAttributeName = (id: number) => {
    const urlBackEnd = `/api/v1/admin/products/attributes/${id}`
    return axios.delete<IBackendRes<CreateAttribute>>(urlBackEnd)
}

export const addAttributeValue = (value: string, attribute: { id: number }) => {
    const urlBackEnd = "/api/v1/admin/attribute-values"
    return axios.post<IBackendRes<CreateAttributeValue>>(urlBackEnd, { value, attribute })
}

export const updateAttributeValue = (id: number, value: string) => {
    const urlBackEnd = `/api/v1/admin/attribute-values/${id}`
    return axios.post<IBackendRes<CreateAttributeValue>>(urlBackEnd, { value })
}

export const deleteAttributeValue = (id: number) => {
    const urlBackEnd = `/api/v1/admin/attribute-values/${id}`
    return axios.delete(urlBackEnd)

}


