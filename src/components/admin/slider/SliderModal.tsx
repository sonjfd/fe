import { createSlider, updateSlider, type Slider } from "@/api/admin.slider.api";
import { uploadToFolder } from "@/api/upload.api";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export interface SliderForm {
  title: string;
  description?: string;
  imageUrl: string;
  redirectUrl?: string;
  position: number;
  active: boolean;
}

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Slider | null;
  onSaved: () => void;
};

export const SliderModal: React.FC<Props> = ({
  open,
  onClose,
  initial,
  onSaved,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<SliderForm>({
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      redirectUrl: "",
      position: 0,
      active: true,
    },
    mode: "onBlur",
  });

  const [uploading, setUploading] = useState(false);
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        title: initial.title,
        description: initial.description || "",
        imageUrl: initial.imageUrl,
        redirectUrl: initial.redirectUrl || "",
        position: initial.position,
        active: initial.active,
      });
    } else {
      reset({
        title: "",
        description: "",
        imageUrl: "",
        redirectUrl: "",
        position: 0,
        active: true,
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (v: SliderForm) => {
    try {
      if (!v.imageUrl) {
        setError("imageUrl", {
          type: "manual",
          message: "Vui lòng upload ảnh slider",
        });
        return;
      }

      if (initial) {
        await updateSlider(initial.id, v);
      } else {
        await createSlider(v);
      }

      toast.success(initial ? "Cập nhật slider thành công" : "Tạo slider thành công");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi lưu slider");
    }
  };

  // ==== HANDLERS UPLOAD (theo style AddProduct, không dùng toast) ====
  const doUpload = async (file: File) => {
    try {
      setUploading(true);
      clearErrors("imageUrl");

      const res = await uploadToFolder("sliders", file);
      const url = (res as any)?.data;

      if (!url) {
        setError("imageUrl", {
          type: "manual",
          message: "Không nhận được link ảnh từ server",
        });
      } else {
        setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
      }
    } catch (err: any) {
      setError("imageUrl", {
        type: "manual",
        message: err?.message || "Upload thất bại, vui lòng thử lại",
      });
    } finally {
      setUploading(false);
    }
  };

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\//.test(file.type)) {
      setError("imageUrl", {
        type: "manual",
        message: "File không phải ảnh hợp lệ",
      });
      e.target.value = "";
      return;
    }
    await doUpload(file);
    e.target.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fileList = e.dataTransfer.files;
    if (!(fileList && fileList.length)) return;
    const file = Array.from(fileList).find((f) => /image\//.test(f.type));
    if (!file) {
      setError("imageUrl", {
        type: "manual",
        message: "Không có ảnh hợp lệ",
      });
      return;
    }
    await doUpload(file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => {
          if (!isSubmitting && !uploading) onClose();
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4">
        <Card className="relative z-10 my-10 w-full max-w-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <h3 className="text-lg font-semibold">
              {initial ? "Chỉnh sửa Slider" : "Tạo Slider"}
            </h3>
            <button
              onClick={onClose}
              disabled={isSubmitting || uploading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Đóng"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm">Tiêu đề *</label>
                <input
                  className={`mt-1 w-full rounded-lg border bg-white ${
                    errors.title ? "border-rose-400" : "border-gray-300"
                  } focus:border-indigo-500 focus:ring-indigo-500`}
                  {...register("title", {
                    required: "Bắt buộc",
                    maxLength: { value: 255, message: "Tối đa 255 ký tự" },
                  })}
                />
                {errors.title && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm">Vị trí</label>
                <input
                  type="number"
                  className={`mt-1 w-full rounded-lg border bg-white ${
                    errors.position ? "border-rose-400" : "border-gray-300"
                  } focus:border-indigo-500 focus:ring-indigo-500`}
                  {...register("position", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Không âm" },
                  })}
                />
                {errors.position && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm">Mô tả</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  {...register("description", {
                    maxLength: { value: 2000, message: "Tối đa 2000 ký tự" },
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* ==== KHU VỰC UPLOAD ẢNH THEO MẪU AddProduct ==== */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm">Ảnh slider *</label>

                {/* Hidden input để react-hook-form quản lý imageUrl */}
                <input
                  type="hidden"
                  {...register("imageUrl", { required: "Vui lòng upload ảnh" })}
                />

                <div
                  className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-300 p-6 text-center"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={onDrop}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    id="slider-image-picker"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickFile}
                  />
                  <label
                    htmlFor="slider-image-picker"
                    className="cursor-pointer text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Kéo & thả ảnh vào đây hoặc{" "}
                    <span className="font-semibold underline">chọn từ máy</span>
                  </label>
                  <div className="mt-1 text-xs text-neutral-500">
                    PNG, JPG • Tối đa vài MB
                  </div>
                  {uploading && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Đang upload ảnh…
                    </div>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative inline-block overflow-hidden rounded-md border">
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="aspect-video max-h-48 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500 text-center">
                    Chưa có ảnh nào.
                  </div>
                )}

                {errors.imageUrl && (
                  <p className="mt-2 text-xs text-rose-600">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>
              {/* ==== HẾT PHẦN UPLOAD ==== */}

              <div className="sm:col-span-2">
                <label className="text-sm">Redirect URL</label>
                <input
                  placeholder="https://your-site/page"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  {...register("redirectUrl", {
                    maxLength: { value: 500, message: "Tối đa 500 ký tự" },
                  })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {errors.redirectUrl && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.redirectUrl.message}
                  </p>
                )}
              </div>

              <label
                className="inline-flex items-center gap-2 text-sm"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input type="checkbox" className="h-4 w-4" {...register("active")} />
                <span>Active</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg px-4 h-10 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled={isSubmitting || uploading}
              >
                Huỷ
              </button>
              <button
                disabled={isSubmitting || uploading}
                className="inline-flex items-center justify-center rounded-lg px-4 h-10 bg-indigo-600 text-white hover:bg-indigo-500"
              >
                {initial ? "Lưu thay đổi" : "Tạo mới"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
