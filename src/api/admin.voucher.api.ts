// src/api/admin.voucher.api.ts
import http from "@/services/axios.customize";

const BASE = "/api/v1/admin/vouchers";
const USER_BASE = "/api/v1/admin/users";

function unwrap<T>(res: any): T {
    if (res?.data?.data !== undefined) return res.data.data as T;
    if (res?.data !== undefined) return res.data as T;
    return res as T;
}

// ========== CRUD voucher ==========

export async function adminListVouchers(): Promise<IVoucher[]> {
    const res = await http.get<IBackendRes<IVoucher[]>>(BASE);
    return unwrap<IVoucher[]>(res) ?? [];
}

export async function adminGetVoucherDetail(id: number): Promise<IVoucher> {
    const res = await http.get<IBackendRes<IVoucher>>(`${BASE}/${id}`);
    return unwrap<IVoucher>(res);
}

export async function adminCreateVoucher(payload: any): Promise<IBackendRes<IVoucher>> {
    const res = await http.post<IBackendRes<IVoucher>>(BASE, payload);
    // interceptor đã trả về thẳng IBackendRes, không unwrap để giữ được message khi lỗi (ví dụ mã code trùng)
    return res;
}


export async function adminUpdateVoucher(id: number, payload: any): Promise<IBackendRes<IVoucher>> {
    const res = await http.put<IBackendRes<IVoucher>>(`${BASE}/${id}`, payload);
    // giữ nguyên IBackendRes để FE đọc được res.message khi API trả lỗi
    return res;
}

export async function adminDeleteVoucher(id: number): Promise<void> {
    await http.delete<IBackendRes<void>>(`${BASE}/${id}`);
}

// ========== Assign / search users ==========

// Lấy danh sách user đã được gán cho 1 voucher
export async function adminGetVoucherAssignedUsers(
    voucherId: number
): Promise<IUserEmailLite[]> {
    const res = await http.get<IBackendRes<IUserEmailLite[]>>(
        `${BASE}/${voucherId}/assigned-users`
    );
    return unwrap<IUserEmailLite[]>(res) ?? [];
}

// Search user theo email
// Backend mapping:
// @GetMapping("/search")
// public ApiResponse<List<UserEmailResDTO>> searchUsersByEmail(
//      @RequestParam("email") String email)
export async function adminSearchUsersByEmail(
    email: string
): Promise<IUserEmailLite[]> {
    const res = await http.get<IBackendRes<IUserEmailLite[]>>(
        `${USER_BASE}/search`,
        {
            // *** CHÚ Ý: phải là "email" chứ không phải "keyword" ***
            params: { email },
        }
    );
    return unwrap<IUserEmailLite[]>(res) ?? [];
}

/**
 * Backend nhận body:
 * {
 *   "emails": ["admin@gmail.com", "..."]
 * }
 */
export async function adminAssignVoucherUsers(
    voucherId: number,
    emails: string[]
): Promise<void> {
    await http.post<IBackendRes<void>>(
        `${BASE}/${voucherId}/assign-users`,
        {
            emails,
        }
    );
}
