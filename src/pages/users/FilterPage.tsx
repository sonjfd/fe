import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/client/ProductCard";
import { fetchVariantByCategory } from "@/api/home.api";
import { useParams } from "react-router-dom";

export default function CategoryPage() {
  const { id } = useParams();
  const cid = Number(id);

  const [data, setData] = useState<IModelPaginate<VariantFilter> | null>(null);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<"newest" | "popular" | "asc" | "desc">(
    "newest"
  );
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchVariantByCategory(cid);
        const payload = res.data;
        setData(payload ?? null);
      } catch (err) {
        console.error("API Error:", err);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const variants = data?.items ?? [];

  const togglePrice = (value: string) => {
    setPriceFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  };

  const matchPrice = (v: VariantFilter) => {
    if (priceFilters.length === 0) return true;
    const rules: Record<string, (p: number) => boolean> = {
      low: (p) => p <= 5000000,
      mid: (p) => p > 5000000 && p <= 15000000,
      high: (p) => p > 15000000,
    };
    return priceFilters.some((key) => rules[key](v.price));
  };

  const processed = useMemo(() => {
    let arr = variants.filter(matchPrice);
    arr = arr.sort((a, b) => {
      switch (sort) {
        case "popular":
          return b.sold - a.sold;
        case "asc":
          return a.price - b.price;
        case "desc":
          return b.price - a.price;
        default:
          return b.id - a.id;
      }
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants, priceFilters, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = processed.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div>Đang tải...</div>
        ) : !data ? (
          <div>Không có dữ liệu</div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-4">Danh sách sản phẩm</h1>
            <div className="grid grid-cols-12 gap-6">
              <aside className="col-span-3 bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Khoảng giá</h2>
                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceFilters.includes("low")}
                    onChange={() => togglePrice("low")}
                  />
                  <span>0-5.000.000đ</span>
                </label>
                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceFilters.includes("mid")}
                    onChange={() => togglePrice("mid")}
                  />
                  <span>5.000.000đ - 15.000.000đ</span>
                </label>
                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceFilters.includes("high")}
                    onChange={() => togglePrice("high")}
                  />
                  <span>Trên 15.000.000đ</span>
                </label>
              </aside>
              <main className="col-span-9">
                <div className="flex justify-between mb-4">
                  <div className="flex bg-gray-100 rounded-full p-1">
                    {[
                      { id: "newest", label: "Mới nhất" },
                      { id: "popular", label: "Phổ biến" },
                      { id: "asc", label: "Giá tăng" },
                      { id: "desc", label: "Giá giảm" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSort(t.id as any)}
                        className={`px-3 py-1 rounded-full ${
                          sort === t.id
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border px-2 py-1 rounded"
                  >
                    <option value={6}>6 / trang</option>
                    <option value={12}>12 / trang</option>
                    <option value={20}>20 / trang</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pageData.map((v) => (
                    <ProductCard
                      key={v.id}
                      productVariantId={v.id}
                      name={v.name}
                      imageUrl={v.thumbnail}
                      salePrice={v.price}
                      stock={v.stock}
                      rating={5}
                      reviewCount={0}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    Trước
                  </button>
                  <span>
                    Trang <b>{safePage}</b> / {totalPages}
                  </span>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
