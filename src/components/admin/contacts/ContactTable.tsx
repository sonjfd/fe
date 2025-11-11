import {
  deleteContactMessage,
  getContactMessage,
  listContactMessages,
  updateContactStatus,
} from "@/api/admin.contact.api";
import { useEffect, useMemo, useState } from "react";
import { Card } from "./Card";
import { FiltersBar } from "./FilterBar";
import { StatusPill } from "./StatusPill";
import { ContactDetailModal } from "./ContactDetailModal";

export const ContactTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<ContactStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
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
    () => Math.max(1, Math.ceil((data?.total || 0) / (data?.size || 10))),
    [data]
  );

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await listContactMessages({ page, size, status, search });
      if (res) {
        setData({
          ...res,
          items: res.items.map((it) => ({
            ...it,
            full_name: it.full_name,
            created_at: it.created_at,
          })),
        });
      }
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, status, search]);

  async function handleStatus(id: number, next: ContactStatus) {
    await updateContactStatus(id, next);
    fetchData();
  }
  async function handleDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
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
      <Card>
        <FiltersBar
          status={status}
          setStatus={(s) => {
            setPage(0);
            setStatus(s);
          }}
          search={search}
          setSearch={(v) => {
            setPage(0);
            setSearch(v);
          }}
          size={size}
          setSize={(n) => {
            setPage(0);
            setSize(n);
          }}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Subject
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Created
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}

              {data.items.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{m.full_name}</div>
                    <div className="text-xs text-gray-500">{m.phone || ""}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{m.email}</td>
                  <td className="px-6 py-4 text-sm truncate max-w-[18rem]">
                    {m.subject || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={m.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <button
                        onClick={() => openDetail(m.id)}
                        className="hover:text-gray-900"
                        title="View"
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
                      {m.status !== "READ" && (
                        <button
                          onClick={() => handleStatus(m.id, "READ")}
                          className="hover:text-gray-900"
                          title="Mark as Read"
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
                      {m.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleStatus(m.id, "RESOLVED")}
                          className="hover:text-gray-900"
                          title="Resolve"
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
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="hover:text-red-600"
                        title="Delete"
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
            Showing {data.items.length} of {data.total} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const n = i; // show first 5 pages for simplicity
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg border ${
                    page === n
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-gray-200"
                  }`}
                >
                  {n + 1}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </Card>

      <ContactDetailModal
        open={detailOpen}
        item={detailItem ?? undefined}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};
