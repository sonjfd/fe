
import axiosCustomize from "@/services/axios.customize";
const baseURL = "api/v1";
export const getCartApi = () => {
  return axiosCustomize.get<IBackendRes<ICartResponse>>(`${baseURL}/cart`);
};

export const addToCartApi = (data: AddToCartRequest) => {
  return axiosCustomize.post<IBackendRes<ICartResponse>>(`${baseURL}/cart/add`, data);
};

export const updateCartQuantityApi = (data: UpdateCartQuantityRequest) => {
  return axiosCustomize.put<IBackendRes<ICartResponse>>(`${baseURL}/cart/update`, data);
};

export const removeCartItemApi = (cartDetailId: number) => {
  return axiosCustomize.delete<IBackendRes<ICartResponse>>(
    `${baseURL}/cart/remove/${cartDetailId}`
  );
};

export const clearCartApi = () => {
  return axiosCustomize.delete<IBackendRes<string>>(`${baseURL}/cart/clear`);
};