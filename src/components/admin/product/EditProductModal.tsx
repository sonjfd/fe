import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchChildCategories, updateProduct } from "@/api/admin.api";
import { toast } from "react-toastify";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  selectedProduct: IProductTable | null;
};

interface FormData {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
}

export default function EditProductModal({
  onClose,
  onSuccess,
  selectedProduct,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const [categories, setCategories] = useState<IChildCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchChildCategories();
        setCategories(res);
      } catch (e: any) {
        toast.error(e.message);
      }
    })();
  }, []);

  // Khi selectedProduct thay đổi → fill lại form
  useEffect(() => {
    if (selectedProduct) {
      reset({
        code: selectedProduct.code,
        name: selectedProduct.name,
        categoryId: selectedProduct.category.id.toString(),
      });
    }
  }, [selectedProduct, reset]);

  if (!selectedProduct) return null;

  const submit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await updateProduct(
        selectedProduct.id,
        data.code,
        data.name,
        { id: data.categoryId }
      );
      if (res.data) {
        toast.success("Cập nhật sản phẩm thành công");
        onSuccess(); // cho parent reload list
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Cập nhật sản phẩm thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit(submit)}
        className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl space-y-4"
      >
        <h2 className="text-lg font-semibold">Chỉnh sửa sản phẩm</h2>

        <div>
          <label className="block text-sm font-medium">
            Mã sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            {...register("code", {
              required: "Không được bỏ trống",
              validate: (value) =>
                value.trim().length > 0 || "Không được chỉ nhập khoảng trắng",
            })}
            className="w-full border rounded px-3 py-2"
            disabled={submitting}
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name", {
              required: "Không được bỏ trống",
              validate: (value) =>
                value.trim().length > 0 || "Không được chỉ nhập khoảng trắng",
            })}
            className="w-full border rounded px-3 py-2"
            disabled={submitting}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoryId", { required: "Vui lòng chọn danh mục" })}
            className="w-full border rounded px-3 py-2"
            disabled={submitting}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option
                key={c.id}
                value={c.id}
                selected={selectedProduct.category.id === c.id}
              >
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="border rounded px-3 py-2"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-neutral-900 text-white rounded px-4 py-2 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
