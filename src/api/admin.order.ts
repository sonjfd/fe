import axios from "@/services/axios.customize";

export const getAllOrder = (query: string) => {
    const backendUrl = `/api/v1/admin/orders?${query}`;
    return axios.get<IBackendRes<IModelPaginate<Order>>>(backendUrl)
}

export const getOrderDetail = (id: number) => {
    const backendUrl = `/api/v1/admin/orders/${id}`;
    return axios.get<IBackendRes<OneOrder>>(backendUrl)
}

export const updateOrder = (id: number, paymentStatus: string, orderStatus: string) => {
    const backendUrl = `/api/v1/admin/orders/${id}`;
    return axios.put<IBackendRes<Order>>(backendUrl, { paymentStatus, orderStatus })
}





export const getAdminShippingOrderDetail = (
  orderId: number
) => {
  return axios.get<IBackendRes<AdminShippingOrderDetail>>(
    `/api/v1/admin/orders/${orderId}/shipping-detail`
  );
};

// Lấy danh sách dịch vụ GHN cho đơn này
export const getGhnServicesApi = () => {
  // hoặc nếu BE không cần orderId thì bỏ param
  return axios.get<IBackendRes<GhnService[]>>(
    `/shipping/services`
  );
};

// Lấy danh sách ca lấy hàng GHN
export const getGhnPickupShiftsApi = () => {
  return axios.get<IBackendRes<GhnPickupShift[]>>(
    `shipping/pickup-shifts`
  );
};

// Tạo đơn GHN
export const createGhnOrderApi = (payload: AdminCreateGhnOrderPayload) => {
  return axios.post<IBackendRes<Order>>(
    "/api/v1/admin/orders/create-ghn-order",
    payload
  );
};
// ================= GHN ORDER DETAIL (GIỮ NGUYÊN) =================

export interface GhnOrderLog {
  status: string;
  driver_name?: string;
  driver_phone?: string;
  payment_type_id?: number;
  trip_code?: string;
  updated_date: string; // ISO string
  reason_code?: string;
  reason?: string;
  updated_lat?: number;
  updated_long?: number;
  action?: string;
}

export interface GhnOrderItem {
  name: string;
  code: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  status: string;
  item_order_code: string;
}

export interface GhnOrderDetail {
  order_code: string;
  client_order_code: string;
  status: string;

  // thời gian
  pickup_time: string | null;
  leadtime: string | null;

  // người gửi
  from_name: string;
  from_phone: string;
  from_address: string;

  // người nhận
  to_name: string;
  to_phone: string;
  to_address: string;

  // hàng hóa
  weight: number;
  calculate_weight: number;
  required_note: string;
  content: string;
  note: string;

  // phí
  cod_amount: number;
  insurance_value: number;
  payment_type_id: number; // 1: người gửi, 2: người nhận

  // item list
  items: GhnOrderItem[];

  // lịch sử trạng thái
  log: GhnOrderLog[];
}

export type GhnOrderDetailBackendRes = IBackendRes<GhnOrderDetail>;

// ================= TRACKING LOGS (TRANG THEO DÕI) =================

export interface GhnTrackingOrderInfo {
  order_code: string;
  shop_id: number;
  status: string;
  action?: string;
  status_name: string;

  picktime: string | null;
  leadtime: string | null;

  leadtime_order?: {
    from_estimate_date: string;
    to_estimate_date: string;
    picked_date: string;
  };

  to_name: string;
  to_phone: string;
  to_address: string;
  to_address_v2?: string;

  from_name: string;
  from_phone: string;
  from_address: string;

  return_name: string;
  return_phone: string;
  return_address: string;

  payment_type_id: number;
}

/** Vị trí trong log */
export interface GhnTrackingLocation {
  address?: string;
  ward_code?: string;
  district_id?: number;
  warehouse_id?: number;
  next_warehouse_id?: number;
}

/** Người thực hiện (nhân viên/khách) */
export interface GhnTrackingExecutor {
  employee_id?: number | null;
  client_id?: number | null;
  name?: string;
  phone?: string;
}

/** Loại log trong timeline */
export type GhnTrackingLogType = "TRACKING" | "CALL" | "SMS";

/** Một dòng log trạng thái (dùng chung cho tracking_logs & timeline) */
export interface GhnTrackingLog {
  // với tracking_logs luôn là TRACKING, với timeline có thể là CALL / SMS
  type?: GhnTrackingLogType;

  status: string;
  status_name: string;
  action_code?: string;

  // ở tracking_logs luôn có, ở timeline CALL/SMS có thể không
  order_code?: string;

  location?: GhnTrackingLocation;
  executor?: GhnTrackingExecutor;

  action_at: string;
  sync_data_at?: string | null;

  // lý do fail
  reason?: string;
  reason_code?: string;

  // CALL / SMS
  sms_content?: string | null;
  phone_call?: string | null;
  phone_receive?: string | null;

  // CALL
  duration?: number | null;
  ring_duration?: number | null;
  /** NG: người gửi, NN: người nhận */
  user_type?: "NG" | "NN" | null;

  // nhân viên thực hiện (GHN trả riêng ngoài executor)
  employee_name?: string | null;
  employee_phone?: string | null;
}

/** Payload data của GHN tracking-logs */
export interface GhnTrackingLogsData {
  order_info: GhnTrackingOrderInfo;
  tracking_logs: GhnTrackingLog[]; // log dạng cũ
  timeline: GhnTrackingLog[];      // log đầy đủ (TRACKING/CALL/SMS)
}

/** Wrapper trả về từ BE */
export type GhnTrackingLogsBackendRes = IBackendRes<GhnTrackingLogsData>;

// ================= API CALL =================

/** Gọi BE lấy detail tracking GHN theo order_code */
export async function getGhnOrderDetail(
  ghnOrderCode: string
): Promise<GhnTrackingLogsData> {
  const res = await axios.get<GhnTrackingLogsBackendRes>(
    "/api/v1/admin/orders/tracking-detail",
    {
      params: { ghnOrderCode },
    }
  );
  return res.data!;
}

// approve / reject cancel giữ nguyên
export const approveCancelOrder = (orderId: number) =>
  axios.post<IBackendRes<boolean>>(
    "/api/v1/admin/orders/cancel/approve",
    null,
    { params: { orderId } }
  );

export const rejectCancelOrder = (orderId: number, reason: string) =>
  axios.post<IBackendRes<boolean>>(
    "/api/v1/admin/orders/cancel/reject",
    null,
    { params: { orderId, reason } }
  );
export const getServiceFee = (payload: { districtId: number; wardId:number,service_id: number,service_type_id: number }) => {
const backEnd = `/shipping/quote`
    return axios.post<ShippingQuote>(backEnd, payload)
}