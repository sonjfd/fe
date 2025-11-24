import axios from 'services/axios.customize'

export const loginAPI = (username: string, password: string) => {
    const urlBackEnd = "/api/v1/auth/login";
    return axios.post<IBackendRes<ILogin>>(urlBackEnd, { username, password }, {
        headers: {
            delay: 3000
        }
    });
}

export const registerApi = (fullName: string, email: string, password: string, phone: string) => {
    const urlBackend = "/api/v1/user/register";
    return axios.post<IBackendRes<IRegister>>(urlBackend, { fullName, email, password, phone })
}

export const fetchAccountAPI = () => {
    const url = "/api/v1/auth/account";
    return axios.get<IBackendRes<IFetchAccount>>(url, {
        headers: {
            delay: 2000
        }
    })
}

export const logoutApi = () => {
    const urlBackend = "/api/v1/auth/logout";
    return axios.post<IBackendRes<string>>(urlBackend);
}

export const getUsersApi = (query: string) => {
    const urlBackend = `/api/v1/user?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend)
}

export const createUserAPI = (fullName: string, password: string, email: string, phone: string) => {
    const urlBackend = `/api/v1/user`;
    return axios.post<IBackendRes<IRegister>>(urlBackend, { fullName, password, email, phone });
}

export const bulkCreateUserAPI = (data: {
    fullName: string;
    password: string;
    email: string;
    phone: string
}[]) => {
    const urlBackend = '/api/v1/user/bulk-create';
    return axios.post<IBackendRes<IResponseImport>>(urlBackend, data)
}

export const updateUserAPI = (_id: string, fullName: string, phone: string) => {
    const urlBackend = '/api/v1/user'
    return axios.put<IBackendRes<IRegister>>(urlBackend, { _id, fullName, phone })
}

export const deleteUSerAPI = (_id: string) => {
    const urlBackEnd = `/api/v1/user/${_id}`
    return axios.delete(urlBackEnd)
}

export const getBooksAPI = (query: string) => {
    const urlBackEnd = `/api/v1/book?${query}`
    return axios.get<IBackendRes<IModelPaginate<IBookTable>>>(urlBackEnd, {
        headers: {
            delay: 1500
        }
    })
}

export const getCategoryAPI = () => {
    const urlBackend = `/api/v1/database/category`;
    return axios.get<IBackendRes<string[]>>(urlBackend);
}

export const uploadFileAPI = (fileImg: any, folder: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append("fileImg", fileImg);
    bodyFormData.append("folder", folder);

    return axios.post<IBackendRes<{ fileUploaded: string }>>(
        `/api/v1/file/upload`,
        bodyFormData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                "upload-type": folder
            },
        }
    );
};


export const createBookAPI = (
    mainText: string, author: string,
    price: number, quantity: number, category: string,
    thumbnail: string, slider: string[]
) => {
    const urlBackend = "/api/v1/book";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { mainText, author, price, quantity, category, thumbnail, slider })
}

export const deleteBook = (id: string) => {
    const url = `/api/v1/book/${id}`
    return axios.delete(url)
}

export const updateBookAPI = (_id: string, mainText: string, author: string,
    price: number, quantity: number, category: string,
    thumbnail: string, slider: string[]) => {
    const urlBackend = `/api/v1/book/${_id}`;
    return axios.put<IBackendRes<IRegister>>(urlBackend, {
        mainText, author,
        price, quantity, category,
        thumbnail, slider
    })
}

export const getBookByIdAPI = (id: string) => {
    const urlBackend = `/api/v1/book/${id}`;
    return axios.get<IBackendRes<IBookTable>>(urlBackend,
        {
            headers: {
                delay: 500
            }
        }
    )
}

export const createOrderAPI = (
    name: string, address: string,
    phone: string, totalPrice: number,
    type: string, detail: any
) => {
    const urlBackend = "/api/v1/order";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { name, address, phone, totalPrice, type, detail })
}

export const getHistoryAPI = () => {
    const urlBackend = `/api/v1/history`;
    return axios.get<IBackendRes<IHistory[]>>(urlBackend)
}