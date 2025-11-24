import {
  deleteContactMessage,
  getContactMessage,
  listContactMessages,
  updateContactStatus,
  bulkDeleteContactMessages,
  bulkUpdateContactStatus
} from "@/api/admin.contact.api";
import { useEffect, useMemo, useState } from "react";
import { FiltersBar } from "./FilterBar";
import { StatusPill } from "./StatusPill";
import { ContactDetailModal } from "./ContactDetailModal";
import { confirmToast } from "@/components/ConfirmToast";
import { toast } from "react-toastify";
import { useDebounce } from "@/hook/UseDebounce";

export const ContactTable: React.FC = () => {
  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10);

  // === Filter states ===
  const [status, setStatus] = useState<ContactStatus | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);


  // === Data states ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IModelPaginate<ContactMessage>>({
    page: 0,
    size: 10,
    total: 0,
    items: [],
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ContactMessage | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / (size || 10))),
    [data, size]
  );

  // === Fetch data ===
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const res = await listContactMessages({
        page,
        size,
        status,
        search:debouncedSearch,
        startDate,
        endDate,
        sortDir,
      });

      if (res) setData(res);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, status, debouncedSearch, startDate, endDate, sortDir]);

  const allSelected =
  data.items.length > 0 &&
  data.items.every((m) => selectedIds.includes(m.id));

const isSelected = (id: number) => selectedIds.includes(id);

const toggleSelectAll = () => {
  if (allSelected) {
    setSelectedIds([]);
  } else {
    setSelectedIds(data.items.map((m) => m.id));
  }
};

const toggleSelectOne = (id: number) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

async function handleBulkStatus(next: ContactStatus) {
  if (selectedIds.length === 0) return;
  const map = {
    PENDING: "chờ xử lý",
    READ: "đã đọc",
    RESOLVED: "đã xử lý",
  }

  const ok = await confirmToast(
    `Bạn có chắc muốn cập nhật trạng thái ${selectedIds.length} liên hệ sang "${map[next]}"?`
  );
  if (!ok) return;

  await bulkUpdateContactStatus(selectedIds, next);

  toast.success("Cập nhật trạng thái thành công!");

  setSelectedIds([]);
  fetchData();
}


async function handleBulkDelete() {
  if (selectedIds.length === 0) return;

  const ok = await confirmToast(
    `Bạn có chắc muốn xoá ${selectedIds.length} liên hệ đã chọn?`
  );
  if (!ok) return;

  await bulkDeleteContactMessages(selectedIds);

  toast.success("Đã xoá thành công!");

  setSelectedIds([]);
  fetchData();
}



  async function handleStatus(id: number, next: ContactStatus) {
    await updateContactStatus(id, next);
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xoá liên hệ này?")) return;
    await deleteContactMessage(id);
    fetchData();
  }

  async function openDetail(id: number) {
    const item = await getContactMessage(id);
    if (item) setDetailItem(item);
    setDetailOpen(true);
  }

  return (
    <>
      <div className="rounded-lg border border-neutral-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <h2 className="text-lg font-semibold">Liên hệ</h2>

          {selectedIds.length > 0 && (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">
        Đã chọn {selectedIds.length} liên hệ
      </span>
      <button
        onClick={() => handleBulkStatus("READ")}
        className="rounded-md border border-gray-200 px-3 py-1 hover:bg-gray-50"
        title="Đánh dấu tất cả là đã đọc"
      >
        Đánh dấu đã đọc
      </button>
      <button
        onClick={() => handleBulkStatus("RESOLVED")}
        className="rounded-md border border-gray-200 px-3 py-1 hover:bg-gray-50"
        title="Đánh dấu tất cả là đã xử lý"
      >
        Đã xử lý
      </button>
      <button
        onClick={handleBulkDelete}
        className="rounded-md border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
        title="Xoá các liên hệ đã chọn"
      >
        Xoá
      </button>
    </div>
  )}
        </div>

        {/* Filter bar */}
        <FiltersBar
          status={status}
          setStatus={(s) => {
            setPage(0);
            setStatus(s);
          }}
          search={searchInput}
          setSearch={(v) => {
            setPage(0);
            setSearchInput(v);
          }}
          size={size}
          setSize={(n) => {
            setPage(0);
            setSize(n);
          }}
          startDate={startDate}
          setStartDate={(v) => {
            setPage(0);
            setStartDate(v);
          }}
          endDate={endDate}
          setEndDate={(v) => {
            setPage(0);
            setEndDate(v);
          }}
          sortDir={sortDir}
          setSortDir={(v) => {
            setPage(0);
            setSortDir(v);
          }}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    title="Chọn / bỏ chọn tất cả"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Stt
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu…
                  </td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                data.items.map((m: ContactMessage, idx:number) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected(m.id)}
                        onChange={() => toggleSelectOne(m.id)}
                        title={isSelected(m.id) ? "Bỏ chọn" : "Chọn liên hệ này"}
                      />
                    </td>
                    {/* STT */}
                    <td className="px-6 py-4">{page * size + idx + 1}</td>

                    {/* Tên + phone */}
                    <td className="px-6 py-4">
                      <div className="font-medium">{m.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {m.phone || ""}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm">{m.email}</td>

                    {/* Tiêu đề */}
                    <td className="px-6 py-4 text-sm truncate max-w-[18rem]">
                      {m.subject || "—"}
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-6 py-4 text-sm">
                      {new Date(m.createdAt).toLocaleString("vi-VN")}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4">
                      <StatusPill status={m.status} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => openDetail(m.id)}
                          className="hover:text-gray-900"
                          title="Xem chi tiết liên hệ"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
                            />
                            <circle cx="12" cy="12" r="3.25" />
                          </svg>
                        </button>

                        {/* Đánh dấu đã đọc */}
                        {m.status !== "READ" && (
                          <button
                            onClick={() => handleStatus(m.id, "READ")}
                            className="hover:text-gray-900"
                            title="Đánh dấu là đã đọc"
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4M7.5 4.5h9A2.5 2.5 0 0 1 19 7v10a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17V7A2.5 2.5 0 0 1 7.5 4.5z"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Đánh dấu đã xử lý */}
                        {m.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleStatus(m.id, "RESOLVED")}
                            className="hover:text-gray-900"
                            title="Đánh dấu là đã xử lý"
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 9.75l-6 6-3-3"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Xoá */}
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="hover:text-red-600"
                          title="Xoá liên hệ này"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 text-sm">
          <span className="text-gray-500">
            Hiển thị {data.items.length} / {data.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-9 w-9 rounded-lg border ${
                  page === i
                    ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                    : "border-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <ContactDetailModal
        open={detailOpen}
        item={detailItem ?? undefined}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};
