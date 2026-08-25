"use client";

import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCart, parseWeightFromVolume } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import CartAnimation from "../CartAnimation";
import { SlidersHorizontal, X, ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";
import { getImageUrl, handleImageError } from "../../lib/imageUtils";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  images: string[];
  rating: number;
  reviewCount: number;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  dealBadge: string;
  benefit: string;
  category: string;
  stock: number;
  weight?: number;
  size?: string;
  variantId?: string;
  variants?: any[];
  brand?: string;
}

const HISTOGRAM = [
  { height: 15 }, { height: 25 }, { height: 40 }, { height: 80 },
  { height: 100 }, { height: 75 }, { height: 35 }, { height: 20 },
  { height: 45 }, { height: 25 }, { height: 15 }, { height: 10 },
  { height: 8 }, { height: 12 }, { height: 15 }, { height: 12 },
  { height: 10 }, { height: 15 }, { height: 20 }, { height: 15 }
];
const PRICE_MAX = 1200;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 p-4 space-y-4 animate-pulse">
      <div className="aspect-[3/4] bg-slate-100 rounded-xl w-full" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
        <div className="h-6 bg-slate-100 rounded w-1/2 mx-auto" />
        <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto" />
      </div>
      <div className="h-10 bg-slate-100 rounded-full w-full" />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, cartCount } = useCart();
  const { showToast } = useToast();

  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (isOutOfStock) {
      showToast(`${product.name} is out of stock.`, "error");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      image: getImageUrl(product.images && product.images.length > 0 ? product.images[0] : (product.variants?.find((v: any) => v.image)?.image || "")),
      price: product.currentPrice,
      currency: product.currency,
      weight: parseWeightFromVolume(product.size || '') || product.weight || 0,
      size: product.size,
      quantity: 1,
      variantId: product.variantId,
    });
    const nextCount = cartCount + 1;
    showToast(`Added to cart. Cart now has ${nextCount} item${nextCount === 1 ? '' : 's'}.`, "success");
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  useEffect(() => {
    if (product.images.length <= 1) return;
    const t = setInterval(
      () => setImgIdx((p) => (p + 1) % product.images.length),
      4000
    );
    return () => clearInterval(t);
  }, [product.images.length]);

  return (
    <article
      aria-label={product.name}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow duration-300 group flex flex-col motion-reduce:transition-none"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
          {(product.images && product.images.length > 0 ? product.images : [(product.variants?.find((v: any) => v.image)?.image || "")]).map((src, i) => (
            <img
              key={`${product.id}-img-${i}`}
              src={getImageUrl(src)}
              alt={`${product.name} image ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 group-hover:transition-transform motion-reduce:transition-none ${i === imgIdx ? "opacity-100" : "opacity-0"}`}
              onError={handleImageError}
              loading="lazy"
            />
          ))}
          {/* Out of Stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <span className="bg-slate-900/90 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          {/* Dots */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.images.map((_, i) => (
                <div key={`${product.id}-dot-${i}`} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-3 flex flex-col flex-grow text-center">
          <h3 className="font-sans font-bold text-sm md:text-base text-slate-900 leading-tight mb-2 md:mb-3 line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <span className="text-[10px] font-bold tracking-wider text-[#A68B5B] uppercase mb-1">{product.brand}</span>
          )}
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-2">
            <span className="font-bold text-lg md:text-xl text-slate-900">{product.currency}{product.currentPrice}</span>
            <span className="text-xs md:text-sm line-through text-slate-400">{product.currency}{product.originalPrice}</span>
          </div>
          <p className="font-bold text-[10px] uppercase tracking-wider text-red-600 mb-1">{product.dealBadge}</p>
          <p className="text-xs text-slate-500 line-clamp-1 mb-2">{product.benefit}</p>
        </div>
      </Link>
      <div className="px-4 pb-6">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            aria-label={`${product.name} is out of stock`}
            className="w-full text-slate-400 bg-slate-200 font-bold text-[10px] md:text-xs uppercase tracking-widest py-2 md:py-3 rounded-full cursor-not-allowed"
          >
            OUT OF STOCK
          </button>
        ) : (
          <CartAnimation onAdd={handleAddToCart}>
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              className={`w-full text-white font-bold text-[10px] md:text-xs uppercase tracking-widest py-2 md:py-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 motion-reduce:transition-none ${isAdded
                ? "bg-green-600 hover:bg-green-700"
                : "bg-slate-900 hover:bg-slate-800"
                }`}
            >
              {isAdded ? "ADDED TO CART" : "ADD TO CART"}
            </button>
          </CartAnimation>
        )}
      </div>
    </article>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterSidebarProps {
  categories: { id: string; label: string }[];
  dbBrands: { id: string; label: string }[];
  activeCategory: string;
  activeBrand: string;
  pendingMin: number;
  pendingMax: number;
  onCategoryChange: (id: string) => void;
  onBrandChange: (id: string) => void;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function FilterSidebar({
  categories, dbBrands, activeCategory, activeBrand,
  pendingMin, pendingMax,
  onCategoryChange, onBrandChange, onMinChange, onMaxChange,
}: FilterSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);

  const getPercent = (val: number) => (val / PRICE_MAX) * 100;

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const val = Math.round(pct * PRICE_MAX);
      const midpoint = (pendingMin + pendingMax) / 2;
      if (val < midpoint) onMinChange(Math.min(val, pendingMax - 1));
      else onMaxChange(Math.max(val, pendingMin + 1));
    },
    [pendingMin, pendingMax, onMinChange, onMaxChange]
  );

  return (
    <div className="bg-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="font-sans font-bold text-xl text-[#8B5E34] flex items-center gap-2">
          <span>Filters</span>
          <SlidersHorizontal className="w-5 h-5 text-[#8B5E34]" />
        </h2>
      </div>

      {/* Category Section */}
      <div className="space-y-4">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full flex items-center justify-between font-sans font-bold text-[17px] text-[#8B5E34] text-left focus:outline-none"
        >
          <span>Category</span>
          {categoryOpen ? (
            <ChevronUp className="w-5 h-5 text-[#8B5E34]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#8B5E34]" />
          )}
        </button>
        {categoryOpen && (
          <div className="flex flex-col gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full h-11 px-4 rounded-xl font-sans font-medium text-sm text-left transition-all flex items-center justify-between focus:outline-none ${
                  activeCategory === cat.id
                    ? "bg-[#8B5E34] text-white font-bold"
                    : "bg-[#FAF6F0] text-slate-700 hover:bg-[#F3EDE4] hover:text-slate-900"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand Section */}
      {dbBrands.length > 1 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setBrandsOpen(!brandsOpen)}
            className="w-full flex items-center justify-between font-sans font-bold text-[17px] text-[#8B5E34] text-left focus:outline-none"
          >
            <span>Brands</span>
            {brandsOpen ? (
              <ChevronUp className="w-5 h-5 text-[#8B5E34]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8B5E34]" />
            )}
          </button>
          {brandsOpen && (
            <div className="flex flex-col gap-2.5 pt-1">
              {dbBrands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onBrandChange(b.id)}
                  className={`w-full h-11 px-4 rounded-xl font-sans font-medium text-sm text-left transition-all flex items-center justify-between focus:outline-none ${
                    activeBrand === b.id
                      ? "bg-[#8B5E34] text-white font-bold"
                      : "bg-[#FAF6F0] text-slate-700 hover:bg-[#F3EDE4] hover:text-slate-900"
                  }`}
                >
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between font-sans font-bold text-[17px] text-[#8B5E34] text-left focus:outline-none"
        >
          <span>Price</span>
          {priceOpen ? (
            <ChevronUp className="w-5 h-5 text-[#8B5E34]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#8B5E34]" />
          )}
        </button>
        {priceOpen && (
          <div className="pt-2">
            <div className="px-2 mb-6">
              {/* Histogram */}
              <div className="h-16 flex items-end gap-1 mb-0 relative z-0 opacity-40">
                {HISTOGRAM.map((bar, i) => (
                  <div
                    key={i}
                    style={{ height: `${bar.height}%` }}
                    className="flex-1 rounded-full bg-[#8B5E34]/30"
                  />
                ))}
              </div>

              {/* Slider track */}
              <div
                ref={trackRef}
                onClick={handleTrackClick}
                className="relative h-3 w-full cursor-pointer z-10 -mt-1"
              >
                <div className="absolute inset-0 h-4 bg-transparent rounded-full -translate-y-0.5" />
                <div className="absolute inset-0 h-1.5 bg-[#FAF6F0] rounded-full top-1/2 -translate-y-1/2" />
                <div
                  className="absolute h-1.5 bg-[#8B5E34] rounded-full top-1/2 -translate-y-1/2"
                  style={{ left: `${getPercent(pendingMin)}%`, right: `${100 - getPercent(pendingMax)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-[#8B5E34] rounded-full shadow-md cursor-grab border-2 border-white"
                  style={{ left: `${getPercent(pendingMin)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-[#8B5E34] rounded-full shadow-md cursor-grab border-2 border-white"
                  style={{ right: `${100 - getPercent(pendingMax)}%` }}
                />
              </div>
            </div>

            {/* Min/Max display matching mockup */}
            <div className="flex items-center justify-between px-1">
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-sans font-medium uppercase tracking-wider">Min</p>
                <p className="text-base font-bold text-[#8B5E34] font-sans">₹{pendingMin.toString().padStart(4, '0')}</p>
              </div>
              <span className="text-slate-300 font-bold">—</span>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-sans font-medium uppercase tracking-wider">Max</p>
                <p className="text-base font-bold text-[#8B5E34] font-sans">₹{pendingMax.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination Component ─────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-12 mb-4">
      <div className="flex items-center border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 font-sans text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border-r border-slate-200 transition-colors"
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 font-sans text-sm border-r border-slate-200 transition-colors ${currentPage === p
              ? "bg-[#8B5E34] text-white"
              : "bg-white text-[#A68B5B] hover:bg-slate-50"
              }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 font-sans text-sm bg-white text-[#A68B5B] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Main Page Content ─────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { id: "all", label: "All Categories" },
];
const DEFAULT_BRANDS = [
  { id: "all", label: "All Brands" },
];

export interface CatalogProps {
  /** Restricts the catalog to a tagged collection. */
  collection?: "gifting" | "newArrival";
  title?: string;
  subtitle?: string;
}

function ProductsContent({ collection, title, subtitle }: CatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State populated from URL via searchParams
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dbBrands, setDbBrands] = useState(DEFAULT_BRANDS);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  // Temporary UI states
  const [pendingMin, setPendingMin] = useState(0);
  const [pendingMax, setPendingMax] = useState(PRICE_MAX);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Fetch Metadata (Categories and Brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${apiURL}/categories`),
          axios.get(`${apiURL}/brands`)
        ]);

        if (catRes.data.success && catRes.data.data) {
          const activeBackendCats = catRes.data.data.filter((c: any) => c.status === 'ACTIVE');
          setCategories([
            { id: "all", label: "All Categories" },
            ...activeBackendCats.map((c: any) => ({
              id: c.name.toLowerCase().replace(/\s+/g, '-'),
              label: c.name
            }))
          ]);
        }

        if (brandRes.data.success && brandRes.data.data) {
          const activeBackendBrands = brandRes.data.data.filter((b: any) => b.status === 'ACTIVE');
          setDbBrands([
            { id: "all", label: "All Brands" },
            ...activeBackendBrands.map((b: any) => ({
              id: b.name.toLowerCase().replace(/\s+/g, '-'),
              label: b.name
            }))
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch filter metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Sync state from URL search params
  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const brand = searchParams.get("brand") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const min = Number(searchParams.get("minPrice")) || 0;
    const max = Number(searchParams.get("maxPrice")) || PRICE_MAX;
    const page = Number(searchParams.get("page")) || 1;

    setActiveCategory(category);
    setActiveBrand(brand);
    setSearchTerm(search);
    setSortBy(sort);
    setMinPrice(min);
    setPendingMin(min);
    setMaxPrice(max);
    setPendingMax(max);
    setCurrentPage(page);
  }, [searchParams]);

  // Unified router push to sync states to URL query params
  const updateUrlFilters = useCallback((newParams: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when changing filters
    if (!newParams.hasOwnProperty('page')) {
      params.set('page', '1');
    }

    Object.keys(newParams).forEach(key => {
      const val = newParams[key];
      if (val === null || val === undefined || val === 'all' || val === '') {
        params.delete(key);
      } else {
        params.set(key, val.toString());
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Automatic debounced filter update for Price changes
  useEffect(() => {
    if (pendingMin === minPrice && pendingMax === maxPrice) {
      return;
    }
    const handler = setTimeout(() => {
      updateUrlFilters({
        minPrice: pendingMin,
        maxPrice: pendingMax
      });
    }, 450); // 450ms debounce for high performance range sliding
    return () => clearTimeout(handler);
  }, [pendingMin, pendingMax, minPrice, maxPrice, updateUrlFilters]);

  // Fetch Products based on URL query state
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortBy
      };

      if (activeCategory !== "all") {
        params.category = activeCategory;
      }
      if (activeBrand !== "all") {
        params.brand = activeBrand;
      }
      if (minPrice > 0) {
        params.minPrice = minPrice;
      }
      if (maxPrice < PRICE_MAX) {
        params.maxPrice = maxPrice;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (collection === "gifting") {
        params.gifting = true;
      } else if (collection === "newArrival") {
        params.newArrival = true;
      }

      const res = await axios.get(`${apiURL}/products`, { params });
      if (res.data.success && res.data.data) {
        const prodData = res.data.data;
        const mapped = prodData.map((p: any) => {
          const totalStock = (p.variants && p.variants.length > 0)
            ? p.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
            : (Number(p.stock) || 0);
          return {
            id: p._id,
            name: p.name,
            stock: totalStock,
            images: p.images && p.images.length > 0 
              ? p.images.map(getImageUrl) 
              : (p.variants?.find((v: any) => v.image)?.image 
                  ? [getImageUrl(p.variants.find((v: any) => v.image).image)] 
                  : [getImageUrl("/products/suncream-1.jpg")]),
            rating: p.starRating || 0,
            reviewCount: p.reviewsCount || 0,
            currentPrice: p.variants?.[0]?.price || 0,
            originalPrice: p.variants?.[0]?.oldPrice || p.variants?.[0]?.price || 0,
            currency: "₹",
            dealBadge: p.offerText || "",
            benefit: p.keyFeatures || "",
            weight: p.variants?.[0]?.weight || p.weight || 0,
            size: p.variants?.[0]?.volume || "Standard",
            category: p.category ? p.category.toLowerCase().replace(/\s+/g, '-') : "all",
            variantId: p.variants?.[0]?._id || p.variants?.[0]?.id || "",
            variants: p.variants || [],
            brand: p.brandId?.name || ""
          };
        });
        setProducts(mapped);
        
        if (res.data.pagination) {
          setTotalProducts(res.data.pagination.total);
        } else {
          setTotalProducts(mapped.length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, activeBrand, minPrice, maxPrice, searchTerm, sortBy, collection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApply = () => {
    updateUrlFilters({
      minPrice: pendingMin,
      maxPrice: pendingMax
    });
    setDrawerOpen(false);
  };

  const handleClearAll = () => {
    router.push(pathname);
    setDrawerOpen(false);
  };

  // Memoized total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;
  }, [totalProducts]);

  // Active Chips Logic
  const activeChips = useMemo(() => {
    const chips = [];
    if (activeCategory !== 'all') {
      const catObj = categories.find(c => c.id === activeCategory);
      chips.push({ key: 'category', label: `${catObj ? catObj.label : activeCategory}`, value: 'all' });
    }
    if (activeBrand !== 'all') {
      const brandObj = dbBrands.find(b => b.id === activeBrand);
      chips.push({ key: 'brand', label: `${brandObj ? brandObj.label : activeBrand}`, value: 'all' });
    }
    if (minPrice > 0 || maxPrice < PRICE_MAX) {
      chips.push({ key: 'price', label: `₹${minPrice} - ₹${maxPrice}`, value: 'price' });
    }
    if (searchTerm) {
      chips.push({ key: 'search', label: `Search: "${searchTerm}"`, value: '' });
    }
    return chips;
  }, [activeCategory, activeBrand, minPrice, maxPrice, searchTerm, categories, dbBrands]);

  const removeChip = (key: string) => {
    if (key === 'category') {
      updateUrlFilters({ category: 'all' });
    } else if (key === 'brand') {
      updateUrlFilters({ brand: 'all' });
    } else if (key === 'price') {
      updateUrlFilters({ minPrice: 0, maxPrice: PRICE_MAX });
    } else if (key === 'search') {
      updateUrlFilters({ search: '' });
    }
  };

  // Close drawer on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sidebarProps: FilterSidebarProps = {
    categories,
    dbBrands,
    activeCategory,
    activeBrand,
    pendingMin,
    pendingMax,
    onCategoryChange: (id) => updateUrlFilters({ category: id }),
    onBrandChange: (id) => updateUrlFilters({ brand: id }),
    onMinChange: setPendingMin,
    onMaxChange: setPendingMax,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-[calc(100vh-5rem)]">

        {/* ── Desktop Sidebar ─────────────────────────────────────── */}
        <aside className="hidden lg:block w-80 xl:w-88 bg-[#fbf9f6] border-r border-slate-100 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0 p-6">
          <div className="bg-white rounded-[2rem] border border-slate-100/80 shadow-sm overflow-hidden">
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* ── Mobile Drawer ────────────────────────────────────────── */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-white overflow-y-auto lg:hidden shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="relative">
                {/* Mobile close button */}
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10 animate-in spin-in-90 duration-300"
                >
                  <X size={20} />
                </button>
                <FilterSidebar {...sidebarProps} />
              </div>
            </div>
          </>
        )}

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main className="flex-1 p-5 md:p-8 overflow-hidden">
          {/* Mobile Back to Home */}
          <Link
            href="/"
            className="md:hidden inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-5 transition-colors text-sm font-semibold bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-sm"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>

          {title && (
            <div className="mb-6">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="font-sans text-base text-slate-500 mt-2">{subtitle}</p>}
            </div>
          )}

          {/* Results Bar + Mobile Filter Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-100 rounded-xl px-5 py-4 mb-6 gap-4">
            <div>
              <p className="font-sans text-base text-slate-600">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {loading ? 0 : products.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">{totalProducts}</span>{" "}
                Products
              </p>
              {searchTerm && (
                <p className="font-sans text-sm text-slate-500 mt-1">
                  Search results for: <span className="font-bold text-slate-900">&quot;{searchTerm}&quot;</span>
                  <button onClick={() => updateUrlFilters({ search: '' })} className="ml-3 text-[#A68B5B] hover:underline text-xs">Clear search</button>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm text-slate-500 whitespace-nowrap">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateUrlFilters({ sort: e.target.value })}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-sans text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 font-sans font-bold text-sm text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="font-sans text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Active Filters:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  {chip.label}
                  <button
                    onClick={() => removeChip(chip.key)}
                    aria-label={`Remove ${chip.key} filter`}
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-[#8B5E34] hover:text-[#5A3A1E] transition-colors ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid / Skeleton / Empty State */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  updateUrlFilters({ page: p });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-serif text-2xl text-slate-900 mb-2">No products found</h3>
              <p className="font-sans text-base text-slate-500 mb-6">
                Try adjusting your filters or clearing them to see all premium treats.
              </p>
              <button
                onClick={handleClearAll}
                className="bg-slate-900 text-white font-bold text-sm uppercase tracking-widest px-8 py-3 rounded-full hover:bg-slate-800 transition-colors"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Main Page Wrapper ───────────────────────────────────────────────────────

export function ProductCatalog(props: CatalogProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    }>
      <ProductsContent {...props} />
    </Suspense>
  );
}
