// src/components/admin/voucher/TableVoucher.tsx
import React from "react";

type Props = {
    items: IVoucher[];
    loading?: boolean;
    onEdit?: (v: IVoucher) => void;
    onAssign?: (v: IVoucher) => void;
    onDelete?: (v: IVoucher) => void;
};

const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString("vi-VN") : "";

const TableVoucher: React.FC<Props> = ({
                                           items,
                                           loading,
                                           onEdit,
                                           onAssign,
                                           onDelete,
                                       }) => {
    return (
        <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-3 py-2 text-left">Mã</th>
                    <th className="px-3 py-2 text-left">Giảm</th>
                    <th className="px-3 py-2 text-left">Phạm vi</th>
                    <th className="px-3 py-2 text-left">Thời gian</th>
                    <th className="px-3 py-2 text-center">Đã dùng / Giới hạn</th>
                    <th className="px-3 py-2 text-center">Trạng thái</th>
                    <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                        <td
                            colSpan={7}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                            Đang tải...
                        </td>
                    </tr>
                )}
                {!loading && items.length === 0 && (
                    <tr>
                        <td
                            colSpan={7}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                            Chưa có voucher nào
                        </td>
                    </tr>
                )}
                {!loading &&
                    items.map((v) => (
                        <tr key={v.id} className="border-t hover:bg-slate-50/60">
                            <td className="px-3 py-2 align-top">
                                <div className="font-mono text-[13px] font-semibold">
                                    {v.code}
                                </div>
                                {v.imageUrl && (
                                    <img
                                        src={v.imageUrl}
                                        alt={v.code}
                                        className="mt-1 h-10 w-auto rounded border object-cover"
                                    />
                                )}
                            </td>
                            <td className="px-3 py-2 align-top text-[13px]">
                                <div>
                                    {v.discountType === "PERCENT"
                                        ? `${v.discountValue}%`
                                        : `- ${v.discountValue.toLocaleString("vi-VN")} đ`}
                                </div>
                                {v.maxDiscountAmount ? (
                                    <div className="text-xs text-slate-500">
                                        Tối đa {v.maxDiscountAmount.toLocaleString("vi-VN")} đ
                                    </div>
                                ) : null}
                                {v.minOrderValue ? (
                                    <div className="text-xs text-slate-500">
                                        ĐH tối thiểu {v.minOrderValue.toLocaleString("vi-VN")} đ
                                    </div>
                                ) : null}
                            </td>
                            <td className="px-3 py-2 align-top text-[13px]">
                                {v.applyScope === "ALL"
                                    ? "Tất cả KH"
                                    : "Gán theo người dùng"}
                            </td>
                            <td className="px-3 py-2 align-top text-[12px] text-slate-600">
                                <div>Bắt đầu: {formatDate(v.startDate)}</div>
                                <div>Kết thúc: {formatDate(v.endDate)}</div>
                            </td>
                            <td className="px-3 py-2 align-top text-center text-[13px]">
                                <div>
                                    {v.usedCount ?? 0}
                                    {v.usageLimit
                                        ? ` / ${v.usageLimit}`
                                        : " / không giới hạn"}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top text-center">
                  <span
                      className={
                          v.status === "ACTIVE"
                              ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              : v.status === "EXPIRED"
                                  ? "inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"
                                  : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                  >
                    {v.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : v.status === "EXPIRED"
                            ? "Hết hạn"
                            : "Không hoạt động"}
                  </span>
                            </td>
                            <td className="px-3 py-2 align-top text-right text-[13px]">
                                <div className="flex justify-end gap-2">
                                    {onAssign && v.applyScope === "ASSIGNED" && (
                                        <button
                                            onClick={() => onAssign(v)}
                                            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                        >
                                            Gán KH
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(v)}
                                            className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white hover:bg-slate-800"
                                        >
                                            Sửa
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(v)}
                                            className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableVoucher;
