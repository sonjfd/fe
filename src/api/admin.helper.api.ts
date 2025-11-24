import axios from "@/services/axios.customize.ts";

export const stockHelperApi = {
    getProductsForSelect: async () => {
        const res: any = await axios.get("api/v1/admin/products?page=1&size=100");

        return res.content || [];
    },

    getVariantByProductId: async (productId: number) => {
        const res: any = await axios.get(`api/v1/admin/products/${productId}/variants`);

        return res.content || [];
    }
};