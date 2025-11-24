import {
  fetchHomeCategories,
  fetchHomeProducts,
  fetchMyWishlist,
  fetchSliders,
} from "@/api/home.api";
import { Container } from "@/components/client/AppHeader";
import { PartnersSection } from "@/components/client/PartnersSection";
import { ProductCard } from "@/components/client/ProductCard";
import { TestimonialsSection } from "@/components/client/TestimonialsSection";
import { useCurrentApp } from "@/components/context/AppContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ---------- Hero + left category menu ----------

export const LeftCategoryMenu: React.FC<{ categories: IHomeCategory[] }> = ({
  categories,
}) => {
  // chỉ giữ lại category có children
  const parentWithChildren = categories.filter(
    (c) => c.children && c.children.length > 0
  );

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="font-semibold">NGÀNH HÀNG</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <ul className="divide-y divide-slate-100">
        {parentWithChildren.map((c) => (
          <li
            key={c.id}
            className="group relative flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-slate-50"
          >
            <span className="flex-1">
              {c.name}
            </span>

            <span className="ml-2 text-slate-400 group-hover:text-slate-700">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>

            {/* submenu con */}
            <div
              className={`
                pointer-events-none
                absolute top-0 left-full
                hidden w-56 bg-white border border-slate-200 shadow-lg
                group-hover:block group-hover:pointer-events-auto z-[999]
              `}
            >
              <ul className="py-2">
                {c.children.map((child) => (
                  <li
                    key={child.id}
                    className="px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    <Link
                      to={`/category/${child.id}`}
                      className="block text-slate-700"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Hero: React.FC<{
  categories: IHomeCategory[];
  sliders: ISlider[];
}> = ({ categories, sliders }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (sliders.length === 0) return;

    const t = setInterval(() => {
      setI((prev) => (prev + 1) % sliders.length);
    }, 5000);

    return () => clearInterval(t);
  }, [sliders]);

  if (sliders.length === 0) {
    return <div className="h-[320px] bg-slate-100 rounded-2xl animate-pulse" />;
  }

  const s = sliders[i];
  return (
    <Container className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4">
        <LeftCategoryMenu categories={categories} />
        {/* SLIDER */}
        <div className="relative overflow-hidden rounded-2xl">
          <Link to={s.redirectUrl}>
            <img
              src={s.imageUrl}
              alt={s.title}
              className="h-[220px] sm:h-[320px] md:h-[420px] w-full object-cover"
            />
          </Link>

          {/* indicators */}
          <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex gap-2">
            {sliders.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setI(idx)}
                className={`h-2.5 w-2.5 rounded-full cursor-pointer ${
                  idx === i ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

// ---------- Category grid section ----------
const DEFAULT_CATEGORY_IMAGE =
  "https://picsum.photos/seed/category/400/400";

type StaticCategory = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
};

const STATIC_CATEGORIES: StaticCategory[] = [
  {
    id: 1,
    name: "Điện thoại",
    slug: "dien-thoai",
    imageUrl:
      "https://picsum.photos/seed/phone/400/400",
  },
  {
    id: 2,
    name: "Laptop",
    slug: "laptop",
    imageUrl:
      "https://picsum.photos/seed/laptop/400/400",
  },
  {
    id: 3,
    name: "Tablet",
    slug: "tablet",
    imageUrl:
      "https://picsum.photos/seed/tablet/400/400",
  },
  {
    id: 4,
    name: "Âm thanh",
    slug: "am-thanh",
    imageUrl:
      "https://picsum.photos/seed/audio/400/400",
  },
  {
    id: 5,
    name: "Phụ kiện",
    slug: "phu-kien",
    imageUrl:
      "https://picsum.photos/seed/accessories/400/400",
  },
  {
    id: 6,
    name: "TV & Màn hình",
    slug: "tv-man-hinh",
    imageUrl:
      "https://picsum.photos/seed/tv/400/400",
  },
  {
    id: 7,
    name: "Nhà thông minh",
    slug: "nha-thong-minh",
    imageUrl:
      "https://picsum.photos/seed/smart-home/400/400",
  },
  {
    id: 8,
    name: "Thiết bị đeo",
    slug: "thiet-bi-deo",
    imageUrl:
      "https://picsum.photos/seed/wearable/400/400",
  },
  {
    id: 9,
    name: "Máy tính bàn",
    slug: "may-tinh-ban",
    imageUrl:
      "https://picsum.photos/seed/desktop/400/400",
  },
  {
    id: 10,
    name: "Gaming Gear",
    slug: "gaming-gear",
    imageUrl:
      "https://picsum.photos/seed/gaming/400/400",
  },
];

export const CategoryCard: React.FC<{ c: StaticCategory }> = ({ c }) => (
  <span
    className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm hover:-translate-y-0.5 transition"
  >
    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100">
      <img
        src={c.imageUrl ?? DEFAULT_CATEGORY_IMAGE}
        alt={c.name}
        className="h-full w-full object-cover"
      />
    </div>
    <div className="w-full text-left">
      <h3 className="font-semibold text-indigo-800 uppercase tracking-tight text-sm line-clamp-2">
        {c.name}
      </h3>
    </div>
  </span>
);

export const CategorySection: React.FC = () => {
  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          DANH MỤC SẢN PHẨM
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {STATIC_CATEGORIES.map((c) => (
          <CategoryCard key={c.id} c={c} />
        ))}
      </div>
    </Container>
  );
};


// ---------- Home page ----------
export const DSHStoreHome: React.FC = () => {
  const { isAuthenticated,wishlistCount } = useCurrentApp();
  const [categories, setCategories] = useState<IHomeCategory[]>([]);
  const [sliders, setSliders] = useState<ISlider[]>([]);
  const [productPage, setProductPage] =
    useState<IModelPaginate<IHomeProductVariant> | null>(null);
  const [productPageLoading, setProductPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const size = 50;
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    const load = async () => {
      try {
        const categoryData = await fetchHomeCategories();
        setCategories(categoryData);
        const sliderData = await fetchSliders();
        setSliders(sliderData);
        setProductPageLoading(true);
        const data = await fetchHomeProducts(page, size);
        setProductPage(data);
      } finally {
        setProductPageLoading(false);
      }
    };
    load();
  }, [page]);
    useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }

    const loadWishlist = async () => {
      try {
        // lấy đủ lớn để gom hết wishlist (tuỳ backend)
        const data = await fetchMyWishlist(1, 1000, "createdAt", "desc");
        const ids = new Set<number>(
          data.items.map((item: IWishlistProductVariant) => item.variantId)
        );
        setWishlistIds(ids);
        console.log(ids)
      } catch (e) {
        console.error("Load wishlist error", e);
      }
    };

    loadWishlist();
  }, [isAuthenticated,wishlistCount]);

  return (
    <>
      <Hero categories={categories} sliders={sliders} />
      <CategorySection />
      {/* Product sections */}
      {/* PRODUCT LIST: tất cả biến thể, sort theo sold, phân trang */}
      <Container className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">SẢN PHẨM BÁN CHẠY</h2>
          {/* nếu muốn thêm filter / sort UI thì để chỗ này */}
        </div>

        {productPageLoading && (
          <div className="text-sm text-slate-500">Đang tải sản phẩm...</div>
        )}

        {!productPageLoading &&
          productPage &&
          productPage.items.length === 0 && (
            <div className="text-sm text-slate-500">Chưa có sản phẩm.</div>
          )}

        {!productPageLoading && productPage && productPage.items.length > 0 && (
          <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {productPage.items.map((p) => (
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
                          rating={p.ratingAverage ?? 0}
                          reviewCount={p.ratingCount ?? 0}
                          isWishlisted={wishlistIds.has(p.variantId)}
                          onToggleWishlist={(added) => {
                              setWishlistIds((prev) => {
                                  const next = new Set(prev);
                                  if (added) next.add(p.variantId);
                                  else next.delete(p.variantId);
                                  return next;
                              });
                          }}
                          sku={p.sku}
                          onClick={() => {
                              console.log("Click variant", p.variantId);
                          }}
                          onAddToCart={() => {
                              console.log("Add to cart variant", p.variantId);
                          }}
                          productId={p.productId}
                      />
                  ))}
              </div>
            {/* Pagination đẹp hơn */}
            {(() => {
              const totalPages = Math.max(
                1,
                Math.ceil(productPage.total / productPage.size)
              );

              // tính các trang hiển thị (max 5 nút số)
              const pages: number[] = [];
              const start = Math.max(1, page - 2);
              const end = Math.min(totalPages, page + 2);
              for (let p = start; p <= end; p++) pages.push(p);

              const canPrev = page > 1;
              const canNext = page < totalPages;

              const from = (page - 1) * productPage.size + 1;
              const to = Math.min(page * productPage.size, productPage.total);

              return (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      disabled={!canPrev}
                      onClick={() => canPrev && setPage(page - 1)}
                      className="h-9 px-3 rounded-full border text-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      ‹
                    </button>

                    {start > 1 && (
                      <>
                        <button
                          onClick={() => setPage(1)}
                          className={`h-9 min-w-[36px] px-3 rounded-full border text-sm ${
                            page === 1
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          1
                        </button>
                        {start > 2 && (
                          <span className="px-1 text-sm text-slate-500">…</span>
                        )}
                      </>
                    )}

                    {pages.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-9 min-w-[36px] px-3 rounded-full border text-sm ${
                          p === page
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    {end < totalPages && (
                      <>
                        {end < totalPages - 1 && (
                          <span className="px-1 text-sm text-slate-500">…</span>
                        )}
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`h-9 min-w-[36px] px-3 rounded-full border text-sm ${
                            page === totalPages
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      disabled={!canNext}
                      onClick={() => canNext && setPage(page + 1)}
                      className="h-9 px-3 rounded-full border text-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      ›
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Hiển thị {from.toLocaleString("vi-VN")} –{" "}
                    {to.toLocaleString("vi-VN")} trên tổng{" "}
                    {productPage.total.toLocaleString("vi-VN")} sản phẩm
                  </p>
                </div>
              );
            })()}
          </>
        )}
      </Container>
      {/* === ĐÁNH GIÁ KHÁCH HÀNG === */}
      <TestimonialsSection />

      {/* === ĐỐI TÁC === */}
      <PartnersSection />
    </>
  );
};
