// src/api/account.api.ts
import axios from "@/services/axios.customize";
const BASE_ACCOUNT = "/api/v1/account";
const ADDR_BASE = "/api/v1/account/addresses";
const API = {
    profile: `${BASE_ACCOUNT}/profile`,
    password: `${BASE_ACCOUNT}/password`,
};
type AddressResDTO = {
    id: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    createdAt: string;
    default: boolean; // <- từ BE
};
type ProfileResDTO = {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    avatar: string;
    status: IUserStatus;
    gender: IGender;
    role: { id: number };
};

function unwrap<T>(res: any): T {
    if (res?.data?.data !== undefined) return res.data.data as T;
    if (res?.data !== undefined) return res.data as T;
    return res as T;
}

function mapProfile(res: ProfileResDTO | IUserProfile): IUserProfile {
    const r: any = res;
    return {
        id: r.id,
        fullName: r.fullName ?? r.full_name,
        email: r.email,
        phone: r.phone,
        avatar: r.avatar,
        status: r.status,
        gender: r.gender,
        role: r.role,
    };
}

export async function updateMe(payload: IUpdateProfileReq): Promise<IUserProfile> {
    const body = {
        fullName: payload.fullName,
        phone: payload.phone,
        gender: payload.gender,
        avatar: payload.avatar,
    };
    const res = await axios.put<IBackendRes<ProfileResDTO | IUserProfile>>(API.profile, body);
    const raw = unwrap<ProfileResDTO | IUserProfile>(res);
    return mapProfile(raw);
}

/**
 * Đổi mật khẩu: trả về message để FE dùng toast.success
 */
// Đổi mật khẩu: trả về nguyên ApiResponse<void> để FE tự kiểm tra
export async function changePassword(req: IChangePasswordReq): Promise<IBackendRes<boolean>> {
    const res = await axios.post<IBackendRes<boolean>>(API.password, {
        currentPassword: req.currentPassword,
        newPassword: req.newPassword,
    });

    // Thành công (HTTP 200) => lấy message để toast success
    return res;
}
export async function listAddresses(): Promise<IAddress[]> {
    const res = await axios.get<IBackendRes<AddressResDTO[]>>(ADDR_BASE);
    const raw = res.data ?? [];

    return raw.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        phone: r.phone,
        province: r.province,
        district: r.district,
        ward: r.ward,
        addressDetail: r.addressDetail,
        createdAt: r.createdAt,
        isDefault: r.default, // <-- map sang isDefault để FE dễ dùng
    }));
}

// TẠO MỚI ĐỊA CHỈ
export async function createAddress(dto: IUpsertAddressReq): Promise<IAddress> {
    const res = await axios.post<IBackendRes<IAddress>>(ADDR_BASE, dto);
    return res.data!;
}

// CẬP NHẬT ĐỊA CHỈ
export async function updateAddress(id: number, dto: IUpsertAddressReq): Promise<IAddress> {
    const res = await axios.put<IBackendRes<IAddress>>(`${ADDR_BASE}/${id}`, dto);
    return res.data!;
}

// XOÁ ĐỊA CHỈ
export async function deleteAddress(id: number): Promise<void> {
    await axios.delete(`${ADDR_BASE}/${id}`);
}

// ĐẶT MẶC ĐỊNH
export async function setDefaultAddress(id: number): Promise<IAddress> {
    const res = await axios.put<IBackendRes<IAddress>>(`${ADDR_BASE}/${id}/default`);
    return res.data!;
}