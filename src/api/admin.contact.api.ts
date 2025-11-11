import http from '@/services/axios.customize';

const BASE = '/api/v1';
const USER_BASE = `${BASE}/contact-message`;
const ADMIN_BASE = `${BASE}/admin/contact-message`;

/** ===== Types (khớp UI snake_case) ===== */
export type ContactStatus = 'PENDING' | 'READ' | 'RESOLVED';

export interface ContactMessage {
    id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    status: ContactStatus;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    updated_at: string;
}

export interface IModelPaginate<T> {
    page: number;
    size: number;
    total: number;
    items: T;
}

export interface IBackendRes<T> {
    message: string;
    data: T;
}

/** ===== Helpers: bóc payload & map camel⇄snake ===== */
const pickPayload = <T = any>(wrapped: IBackendRes<T> | T): T => {
    // BE trả { message, data: ... }, còn axios interceptor đôi khi đã trả thẳng 'data'
    // nên bóc an toàn:
    // - nếu có 'data' bên trong => lấy nó
    // - nếu không => trả nguyên object
    return (wrapped as any)?.data ?? (wrapped as any);
};

const mapContactFromCamel = (m: any): ContactMessage => ({
    id: m.id,
    full_name: m.fullName,
    email: m.email,
    phone: m.phone ?? null,
    subject: m.subject ?? null,
    message: m.message,
    status: m.status,
    ip_address: m.ipAddress ?? null,
    user_agent: m.userAgent ?? null,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
});

const mapContactToCamel = (m: Partial<ContactMessage>): any => ({
    id: m.id,
    fullName: m.full_name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message,
    status: m.status,
    ipAddress: m.ip_address,
    userAgent: m.user_agent,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
});

const mapPaginateFromCamel = (d: any): IModelPaginate<ContactMessage[]> => ({
    page: Number(d?.page ?? 0),
    size: Number(d?.size ?? 10),
    total: Number(d?.total ?? 0),
    items: Array.isArray(d?.items) ? d.items.map(mapContactFromCamel) : [],
});

function buildQuery(params?: {
    page?: number; size?: number;
    status?: ContactStatus | 'ALL';
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | string;
    sortDir?: 'asc' | 'desc';
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
}) {
    const p = new URLSearchParams();
    p.set('page', String(params?.page ?? 0));
    p.set('size', String(params?.size ?? 10));
    // BE dùng field camelCase trong sort
    p.set('sort', `${params?.sortBy ?? 'createdAt'},${params?.sortDir ?? 'desc'}`);
    if (params?.status && params.status !== 'ALL') p.set('status', params.status);
    if (params?.search?.trim()) p.set('search', params.search.trim());
    if (params?.startDate) p.set('startDate', params.startDate);
    if (params?.endDate) p.set('endDate', params.endDate);
    return p.toString();
}

/** ================= USER ================= */

/** Gửi contact message từ form (UI có thể dùng snake_case, ta map sang camelCase cho BE) */
export async function submitContactMessage(payload: {
    fullName: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
}): Promise<ContactMessage> {
    // BE của bạn dùng camelCase => map payload sang camelCase
    const body = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        subject: payload.subject,
        message: payload.message,
    };
    const res = await http.post<IBackendRes<any>>(USER_BASE, body);
    if (!res.data) {
        throw new Error(res.message || "Đã xảy ra lỗi");
    }

    const data = pickPayload(res.data); // { ...item camelCase }
    return mapContactFromCamel(data);
}

/** ================= ADMIN ================= */

/** List + paginate + filter */
export async function listContactMessages(params?: {
    page?: number; size?: number;
    status?: ContactStatus | 'ALL';
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | string;
    sortDir?: 'asc' | 'desc';
    startDate?: string; endDate?: string;
}): Promise<IModelPaginate<ContactMessage[]>> {
    const qs = buildQuery(params);
    // Dùng GET đúng REST (nếu BE bạn bắt POST thì đổi lại .post như trước)
    const res = await http.post<IBackendRes<any>>(`${ADMIN_BASE}?${qs}`);
    if (!res.data) {
        throw new Error(res.message || "Đã xảy ra lỗi");
    }
    const payload = pickPayload(res.data); // { page, size, total, items:[{ camelCase }] }
    return mapPaginateFromCamel(payload);
}

/** Detail */
export async function getContactMessage(id: number): Promise<ContactMessage> {
    const res = await http.get<IBackendRes<any>>(`${ADMIN_BASE}/${id}`);
    const payload = pickPayload(res.data); // item camelCase hoặc { item: ... }
    const raw = (payload as any)?.item ?? payload;
    return mapContactFromCamel(raw);
}

/** Update status (READ / RESOLVED / PENDING) */
export async function updateContactStatus(id: number, status: ContactStatus): Promise<ContactMessage> {
    const res = await http.patch<IBackendRes<any>>(`${ADMIN_BASE}/${id}/status`, null, { params: { status } });
    const payload = pickPayload(res.data);
    return mapContactFromCamel(payload);
}

/** Patch nội dung (admin chỉnh sửa) – nhận snake_case từ UI, map sang camelCase cho BE */
export async function updateContactMessage(
    id: number,
    update: Partial<ContactMessage>
): Promise<ContactMessage> {
    const body = mapContactToCamel(update);
    const res = await http.patch<IBackendRes<any>>(`${ADMIN_BASE}/${id}`, body);
    const payload = pickPayload(res.data);
    return mapContactFromCamel(payload);
}

/** Delete 1 record */
export async function deleteContactMessage(id: number): Promise<boolean> {
    await http.delete(`${ADMIN_BASE}/${id}`);
    return true;
}

/** Bulk update status */
export async function bulkUpdateContactStatus(ids: number[], status: ContactStatus): Promise<{ updated: number }> {
    const res = await http.patch<IBackendRes<any>>(`${ADMIN_BASE}/bulk/status`, { ids, status });
    if (!res.data) {
        throw new Error(res.message || "Đã xảy ra lỗi");
    }
    const payload = pickPayload(res.data);
    return payload;
}

/** Bulk delete */
export async function bulkDeleteContactMessages(ids: number[]): Promise<{ deleted: number }> {
    const res = await http.request<IBackendRes<any>>({
        url: `${ADMIN_BASE}/bulk`,
        method: 'DELETE',
        data: { ids },
    });
    if (!res.data) {
        throw new Error(res.message || "Đã xảy ra lỗi");
    }
    const payload = pickPayload(res.data);
    return payload;
}

/** Stats */
export async function getContactStats(): Promise<{ total: number; PENDING: number; READ: number; RESOLVED: number }> {
    const res = await http.get<IBackendRes<any>>(`${ADMIN_BASE}/stats`);
    const payload = pickPayload(res.data);
    return payload;
}
