import { useForm } from "react-hook-form";
import { createUser } from "@/api/admin.api";
import { toast } from "react-toastify";

type Props = { onClose: () => void; onSuccess: () => void };

export default function CreateUser({ onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ICreateUserReq>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      status: "ACTIVE",
      gender: "MALE",
      role: { id: 1 },
    },
  });

  const onSubmit = async (data: ICreateUserReq) => {
    try {
      const res = await createUser(data);
      if (res.data) {
        toast.success("Tạo người dùng thành công");
        reset();
        onSuccess();
      } else {
        toast.error(res.message || "Tạo thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Tạo thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[520px] space-y-3 rounded-lg bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold">Tạo người dùng</h3>

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

        <div>
          <label className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email", { required: "Bắt buộc" })}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password", { required: "Bắt buộc" })}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
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

        <div className="grid gap-3 md:grid-cols-2">
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
          <div>
            <label className="text-sm font-medium">Role ID</label>
            <input
              type="number"
              {...register("role.id", { valueAsNumber: true })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-3 py-2"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-white"
          >
            Tạo
          </button>
        </div>
      </form>
    </div>
  );
}
