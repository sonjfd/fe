import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllImagesByProduct,
  updateImage,
  deleteImage,
  type IProductImage,
} from "@/api/admin.images.api";
import { uploadFiles } from "@/api/file.api";
import UploadImagesModal from "./UploadImages";

export default function ProductImage() {
  const { id } = useParams();
  const pid = Number(id);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [images, setImages] = useState<IProductImage[]>([]);
  const [loading, setLoading] = useState(false);

  // Map lưu ref của từng input file ẩn
  const fileRefMap = useRef<Record<number, HTMLInputElement | null>>({});

  const load = async () => {
    try {
      if (!pid || Number.isNaN(pid)) {
        toast.error("Thiếu productId hợp lệ từ URL");
        return;
      }
      setLoading(true);
      const res = await getAllImagesByProduct(pid);
      if (res.data) {
        const arr = Array.isArray(res.data)
          ? res.data
          : ([] as IProductImage[]);
        setImages(arr);
      } else {
        toast.error(res.message || "Không tải được danh sách ảnh");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi tải ảnh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const handleReplace = async (img: IProductImage, file: File) => {
    try {
      const urls = await uploadFiles([file]);
      const url = urls[0];
      if (!url) {
        toast.error("Upload thất bại");
        return;
      }

      const res = await updateImage(img.id, { url });
      if (res.data) {
        toast.success("Đã cập nhật ảnh");
        load();
      } else {
        toast.error(res.message || "Cập nhật ảnh thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Đổi ảnh thất bại");
    } finally {
      const ref = fileRefMap.current[img.id];
      if (ref) ref.value = "";
    }
  };

  const onDelete = async (id: number) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Bạn có chắc muốn xóa ảnh này?</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await deleteImage(id);
                toast.success("Đã xoá ảnh");
                load();
                closeToast();
              }}
            >
              Xóa
            </button>
            <button className="px-3 py-1 rounded border" onClick={closeToast}>
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return (
    <>
      <div className="p-4">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-white rounded  border border-neutral-300 text-black px-4 py-2  hover:bg-neutral-50"
        >
          + Thêm ảnh
        </button>

        <UploadImagesModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          productId={pid}
          onUploaded={load}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ảnh sản phẩm — #{pid}</h2>
        </div>

        {loading && (
          <div className="p-4 text-sm text-neutral-500">Đang tải…</div>
        )}

        {!loading && images.length === 0 && (
          <div className="p-4 text-sm text-neutral-500">Chưa có ảnh</div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-lg border border-neutral-200 bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-neutral-50">
                <img
                  src={img.url}
                  alt={`Image ${img.id}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2 p-3">
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    Xem
                  </a>

                  <button
                    onClick={() => onDelete(img.id)}
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-600"
                  >
                    Xoá
                  </button>
                </div>
              </div>

              {/* input file ẩn để đổi ảnh */}
              <input
                ref={(el) => {
                  fileRefMap.current[img.id] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleReplace(img, f);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
