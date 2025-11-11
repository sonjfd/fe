import { cn, Container } from "@/components/client/AppHeader";
import { useEffect, useState } from "react";

export type Category = { name: string; count: number; image: string };
export const CATEGORY_LIST: Category[] = [
  { name: "Ghế MASSAGE", count: 12, image: "https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=1200&auto=format&fit=crop" },
  { name: "DỤNG CỤ BÓNG CHUYỀN", count: 540, image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop" },
  { name: "DỤNG CỤ BÓNG ĐÁ", count: 435, image: "https://images.unsplash.com/photo-1543326727-cf6c39c9f043?q=80&w=1200&auto=format&fit=crop" },
  { name: "DỤNG CỤ CẦU LÔNG", count: 214, image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop" },
  { name: "DỤNG CỤ BÓNG RỔ", count: 62, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop" },
  { name: "Máy tập thể dục", count: 54, image: "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?q=80&w=1200&auto=format&fit=crop" },
  { name: "Dụng cụ võ thuật", count: 66, image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop" },
  { name: "Dụng cụ thể thao ngoài trời", count: 11, image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1200&auto=format&fit=crop" },
  { name: "Dụng cụ bóng bàn", count: 58, image: "https://images.unsplash.com/photo-1579702493446-c03f0b96d39d?q=80&w=1200&auto=format&fit=crop" },
  { name: "QUẦN ÁO BÓNG CHUYỀN", count: 362, image: "https://images.unsplash.com/photo-1591865769350-01d7c6a59095?q=80&w=1200&auto=format&fit=crop" },
  { name: "QUẦN ÁO BÓNG ĐÁ", count: 133, image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop" },
  { name: "Thiết bị thể thao trường học", count: 27, image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop" },
];

export type Slide = { id: number; image: string; title: string; desc?: string; cta?: string };
export const HERO_SLIDES: Slide[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=1600&auto=format&fit=crop", title: "THIẾT KẾ TINH XẢO HOÀN HẢO TÍNH NĂNG", desc: "Ghế massage Oreni OR-500", cta: "MUA NGAY" },
  { id: 2, image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1600&auto=format&fit=crop", title: "SĂN SALE CUỐI TUẦN", desc: "Giảm đến 50% + freeship", cta: "Xem ưu đãi" },
];

export type Product = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: string;
  image: string;
};

export const MASSAGE_PRODUCTS: Product[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: [
    "Ghế massage Oreni OR-160",
    "Ghế massage Oreni OR-500",
    "Ghế massage ô tô CP-910A",
    "Ghế massage Oreni OR-150",
    "Ghế massage Sakura SK 88D",
  ][i % 5],
  rating: 5,
  reviews: 1,
  price: [26500000, 112680000, 7990000, 26500000, 34500000][i % 5],
  oldPrice: [31000000, 169500000, 12500000, 31000000, 45680000][i % 5],
  discount: [15, 34, 36, 15, 24][i % 5],
  stock: "Còn hàng",
  image: `https://picsum.photos/seed/m${i}/700/700`,
}));

// simple runtime checks (won't throw in prod builds)
(function runSmokeTests() {
  try {
    console.assert(Array.isArray(HERO_SLIDES) && HERO_SLIDES.length > 0, "HERO_SLIDES must be non-empty array");
    console.assert(typeof HERO_SLIDES[0].title === "string" && HERO_SLIDES[0].title.length > 0, "slide[0].title must be string");
    console.assert(!/\n/.test(HERO_SLIDES[0].title), "slide[0].title must not contain newline characters");

    console.assert(Array.isArray(CATEGORY_LIST) && CATEGORY_LIST.length >= 5, "CATEGORY_LIST should have at least 5 items");
    console.assert(MASSAGE_PRODUCTS.length === 10, "MASSAGE_PRODUCTS should have 10 items");
  } catch (e) {
    console.error("Smoke tests failed:", e);
  }
})();

// ---------- Atoms ----------
export const Price: React.FC<{ price: number; old?: number }> = ({ price, old }) => (
  <div className="mt-1 flex items-center gap-2">
    <span className="text-lg font-bold text-indigo-800">{price.toLocaleString("vi-VN")}đ</span>
    {old ? <span className="text-sm line-through text-slate-400">{old.toLocaleString("vi-VN")}đ</span> : null}
  </div>
);

export const Rating: React.FC<{ value?: number; reviews?: number }> = ({ value = 5, reviews = 0 }) => (
  <div className="flex items-center gap-1 text-amber-500 text-sm">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" width="16" height="16" fill={i < value ? "currentColor" : "none"} stroke="currentColor" aria-hidden>
        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.262L12 19.771 4.583 23.858 6 15.596 0 9.748l8.332-1.73z"/>
      </svg>
    ))}
    <span className="ml-1 text-slate-600">{reviews} đánh giá</span>
  </div>
);

// ---------- Hero + left category menu ----------
export const LeftCategoryMenu: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
      <span className="font-semibold">NGÀNH HÀNG</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
    <ul className="max-h-[420px] overflow-auto divide-y divide-slate-100">
      {CATEGORY_LIST.slice(0, 10).map((c) => (
        <li
          key={c.name}
          className="group flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-slate-50"
        >
          <span>{c.name}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-60 group-hover:opacity-100" aria-hidden>
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </li>
      ))}
    </ul>
  </div>
);

export const Hero: React.FC = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = HERO_SLIDES[i];
  return (
    <Container className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4">
        <LeftCategoryMenu />
        <div className="relative overflow-hidden rounded-2xl">
          <img src={s.image} alt={s.title} className="h-[220px] sm:h-[320px] md:h-[420px] w-full object-cover" />
          <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-between pointer-events-none">
            <div className="p-2">
              <button
                onClick={() => setI((i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="pointer-events-auto h-10 w-10 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-label="Slide trước"
              >
                ◄
              </button>
            </div>
            <div className="p-2">
              <button
                onClick={() => setI((i + 1) % HERO_SLIDES.length)}
                className="pointer-events-auto h-10 w-10 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-label="Slide sau"
              >
                ►
              </button>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <span key={idx} className={cn("h-2 w-2 rounded-full", idx === i ? "bg-white" : "bg-white/60")} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

// ---------- Category grid section ----------
export const CategoryCard: React.FC<{ c: Category }> = ({ c }) => (
  <a href="#" className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm">
    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100">
      <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
    </div>
    <div className="w-full text-left">
      <h3 className="font-semibold text-indigo-800 uppercase tracking-tight">{c.name}</h3>
      <p className="text-slate-500 text-sm mt-1">{c.count} Sản phẩm</p>
    </div>
  </a>
);

export const CategorySection: React.FC = () => (
  <Container className="py-6">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl sm:text-2xl font-bold">DANH MỤC SẢN PHẨM</h2>
      <a href="#" className="text-sm text-slate-700 hover:text-indigo-700">xem tất cả →</a>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {CATEGORY_LIST.map((c) => (
        <CategoryCard key={c.name} c={c} />
      ))}
    </div>
  </Container>
);

// ---------- Product card & list ----------
export const ProductCard: React.FC<{ p: Product }> = ({ p }) => (
  <div className="group relative rounded-2xl border border-slate-200 bg-white p-3">
    {p.discount ? (
      <div className="absolute left-3 top-3 rounded-md bg-rose-600 text-white text-xs px-1.5 py-0.5 font-semibold">{p.discount}%</div>
    ) : null}
    <button
      className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      aria-label="Thêm vào yêu thích"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M12 21s-6.716-4.438-9-8.25C1.32 10.12 2.5 6 6.5 6c2 0 3.5 1.5 3.5 1.5S11.5 6 13.5 6C17.5 6 18.68 10.12 21 12.75 18.716 16.562 12 21 12 21z"/>
      </svg>
    </button>

    <a href="#" className="block overflow-hidden rounded-xl bg-slate-100">
      <img src={p.image} alt={p.name} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
    </a>

    <a href="#" className="mt-3 block text-sm font-semibold leading-snug text-slate-800 hover:text-indigo-700">{p.name}</a>

    <Rating value={p.rating} reviews={p.reviews} />
    <Price price={p.price} old={p.oldPrice} />

    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {p.stock}
      </span>
    </div>

    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100">
      <div className="rounded-2xl bg-white shadow-xl p-4">
        <button className="w-56 rounded-lg bg-indigo-800 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
          Thêm giỏ hàng
        </button>
      </div>
    </div>
  </div>
);

export const ProductRow: React.FC<{ title: string; items: Product[] }> = ({ title, items }) => (
  <Container className="py-6">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl sm:text-2xl font-bold uppercase">{title}</h2>
      <a href="#" className="text-sm text-slate-700 hover:text-indigo-700">xem tất cả →</a>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  </Container>
);

// ---------- Home page ----------
export const DSHStoreHome: React.FC = () => {
  return (
    <>
      <Hero />
      <CategorySection />
      <ProductRow title="Ghế MASSAGE" items={MASSAGE_PRODUCTS} />
    </>
  );
};
