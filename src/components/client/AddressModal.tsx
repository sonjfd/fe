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

    const [provinceCode, setProvinceCode] = React.useState<number | "">("");
    const [districtCode, setDistrictCode] = React.useState<number | "">("");
    const [wardCode, setWardCode] = React.useState<number | "">("");

    const [provinces, setProvinces] = React.useState<any[]>([]);
    const [districts, setDistricts] = React.useState<any[]>([]);
    const [wards, setWards] = React.useState<any[]>([]);

    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<AddressErrors>({});

    React.useEffect(() => {
        if (open) {
            loadProvinces();

            if (initial) {
                setFullName(initial.fullName);
                setPhone(initial.phone);
                setAddressDetail(initial.addressDetail);
            } else {
                setFullName("");
                setPhone("");
                setAddressDetail("");
            }
            setErrors({});
            setProvinceCode("");
            setDistrictCode("");
            setWardCode("");
            setDistricts([]);
            setWards([]);
        }
    }, [open, initial]);

    async function loadProvinces() {
        try {
            const pv = await getProvinces();
            setProvinces(pv);
        } catch {
            toast.error("Không tải được danh sách tỉnh/thành");
        }
    }

    async function handleProvinceChange(code: number) {
        setProvinceCode(code);
        setDistrictCode("");
        setWardCode("");
        setWards([]);
        try {
            const ds = await getDistricts(code);
            setDistricts(ds);
        } catch {
            toast.error("Không tải được danh sách quận/huyện");
        }
    }

    async function handleDistrictChange(code: number) {
        setDistrictCode(code);
        setWardCode("");
        try {
            const ws = await getWards(code);
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
        // validate tên + phone giống bên profile
        if (!validateFields()) return;

        if (!provinceCode) {
            toast.error("Vui lòng chọn Tỉnh/Thành");
            return;
        }
        if (!districtCode) {
            toast.error("Vui lòng chọn Quận/Huyện");
            return;
        }
        if (!wardCode) {
            toast.error("Vui lòng chọn Phường/Xã");
            return;
        }

        const province = provinces.find((p) => p.code === provinceCode)?.name ?? "";
        const district = districts.find((d) => d.code === districtCode)?.name ?? "";
        const ward = wards.find((w) => w.code === wardCode)?.name ?? "";

        const payload: IUpsertAddressReq = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            province,
            district,
            ward,
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
                            <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
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
                            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={provinceCode}
                        onChange={(e) => handleProvinceChange(Number(e.target.value))}
                    >
                        <option value="">-- Chọn Tỉnh / Thành phố --</option>
                        {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={districtCode}
                        onChange={(e) => handleDistrictChange(Number(e.target.value))}
                        disabled={!provinceCode}
                    >
                        <option value="">-- Chọn Quận / Huyện --</option>
                        {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={wardCode}
                        onChange={(e) => setWardCode(Number(e.target.value))}
                        disabled={!districtCode}
                    >
                        <option value="">-- Chọn Phường / Xã --</option>
                        {wards.map((w) => (
                            <option key={w.code} value={w.code}>
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
