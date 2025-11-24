import http from "@/services/axios.customize";

const BASE = "/api/v1";
const USER_BASE = `${BASE}/contact-message`;
const ADMIN_BASE = `${BASE}/admin/contact-message`;



/** ===== Helpers: bóc payload chung ===== */
const pickPayload = <T = any>(wrapped: IBackendRes<T> | T): T => {
  // BE trả { message, data: ... }, còn axios interceptor có thể đã trả thẳng 'data'
  return (wrapped as any)?.data ?? (wrapped as any);
};

function buildQuery(params?: {
  page?: number;
  size?: number;
  status?: ContactStatus | "ALL";
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "fullName" | "email" | string;
  sortDir?: "asc" | "desc";
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}) {
  const p = new URLSearchParams();
  p.set("page", String(params?.page ?? 0));
  p.set("size", String(params?.size ?? 10));
  // BE dùng field camelCase trong sort
  p.set("sort", `${params?.sortBy ?? "createdAt"},${params?.sortDir ?? "desc"}`);
  if (params?.status && params.status !== "ALL") p.set("status", params.status);
  if (params?.search?.trim()) p.set("search", params.search.trim());
  if (params?.startDate) p.set("startDate", params.startDate);
  if (params?.endDate) p.set("endDate", params.endDate);
  return p.toString();
}

/** ================= USER ================= */

/** Gửi contact message từ form */
export async function submitContactMessage(payload: {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  const body = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject,
    message: payload.message,
  };

  const res = await http.post<IBackendRes<ContactMessage>>(USER_BASE, body);
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<ContactMessage>(res.data);
}

/** ================= ADMIN ================= */

/** List + paginate + filter */
export async function listContactMessages(params?: {
  page?: number;
  size?: number;
  status?: ContactStatus | "ALL";
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "fullName" | "email" | string;
  sortDir?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}): Promise<IModelPaginate<ContactMessage>> {
  const qs = buildQuery(params);
  // nếu BE dùng POST cho search/filter thì giữ .post, nếu không thì đổi sang .get
  const res = await http.post<IBackendRes<IModelPaginate<ContactMessage>>>(
    `${ADMIN_BASE}?${qs}`
  );
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<IModelPaginate<ContactMessage>>(res.data);
}

/** Detail */
export async function getContactMessage(id: number): Promise<ContactMessage> {
  const res = await http.get<IBackendRes<any>>(`${ADMIN_BASE}/${id}`);
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  const payload = pickPayload<any>(res.data);
  const raw = payload?.item ?? payload; // dự phòng nếu BE bọc { item: ... }
  return raw as ContactMessage;
}

/** Update status (READ / RESOLVED / PENDING) */
export async function updateContactStatus(
  id: number,
  status: ContactStatus
): Promise<ContactMessage> {
  const res = await http.patch<IBackendRes<ContactMessage>>(
    `${ADMIN_BASE}/${id}/status`,
    null,
    { params: { status } }
  );
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<ContactMessage>(res.data);
}

/** Patch nội dung (admin chỉnh sửa) */
export async function updateContactMessage(
  id: number,
  update: Partial<ContactMessage>
): Promise<ContactMessage> {
  const res = await http.patch<IBackendRes<ContactMessage>>(
    `${ADMIN_BASE}/${id}`,
    update
  );
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<ContactMessage>(res.data);
}

/** Delete 1 record */
export async function deleteContactMessage(id: number): Promise<boolean> {
  await http.delete(`${ADMIN_BASE}/${id}`);
  return true;
}

/** Bulk update status */
export async function bulkUpdateContactStatus(
  ids: number[],
  status: ContactStatus
): Promise<{ updated: number }> {
  const res = await http.patch<IBackendRes<{ updated: number }>>(
    `${ADMIN_BASE}/bulk/status`,
    { ids, status }
  );
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<{ updated: number }>(res.data);
}

/** Bulk delete */
export async function bulkDeleteContactMessages(
  ids: number[]
): Promise<{ deleted: number }> {
  const res = await http.request<IBackendRes<{ deleted: number }>>({
    url: `${ADMIN_BASE}/bulk`,
    method: "DELETE",
    data: { ids },
  });
  if (!res.data) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }

  return pickPayload<{ deleted: number }>(res.data);
}

/** Stats */
export async function getContactStats(): Promise<number> {
  const res = await http.get<IBackendRes<any>>(`${ADMIN_BASE}/stats/pending-count`);
  if (!res.data && res.data !== 0) {
    throw new Error(res.message || "Đã xảy ra lỗi");
  }
    return pickPayload<number>(res.data)
}
