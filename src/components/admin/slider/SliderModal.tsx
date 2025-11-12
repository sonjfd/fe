import { createSlider, updateSlider, type Slider } from '@/api/admin.slider.api';
import { uploadToFolder } from '@/api/upload.api';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
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

export const SliderModal: React.FC<Props> = ({ open, onClose, initial, onSaved }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<SliderForm>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      redirectUrl: '',
      position: 0,
      active: true,
    },
    mode: 'onBlur',
  });

  const [uploading, setUploading] = useState(false);
  const imageUrl = watch('imageUrl');

  // nạp dữ liệu khi mở modal / đổi initial
  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        title: initial.title,
        description: initial.description || '',
        imageUrl: initial.imageUrl,
        redirectUrl: initial.redirectUrl || '',
        position: initial.position,
        active: initial.active,
      });
    } else {
      reset({
        title: '',
        description: '',
        imageUrl: '',
        redirectUrl: '',
        position: 0,
        active: true,
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (v: SliderForm) => {
    try {
      if (initial) {
        await updateSlider(initial.id, v);
      } else {
        await createSlider(v);
      }
      toast.success(initial ? 'Cập nhật slider thành công' : 'Tạo slider thành công');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi lưu slider');
    }
  };

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    e.stopPropagation(); // không để click rơi vào backdrop
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToFolder('sliders', file); // hoặc uploadToFolder từ '@/api/upload.api'
      setValue('imageUrl', url.data, { shouldDirty: true, shouldValidate: true });
      toast.success('Upload ảnh thành công');
    } catch (err: any) {
      toast.error(err?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
            <h3 className="text-lg font-semibold">{initial ? 'Chỉnh sửa Slider' : 'Tạo Slider'}</h3>
            <button
              onClick={onClose}
              disabled={isSubmitting || uploading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm">Tiêu đề *</label>
                <input
                  className={`mt-1 w-full rounded-lg border bg-white ${
                    errors.title ? 'border-rose-400' : 'border-gray-300'
                  } focus:border-indigo-500 focus:ring-indigo-500`}
                  {...register('title', { required: 'Bắt buộc', maxLength: { value: 255, message: 'Tối đa 255 ký tự' } })}
                />
                {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm">Vị trí</label>
                <input
                  type="number"
                  className={`mt-1 w-full rounded-lg border bg-white ${
                    errors.position ? 'border-rose-400' : 'border-gray-300'
                  } focus:border-indigo-500 focus:ring-indigo-500`}
                  {...register('position', { valueAsNumber: true, min: { value: 0, message: 'Không âm' } })}
                />
                {errors.position && <p className="text-xs text-rose-600 mt-1">{errors.position.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm">Mô tả</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  {...register('description', { maxLength: { value: 2000, message: 'Tối đa 2000 ký tự' } })}
                />
                {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm">Image URL (Cloudinary) *</label>
                <div className="grid gap-2 sm:grid-cols-2 items-end">
                  <div>
                    <input
                      placeholder="https://res.cloudinary.com/..."
                      className={`mt-1 w-full rounded-lg border bg-white ${
                        errors.imageUrl ? 'border-rose-400' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-indigo-500`}
                      {...register('imageUrl', { required: 'Bắt buộc' })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    {errors.imageUrl && <p className="text-xs text-rose-600 mt-1">{errors.imageUrl.message}</p>}
                    {!!imageUrl && <img src={imageUrl} alt="preview" className="mt-2 h-24 w-40 object-cover rounded border" />}
                    <p className="text-xs text-gray-500 mt-1">* Bạn có thể upload ảnh để tự động gán URL.</p>
                  </div>

                  <div>
                    <label className="text-sm">Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickFile}
                      disabled={uploading}
                      className="mt-1 block text-sm bg-white file:mr-2 file:px-3 file:py-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:text-sm file:text-gray-700 hover:file:bg-gray-50"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    {uploading && <p className="text-xs text-gray-500 mt-1">Đang upload…</p>}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm">Redirect URL</label>
                <input
                  placeholder="https://your-site/page"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  {...register('redirectUrl', { maxLength: { value: 500, message: 'Tối đa 500 ký tự' } })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {errors.redirectUrl && <p className="text-xs text-rose-600 mt-1">{errors.redirectUrl.message}</p>}
              </div>

              <label
                className="inline-flex items-center gap-2 text-sm"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input type="checkbox" className="h-4 w-4" {...register('active')} />
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
                {initial ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
