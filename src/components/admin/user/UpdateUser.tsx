import { updateUser } from "@/api/admin.api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = { user: IUser; onClose: () => void; onSuccess: () => void };

export default function UpdateUser({ user, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm<IUpdateUserReq>();

  useEffect(() => {
    if (user) {
      reset({
        id: user.id,
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
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e?.message);
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
          <label className="text-sm font-medium">Trạng thái</label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="NOT_ACTIVE">Chưa kích hoạt</option>
            <option value="BAN">Khoá</option>
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
