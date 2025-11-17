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
}> = ({ status, setStatus, search, setSearch, size, setSize }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
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
      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-72 rounded-lg border-gray-200 pl-3 pr-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tìm theo tên / email / tiêu đề"
          />
          <svg
            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
        </div>
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
