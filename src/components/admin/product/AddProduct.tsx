import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createProduct, fetchChildCategories } from "@/api/admin.api";
import { toast } from "react-toastify";

type Props = { onClose: () => void; onSuccess: () => void };

interface FormData {
  code: string;
  name: string;
  categoryId: string;
}

export default function AddProduct({ onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [categories, setCategories] = useState<IChildCategory[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetchChildCategories();
      setCategories(res);
    })();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const { code, name, categoryId } = data;
      const res = await createProduct(code, name, { id: categoryId });
      if (res.data) {
        toast.success("Tạo thành công");
        reset();
        onClose();
        onSuccess();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-6 w-[520px] space-y-4"
      >
        <h2 className="text-lg font-semibold mb-2">Thêm mới sản phẩm</h2>

        <div>
          <label className="block text-sm font-medium">
            Mã sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            {...register("code", { required: "Vui lòng nhập mã sản phẩm" })}
            className="w-full border rounded px-3 py-2"
            placeholder="VD: SP001"
          />
          {errors.code && (
            <p className="text-red-500 text-sm mt-1">{`${errors.code.message}`}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name", { required: "Vui lòng nhập tên sản phẩm" })}
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập tên sản phẩm"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{`${errors.name.message}`}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoryId", { required: "Vui lòng chọn danh mục" })}
            className="w-full border rounded px-3 py-2"
            defaultValue=""
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{`${errors.categoryId.message}`}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-neutral-100"
          >
            Huỷ
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Thêm
          </button>
        </div>
      </form>
    </div>
  );
}
