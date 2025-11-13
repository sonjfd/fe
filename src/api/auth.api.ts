import axios from 'services/axios.customize'

export const loginApi = (email: string, password: string) => {
    const urlBackEnd = "/api/v1/auth/login";
    return axios.post<IBackendRes<ILogin>>(urlBackEnd, { email, password })
}

export const registerApi = (fullName: string, email: string, password: string, phone: string, gender: string) => {
    const urlBackEnd = "/api/v1/auth/register";
    return axios.post<IBackendRes<ILogin>>(urlBackEnd, { fullName, email, password, phone, gender })
}

export const fetchAccountAPI = () => {
    const urlBackend = "/api/v1/auth/account";
    return axios.get<IBackendRes<IAccount>>(urlBackend)
}

export const logoutApi = () => {
    const urlBackend = "/api/v1/auth/logout";
    return axios.post(urlBackend)
}



export const fetchCategories = async (query: string) => {
    const url = `api/v1/admin/categories?${query}`;
    const res = await axios.get<IBackendRes<IModelPaginate<ICategoryRow>>>(url);
    return res.data;
};



export const createCategory = (payload: { name: string; description?: string; parentId?: number | null }) => {
    return axios.post<IBackendRes<ICategoryRow>>(`api/v1/admin/categories`, payload);
};

export const updateCategory = (id: number, payload: { name: string; description?: string; parentId?: number | null }) => {
    return axios.put<IBackendRes<ICategoryRow>>(`api/v1/admin/categories/${id}`, payload);
};

export const deleteCategory = (id: number) => {
    return axios.delete<IBackendRes<any>>(`api/v1/admin/categories/${id}`);
};


export const fetchCategoriesForSelect = async () => {
    const url = `api/v1/admin/categories?page=1&size=1000&sortField=createdAt&sortDirection=desc`;
    const res = await axios.get<IBackendRes<IModelPaginate<ICategoryRow>>>(url);
    return res.data?.items ?? [];
};
