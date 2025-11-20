// src/components/admin/voucher/UpdateVoucher.tsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { adminUpdateVoucher } from "@/api/admin.voucher.api";
import {uploadVoucherImg} from "@/api/upload.api.ts";

type Props = {
    open: boolean;
    voucher: IVoucher | null;
    onClose: () => void;
    onUpdated?: (voucher: IVoucher) => void;
};

const Err: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="mt-1 text-xs text-red-600">{children}</p>
);
const Req: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="after:ml-0.5 after:text-red-600 after:content-['*']">
      {children}
    </span>
);

const UpdateVoucher: React.FC<Props> = ({
                                            open,
                                            voucher,
                                            onClose,
                                            onUpdated,
                                        }) => {
    const [form, setForm] = useState({
        code: "",
        imageUrl: "",
        discountType: "PERCENT" as VoucherDiscountType,
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderValue: 0,
        usageLimit: 0,
        userLimit: 0,
        applyScope: "ALL" as VoucherApplyScope,
        status: "INACTIVE" as VoucherStatus,
        startDate: "",
        endDate: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (open && voucher) {
            setForm({
                code: voucher.code,
                imageUrl: voucher.imageUrl || "",
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
                maxDiscountAmount: voucher.maxDiscountAmount ?? 0,
                minOrderValue: voucher.minOrderValue ?? 0,
                usageLimit: voucher.usageLimit ?? 0,
                userLimit: voucher.userLimit ?? 0,
                applyScope: voucher.applyScope,
                status: voucher.status as VoucherStatus,
                startDate: voucher.startDate?.slice(0, 16) ?? "",
                endDate: voucher.endDate?.slice(0, 16) ?? "",
            });
            setErrors({});
        }
    }, [open, voucher]);

    function handleChange<K extends keyof typeof form>(
        key: K,
        value: (typeof form)[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const code = (form.code || voucher?.code || "").trim();
        if (!code) {
            toast.error("Vui lòng nhập mã voucher trước khi chọn ảnh");
            e.target.value = "";
            return;
        }

        try {
            setUploading(true);
            const res = await uploadVoucherImg(code, file); // IBackendRes<string>
            const imageUrl = (res as any).data as string;

            if (!imageUrl) {
                toast.error("Upload ảnh thất bại");
                return;
            }

            handleChange("imageUrl", imageUrl);
            toast.success("Upload ảnh thành công");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Không thể upload ảnh");
        } finally {
            setUploading(false);
        }
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!form.code.trim()) e.code = "Vui lòng nhập mã voucher";
        if (!form.discountValue || form.discountValue <= 0)
            e.discountValue = "Giá trị giảm phải > 0";
        if (!form.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!form.endDate) e.endDate = "Vui lòng chọn ngày kết thúc";
        if (form.startDate && form.endDate) {
            if (new Date(form.startDate) >= new Date(form.endDate)) {
                e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit() {
        if (!voucher) return;
        if (!validate()) return;

        try {
            setSubmitting(true);
            const payload: IUpdateVoucherReq = {
                id: voucher.id,
                ...form,
            };

            // Gọi API: trả về IBackendRes<IVoucher>, cần kiểm tra message khi lỗi (vd mã code trùng)
            const res = await adminUpdateVoucher(voucher.id, payload);
            const updated = (res as IBackendRes<IVoucher>)?.data as IVoucher | undefined;

            if (!updated || (updated as any).id === undefined) {
                const message = (res as IBackendRes<any>)?.message;
                toast.error(message || "Không thể cập nhật voucher, thử lại sau");
                return;
            }

            toast.success("Cập nhật voucher thành công");
            onUpdated?.(updated);
            onClose();
        } catch (e: any) {
            console.error(e);
            toast.error(
                e?.response?.data?.message || "Không thể cập nhật voucher, thử lại sau"
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (!open || !voucher) return null;
    const v = voucher;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-base font-semibold">
                        Cập nhật voucher <span className="font-mono">{v.code}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[70vh] space-y-4 overflow-auto px-4 py-3 text-sm">
                    {/* Code */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            <Req>Mã voucher</Req>
                        </label>
                        <input
                            value={form.code}
                            onChange={(e) => handleChange("code", e.target.value)}
                            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                        />
                        {errors.code && <Err>{errors.code}</Err>}
                    </div>

                    {/* Ảnh voucher */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            Ảnh voucher
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadImage}
                                disabled={uploading || submitting}
                                className="text-sm"
                            />
                            {uploading && (
                                <span className="text-xs text-slate-500">
                                    Đang upload...
                                </span>
                            )}
                        </div>
                        {form.imageUrl && (
                            <div className="mt-2">
                                <img
                                    src={form.imageUrl}
                                    alt="Voucher"
                                    className="h-20 rounded-md border object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Loại giảm & giá trị */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                <Req>Loại giảm</Req>
                            </label>
                            <select
                                value={form.discountType}
                                onChange={(e) =>
                                    handleChange(
                                        "discountType",
                                        e.target.value as VoucherDiscountType
                                    )
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            >
                                <option value="PERCENT">Phần trăm (%)</option>
                                <option value="FIXED">Giảm tiền cố định</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                <Req>Giá trị giảm</Req>
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.discountValue}
                                onChange={(e) =>
                                    handleChange("discountValue", Number(e.target.value))
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            />
                            {errors.discountValue && <Err>{errors.discountValue}</Err>}
                        </div>
                    </div>

                    {/* Max discount + min order */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                Giảm tối đa (nếu là %)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.maxDiscountAmount}
                                onChange={(e) =>
                                    handleChange(
                                        "maxDiscountAmount",
                                        Number(e.target.value)
                                    )
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                Đơn tối thiểu áp dụng
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.minOrderValue}
                                onChange={(e) =>
                                    handleChange("minOrderValue", Number(e.target.value))
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>
                    </div>

                    {/* Usage / user limit */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                Giới hạn sử dụng (0 = không giới hạn)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.usageLimit}
                                onChange={(e) =>
                                    handleChange("usageLimit", Number(e.target.value))
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                Mỗi user dùng tối đa (0 = không giới hạn)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.userLimit}
                                onChange={(e) =>
                                    handleChange("userLimit", Number(e.target.value))
                                }
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>
                    </div>

                    {/* Trạng thái + scope + date */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    <Req>Trạng thái</Req>
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) =>
                                        handleChange(
                                            "status",
                                            e.target.value as VoucherStatus
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    <Req>Phạm vi áp dụng</Req>
                                </label>
                                <select
                                    value={form.applyScope}
                                    onChange={(e) =>
                                        handleChange(
                                            "applyScope",
                                            e.target.value as VoucherApplyScope
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                                >
                                    <option value="ALL">Tất cả khách hàng</option>
                                    <option value="ASSIGNED">Gán theo người dùng</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    <Req>Ngày bắt đầu</Req>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.startDate}
                                    onChange={(e) =>
                                        handleChange("startDate", e.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                                />
                                {errors.startDate && <Err>{errors.startDate}</Err>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    <Req>Ngày kết thúc</Req>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.endDate}
                                    onChange={(e) =>
                                        handleChange("endDate", e.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                                />
                                {errors.endDate && <Err>{errors.endDate}</Err>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t px-4 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-50"
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateVoucher;


