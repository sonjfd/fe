import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadFiles } from "@/api/file.api";
import { createProduct } from "@/api/admin.images.api";

interface UploadImagesModalProps {
  productId: number;
  open: boolean;
  onClose: () => void;
  onUploaded?: () => Promise<void>;
}

export default function UploadImagesModal({
  productId,
  open,
  onClose,
  onUploaded,
}: UploadImagesModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const valid = files.filter((f) => /image\/(png|jpe?g|webp)/.test(f.type));

    if (valid.length === 0) {
      toast.warning("Vui lòng chọn ảnh hợp lệ (png, jpg, jpeg, webp).");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.info("Chưa có ảnh nào được chọn.");
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls = await uploadFiles(selectedFiles);

      if (!uploadedUrls.length) {
        toast.error("Upload thất bại, vui lòng thử lại.");
        return;
      }

      for (const url of uploadedUrls) {
        const res = await createProduct(productId, { url });
        if (res.data) {
          toast.success("Tải ảnh lên thành công!");
          await onUploaded?.();
          handleClose();
        } else {
          toast.error(res.message);
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-5 animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Thêm ảnh sản phẩm
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <label className="block">
          <span className="font-medium text-gray-700">Chọn ảnh sản phẩm:</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleSelectFiles}
            className="bg-white rounded  border border-neutral-300 text-black px-4 py-2  hover:bg-neutral-50"
          />
        </label>

        {/* Preview ảnh */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`preview-${index}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            disabled={uploading}
            onClick={handleUpload}
            className={`px-5 py-2 rounded-md font-medium text-black ${
              uploading
                ? "bg-white cursor-not-allowed"
                : "bg-white rounded  border border-neutral-300  px-4 py-2  hover:bg-neutral-50"
            }`}
          >
            {uploading ? "Đang tải..." : "Tải ảnh lên"}
          </button>
        </div>
      </div>
    </div>
  );
}
