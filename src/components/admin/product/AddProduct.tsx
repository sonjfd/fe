import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

import axios from "services/axios.customize";
import { uploadFiles } from "@/api/file.api";
import { createProduct } from "@/api/admin.api";

interface IChildCategory {
  id: number;
  name: string;
}
interface IBackendRes<T> {
  message: string;
  data: T;
}

interface FormData {
  code: string;
  name: string;
  categoryId: string;
  description: string;
}

async function fetchChildCategories(): Promise<IChildCategory[]> {
  const res = await axios.get<IBackendRes<IChildCategory[]>>(
    "/api/v1/admin/categories/children"
  );
  return res.data ?? [];
}

export default function AddProductPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: { code: "", name: "", categoryId: "", description: "" },
  });

  const [categories, setCategories] = useState<IChildCategory[]>([]);
  const [loadingCat, setLoadingCat] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCat(true);
        setCategories(await fetchChildCategories());
      } catch (e: any) {
        toast.error(e?.message || "Không lấy được danh mục");
      } finally {
        setLoadingCat(false);
      }
    })();
  }, []);

  const desc = watch("description");

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const accepted = Array.from(e.target.files).filter((f) =>
      /image\//.test(f.type)
    );
    if (!accepted.length) return toast.info("Không có ảnh hợp lệ.");

    try {
      setUploading(true);
      const urls = await uploadFiles(accepted);
      setImageUrls((prev) => [...prev, ...urls]);
      toast.success(`Đã tải ${urls.length} ảnh`);
    } catch (err: any) {
      toast.error(err?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!(e.dataTransfer.files && e.dataTransfer.files.length)) return;
    const accepted = Array.from(e.dataTransfer.files).filter((f) =>
      /image\//.test(f.type)
    );
    if (!accepted.length) return;

    try {
      setUploading(true);
      const urls = await uploadFiles(accepted);
      setImageUrls((prev) => [...prev, ...urls]);
      toast.success(`Đã tải ${urls.length} ảnh`);
    } catch (err: any) {
      toast.error(err?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data: FormData) => {
    try {
      if (uploading) {
        toast.info("VUi lòng chờ");
        return;
      }

      if (imageUrls.length === 0) {
        toast.error("Vui lòng tải lên ít nhất một ảnh sản phẩm!");
        return;
      }

      setSaving(true);

      const payload = {
        code: data.code.trim(),
        name: data.name.trim(),
        description: desc || "",
        imgURL: imageUrls,
        category: { id: Number(data.categoryId) },
      };

      const res = await createProduct(payload);
      if (res.data) {
        reset();
        setImageUrls([]);
        toast.success("Tạo sản phẩm thành công");
      } else {
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi tạo sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            ← Quay lại
          </button>
          <h1 className="text-xl font-semibold">Thêm mới sản phẩm</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || uploading}
            className={`rounded-md px-4 py-2 text-sm text-white ${
              saving || uploading
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-neutral-900 hover:opacity-90"
            }`}
          >
            {saving ? "Đang lưu…" : uploading ? "Đang upload ảnh…" : "Lưu"}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {/* Left column */}
        <div className="md:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 text-sm font-semibold">Thông tin cơ bản</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Mã sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("code", {
                    required: "Vui lòng nhập mã sản phẩm",
                    validate: (v) =>
                      v.trim().length > 0 || "Không được chỉ nhập khoảng trắng",
                  })}
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  placeholder="VD: SP001"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.code.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", {
                    required: "Vui lòng nhập tên sản phẩm",
                    validate: (v) =>
                      v.trim().length > 0 || "Không được chỉ nhập khoảng trắng",
                  })}
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                {...register("categoryId", {
                  required: "Vui lòng chọn danh mục",
                })}
                className="w-full rounded border border-neutral-300 px-3 py-2"
                defaultValue=""
              >
                <option value="">-- Chọn danh mục --</option>
                {loadingCat ? (
                  <option value="" disabled>
                    Đang tải…
                  </option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 text-sm font-semibold">Mô tả sản phẩm</div>
            <ReactQuill
              theme="snow"
              value={desc}
              onChange={(html) =>
                setValue("description", html, { shouldDirty: true })
              }
            />
            <div className="mt-2 text-xs text-neutral-500">
              Bạn có thể chèn chữ đậm, danh sách, link, ảnh (qua URL), v.v.
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="rounded-lg border p-4">
            <div className="mb-3 text-sm font-semibold">Ảnh sản phẩm</div>

            <div
              className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-300 p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <input
                id="picker"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickFiles}
              />
              <label htmlFor="picker" className="cursor-pointer text-sm">
                Kéo & thả ảnh vào đây hoặc{" "}
                <span className="font-semibold underline">chọn từ máy</span>
              </label>
              <div className="mt-1 text-xs text-neutral-500">
                PNG, JPG • Tối đa vài MB mỗi ảnh
              </div>
            </div>

            {!!imageUrls.length && (
              <div className="grid grid-cols-3 gap-3">
                {imageUrls.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative overflow-hidden rounded-md border"
                  >
                    <img
                      src={src}
                      alt="preview"
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!imageUrls.length && (
              <div className="text-center text-sm text-neutral-500">
                Chưa có ảnh nào.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
