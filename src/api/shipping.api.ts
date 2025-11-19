// src/api/shipping.api.ts
import axios from "@/services/axios.customize"; // thay theo cách bạn cấu hình axios

export interface ShippingQuoteRequest {
  addressId: number;
  serviceTypeId: number; // fix 2
  serviceId: number; //fix 53320: hàng nhẹ
  codAmount: number;      // tiền thu hộ (nếu CASH)
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface ShippingQuoteResponse {
  fee: number;
  serviceFee: number;
  insuranceFee: number;
  expectedDeliveryTime: string | null; // ISO string hoặc null
}

export const getShippingQuoteApi = (payload: ShippingQuoteRequest) => {
  return axios.post<IBackendRes<ShippingQuoteResponse>>(
    "/api/shipping/quote",
    payload
  );
};
