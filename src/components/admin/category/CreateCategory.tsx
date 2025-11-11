import { createCategory, fetchCategoriesForSelect } from "@/api/auth.api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Props = { onClose: () => void; onSuccess: () => void };

type FormData = {
  name: string;
  description?: string;
  parentId?: string; // string để đọc từ <select>, convert sang number | null khi gửi
};

export default function CreateCategory({ onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [parents, setParents] = useState<ICategoryRow[]>([]);

  useEffect(() => {
    (async () => {
      const all = await fetchCategoriesForSelect();
      setParents(all.filter((c) => c.parentId === null));
    })();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        parentId: data.parentId ? Number(data.parentId) : null,
      };
      const res = await createCategory(payload);
      if (res.data) {
        toast.success("Thêm danh mục thành công");
        reset();
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Thêm thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-6 w-[520px] space-y-4"
      >
        <h2 className="text-lg font-semibold">Thêm danh mục</h2>

        <div>
          <label className="block text-sm font-medium">
            Tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name", { required: "Không được bỏ trống" })}
            className="w-full border rounded px-3 py-2"
            placeholder="VD: Điện thoại"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Mô tả ngắn…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Danh mục cha</label>
          <select
            {...register("parentId")}
            className="w-full border rounded px-3 py-2"
            defaultValue=""
          >
            <option value="">— Không có cha —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="border rounded px-3 py-2"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-neutral-900 text-white rounded px-4 py-2"
          >
            Thêm
          </button>
        </div>
      </form>
    </div>
  );
}
