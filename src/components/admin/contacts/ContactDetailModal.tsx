// ContactDetailModal.tsx

import { StatusPill } from "./StatusPill";

export const ContactDetailModal: React.FC<{
  open: boolean;
  item?: ContactMessage | null;
  onClose: () => void;
}> = ({ open, item, onClose }) => {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto my-10 w-[92%] max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">Chi tiết liên hệ</h3>
            <p className="text-sm text-gray-500">Mã #{item.id}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
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
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-gray-500">Họ và tên</span>
              <div className="font-medium">{item.full_name}</div>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <div className="font-medium">{item.email}</div>
            </div>
            {item.phone && (
              <div>
                <span className="text-gray-500">Số điện thoại</span>
                <div className="font-medium">{item.phone}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Trạng thái</span>
              <div className="mt-1">
                <StatusPill status={item.status} />
              </div>
            </div>
            <div>
              <span className="text-gray-500">Ngày tạo</span>
              <div className="font-medium">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Cập nhật lần cuối</span>
              <div className="font-medium">
                {new Date(item.updated_at).toLocaleString()}
              </div>
            </div>
          </div>

          {item.subject && (
            <div>
              <div className="text-sm text-gray-500">Tiêu đề</div>
              <div className="font-medium">{item.subject}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-500">Nội dung</div>
            <div className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-3 leading-relaxed text-gray-800">
              {item.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
