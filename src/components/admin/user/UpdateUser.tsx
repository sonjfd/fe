import { updateUser } from "@/api/admin.api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = { user: IUser; onClose: () => void; onSuccess: () => void };

export default function UpdateUser({ user, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IUpdateUserReq>();

  useEffect(() => {
    if (user) {
      reset({
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        gender: (user.gender || "MALE") as any,
        status: user.status,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: IUpdateUserReq) => {
    try {
      const res = await updateUser(data);
      if (res.data) {
        toast.success("Cập nhật thành công");
        onSuccess();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[520px] space-y-3 rounded-lg bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold">Cập nhật người dùng</h3>

        <div>
          <label className="text-sm font-medium">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName", { required: "Bắt buộc" })}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">SĐT</label>
            <input
              {...register("phone")}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Giới tính</label>
            <select
              {...register("gender")}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Trạng thái</label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="NOT_ACTIVE">NOT_ACTIVE</option>
            <option value="BAN">BAN</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-3 py-2"
          >
            Đóng
          </button>
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-white"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
