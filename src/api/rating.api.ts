import axios from "@/services/axios.customize";

const BASE_PRODUCT = "/api/v1/products";

const API = {
    reviews: (productId: number) => `${BASE_PRODUCT}/${productId}/reviews`,
    rating: (productId: number) => `${BASE_PRODUCT}/${productId}/rating`,
};

export interface RatingResDTO {
    id: number;
    productId: number;
    userId: number;
    userName: string;
    score: number;
    content?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProductReviewResDTO {
    productId: number;
    averageRating: number;
    totalRatings: number;
    myRating?: RatingResDTO | null;
    ratings: RatingResDTO[];
}

// payload gửi lên backend
export interface RatingPayload {
    score: number; // 1..5
    content?: string;
}

// IBackendRes giống account.api, dùng luôn
export async function fetchProductReviews(
    productId: number
): Promise<ProductReviewResDTO> {
    const res = await axios.get<IBackendRes<ProductReviewResDTO>>(
        API.reviews(productId)
    );
    return res.data!;
}

export async function saveRating(
    productId: number,
    payload: RatingPayload
): Promise<RatingResDTO> {
    const res = await axios.post<IBackendRes<RatingResDTO>>(
        API.rating(productId),
        payload
    );
    return res.data!;
}

export async function deleteRating(productId: number): Promise<void> {
    await axios.delete<IBackendRes<null>>(API.rating(productId));
}
