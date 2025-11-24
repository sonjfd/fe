import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/client/AppHeader";
import { SearchBar } from "@/components/client/SearchBar";
import { ProductCard } from "@/components/client/ProductCard";
import { fetchSearchProducts } from "@/api/home.api";

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [page, setPage] = useState(Math.max(pageParam, 1));

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IModelPaginate<IHomeProductVariant> | null>(null);

  const size = 50;

  // Đồng bộ page state với query param
  useEffect(() => {
    setPage(Math.max(pageParam, 1));
  }, [pageParam]);

  // Load API: luôn gọi API kể cả khi q = ""
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSearchProducts(q, page, size); // q="" => trả full
        setResult(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, page]);

  const handleSubmitSearch = (keyword: string) => {
    setSearchParams({ q: keyword, page: "1" });
  };

  const onChangePage = (p: number) => {
    setSearchParams({ q, page: String(p) });
  };

  const total = result?.total ?? 0;
  const totalPages =
    result && result.size > 0
      ? Math.max(1, Math.ceil(result.total / result.size))
      : 1;

  // from/to
  const from = result && total > 0 ? (result.page - 1) * result.size + 1 : 0;
  const to =
    result && total > 0
      ? Math.min(result.page * result.size, result.total)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero search */}
      <section className="bg-slate-950 text-white py-10 sm:py-16">
        <Container>
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Tìm kiếm
            </h1>

            {q ? (
              <p className="text-sm sm:text-base text-slate-200">
                Có{" "}
                <b>{total.toLocaleString("vi-VN")}</b>{" "}
                kết quả cho từ khóa{" "}
                <span className="font-semibold">&quot;{q}&quot;</span>
              </p>
            ) : (
              <p className="text-sm sm:text-base text-slate-200">
                Hiển thị tất cả sản phẩm
              </p>
            )}
          </div>

          <SearchBar
            variant="hero"
            initialKeyword={q}
            onSubmit={handleSubmitSearch}
          />
        </Container>
      </section>

      {/* Kết quả */}
      <Container className="py-6 sm:py-8">
        {/* Loading */}
        {loading && (
          <div className="text-sm text-slate-500">Đang tải kết quả...</div>
        )}

        {/* Không có kết quả (chỉ khi API trả items rỗng) */}
        {!loading && result && result.items.length === 0 && (
          <div className="text-sm text-slate-500">
            Không tìm thấy sản phẩm nào.
          </div>
        )}

        {/* Có kết quả */}
        {!loading && result && result.items.length > 0 && (
          <>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              Hiển thị {from.toLocaleString("vi-VN")}–{to.toLocaleString("vi-VN")}{" "}
              trên tổng {total.toLocaleString("vi-VN")} sản phẩm
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {result.items.map((p) => (
                <ProductCard
                  key={p.variantId}
                  productVariantId={p.variantId}
                  name={p.productName}
                  imageUrl={
                    p.thumbnailUrl ||
                    "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  salePrice={p.price}
                  stock={p.stock}
                  discountPercent={0}
                  rating={5}
                  reviewCount={p.sold}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* prev */}
                  <button
                    disabled={page <= 1}
                    onClick={() => onChangePage(page - 1)}
                    className="h-9 px-3 rounded-full border text-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    «
                  </button>

                  {/* pages */}
                  {(() => {
                    const pages: number[] = [];
                    const start = Math.max(1, page - 2);
                    const end = Math.min(totalPages, page + 2);

                    for (let p = start; p <= end; p++) pages.push(p);

                    if (start > 1) pages.unshift(1);
                    if (end < totalPages) pages.push(totalPages);

                    return [...new Set(pages)]
                      .sort((a, b) => a - b)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const needDots = prev && p - prev > 1;

                        return (
                          <React.Fragment key={p}>
                            {needDots && (
                              <span className="px-1 text-sm text-slate-500">
                                …
                              </span>
                            )}
                            <button
                              onClick={() => onChangePage(p)}
                              className={`h-9 min-w-[36px] px-3 rounded-full border text-sm ${
                                p === page
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      });
                  })()}

                  {/* next */}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => onChangePage(page + 1)}
                    className="h-9 px-3 rounded-full border text-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};
