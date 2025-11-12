const SEED_USER: IUserProfile = {
    id: 1,
    fullName: "Hải Anh",
    email: "anphan@fpt.edu.vn",
    phone: "0912345639",
    avatar: "https://images.unsplash.com/photo-1531128917343-a245cd0696e6?q=80&w=300&auto=format&fit=crop",
    status: "ACTIVE",
    gender: "FEMALE",
    role: { id: 2 },
};
const SEED_ADDR: IAddress[] = [
    {
        id: 1,
        userId: 1,
        name: "Ngọc Anh",
        phone: "0901122334",
        province: "Hà Nội",
        district: "Sơn Tây",
        ward: "Cổ Đông",
        addressDetail: "Xã Cổ Đông, Thị Xã Sơn Tây, Hà Nội",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        userId: 1,
        name: "Hải Mit",
        phone: "0988777666",
        province: "Thanh Hóa",
        district: "Thiệu Hóa",
        ward: "Thiệu Hợp",
        addressDetail: "Xã Thiệu Hợp, Huyện Thiệu Hóa, Thanh Hóa",
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];


const K_USER = "mock_user_profile";
const K_ADDR = "mock_user_addresses";

function seed() {
    if (!localStorage.getItem(K_USER)) localStorage.setItem(K_USER, JSON.stringify(SEED_USER));
    if (!localStorage.getItem(K_ADDR)) localStorage.setItem(K_ADDR, JSON.stringify(SEED_ADDR));
}
seed();
export async function getMe(): Promise<IUserProfile> {
    return JSON.parse(localStorage.getItem(K_USER)!);
}


export async function updateMe(payload: IUpdateProfileReq): Promise<IUserProfile> {
    const current: IUserProfile = await getMe();
    const next: IUserProfile = {
        ...current,
        fullName: payload.fullName,
        phone: payload.phone,
        gender: payload.gender,
        avatar: payload.avatar ?? current.avatar,
    };
    localStorage.setItem(K_USER, JSON.stringify(next));
    return next;
}


export async function listAddresses(): Promise<IAddress[]> {
    return JSON.parse(localStorage.getItem(K_ADDR)!);
}


export async function createAddress(req: IUpsertAddressReq): Promise<IAddress> {
    const list = await listAddresses();
    const item: IAddress = {
        id: Date.now(),
        userId: (await getMe()).id,
        name: req.name,
        phone: req.phone,
        province: req.province,
        district: req.district,
        ward: req.ward,
        addressDetail: req.addressDetail,
        isDefault: !!req.isDefault,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    if (item.isDefault) list.forEach(a => (a.isDefault = false));
    list.push(item);
    localStorage.setItem(K_ADDR, JSON.stringify(list));
    return item;
}


export async function updateAddress(id: IAddress["id"], patch: Partial<IUpsertAddressReq> & { isDefault?: boolean }): Promise<IAddress> {
    const list = await listAddresses();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Address not found");
    if (patch.isDefault) list.forEach(a => (a.isDefault = false));
    const now = new Date().toISOString();
    list[idx] = { ...list[idx], ...patch, updatedAt: now } as IAddress;
    localStorage.setItem(K_ADDR, JSON.stringify(list));
    return list[idx];
}


export async function deleteAddress(id: IAddress["id"]): Promise<void> {
    const list = await listAddresses();
    localStorage.setItem(K_ADDR, JSON.stringify(list.filter(a => a.id !== id)));
}


export async function changePassword(req: IChangePasswordReq): Promise<void> {
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strong.test(req.newPassword)) throw new Error("Mật khẩu mới không đủ mạnh");
    if (req.currentPassword === req.newPassword) throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    await new Promise(r => setTimeout(r, 200));
}