import axios from "services/axios.customize";

const BASE_URL = "api/v1"

export const fetchHomeCategories = async (): Promise<IHomeCategory[]> => {
  const url = `${BASE_URL}/categories`;
  const res = await axios.get<IBackendRes<IHomeCategory[]>>(url);
  return res.data ?? [];
};

export const fetchSliders = async (): Promise<ISlider[]> => {
  const res = await axios.get<IBackendRes<ISlider[]>>("/api/v1/sliders");
  return res.data ?? [];
};

export const fetchMyWishlist = async (
  page = 1,
  size = 10,
  sortBy = "createdAt",
  sortDir: "asc" | "desc" = "desc"
): Promise<IModelPaginate<IWishlistItem>> => {
  const res = await axios.get<IBackendRes<IModelPaginate<IWishlistItem>>>(
    `${BASE_URL}/wishlists`,
    {
      params: { page, size, sortBy, sortDir },
    }
  );
  // axios.customize đã trả về .data
  return (res.data as IModelPaginate<IWishlistItem>) ?? {
    page,
    size,
    total: 0,
    items: [],
  };
};

export const addToWishlistApi = async (
  productVariantId: number
): Promise<IBackendRes<null>> => {
  const res = await axios.post<IBackendRes<null>>(
    `${BASE_URL}/wishlists`,
    { productVariantId }
  );
  return res;
};


export const removeFromWishlistApi = async (
  productVariantId: number
): Promise<IBackendRes<null>> => {
  const res = await axios.delete<IBackendRes<null>>(
    `${BASE_URL}/wishlists/${productVariantId}`
  );
  return res;
};





export const fetchHomeProducts = async (
  page = 1,
  size = 50
): Promise<IModelPaginate<IHomeProductVariant>> => {
  const res = await axios.get<
    IBackendRes<IModelPaginate<IHomeProductVariant>>
  >("/api/v1/home/products", {
    params: { page, size },
  });

  return (
    res.data ?? {
      page,
      size,
      total: 0,
      items: [],
    }
  );
};


export const fetchVariantByCategory = (id: number) => {
  return axios.get<IBackendRes<IModelPaginate<VariantFilter>>>(`api/v1/category/${id}`)
}
