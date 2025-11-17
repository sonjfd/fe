import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/client/AppHeader";
import { ProductCard } from "@/components/client/ProductCard";
import { fetchMyWishlist } from "@/api/home.api";
import { useCurrentApp } from "@/components/context/AppContext";

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useCurrentApp();
  const navigate = useNavigate();

  const [pageData, setPageData] =
    useState<IModelPaginate<IWishlistProductVariant> | null>(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMyWishlist(page, size, "createdAt", "desc");
        setPageData(data as unknown as IModelPaginate<IWishlistProductVariant>);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, size, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container className="py-6">
        <p className="text-sm text-slate-500 mb-2">
          <Link to="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>{" "}
          / <span>Sản phẩm yêu thích</span>
        </p>
        <h1 className="text-2xl font-bold mb-4">Sản phẩm yêu thích</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-700">
            Vui lòng{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-semibold"
            >
              đăng nhập
            </button>{" "}
            để xem danh sách sản phẩm yêu thích.
          </p>
        </div>
      </Container>
    );
  }

  const total = pageData?.total ?? 0;
  const totalPages =
    pageData && pageData.size > 0
      ? Math.max(1, Math.ceil(pageData.total / pageData.size))
      : 1;

  return (
    <Container className="py-6">
      {/* Breadcrumb */}
      <p className="text-sm text-slate-500 mb-2">
        <Link to="/" className="hover:text-indigo-600">
          Trang chủ
        </Link>{" "}
        / <span>Sản phẩm yêu thích</span>
      </p>

      <h1 className="text-2xl font-bold mb-4">Sản phẩm yêu thích</h1>

      {/* Khung nội dung */}
      <div className="bg-transparent">
        {loading && (
          <div className="text-sm text-slate-500">Đang tải sản phẩm...</div>
        )}

        {!loading && total === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-700">
              Bạn chưa có sản phẩm yêu thích nào.
            </p>
          </div>
        )}

        {!loading && total > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {pageData?.items.map((item) => (
                <ProductCard
                  key={item.wishlistId}
                  productVariantId={item.variantId}
                  name={item.variantName || item.productName}
                  imageUrl={
                    item.thumbnailUrl ||
                    "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  discountPercent={0}
                  rating={5}
                  reviewCount={item.sold}
                  originalPrice={undefined}
                  salePrice={item.price}
                  stock={item.stock}
                  onClick={() => {
                    // sau này điều hướng sang trang chi tiết sản phẩm
                    // navigate(`/product/${item.variantId}`);
                    console.log("Go to product variant", item.variantId);
                  }}
                  onAddToCart={() => {
                    console.log("Add to cart from wishlist", item.variantId);
                  }}
                />
              ))}
            </div>

            {/* Phân trang đơn giản */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-2 py-1 text-sm">
                  Trang {pageData?.page ?? page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};
