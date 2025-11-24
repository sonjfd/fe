import { updateOrder } from "@/api/admin.order";
import { useState } from "react";
import { toast } from "react-toastify";

interface UpdateOrderModalProps {
  order: Order;
  setOpenModalUpdate: (v: boolean) => void;
  load: () => Promise<void>;
}

export const UpdateOrderModal = ({
  order,
  setOpenModalUpdate,
  load,
}: UpdateOrderModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await updateOrder(order.id, paymentStatus, orderStatus);
      if (res.data) {
        toast.success("Cập nhật đơn hàng thành công");
        setOpenModalUpdate(false);
        load();
      } else {
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Cập nhật đơn #{order.id}</h3>

        <div className="mb-3 text-sm">
          <div className="font-medium">{order.user.fullName}</div>
          <div className="text-xs text-neutral-500">{order.user.email}</div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium">
              Trạng thái thanh toán
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">
              Trạng thái đơn hàng
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded border px-3 py-1.5 text-sm"
            onClick={() => setOpenModalUpdate(false)}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};
