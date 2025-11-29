import { useState } from "react";
import { toast } from "react-toastify";
import { cancelOrderRequest } from "@/api/order.api";

const CANCEL_REASONS = [
  "Đặt nhầm sản phẩm / sai số lượng",
  "Muốn thay đổi địa chỉ / thông tin nhận hàng",
  "Thời gian giao hàng không phù hợp",
  "Tìm được nơi mua khác tốt hơn",
  "Không còn nhu cầu nữa",
  "Lý do khác",
];

type CancelOrderPopupProps = {
  order: Order;
  onSuccess: () => void;
  closeToast: () => void;
};

export function CancelOrderPopup({ order, onSuccess, closeToast }: CancelOrderPopupProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [otherReason, setOtherReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOther = selectedReason === "Lý do khác";

  const handleSubmit = async () => {
    setError(null);

    const reasonToSend = isOther ? otherReason.trim() : selectedReason;

    if (!reasonToSend) {
      setError("Vui lòng chọn hoặc nhập lý do huỷ đơn.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await cancelOrderRequest({
        orderId: order.id,
        reason: reasonToSend,
      });

      const newStatus = res.data; // "CANCELLED" hoặc "CANCEL_REQUESTED"

      if (newStatus === "CANCELLED") {
        toast.success("Đơn hàng đã được huỷ thành công");
      } else if (newStatus === "CANCEL_REQUESTED") {
        toast.success("Yêu cầu huỷ đơn đã được gửi, vui lòng chờ duyệt");
      } else {
        toast.success(res.data || "Yêu cầu huỷ đơn đã được xử lý");
      }

      onSuccess(); // load lại list
      closeToast();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Không thể huỷ đơn hàng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">Bạn có chắc muốn huỷ đơn hàng #{order.id}?</p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">
          Chọn lý do huỷ
        </label>
        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-blue-500"
        >
          {CANCEL_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {isOther && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600">
            Nhập lý do khác
          </label>
          <textarea
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            rows={3}
            className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-blue-500"
            placeholder="Ví dụ: Thay đổi kế hoạch, không còn nhận hàng vào thời gian này..."
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button
          className="px-3 py-1.5 rounded border text-xs md:text-sm"
          onClick={closeToast}
          disabled={submitting}
        >
          Hủy
        </button>
        <button
          className="px-3 py-1.5 rounded bg-red-600 text-white text-xs md:text-sm disabled:opacity-60"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Đang xử lý..." : "Xác nhận huỷ"}
        </button>
      </div>
    </div>
  );
}
