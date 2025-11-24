// FilterBar.tsx

const STATUS_OPTIONS: { value: ContactStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" } as any,
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "READ", label: "Đã đọc" },
  { value: "RESOLVED", label: "Đã xử lý" },
];

export const FiltersBar: React.FC<{
  status: ContactStatus | "ALL";
  setStatus: (s: ContactStatus | "ALL") => void;
  search: string;
  setSearch: (v: string) => void;
  size: number;
  setSize: (n: number) => void;
  startDate?: string;
  setStartDate: (v?: string) => void;
  endDate?: string;
  setEndDate: (v?: string) => void;
  sortDir: "asc" | "desc";
  setSortDir: (v: "asc" | "desc") => void;
}> = ({
  status,
  setStatus,
  search,
  setSearch,
  size,
  setSize,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortDir,
  setSortDir,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      {/* STATUS */}
      <div className="flex gap-2 text-sm">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`h-9 px-3 rounded-lg border ${
              status === s.value
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        {/* SEARCH */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-72 rounded-lg border-gray-200 pl-3 pr-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tìm theo tên / email / tiêu đề"
          />
        </div>

        {/* DATE RANGE */}
        <input
          type="date"
          value={startDate ?? ""}
          onChange={(e) => setStartDate(e.target.value || undefined)}
          className="h-10 rounded-lg border-gray-200 text-sm px-2"
        />
        <input
          type="date"
          value={endDate ?? ""}
          onChange={(e) => setEndDate(e.target.value || undefined)}
          className="h-10 rounded-lg border-gray-200 text-sm px-2"
        />

        {/* SORT DIRECTION (chỉ createdAt) */}
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
          className="h-10 rounded-lg border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>

        {/* PAGE SIZE */}
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="h-10 rounded-lg border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/trang
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

