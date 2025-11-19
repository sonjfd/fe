// src/api/account.api.ts
import axios from "@/services/axios.customize";
const BASE_ACCOUNT = "/api/v1/account";
const BASE_ADDRESS = "/api/v1/account/addresses";
const API = {
    profile: `${BASE_ACCOUNT}/profile`,
    password: `${BASE_ACCOUNT}/password`,
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

export async function getMyAddresses(): Promise<IAddress[]> {
    const res = await axios.get<IBackendRes<IAddress[]>>(BASE_ADDRESS);
    return res.data!;
}

export async function createAddress(payload: IUpsertAddressReq): Promise<IAddress> {
    const res = await axios.post<IBackendRes<IAddress>>(BASE_ADDRESS, payload);
    return res.data!;
}

export async function updateAddress(
    addressId: number,
    payload: IUpsertAddressReq
): Promise<IAddress> {
    const res = await axios.put<IBackendRes<IAddress>>(
        `${BASE_ADDRESS}/${addressId}`,
        payload
    );
    return res.data!;
}

export async function deleteAddress(addressId: number): Promise<void> {
    await axios.delete<IBackendRes<null>>(`${BASE_ADDRESS}/${addressId}`);
}

export async function setDefaultAddress(addressId: number): Promise<IAddress> {
    const res = await axios.put<IBackendRes<IAddress>>(
        `${BASE_ADDRESS}/${addressId}/default`
    );
    return res.data!;
}