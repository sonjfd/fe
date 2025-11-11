import axios from 'services/axios.customize'

export const fetchChildCategories = async (): Promise<IChildCategory[]> => {
    const backEndUrl = 'api/v1/admin/categories/children';
    const res = await axios.get<IBackendRes<IChildCategory[]>>(backEndUrl);
    return res.data!;
};

export const createProduct = (code: string, name: string, category: { id: string }) => {
    const backEndUrl = 'api/v1/admin/products';
    return axios.post<IBackendRes<ICreateProduct>>(backEndUrl, { code, name, category })
}

export const fetchProducts = async (query: string): Promise<IProductTable[]> => {
    const backEndUrl = `api/v1/admin/products?${query}`
    const res = await axios.get<IBackendRes<IModelPaginate<IProductTable>>>(backEndUrl);
    return res.data?.items ?? [];
};

export const updateProduct = async (id: number, code: string, name: string, category: { id: string }) => {
    const backEndUrl = `api/v1/admin/products/${id}`
    return axios.put<IBackendRes<ICreateProduct>>(backEndUrl, { code, name, category })
}

export const deleteProduct = async (id: number) => {
    const backEndUrl = `api/v1/admin/products/${id}`
    await axios.delete(backEndUrl)

}



export const fetchUsers = async (query: string) => {
    const url = `api/v1/admin/users?${query}`;
    const res = await axios.get<IBackendRes<IModelPaginate<IUser>>>(url);
    return res.data;
};

export const fetchUserDetail = async (id: string | number) => {
    const url = `api/v1/admin/users/${id}`;
    const res = await axios.get<IBackendRes<IUser>>(url);
    return res.data;
};

export const createUser = (payload: ICreateUserReq) => {
    const url = `api/v1/admin/users`;
    return axios.post<IBackendRes<IUser>>(url, payload);
};


export const updateUser = (payload: IUpdateUserReq) => {
    const url = `api/v1/admin/users`;
    return axios.put<IBackendRes<IUser>>(url, payload);
};


export const deleteUser = (id: number | string) => {
    const url = `api/v1/admin/users/${id}`;
    return axios.delete<IBackendRes<null>>(url);
};
