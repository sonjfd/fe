import { fetchHomeCategories, fetchHomeSections, fetchSliders } from "@/api/home.api";
import { Container } from "@/components/client/AppHeader";
import { ProductCard } from "@/components/client/ProductCard";
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
            <Link to={`/category/${c.id}`} className="flex-1">
              {c.name}
            </Link>

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



export const Hero: React.FC<{ categories: IHomeCategory[],sliders: ISlider[] }> = ({ categories,sliders }) => {
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
        <LeftCategoryMenu categories={categories}/>
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
// tạm dùng ảnh placeholder vì BE chưa trả image
const DEFAULT_CATEGORY_IMAGE =
  "https://picsum.photos/seed/category/400/400";

type ChildWithParent = IChildCategory & {
  parentId: number;
  parentName: string;
};

export const CategoryCard: React.FC<{ c: ChildWithParent }> = ({ c }) => (
  <a
    href={`/category/${c.id}`}
    className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm"
  >
    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100">
      <img src={DEFAULT_CATEGORY_IMAGE} alt={c.name} className="h-full w-full object-cover" />
    </div>
    <div className="w-full text-left">
      <h3 className="font-semibold text-indigo-800 uppercase tracking-tight">
        {c.name}
      </h3>
    </div>
  </a>
);


export const CategorySection: React.FC<{ categories: IHomeCategory[]; loading?: boolean }> = ({
  categories,
  loading = false,
}) => {
  // Gộp tất cả children của các root category lại thành 1 list phẳng
  type ChildWithParent = IChildCategory & {
    parentId: number;
    parentName: string;
  };

  const childCategories: ChildWithParent[] = categories.flatMap((parent) =>
    (parent.children ?? []).map((child) => ({
      ...child,
      parentId: parent.id,
      parentName: parent.name,
    }))
  );

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl sm:text-2xl font-bold">DANH MỤC SẢN PHẨM</h2>
        <a href="#" className="text-sm text-slate-700 hover:text-indigo-700">
          xem tất cả →
        </a>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Đang tải danh mục...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {childCategories.map((c) => (
            <CategoryCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </Container>
  );
};



// ---------- Product  ----------
type HomeProductSectionProps = {
  section: IHomeCategorySection;
};

const HomeProductSection: React.FC<HomeProductSectionProps> = ({ section }) => {
  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          {section.categoryName}
        </h2>
        <a
          href={`/category/${section.categoryId}`}
          className="text-sm text-slate-700 hover:text-indigo-700"
        >
          Xem tất cả →
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {section.variants.map((v) => {
          const name = v.variantName || v.productName;

          return (
            <ProductCard
              productVariantId={v.variantId}
              key={v.variantId}
              name={name}
              imageUrl={
                v.thumbnailUrl ||
                "https://via.placeholder.com/400x400?text=No+Image"
              }
              salePrice={v.price}
              stock={v.stock}
              // tạm thời chưa có data discount / rating / review từ BE
              discountPercent={0}
              rating={5}
              reviewCount={v.sold} // nếu bạn có riêng field review thì đổi lại
              originalPrice={undefined}
              onClick={() => {
                // sau này bạn chuyển sang navigate("/product/..." )
                console.log("Clicked variant", v.variantId);
              }}
              onAddToCart={() => {
                console.log("Add to cart variant", v.variantId);
              }}
            />
          );
        })}
      </div>
    </Container>
  );
};



// ---------- Home page ----------
export const DSHStoreHome: React.FC = () => {
  const [categories, setCategories] = useState<IHomeCategory[]>([]);
  const [sliders, setSliders] = useState<ISlider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<IHomeCategorySection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const categoryData = await fetchHomeCategories();
        setCategories(categoryData);
        const sliderData = await fetchSliders();
        setSliders(sliderData)
        setLoadingProducts(true);
        const data = await fetchHomeSections();
        setSections(data);
      } finally {
        setLoading(false);
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Hero categories={categories} sliders={sliders}/>
      <CategorySection categories={categories} loading={loading} />
      {/* Product sections */}
      {loadingProducts && (
        <Container className="py-4">
          <div className="text-sm text-slate-500">Đang tải sản phẩm...</div>
        </Container>
      )}

      {!loadingProducts &&
        sections.map((section) => (
          <HomeProductSection key={section.categoryId} section={section} />
        ))}
    </>
  );
};
