import axios from "@/services/axios.customize";

export const getShippingFree = (addressId: number, service_id: number = 53320, service_type_id: number = 2) => {
    const backEnd = `/shipping/quote`
    return axios.post<ShippingQuote>(backEnd, { addressId, service_id, service_type_id })
}


export const createOrder = (payload: CreateOrderRequest) => {
    const backEnd = "/api/v1/orders/create"
    return axios.post<IBackendRes<OrderCreateResponse>>(backEnd, payload)
}


export const getUserAddresses = () => {
    return axios.get<IBackendRes<IAddress[]>>("/api/v1/account/addresses");

}

export const updatePaymentStatus = (uuid: string, status: string) => {
    return axios.put("/api/v1/orders/update-payment-status", { uuid, status });
};

export const getUserOrder = (query: string) => {
    const backendUrl = `/api/v1/orders?${query}`;
    return axios.get<IBackendRes<IModelPaginate<Order>>>(backendUrl)

}

export const getOrderDetail = (id: number) => {
    const backendUrl = `/api/v1/orders/${id}`;
    return axios.get<IBackendRes<OneOrder>>(backendUrl)

}

export const vnPayPayment = (totalAmount: number, order: any) => {
    const backendUrl = `/api/v1/payment/vn-pay`;
    return axios.post<IBackendRes<VNPayResponse>>(backendUrl, {
        totalAmount,
        order
    });
};


export const cancelUrl = (id: number) => {
    const backendUrl = `/api/v1/orders/${id}`
    return axios.delete(backendUrl)
}

export const cancelOrderRequest = (payload: { orderId: number; reason: string }) => {
    return axios.post<IBackendRes<string>>("/api/v1/orders/cancel", payload);
};

export interface ApplicableVoucher {
    id: number;
    code: string;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    maxDiscountAmount?: number | null;
    minOrderValue?: number | null;
    imageUrl?: string | null;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export const getAvailableVouchers = (orderAmount: number) => {
    const backEnd = "/api/v1/vouchers/available";
    return axios.get<IBackendRes<ApplicableVoucher[]>>(backEnd, {
        params: { orderAmount },
    });
};

// ================= TRACKING =================
export interface GhnTrackingOrderInfo {
  order_code: string;
  status_name: string;
  picktime?: string | null;
  leadtime?: string | null;
  from_name?: string | null;
  from_phone?: string | null;
  from_address?: string | null;
  to_name?: string | null;
  to_phone?: string | null;
  to_address?: string | null;
}

export interface GhnTrackingLocation {
  address?: string | null;
  district?: string | null;
  ward?: string | null;
  province?: string | null;
}

export interface GhnTrackingExecutor {
  name?: string | null;
  phone?: string | null;
}

export type GhnTrackingLogType = "TRACKING" | "CALL" | "SMS";

export interface GhnTrackingLog {
  type?: GhnTrackingLogType;
  status?: string | null;
  status_name?: string | null;
  action_at?: string | null;
  location?: GhnTrackingLocation;
  executor?: GhnTrackingExecutor;
  employee_name?: string | null;
  employee_phone?: string | null;
  reason?: string | null;
  phone_receive?: string | null;
  user_type?: string | null;
  ring_duration?: number | null;
  duration?: number | null;
  sms_content?: string | null;
}

export interface GhnTrackingLogsData {
  order_info: GhnTrackingOrderInfo;
  tracking_logs: GhnTrackingLog[];
  timeline: GhnTrackingLog[];
}

export const getOrderTracking = async (orderId: number): Promise<GhnTrackingLogsData> => {
  const res = await axios.get<IBackendRes<GhnTrackingLogsData>>(
    `/api/v1/orders/${orderId}/tracking`
  );
  if (res.data) {
    return res.data;
  }
  throw new Error("Không lấy được tracking");
};