// AddressModal.tsx
import React from "react";
import { getProvinces, getDistricts, getWards } from "@/api/vietnam.api";
import { toast } from "react-toastify";

interface AddressModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: IUpsertAddressReq) => Promise<void>;
    initial?: IAddress | null;
}

type AddressErrors = {
    fullName?: string;
    phone?: string;
};

type LocationItem = {
    id: number;
    name: string;
};

export const AddressModal: React.FC<AddressModalProps> = ({
    open,
    onClose,
    onSubmit,
    initial,
}) => {
    const [fullName, setFullName] = React.useState(initial?.fullName ?? "");
    const [phone, setPhone] = React.useState(initial?.phone ?? "");
    const [addressDetail, setAddressDetail] = React.useState(
        initial?.addressDetail ?? ""
    );

    // 🔄 Dùng ID thay vì code
    const [provinceId, setProvinceId] = React.useState<number | "">("");
    const [districtId, setDistrictId] = React.useState<number | "">("");
    const [wardId, setWardId] = React.useState<number | "">("");

    const [provinces, setProvinces] = React.useState<LocationItem[]>([]);
    const [districts, setDistricts] = React.useState<LocationItem[]>([]);
    const [wards, setWards] = React.useState<LocationItem[]>([]);

    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<AddressErrors>({});

    React.useEffect(() => {
        if (open) {
            loadProvinces();

            if (initial) {
                setFullName(initial.fullName);
                setPhone(initial.phone);
                setAddressDetail(initial.addressDetail);
                // ⚠️ Hiện tại BE chỉ trả name nên không pre-select được tỉnh/huyện/xã
                // => giữ behavior cũ: user phải chọn lại location
            } else {
                setFullName("");
                setPhone("");
                setAddressDetail("");
            }

            setErrors({});
            setProvinceId("");
            setDistrictId("");
            setWardId("");
            setDistricts([]);
            setWards([]);
        }
    }, [open, initial]);

    async function loadProvinces() {
        try {
            const pv = await getProvinces(); // [{id, name}]
            setProvinces(pv);
        } catch {
            toast.error("Không tải được danh sách tỉnh/thành");
        }
    }

    async function handleProvinceChange(id: number) {
        setProvinceId(id);
        setDistrictId("");
        setWardId("");
        setDistricts([]);
        setWards([]);
        try {
            const ds = await getDistricts(id); // [{id, name}]
            setDistricts(ds);
        } catch {
            toast.error("Không tải được danh sách quận/huyện");
        }
    }

    async function handleDistrictChange(id: number) {
        setDistrictId(id);
        setWardId("");
        setWards([]);
        try {
            const ws = await getWards(id); // [{id, name}]
            setWards(ws);
        } catch {
            toast.error("Không tải được danh sách phường/xã");
        }
    }

    function validateFields(): boolean {
        const e: AddressErrors = {};

        const nameTrim = fullName.trim();
        if (!nameTrim) {
            e.fullName = "Vui lòng nhập họ tên";
        } else if (nameTrim.length < 3) {
            e.fullName = "Tên phải lớn hơn 3 kí tự";
        } else if (nameTrim.replace(/\s+/g, "").length === 0) {
            e.fullName = "Không được chỉ nhập khoảng trắng";
        }

        const phoneTrim = phone.trim();
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneTrim) {
            e.phone = "Vui lòng nhập số điện thoại";
        } else if (!phoneRegex.test(phoneTrim)) {
            e.phone = "Số điện thoại bắt đầu bằng 0 và đủ 10-11 kí tự";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit() {
        if (!validateFields()) return;

        if (!provinceId) {
            toast.error("Vui lòng chọn Tỉnh/Thành");
            return;
        }
        if (!districtId) {
            toast.error("Vui lòng chọn Quận/Huyện");
            return;
        }
        if (!wardId) {
            toast.error("Vui lòng chọn Phường/Xã");
            return;
        }

        const payload: IUpsertAddressReq = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            provinceId: Number(provinceId),
            districtId: Number(districtId),
            wardId: Number(wardId),
            addressDetail,
            isDefault: initial?.isDefault ?? false,
        };

        try {
            setLoading(true);
            await onSubmit(payload);
            onClose();
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[420px] rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold">
                    {initial ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                </h2>

                <div className="space-y-3">
                    <div>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Họ và tên"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Số điện thoại"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={provinceId}
                        onChange={(e) => handleProvinceChange(Number(e.target.value))}
                    >
                        <option value="">-- Chọn Tỉnh / Thành phố --</option>
                        {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={districtId}
                        onChange={(e) => handleDistrictChange(Number(e.target.value))}
                        disabled={!provinceId}
                    >
                        <option value="">-- Chọn Quận / Huyện --</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={wardId}
                        onChange={(e) => setWardId(Number(e.target.value))}
                        disabled={!districtId}
                    >
                        <option value="">-- Chọn Phường / Xã --</option>
                        {wards.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>

                    <textarea
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        placeholder="Địa chỉ chi tiết (số nhà, tên đường...)"
                        rows={2}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md border px-4 py-2 text-sm"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                        {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
};
